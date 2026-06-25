"""维保需求 API 路由"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from Models.ElementInfo.maintenance_requirement import (
    MaintenanceRequirement,
    MaintenanceRequirementUpdate,
    MaintenancePeriod,
)
from Services import MaintenanceRequirementService
from Services.auth_service import verify_token

router = APIRouter(
    prefix="/maintenance-requirements", tags=["maintenance-requirements"]
)


# ==================== 增删改查 ====================


@router.post("", summary="创建维保需求", dependencies=[Depends(verify_token)])
async def create_requirement(requirement: MaintenanceRequirement):
    """创建一条维保需求"""
    doc_id = await MaintenanceRequirementService.create(requirement)
    return {"id": doc_id}


@router.post("/batch", summary="批量创建", dependencies=[Depends(verify_token)])
async def create_requirements(requirements: list[MaintenanceRequirement]):
    """批量创建维保需求"""
    doc_ids = await MaintenanceRequirementService.create_many(requirements)
    return {"ids": doc_ids, "count": len(doc_ids)}


@router.get("", summary="查询所有维保需求", dependencies=[Depends(verify_token)])
async def get_requirements(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    name: Optional[str] = Query(None, description="按名称模糊筛选"),
):
    """分页查询，可按名称模糊筛选"""
    return await MaintenanceRequirementService.get_all(
        skip=skip, limit=limit, name=name
    )


@router.get(
    "/periods",
    summary="获取所有维保周期单位",
    dependencies=[Depends(verify_token)],
)
async def get_periods():
    """返回所有可选的维保周期单位"""
    return [{"label": p.value, "value": p.value} for p in MaintenancePeriod]


@router.get(
    "/{doc_id}",
    summary="根据 ID 查询维保需求",
    dependencies=[Depends(verify_token)],
)
async def get_requirement(doc_id: str):
    """根据 _id 查询单条维保需求"""
    requirement = await MaintenanceRequirementService.get_by_id(doc_id)
    if not requirement:
        raise HTTPException(status_code=404, detail="维保需求不存在")
    return requirement


@router.put(
    "/{doc_id}",
    summary="更新维保需求",
    dependencies=[Depends(verify_token)],
)
async def update_requirement(
    doc_id: str, update_data: MaintenanceRequirementUpdate
):
    """根据 _id 更新维保需求"""
    update_doc = update_data.model_dump(exclude_unset=True)
    if not update_doc:
        raise HTTPException(status_code=400, detail="没有可更新的字段")
    count = await MaintenanceRequirementService.update_by_id(doc_id, update_doc)
    if count == 0:
        raise HTTPException(status_code=404, detail="维保需求不存在或没有变化")
    return {"updated": count}


@router.delete(
    "/{doc_id}",
    summary="删除维保需求",
    dependencies=[Depends(verify_token)],
)
async def delete_requirement(doc_id: str):
    """根据 _id 删除维保需求"""
    count = await MaintenanceRequirementService.delete_by_id(doc_id)
    if count == 0:
        raise HTTPException(status_code=404, detail="维保需求不存在")
    return {"deleted": count}
