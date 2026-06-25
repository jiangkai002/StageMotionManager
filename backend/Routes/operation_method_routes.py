"""操作方法 API 路由"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from Models.ElementInfo.elementType import ElementType
from Models.ElementInfo.operation_method import (
    OperationMethod,
    OperationMethodUpdate,
    OperationStep,
)
from Services import OperationMethodService
from Services.auth_service import verify_token

router = APIRouter(prefix="/operation-method", tags=["operation-method"])


# ==================== 增删改查 ====================


@router.post("", summary="创建操作方法", dependencies=[Depends(verify_token)])
async def create_operation_method(method: OperationMethod):
    """创建一条操作方法记录"""
    doc_id = await OperationMethodService.create(method)
    return {"id": doc_id}


@router.post("/batch", summary="批量创建", dependencies=[Depends(verify_token)])
async def create_operation_methods(methods: list[OperationMethod]):
    """批量创建操作方法"""
    doc_ids = await OperationMethodService.create_many(methods)
    return {"ids": doc_ids, "count": len(doc_ids)}


@router.get("", summary="查询所有操作方法", dependencies=[Depends(verify_token)])
async def get_operation_methods(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    type: Optional[ElementType] = Query(None, description="按构件类型筛选"),
):
    """分页查询，可按构件类型筛选"""
    return await OperationMethodService.get_all(
        skip=skip, limit=limit, type=type.value if type else None
    )


@router.get("/types", summary="获取所有操作类型", dependencies=[Depends(verify_token)])
async def get_operation_types():
    """返回所有可选的操作类型"""
    from Models.ElementInfo.operation_method import OperationType

    return [{"label": t.value, "value": t.value} for t in OperationType]


@router.get("/{type}", summary="根据构件类型查询", dependencies=[Depends(verify_token)])
async def get_operation_method(type: ElementType):
    """根据构件类型查询单条操作方法"""
    info = await OperationMethodService.get_by_type(type.value)
    if not info:
        raise HTTPException(status_code=404, detail="操作方法不存在")
    return info


@router.put("/{type}", summary="更新操作方法", dependencies=[Depends(verify_token)])
async def update_operation_method(type: ElementType, update_data: OperationMethodUpdate):
    """根据构件类型更新操作方法"""
    update_doc = update_data.model_dump(exclude_unset=True)
    if not update_doc:
        raise HTTPException(status_code=400, detail="娌℃湁鍙洿鏂扮殑瀛楁")

    count = await OperationMethodService.update_by_type(type.value, update_doc)
    if count == 0:
        raise HTTPException(status_code=404, detail="操作方法不存在或没有变化")
    return {"updated": count}


@router.delete("/{type}", summary="删除操作方法", dependencies=[Depends(verify_token)])
async def delete_operation_method(type: ElementType):
    """根据构件类型删除操作方法"""
    count = await OperationMethodService.delete_by_type(type.value)
    if count == 0:
        raise HTTPException(status_code=404, detail="操作方法不存在")
    return {"deleted": count}


# ==================== 操作步骤管理 ====================


@router.post(
    "/{type}/steps",
    summary="追加操作步骤",
    dependencies=[Depends(verify_token)],
)
async def add_operation_step(type: ElementType, step: OperationStep):
    """为指定构件类型追加一个操作步骤"""
    count = await OperationMethodService.add_operation_step(
        type.value, step.model_dump()
    )
    if count == 0:
        raise HTTPException(status_code=404, detail="操作方法不存在")
    return {"added": count}


@router.delete(
    "/{type}/steps",
    summary="移除操作步骤",
    dependencies=[Depends(verify_token)],
)
async def remove_operation_step(
    type: ElementType, index: int = Query(..., description="操作步骤序号")
):
    """根据 index 移除指定操作步骤"""
    count = await OperationMethodService.remove_operation_step(type.value, index)
    if count == 0:
        raise HTTPException(status_code=404, detail="操作方法或步骤不存在")
    return {"removed": count}
