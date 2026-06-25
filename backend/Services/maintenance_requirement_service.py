"""维保需求 Service 层 — 封装 MongoDB 增删改查操作"""

from datetime import datetime
from typing import Optional

from bson import ObjectId

from Models.ElementInfo.maintenance_requirement import (
    MaintenanceRequirement,
    MaintenanceRequirementCollection,
)
from Models.database import serialize_doc, serialize_docs


class MaintenanceRequirementService:
    """维保需求数据访问层"""

    @classmethod
    @property
    def collection(cls):
        return MaintenanceRequirementCollection.get_collection()

    # ==================== 写入操作 ====================

    @classmethod
    async def create(cls, requirement: MaintenanceRequirement) -> str:
        """插入一条维保需求记录，返回 _id"""
        doc = requirement.model_dump()
        result = await cls.collection.insert_one(doc)
        return str(result.inserted_id)

    @classmethod
    async def create_many(cls, requirements: list[MaintenanceRequirement]) -> list[str]:
        """批量插入，返回 _id 列表"""
        docs = [r.model_dump() for r in requirements]
        result = await cls.collection.insert_many(docs)
        return [str(i) for i in result.inserted_ids]

    # ==================== 查询操作 ====================

    @classmethod
    async def get_by_id(cls, doc_id: str) -> Optional[dict]:
        """根据 _id 查询"""
        doc = await cls.collection.find_one({"_id": ObjectId(doc_id)})
        return serialize_doc(doc)

    @classmethod
    async def get_by_name(cls, name: str) -> Optional[dict]:
        """根据维保名称查询"""
        doc = await cls.collection.find_one({"name": name})
        return serialize_doc(doc)

    @classmethod
    async def get_all(
        cls,
        skip: int = 0,
        limit: int = 100,
        name: Optional[str] = None,
    ) -> list[dict]:
        """分页查询，可按名称模糊筛选"""
        query = {}
        if name:
            query["name"] = {"$regex": name, "$options": "i"}
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
    async def update_by_name(cls, name: str, update_data: dict) -> int:
        """根据维保名称更新"""
        update_data["updated_at"] = datetime.now()
        result = await cls.collection.update_one(
            {"name": name},
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
    async def delete_by_name(cls, name: str) -> int:
        """根据维保名称删除"""
        result = await cls.collection.delete_one({"name": name})
        return result.deleted_count
