import os
import subprocess
import time
import httpx
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse

app = FastAPI()

# مسار مجلد الـ backend الخاص بك داخل الريبو
BACKEND_DIR = "."  # أو اتركه "." لو ملفات النود في الجذر مباشرة

INTERNAL_PORT = int(os.getenv("PORT"))
NODE_PROCESS = None

@app.on_event("startup")
async def startup_event():
    global NODE_PROCESS
    print("Starting Node.js backend...")
    
    # تعبئة متغيرات البيئة وإجبار النود على العمل على البورت الداخلي
    env = os.environ.copy()
    env["PORT"] = str(INTERNAL_PORT)
    
    # تشغيل سيرفر النود في الخلفية
    NODE_PROCESS = subprocess.Popen(
        ["npm", "start"],
        cwd=BACKEND_DIR,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # الانتظار قليلاً لضمان قيام سيرفر النود
    time.sleep(3)
    print("Node.js backend should be running.")

@app.on_event("shutdown")
async def shutdown_event():
    if NODE_PROCESS:
        NODE_PROCESS.terminate()
        NODE_PROCESS.wait()

@app.get("/")
def read_root():
    return {"status": "FastAPI wrapper is running, Node.js backend should be active."}

# بروكسي لتوجيه كل طلبات الـ API إلى سيرفر الـ Node الداخلي
client = httpx.AsyncClient(base_url=f"http://localhost:{INTERNAL_PORT}", timeout=60.0)

@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy(request: Request, path_name: str):
    url = f"/{path_name}"
    params = request.query_params
    body = await request.body()
    headers = dict(request.headers)
    
    # إزالة هوست الهักينج فيس من الـ headers لكي لا يحدث تضارب
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
            headers=dict(response.headers)
        )
    except Exception as e:
        return JSONResponse(status_code=502, content={"error": "Backend communication failed", "details": str(e)})