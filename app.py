import os
os.environ["GRADIO_SSR_MODE"] = "False"

import spaces

@spaces.GPU
def warmup():
    return "ok"
  
import subprocess
import threading
import httpx
import asyncio
import gradio as gr
from fastapi import Request, Response
from fastapi.routing import APIRoute
from fastapi.responses import JSONResponse


BACKEND_DIR = "."
INTERNAL_PORT = 3000
NODE_PROCESS = None

def start_node_backend():
    global NODE_PROCESS
    print("📦 Installing Node.js dependencies...")
    install = subprocess.run(["npm", "install"], cwd=BACKEND_DIR, capture_output=True, text=True)
    print(install.stdout)
    if install.returncode != 0:
        print("❌ npm install failed:", install.stderr)
        return
    print("🚀 Starting Node.js backend...")
    env = os.environ.copy()
    env["PORT"] = str(INTERNAL_PORT)
    NODE_PROCESS = subprocess.Popen(
        ["npm", "start"], cwd=BACKEND_DIR, env=env,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1,
    )
    for line in iter(NODE_PROCESS.stdout.readline, ""):
        print(f"[NODE] {line}", end="")

def check_status():
    warmup()
    return "✅ سيرفر الـ Node.js يعمل في الخلفية بنجاح!"

with gr.Blocks(title="EgyPyramid Backend") as demo:
    gr.Markdown("## 🟢 EgyPyramid Node.js Backend")
    status_btn = gr.Button("فحص حالة السيرفر الداخلي")
    status_txt = gr.Textbox(label="الحالة")
    status_btn.click(fn=check_status, inputs=[], outputs=status_txt)

threading.Thread(target=start_node_backend, daemon=True).start()

fastapi_app, local_url, share_url = demo.launch(
    server_name="0.0.0.0",
    server_port=7860,
    prevent_thread_lock=True,
)

# ✅ نضيف CORS على الـ middleware_stack مباشرة
from starlette.middleware.cors import CORSMiddleware

fastapi_app.middleware_stack = CORSMiddleware(
    app=fastapi_app.middleware_stack,
    allow_origins=["https://egypyramid-cms-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


client = httpx.AsyncClient(base_url=f"http://localhost:{INTERNAL_PORT}", timeout=60.0)


async def wait_for_node(retries=10, delay=2):
    for i in range(retries):
        try:
            r = await client.get("/api/health")  # أو أي endpoint خفيف
            if r.status_code < 500:
                print("✅ Node is ready")
                return True
        except Exception:
            pass
        print(f"⏳ Waiting for Node... ({i+1}/{retries})")
        await asyncio.sleep(delay)
    print("❌ Node failed to start")
    return False

async def proxy(request: Request, path_name: str):
    origin = request.headers.get("origin", "https://egypyramid-cms-frontend.vercel.app")
    
    cors_headers = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Expose-Headers": "*",
        
    }

    if request.method == "OPTIONS":
        cors_headers.update({
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": request.headers.get(
                "access-control-request-headers", "Content-Type, Authorization"
            ),
            "Access-Control-Max-Age": "600",
        })
        return Response(status_code=200, headers=cors_headers)

    body = await request.body()
    headers = dict(request.headers)
    headers.pop("host", None)
    
    # Retry logic لو Node لسه بتبدأ
    last_error = None
    for attempt in range(3):
        try:
            response = await client.request(
                method=request.method,
                url=f"/api/{path_name}",
                params=request.query_params,
                content=body,
                headers=headers,
            )
            response_headers = dict(response.headers)
            response_headers.update(cors_headers)
            response_headers.pop("content-encoding", None)
            response_headers.pop("transfer-encoding", None)
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=response_headers,
            )
        except Exception as e:
            last_error = e
            print(f"⚠️ Attempt {attempt+1} failed: {e}")
            await asyncio.sleep(1)
    
    return JSONResponse(
        status_code=502,
        content={"error": "Backend communication failed", "details": str(last_error)},
        headers=cors_headers,
    )

# 🔑 السطر الجديد المهم: نسجل الـ route ونحطه في أول القايمة عشان يسبق كاتش-أول بتاع Gradio
proxy_route = APIRoute(
    "/api/{path_name:path}",
    proxy,
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
)
fastapi_app.router.routes.insert(0, proxy_route)

demo.block_thread()