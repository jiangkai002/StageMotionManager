"""构件基础信息 Service 层 — 封装 MongoDB 增删改查操作"""

from datetime import datetime
from typing import Optional

from bson import ObjectId

from Models.ElementInfo.ElementBasicInfo import (
    ElementBasicInfo,
    ElementBasicInfoCollection,
)
from Models.database import serialize_doc, serialize_docs


class ElementBasicInfoService:
    """构件基础信息数据访问层"""

    @classmethod
    @property
    def collection(cls):
        return ElementBasicInfoCollection.get_collection()

    # ==================== 写入操作 ====================

    @classmethod
    async def create(cls, info: ElementBasicInfo) -> str:
        """插入一条构件基础信息记录，返回 _id"""
        doc = info.model_dump()
        result = await cls.collection.insert_one(doc)
        return str(result.inserted_id)

    @classmethod
    async def create_many(cls, infos: list[ElementBasicInfo]) -> list[str]:
        """批量插入，返回 _id 列表"""
        docs = [i.model_dump() for i in infos]
        result = await cls.collection.insert_many(docs)
        return [str(i) for i in result.inserted_ids]

    # ==================== 查询操作 ====================

    @classmethod
    async def get_by_id(cls, doc_id: str) -> Optional[dict]:
        """根据 _id 查询"""
        doc = await cls.collection.find_one({"_id": ObjectId(doc_id)})
        return serialize_doc(doc)

    @classmethod
    async def get_by_element_id(cls, element_id: int) -> Optional[dict]:
        """根据 element_id 查询"""
        doc = await cls.collection.find_one({"element_id": element_id})
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
    async def update_by_element_id(cls, element_id: int, update_data: dict) -> int:
        """根据 element_id 更新"""
        update_data["updated_at"] = datetime.now()
        result = await cls.collection.update_one(
            {"element_id": element_id},
            {"$set": update_data},
        )
        return result.modified_count

    @classmethod
    async def add_related_document(
        cls, element_id: int, document: dict
    ) -> int:
        """为构件追加一个关联文档"""
        result = await cls.collection.update_one(
            {"element_id": element_id},
            {
                "$push": {"related_documents": document},
                "$set": {"updated_at": datetime.now()},
            },
        )
        return result.modified_count

    @classmethod
    async def remove_related_document(
        cls, element_id: int, oss_path: str
    ) -> int:
        """移除指定关联文档"""
        result = await cls.collection.update_one(
            {"element_id": element_id},
            {
                "$pull": {"related_documents": {"oss_path": oss_path}},
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
    async def delete_by_element_id(cls, element_id: int) -> int:
        """根据 element_id 删除"""
        result = await cls.collection.delete_one({"element_id": element_id})
        return result.deleted_count
