import uvicorn
from fastapi import FastAPI

from Routes.element_routes import router as element_router
from Routes.model_file_routes import router as model_file_router

app = FastAPI(
    title="StageMotionManager API",
    description="舞台运动管理系统后端 API",
    version="0.1.0",
)

# 注册路由
app.include_router(element_router)
app.include_router(model_file_router)


@app.get("/")
async def root():
    return {"message": "Welcome to StageMotionManager API"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
