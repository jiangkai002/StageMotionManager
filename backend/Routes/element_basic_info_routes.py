"""构件基础信息 API 路由"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from Models.ElementInfo.elementBasicInfo import (
    ElementBasicInfo,
    ElementBasicInfoUpdate,
    RelatedDocument,
)
from Models.ElementInfo.elementType import ElementType
from Services import ElementBasicInfoService
from Services.auth_service import verify_token

router = APIRouter(prefix="/element-basic-info", tags=["element-basic-info"])


@router.post("", summary="创建构件基础信息", dependencies=[Depends(verify_token)])
async def create_basic_info(info: ElementBasicInfo):
    """创建一条构件基础信息"""
    doc_id = await ElementBasicInfoService.create(info)
    return {"id": doc_id}


@router.post("/batch", summary="批量创建构件基础信息", dependencies=[Depends(verify_token)])
async def create_basic_infos(infos: list[ElementBasicInfo]):
    """批量创建构件基础信息"""
    doc_ids = await ElementBasicInfoService.create_many(infos)
    return {"ids": doc_ids, "count": len(doc_ids)}


@router.get("", summary="查询所有构件基础信息", dependencies=[Depends(verify_token)])
async def get_basic_infos(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    type: Optional[ElementType] = Query(None, description="按类型筛选"),
):
    """分页查询，可按类型筛选"""
    return await ElementBasicInfoService.get_all(
        skip=skip, limit=limit, type=type.value if type else None
    )


@router.get("/types", summary="获取所有构件类型", dependencies=[Depends(verify_token)])
async def get_types():
    """返回所有可选的构件类型"""
    return [{"label": t.value, "value": t.value} for t in ElementType]


@router.get("/{element_id}", summary="根据 elementId 查询", dependencies=[Depends(verify_token)])
async def get_basic_info(element_id: int):
    """根据 element_id 查询单条构件基础信息"""
    info = await ElementBasicInfoService.get_by_element_id(element_id)
    if not info:
        raise HTTPException(status_code=404, detail="构件基础信息不存在")
    return info


@router.put("/{element_id}", summary="更新构件基础信息", dependencies=[Depends(verify_token)])
async def update_basic_info(element_id: int, update_data: ElementBasicInfoUpdate):
    """根据 element_id 更新构件基础信息"""
    update_doc = update_data.model_dump(exclude_unset=True)
    if not update_doc:
        raise HTTPException(status_code=400, detail="没有可更新的字段")

    count = await ElementBasicInfoService.update_by_element_id(element_id, update_doc)
    if count == 0:
        raise HTTPException(status_code=404, detail="构件不存在或没有变化")
    return {"updated": count}


@router.delete("/{element_id}", summary="删除构件基础信息", dependencies=[Depends(verify_token)])
async def delete_basic_info(element_id: int):
    """根据 element_id 删除构件基础信息"""
    count = await ElementBasicInfoService.delete_by_element_id(element_id)
    if count == 0:
        raise HTTPException(status_code=404, detail="构件不存在")
    return {"deleted": count}


@router.post(
    "/{element_id}/documents",
    summary="追加关联文档",
    dependencies=[Depends(verify_token)],
)
async def add_related_document(element_id: int, document: RelatedDocument):
    """为指定构件追加一个关联文档"""
    count = await ElementBasicInfoService.add_related_document(
        element_id, document.model_dump()
    )
    if count == 0:
        raise HTTPException(status_code=404, detail="构件不存在")
    return {"added": count}


@router.delete(
    "/{element_id}/documents",
    summary="移除关联文档",
    dependencies=[Depends(verify_token)],
)
async def remove_related_document(element_id: int, oss_path: str = Query(...)):
    """根据 oss_path 移除指定关联文档"""
    count = await ElementBasicInfoService.remove_related_document(element_id, oss_path)
    if count == 0:
        raise HTTPException(status_code=404, detail="构件或文档不存在")
    return {"removed": count}
