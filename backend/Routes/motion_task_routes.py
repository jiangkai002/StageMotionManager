"""运动任务 API 路由"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from Models.motion_task import MotionTask, MotionTaskUpdate, TaskStatus
from Services import MotionTaskService
from Services.auth_service import verify_token

router = APIRouter(prefix="/motion-tasks", tags=["motion-tasks"])


@router.post("", summary="创建运动任务", dependencies=[Depends(verify_token)])
async def create_task(task: MotionTask):
    """创建一条运动任务"""
    doc_id = await MotionTaskService.create(task)
    return {"id": doc_id}


@router.post("/batch", summary="批量创建运动任务", dependencies=[Depends(verify_token)])
async def create_tasks(tasks: list[MotionTask]):
    """批量创建运动任务"""
    doc_ids = await MotionTaskService.create_many(tasks)
    return {"ids": doc_ids, "count": len(doc_ids)}


@router.get("", summary="查询所有运动任务", dependencies=[Depends(verify_token)])
async def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[TaskStatus] = Query(None, description="按状态筛选"),
    device_id: Optional[str] = Query(None, description="按设备ID筛选"),
):
    """分页查询，可按状态或设备筛选"""
    return await MotionTaskService.get_all(
        skip=skip,
        limit=limit,
        status=status.value if status else None,
        device_id=device_id,
    )


@router.get("/pending", summary="获取待执行任务", dependencies=[Depends(verify_token)])
async def get_pending_tasks(limit: int = Query(50, ge=1, le=200)):
    """获取待执行任务列表，按优先级降序"""
    return await MotionTaskService.get_pending_tasks(limit=limit)


@router.get("/statuses", summary="获取所有任务状态", dependencies=[Depends(verify_token)])
async def get_statuses():
    """返回所有可选的任务状态"""
    return [{"label": s.value, "value": s.value} for s in TaskStatus]


@router.get("/{doc_id}", summary="根据 ID 查询任务", dependencies=[Depends(verify_token)])
async def get_task(doc_id: str):
    """根据 _id 查询单个运动任务"""
    task = await MotionTaskService.get_by_id(doc_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task


@router.put("/{doc_id}", summary="更新任务", dependencies=[Depends(verify_token)])
async def update_task(doc_id: str, update_data: MotionTaskUpdate):
    """根据 _id 更新任务信息"""
    update_doc = update_data.model_dump(exclude_unset=True)
    if not update_doc:
        raise HTTPException(status_code=400, detail="没有可更新的字段")

    count = await MotionTaskService.update_by_id(doc_id, update_doc)
    if count == 0:
        raise HTTPException(status_code=404, detail="任务不存在或没有变化")
    return {"updated": count}


@router.put(
    "/{doc_id}/status",
    summary="更新任务状态",
    dependencies=[Depends(verify_token)],
)
async def update_task_status(
    doc_id: str,
    status: TaskStatus = Query(..., description="新状态"),
    error_message: Optional[str] = Query(None, description="错误信息，失败时填写"),
):
    """更新任务状态，自动维护 started_at / completed_at"""
    count = await MotionTaskService.update_status(doc_id, status.value, error_message)
    if count == 0:
        raise HTTPException(status_code=404, detail="任务不存在")
    return {"updated": count}


@router.delete("/{doc_id}", summary="删除任务", dependencies=[Depends(verify_token)])
async def delete_task(doc_id: str):
    """根据 _id 删除任务"""
    count = await MotionTaskService.delete_by_id(doc_id)
    if count == 0:
        raise HTTPException(status_code=404, detail="任务不存在")
    return {"deleted": count}


@router.delete(
    "/by-status/{status}",
    summary="按状态批量删除任务",
    dependencies=[Depends(verify_token)],
)
async def delete_tasks_by_status(status: TaskStatus):
    """按状态批量删除任务"""
    count = await MotionTaskService.delete_by_status(status.value)
    return {"deleted": count}
