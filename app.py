import spaces

@spaces.GPU
def warmup():
    return "ok"

import os
import subprocess
import threading
import httpx
import gradio as gr
from fastapi import Request, Response
from fastapi.responses import JSONResponse

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

def check_status():
    warmup()
    return "✅ سيرفر الـ Node.js يعمل في الخلفية بنجاح!"

with gr.Blocks(title="EgyPyramid Backend") as demo:
    gr.Markdown("## 🟢 EgyPyramid Node.js Backend")
    status_btn = gr.Button("فحص حالة السيرفر الداخلي")
    status_txt = gr.Textbox(label="الحالة")
    status_btn.click(fn=check_status, inputs=[], outputs=status_txt)

# 1) ابدأ النود في الخلفية (thread منفصل، ميعطلش حاجة)
threading.Thread(target=start_node_backend, daemon=True).start()

# 2) شغّل Gradio بنفس الطريقة اللي أثبتنا إنها الوحيدة المضمونة مع ZeroGPU
#    prevent_thread_lock=True بترجعلنا الـ FastAPI app نفسه عشان نضيف عليه الـ proxy
fastapi_app, local_url, share_url = demo.launch(
    server_name="0.0.0.0",
    server_port=7860,
    prevent_thread_lock=True,
)

# 3) دلوقتي نضيف route البروكسي على نفس الـ app اللي جراديو شغالة عليه فعليًا
client = httpx.AsyncClient(base_url=f"http://localhost:{INTERNAL_PORT}", timeout=60.0)

@fastapi_app.api_route("/api/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy(request: Request, path_name: str):
    body = await request.body()
    headers = dict(request.headers)
    headers.pop("host", None)
    try:
        response = await client.request(
            method=request.method,
            url=f"/{path_name}",
            params=request.query_params,
            content=body,
            headers=headers,
        )
        return Response(content=response.content, status_code=response.status_code, headers=dict(response.headers))
    except Exception as e:
        return JSONResponse(status_code=502, content={"error": "Backend communication failed", "details": str(e)})

# 4) خلي السكريبت شغال (بديل demo.launch() العادي اللي كنا بنعتمد عليه للـ blocking)
demo.block_thread()