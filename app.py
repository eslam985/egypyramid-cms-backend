import os
os.environ["GRADIO_SSR_MODE"] = "False"

import spaces, subprocess, threading, httpx, asyncio
import gradio as gr
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

INTERNAL_PORT = 3000

# ← FastAPI أولاً وقبل Gradio
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://egypyramid-cms-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

client = httpx.AsyncClient(base_url=f"http://localhost:{INTERNAL_PORT}", timeout=60.0)

@app.api_route("/api/{path_name:path}", methods=["GET","POST","PUT","DELETE","PATCH","OPTIONS"])
async def proxy(request: Request, path_name: str):
    body = await request.body()
    headers = dict(request.headers)
    headers.pop("host", None)
    try:
        response = await client.request(
            method=request.method,
            url=f"/api/{path_name}",
            params=request.query_params,
            content=body,
            headers=headers,
        )
        resp_headers = dict(response.headers)
        resp_headers.pop("content-encoding", None)
        resp_headers.pop("transfer-encoding", None)
        return Response(content=response.content, status_code=response.status_code, headers=resp_headers)
    except Exception as e:
        return JSONResponse(status_code=502, content={"error": str(e)})

# ← Gradio جوّا FastAPI
@spaces.GPU
def warmup():
    return "ok"

def check_status():
    warmup()
    return "✅ Node.js يعمل!"

with gr.Blocks(title="EgyPyramid Backend") as demo:
    gr.Markdown("## 🟢 EgyPyramid Node.js Backend")
    status_btn = gr.Button("فحص حالة السيرفر")
    status_txt = gr.Textbox(label="الحالة")
    status_btn.click(fn=check_status, inputs=[], outputs=status_txt)

# ← mount Gradio على FastAPI
app = gr.mount_gradio_app(app, demo, path="/")

def start_node_backend():
    env = os.environ.copy()
    env["PORT"] = str(INTERNAL_PORT)
    subprocess.run(["npm", "install"], cwd=".")
    proc = subprocess.Popen(
        ["npm", "start"], cwd=".", env=env,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1,
    )
    for line in iter(proc.stdout.readline, ""):
        print(f"[NODE] {line}", end="")

threading.Thread(target=start_node_backend, daemon=True).start()