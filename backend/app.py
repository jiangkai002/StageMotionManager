import json
from datetime import datetime

import uvicorn
from bson import ObjectId
from fastapi import FastAPI
from starlette.responses import JSONResponse

from Routes.element_routes import router as element_router
from Routes.model_file_routes import router as model_file_router
from Routes.element_basic_info_routes import router as element_basic_info_router
from Routes.operation_method_routes import router as operation_method_router


class MongoJSONResponse(JSONResponse):
    """自定义 JSONResponse，处理 MongoDB 的 ObjectId / datetime 序列化"""

    def render(self, content) -> bytes:
        return json.dumps(
            content,
            default=self._default,
            ensure_ascii=False,
        ).encode("utf-8")

    @staticmethod
    def _default(o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        raise TypeError(f"Object of type {type(o).__name__} is not JSON serializable")


app = FastAPI(
    title="StageMotionManager API",
    description="舞台运动管理系统后端 API",
    version="0.1.0",
    default_response_class=MongoJSONResponse,
)

# 注册路由（统一 /api 前缀）
app.include_router(element_router, prefix="/api")
app.include_router(model_file_router, prefix="/api")
app.include_router(element_basic_info_router, prefix="/api")
app.include_router(operation_method_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Welcome to StageMotionManager API"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
