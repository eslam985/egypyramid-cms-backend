import spaces

@spaces.GPU
def warmup():
    return "ok"

import gradio as gr
import uvicorn
from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Lifespan started (no node logic)")
    yield
    print("🛑 Lifespan ended")

app = FastAPI(lifespan=lifespan)

def check_status():
    warmup()
    return "test ok"

with gr.Blocks(title="Isolation Test") as demo:
    gr.Markdown("## Isolation Test")
    status_btn = gr.Button("Check")
    status_txt = gr.Textbox(label="Status")
    status_btn.click(fn=check_status, inputs=[], outputs=status_txt)

app = gr.mount_gradio_app(app, demo, path="/")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)