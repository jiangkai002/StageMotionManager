"""模型文件 API 路由"""

from fastapi import APIRouter, HTTPException

from Models import ModelFile
from Services import ModelFileService

router = APIRouter(prefix="/model-files", tags=["model-files"])


@router.post("", summary="上传模型文件记录")
def create_model_file(model_file: ModelFile):
    """创建一个新的模型文件记录"""
    file_id = ModelFileService.create(model_file)
    return {"id": file_id}


@router.get("", summary="查询所有模型文件")
def get_model_files(skip: int = 0, limit: int = 100):
    """分页查询所有模型文件"""
    return ModelFileService.get_all(skip, limit)


@router.get("/{file_id}", summary="根据 ID 查询模型文件")
def get_model_file(file_id: str):
    """根据 _id 查询单个模型文件"""
    model_file = ModelFileService.get_by_id(file_id)
    if not model_file:
        raise HTTPException(status_code=404, detail="模型文件不存在")
    return model_file


@router.put("/{file_id}", summary="更新模型文件")
def update_model_file(file_id: str, update_data: dict):
    """根据 _id 更新模型文件信息"""
    count = ModelFileService.update_by_id(file_id, update_data)
    if count == 0:
        raise HTTPException(status_code=404, detail="模型文件不存在或没有变化")
    return {"updated": count}


@router.delete("/{file_id}", summary="删除模型文件")
def delete_model_file(file_id: str):
    """根据 _id 删除模型文件"""
    count = ModelFileService.delete_by_id(file_id)
    if count == 0:
        raise HTTPException(status_code=404, detail="模型文件不存在")
    return {"deleted": count}
