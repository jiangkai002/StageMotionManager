"""构件 API 路由"""

from fastapi import APIRouter, Depends, HTTPException

from Models import StageElement, StageElementUpdate
from Services import StageElementService
from Services.auth_service import verify_token

router = APIRouter(prefix="/elements", tags=["elements"])


@router.post("", summary="创建构件", dependencies=[Depends(verify_token)])
async def create_element(element: StageElement):
    """创建一条新的舞台构件"""
    element_id = await StageElementService.create(element)
    return {"id": element_id}


@router.get("", summary="查询所有构件", dependencies=[Depends(verify_token)])
async def get_elements(skip: int = 0, limit: int = 100):
    """分页查询所有构件"""
    return await StageElementService.get_all(skip, limit)


@router.get("/{element_id}", summary="根据 elementId 查询构件")
async def get_element(element_id: int):
    """根据 elementId 查询单个构件"""
    element = await StageElementService.get_by_element_id(element_id)
    if not element:
        raise HTTPException(status_code=404, detail="构件不存在")
    return element


@router.put("/{element_id}", summary="更新构件")
async def update_element(element_id: int, update_data: StageElementUpdate):
    """根据 elementId 更新构件信息"""
    update_doc = update_data.model_dump(exclude_unset=True)
    if not update_doc:
        raise HTTPException(status_code=400, detail="没有可更新的字段")

    count = await StageElementService.update_by_element_id(element_id, update_doc)
    if count == 0:
        raise HTTPException(status_code=404, detail="构件不存在或没有变化")
    return {"updated": count}


@router.delete("/{element_id}", summary="删除构件")
async def delete_element(element_id: int):
    """根据 elementId 删除构件"""
    count = await StageElementService.delete_by_element_id(element_id)
    if count == 0:
        raise HTTPException(status_code=404, detail="构件不存在")
    return {"deleted": count}
