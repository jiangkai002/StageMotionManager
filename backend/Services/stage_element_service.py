"""构件 Service 层 — 封装 MongoDB 增删改查操作"""

from datetime import datetime
from typing import Optional

from bson import ObjectId

from Models.element import StageElement, StageElementCollection


class StageElementService:
    """构件数据访问层"""

    collection = StageElementCollection.get_collection()

    # ==================== 写入操作 ====================

    @classmethod
    def create(cls, element: StageElement) -> str:
        """
        插入一条构件记录
        :return: 插入记录的 _id（字符串）
        """
        doc = element.model_dump()
        result = cls.collection.insert_one(doc)
        return str(result.inserted_id)

    @classmethod
    def create_many(cls, elements: list[StageElement]) -> list[str]:
        """
        批量插入构件记录
        :return: 插入记录的 _id 列表
        """
        docs = [e.model_dump() for e in elements]
        result = cls.collection.insert_many(docs)
        return [str(id) for id in result.inserted_ids]

    # ==================== 查询操作 ====================

    @classmethod
    def get_by_id(cls, element_id: str) -> Optional[dict]:
        """根据 _id 查询构件"""
        return cls.collection.find_one({"_id": ObjectId(element_id)})

    @classmethod
    def get_by_element_id(cls, element_id: int) -> Optional[dict]:
        """根据 elementId 查询构件"""
        return cls.collection.find_one({"elementId": element_id})

    @classmethod
    def get_by_guid(cls, guid: str) -> Optional[dict]:
        """根据 guid 查询构件"""
        return cls.collection.find_one({"guid": guid})

    @classmethod
    def get_all(cls, skip: int = 0, limit: int = 100) -> list[dict]:
        """
        分页查询所有构件
        :param skip: 跳过条数
        :param limit: 返回条数
        """
        return list(cls.collection.find().skip(skip).limit(limit))

    # ==================== 更新操作 ====================

    @classmethod
    def update_by_id(cls, element_id: str, update_data: dict) -> int:
        """
        根据 _id 更新构件信息
        :return: 修改的文档数
        """
        update_data["updated_at"] = datetime.now()
        result = cls.collection.update_one(
            {"_id": ObjectId(element_id)},
            {"$set": update_data},
        )
        return result.modified_count

    @classmethod
    def update_by_element_id(cls, element_id: int, update_data: dict) -> int:
        """
        根据 elementId 更新构件信息
        :return: 修改的文档数
        """
        update_data["updated_at"] = datetime.now()
        result = cls.collection.update_one(
            {"elementId": element_id},
            {"$set": update_data},
        )
        return result.modified_count

    # ==================== 删除操作 ====================

    @classmethod
    def delete_by_id(cls, element_id: str) -> int:
        """
        根据 _id 删除构件
        :return: 删除的文档数
        """
        result = cls.collection.delete_one({"_id": ObjectId(element_id)})
        return result.deleted_count

    @classmethod
    def delete_by_element_id(cls, element_id: int) -> int:
        """
        根据 elementId 删除构件
        :return: 删除的文档数
        """
        result = cls.collection.delete_one({"elementId": element_id})
        return result.deleted_count
