"""构件 API 路由"""

from fastapi import APIRouter, HTTPException

from Models import StageElement
from Services import StageElementService

router = APIRouter(prefix="/elements", tags=["elements"])


@router.post("", summary="创建构件")
def create_element(element: StageElement):
    """创建一个新的舞台构件"""
    element_id = StageElementService.create(element)
    return {"id": element_id}


@router.get("", summary="查询所有构件")
def get_elements(skip: int = 0, limit: int = 100):
    """分页查询所有构件"""
    return StageElementService.get_all(skip, limit)


@router.get("/{element_id}", summary="根据 elementId 查询构件")
def get_element(element_id: int):
    """根据 elementId 查询单个构件"""
    element = StageElementService.get_by_element_id(element_id)
    if not element:
        raise HTTPException(status_code=404, detail="构件不存在")
    return element


@router.put("/{element_id}", summary="更新构件")
def update_element(element_id: int, update_data: dict):
    """根据 elementId 更新构件信息"""
    count = StageElementService.update_by_element_id(element_id, update_data)
    if count == 0:
        raise HTTPException(status_code=404, detail="构件不存在或没有变化")
    return {"updated": count}


@router.delete("/{element_id}", summary="删除构件")
def delete_element(element_id: int):
    """根据 elementId 删除构件"""
    count = StageElementService.delete_by_element_id(element_id)
    if count == 0:
        raise HTTPException(status_code=404, detail="构件不存在")
    return {"deleted": count}
