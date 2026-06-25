"""场景 API 路由"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from Models.scene import Scene, SceneDeviceItem, SceneUpdate
from Services import SceneService
from Services.auth_service import verify_token

router = APIRouter(prefix="/scenes", tags=["scenes"])


@router.post("", summary="创建场景", dependencies=[Depends(verify_token)])
async def create_scene(scene: Scene):
    """创建一条新的场景预设"""
    doc_id = await SceneService.create(scene)
    return {"id": doc_id}


@router.post("/batch", summary="批量创建场景", dependencies=[Depends(verify_token)])
async def create_scenes(scenes: list[Scene]):
    """批量创建场景"""
    doc_ids = await SceneService.create_many(scenes)
    return {"ids": doc_ids, "count": len(doc_ids)}


@router.get("", summary="查询所有场景", dependencies=[Depends(verify_token)])
async def get_scenes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    name: Optional[str] = Query(None, description="按名称模糊筛选"),
):
    """分页查询，可按名称模糊筛选"""
    return await SceneService.get_all(skip=skip, limit=limit, name=name)


@router.get("/{doc_id}", summary="根据 ID 查询场景", dependencies=[Depends(verify_token)])
async def get_scene(doc_id: str):
    """根据 _id 查询单个场景"""
    scene = await SceneService.get_by_id(doc_id)
    if not scene:
        raise HTTPException(status_code=404, detail="场景不存在")
    return scene


@router.put("/{doc_id}", summary="更新场景", dependencies=[Depends(verify_token)])
async def update_scene(doc_id: str, update_data: SceneUpdate):
    """根据 _id 更新场景信息"""
    update_doc = update_data.model_dump(exclude_unset=True)
    if not update_doc:
        raise HTTPException(status_code=400, detail="没有可更新的字段")

    count = await SceneService.update_by_id(doc_id, update_doc)
    if count == 0:
        raise HTTPException(status_code=404, detail="场景不存在或没有变化")
    return {"updated": count}


@router.delete("/{doc_id}", summary="删除场景", dependencies=[Depends(verify_token)])
async def delete_scene(doc_id: str):
    """根据 _id 删除场景"""
    count = await SceneService.delete_by_id(doc_id)
    if count == 0:
        raise HTTPException(status_code=404, detail="场景不存在")
    return {"deleted": count}


@router.post(
    "/{doc_id}/devices",
    summary="追加设备项",
    dependencies=[Depends(verify_token)],
)
async def add_device(doc_id: str, device: SceneDeviceItem):
    """为指定场景追加一个设备项"""
    count = await SceneService.add_device(doc_id, device.model_dump())
    if count == 0:
        raise HTTPException(status_code=404, detail="场景不存在")
    return {"added": count}


@router.delete(
    "/{doc_id}/devices",
    summary="移除设备项",
    dependencies=[Depends(verify_token)],
)
async def remove_device(
    doc_id: str,
    device_id: str = Query(..., description="设备ID"),
):
    """根据 device_id 移除指定设备项"""
    count = await SceneService.remove_device(doc_id, device_id)
    if count == 0:
        raise HTTPException(status_code=404, detail="场景或设备不存在")
    return {"removed": count}
