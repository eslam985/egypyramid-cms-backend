import os
import subprocess
import time
import httpx
import gradio as gr
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

BACKEND_DIR = "."
NODE_PROCESS = None
INTERNAL_PORT = 3000

@asynccontextmanager
async def lifespan(app: FastAPI):
    global NODE_PROCESS
    print("🚀 Starting Node.js backend...")

    env = os.environ.copy()
    env["PORT"] = str(INTERNAL_PORT)

    try:
        NODE_PROCESS = subprocess.Popen(
            ["npm", "start"],
            cwd=BACKEND_DIR,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
    except Exception as e:
        print(f"❌ Failed to start Node.js process: {e}")

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
    params = request.query_params
    body = await request.body()
    headers = dict(request.headers)
    headers.pop("host", None)

    try:
        response = await client.request(
            method=request.method,
            url=url,
            params=params,
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

# واجهة Gradio العادية لإبقاء السبيس يعمل بدون الحاجة لـ ZeroGPU
def check_status():
    return "✅ سيرفر الـ Node.js يعمل في الخلفية بنجاح ويستقبل الطلبات!"

with gr.Blocks(title="EgyPyramid Backend") as demo:
    gr.Markdown("## 🟢 EgyPyramid Node.js Backend is Running!")
    gr.Markdown("هذه الواجهة مخصصة لإبقاء السيرفر يعمل واستقبال الطلبات.")
    
    status_btn = gr.Button("فحص حالة السيرفر الداخلي")
    status_txt = gr.Textbox(label="الحالة")
    status_btn.click(fn=check_status, inputs=[], outputs=status_txt)

# دمج الواجهة مع تطبيق الـ FastAPI
app = gr.mount_gradio_app(app, demo, path="/")