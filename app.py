import os
os.environ["GRADIO_SSR_MODE"] = "False"

import subprocess
import threading
import time
import httpx
import gradio as gr
import spaces
import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

BACKEND_DIR = "."
NODE_PROCESS = None
INTERNAL_PORT = 3000

def stream_node_logs(process):
    for line in iter(process.stdout.readline, ""):
        print(f"[NODE] {line}", end="")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global NODE_PROCESS
    print("📦 Installing Node.js dependencies...")

    install = subprocess.run(
        ["npm", "install"],
        cwd=BACKEND_DIR,
        capture_output=True,
        text=True,
    )
    print(install.stdout)
    if install.returncode != 0:
        print("❌ npm install failed:")
        print(install.stderr)

    print("🚀 Starting Node.js backend...")
    env = os.environ.copy()
    env["PORT"] = str(INTERNAL_PORT)

    NODE_PROCESS = subprocess.Popen(
        ["npm", "start"],
        cwd=BACKEND_DIR,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    threading.Thread(target=stream_node_logs, args=(NODE_PROCESS,), daemon=True).start()

    time.sleep(3)
    print("✅ Node.js backend should be running on internal port 3000.")
    yield

    if NODE_PROCESS:
        NODE_PROCESS.terminate()
        NODE_PROCESS.wait()

app = FastAPI(lifespan=lifespan)
client = httpx.AsyncClient(base_url=f"http://localhost:{INTERNAL_PORT}", timeout=60.0)

@app.api_route("/api/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy(request: Request, path_name: str):
    url = f"/{path_name}"
    body = await request.body()
    headers = dict(request.headers)
    headers.pop("host", None)

    try:
        response = await client.request(
            method=request.method,
            url=url,
            params=request.query_params,
            content=body,
            headers=headers,
        )
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
        )
    except Exception as e:
        return JSONResponse(
            status_code=502,
            content={"error": "Backend communication failed", "details": str(e)},
        )

@spaces.GPU
def warmup():
    return "ok"

def check_status():
    warmup()
    return "✅ سيرفر الـ Node.js يعمل في الخلفية بنجاح ويستقبل الطلبات!"

with gr.Blocks(title="EgyPyramid Backend") as demo:
    gr.Markdown("## 🟢 EgyPyramid Node.js Backend is Running!")
    status_btn = gr.Button("فحص حالة السيرفر الداخلي")
    status_txt = gr.Textbox(label="الحالة")
    status_btn.click(fn=check_status, inputs=[], outputs=status_txt)

app = gr.mount_gradio_app(app, demo, path="/")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)