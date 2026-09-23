import spaces

@spaces.GPU
def warmup():
    return "ok"

# باقي الاستيرادات بعد كده عادي
import os
os.environ["GRADIO_SSR_MODE"] = "False"
import subprocess
import threading
import httpx
import gradio as gr
import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

BACKEND_DIR = "."
INTERNAL_PORT = 3000
NODE_PROCESS = None

def start_node_backend():
    global NODE_PROCESS
    print("📦 Installing Node.js dependencies...")
    install = subprocess.run(
        ["npm", "install"], cwd=BACKEND_DIR,
        capture_output=True, text=True,
    )
    print(install.stdout)
    if install.returncode != 0:
        print("❌ npm install failed:", install.stderr)
        return

    print("🚀 Starting Node.js backend...")
    env = os.environ.copy()
    env["PORT"] = str(INTERNAL_PORT)
    NODE_PROCESS = subprocess.Popen(
        ["npm", "start"], cwd=BACKEND_DIR, env=env,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, bufsize=1,
    )
    for line in iter(NODE_PROCESS.stdout.readline, ""):
        print(f"[NODE] {line}", end="")

@asynccontextmanager
async def lifespan(app: FastAPI):
    threading.Thread(target=start_node_backend, daemon=True).start()
    yield
    if NODE_PROCESS:
        NODE_PROCESS.terminate()
        NODE_PROCESS.wait()

app = FastAPI(lifespan=lifespan)
client = httpx.AsyncClient(base_url=f"http://localhost:{INTERNAL_PORT}", timeout=60.0)

@app.api_route("/api/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy(request: Request, path_name: str):
    body = await request.body()
    headers = dict(request.headers)
    headers.pop("host", None)
    try:
        response = await client.request(
            method=request.method, url=f"/{path_name}",
            params=request.query_params, content=body, headers=headers,
        )
        return Response(content=response.content, status_code=response.status_code, headers=dict(response.headers))
    except Exception as e:
        return JSONResponse(status_code=502, content={"error": "Backend communication failed", "details": str(e)})

def check_status():
    warmup()
    return "✅ سيرفر الـ Node.js يعمل في الخلفية بنجاح!"

with gr.Blocks(title="EgyPyramid Backend") as demo:
    gr.Markdown("## 🟢 EgyPyramid Node.js Backend")
    status_btn = gr.Button("فحص حالة السيرفر الداخلي")
    status_txt = gr.Textbox(label="الحالة")
    status_btn.click(fn=check_status, inputs=[], outputs=status_txt)

app = gr.mount_gradio_app(app, demo, path="/")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)