"""场景 Service 层 — 封装 MongoDB 增删改查操作"""

from datetime import datetime
from typing import Optional

from bson import ObjectId

from Models.scene import Scene, SceneCollection
from Models.database import serialize_doc, serialize_docs


class SceneService:
    """场景数据访问层"""

    @classmethod
    @property
    def collection(cls):
        return SceneCollection.get_collection()

    # ==================== 写入操作 ====================

    @classmethod
    async def create(cls, scene: Scene) -> str:
        """插入一条场景记录，返回 _id"""
        doc = scene.model_dump()
        result = await cls.collection.insert_one(doc)
        return str(result.inserted_id)

    @classmethod
    async def create_many(cls, scenes: list[Scene]) -> list[str]:
        """批量插入，返回 _id 列表"""
        docs = [s.model_dump() for s in scenes]
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
        """根据场景名称查询"""
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
    async def add_device(cls, doc_id: str, device: dict) -> int:
        """为场景追加一个设备项"""
        result = await cls.collection.update_one(
            {"_id": ObjectId(doc_id)},
            {
                "$push": {"devices": device},
                "$set": {"updated_at": datetime.now()},
            },
        )
        return result.modified_count

    @classmethod
    async def remove_device(cls, doc_id: str, device_id: str) -> int:
        """移除指定设备项"""
        result = await cls.collection.update_one(
            {"_id": ObjectId(doc_id)},
            {
                "$pull": {"devices": {"device_id": device_id}},
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
    async def delete_by_name(cls, name: str) -> int:
        """根据场景名称删除"""
        result = await cls.collection.delete_one({"name": name})
        return result.deleted_count
