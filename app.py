import spaces
import gradio as gr

@spaces.GPU
def warmup():
    return "ok"

with gr.Blocks() as demo:
    gr.Markdown("test")

demo.launch()