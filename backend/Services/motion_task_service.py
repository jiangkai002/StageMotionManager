"""运动任务 Service 层 — 封装 MongoDB 增删改查操作"""

from datetime import datetime
from typing import Optional

from bson import ObjectId

from Models.motion_task import MotionTask, MotionTaskCollection
from Models.database import serialize_doc, serialize_docs


class MotionTaskService:
    """运动任务数据访问层"""

    @classmethod
    @property
    def collection(cls):
        return MotionTaskCollection.get_collection()

    # ==================== 写入操作 ====================

    @classmethod
    async def create(cls, task: MotionTask) -> str:
        """插入一条运动任务记录，返回 _id"""
        doc = task.model_dump()
        result = await cls.collection.insert_one(doc)
        return str(result.inserted_id)

    @classmethod
    async def create_many(cls, tasks: list[MotionTask]) -> list[str]:
        """批量插入，返回 _id 列表"""
        docs = [t.model_dump() for t in tasks]
        result = await cls.collection.insert_many(docs)
        return [str(i) for i in result.inserted_ids]

    # ==================== 查询操作 ====================

    @classmethod
    async def get_by_id(cls, doc_id: str) -> Optional[dict]:
        """根据 _id 查询"""
        doc = await cls.collection.find_one({"_id": ObjectId(doc_id)})
        return serialize_doc(doc)

    @classmethod
    async def get_by_device_id(cls, device_id: str) -> list[dict]:
        """根据设备 ID 查询所有关联任务"""
        cursor = cls.collection.find({"device_id": device_id})
        docs = await cursor.to_list(length=100)
        return serialize_docs(docs)

    @classmethod
    async def get_all(
        cls,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        device_id: Optional[str] = None,
    ) -> list[dict]:
        """分页查询，可按状态 / 设备筛选"""
        query = {}
        if status:
            query["status"] = status
        if device_id:
            query["device_id"] = device_id
        cursor = cls.collection.find(query).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return serialize_docs(docs)

    @classmethod
    async def get_pending_tasks(cls, limit: int = 50) -> list[dict]:
        """获取待执行任务（按优先级降序）"""
        cursor = (
            cls.collection.find({"status": "pending"})
            .sort("priority", -1)
            .limit(limit)
        )
        docs = await cursor.to_list(length=limit)
        return serialize_docs(docs)

    # ==================== 更新操作 ====================

    @classmethod
    async def update_by_id(cls, doc_id: str, update_data: dict) -> int:
        """根据 _id 更新"""
        result = await cls.collection.update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": update_data},
        )
        return result.modified_count

    @classmethod
    async def update_status(
        cls,
        doc_id: str,
        status: str,
        error_message: Optional[str] = None,
    ) -> int:
        """更新任务状态"""
        update_data: dict = {"status": status}
        now = datetime.now()
        if status == "running":
            update_data["started_at"] = now
        elif status in ("completed", "failed"):
            update_data["completed_at"] = now
        if error_message:
            update_data["error_message"] = error_message
        result = await cls.collection.update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": update_data},
        )
        return result.modified_count

    # ==================== 删除操作 ====================

    @classmethod
    async def delete_by_id(cls, doc_id: str) -> int:
        """根据 _id 删除"""
        result = await cls.collection.delete_one({"_id": ObjectId(doc_id)})
        return result.deleted_count

    @classmethod
    async def delete_by_status(cls, status: str) -> int:
        """按状态批量删除（如清理已完成 / 已取消任务）"""
        result = await cls.collection.delete_many({"status": status})
        return result.deleted_count
