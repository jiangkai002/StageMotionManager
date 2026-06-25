"""操作方法 Service 层 — 封装 MongoDB 增删改查操作"""

from datetime import datetime
from typing import Optional

from bson import ObjectId

from Models.ElementInfo.operation_method import (
    OperationMethod,
    OperationMethodCollection,
)
from Models.database import serialize_doc, serialize_docs


class OperationMethodService:
    """操作方法数据访问层"""

    @classmethod
    @property
    def collection(cls):
        return OperationMethodCollection.get_collection()

    # ==================== 写入操作 ====================

    @classmethod
    async def create(cls, method: OperationMethod) -> str:
        """插入一条操作方法记录，返回 _id"""
        doc = method.model_dump()
        result = await cls.collection.insert_one(doc)
        return str(result.inserted_id)

    @classmethod
    async def create_many(cls, methods: list[OperationMethod]) -> list[str]:
        """批量插入，返回 _id 列表"""
        docs = [m.model_dump() for m in methods]
        result = await cls.collection.insert_many(docs)
        return [str(i) for i in result.inserted_ids]

    # ==================== 查询操作 ====================

    @classmethod
    async def get_by_id(cls, doc_id: str) -> Optional[dict]:
        """根据 _id 查询"""
        doc = await cls.collection.find_one({"_id": ObjectId(doc_id)})
        return serialize_doc(doc)

    @classmethod
    async def get_by_type(cls, type: str) -> Optional[dict]:
        """根据构件类型查询"""
        doc = await cls.collection.find_one({"type": type})
        return serialize_doc(doc)

    @classmethod
    async def get_all(
        cls,
        skip: int = 0,
        limit: int = 100,
        type: Optional[str] = None,
    ) -> list[dict]:
        """分页查询，可按类型筛选"""
        query = {}
        if type:
            query["type"] = type
        cursor = cls.collection.find(query).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return serialize_docs(docs)

    # ==================== 更新操作 ====================

    @classmethod
    async def update_by_id(cls, doc_id: str, update_data: dict) -> int:
        """根据 _id 更新"""
        update_data["updated_at"] = datetime.now()
        result = await cls.collection.update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": update_data},
        )
        return result.modified_count

    @classmethod
    async def update_by_type(cls, type: str, update_data: dict) -> int:
        """根据构件类型更新"""
        update_data["updated_at"] = datetime.now()
        result = await cls.collection.update_one(
            {"type": type},
            {"$set": update_data},
        )
        return result.modified_count

    @classmethod
    async def add_operation_step(cls, type: str, step: dict) -> int:
        """为指定构件类型追加一个操作步骤"""
        result = await cls.collection.update_one(
            {"type": type},
            {
                "$push": {"operation_steps": step},
                "$set": {"updated_at": datetime.now()},
            },
        )
        return result.modified_count

    @classmethod
    async def remove_operation_step(cls, type: str, index: int) -> int:
        """移除指定 index 的操作步骤"""
        result = await cls.collection.update_one(
            {"type": type},
            {
                "$pull": {"operation_steps": {"index": index}},
                "$set": {"updated_at": datetime.now()},
            },
        )
        return result.modified_count

    # ==================== 删除操作 ====================

    @classmethod
    async def delete_by_id(cls, doc_id: str) -> int:
        """根据 _id 删除"""
        result = await cls.collection.delete_one({"_id": ObjectId(doc_id)})
        return result.deleted_count

    @classmethod
    async def delete_by_type(cls, type: str) -> int:
        """根据构件类型删除"""
        result = await cls.collection.delete_one({"type": type})
        return result.deleted_count
