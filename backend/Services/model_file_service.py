"""模型文件 Service 层"""

from datetime import datetime
from typing import Optional

from bson import ObjectId

from Models import ModelFile, ModelFileCollection
from Models.database import serialize_doc, serialize_docs


class ModelFileService:
    """模型文件数据访问层"""

    @classmethod
    @property
    def collection(cls):
        return ModelFileCollection.get_collection()

    # ==================== 写入操作 ====================

    @classmethod
    async def create(cls, model_file: ModelFile) -> str:
        """
        插入一条模型文件记录
        :return: 插入记录的 _id（字符串）
        """
        doc = model_file.model_dump()
        result = await cls.collection.insert_one(doc)
        return str(result.inserted_id)

    @classmethod
    async def create_many(cls, model_files: list[ModelFile]) -> list[str]:
        """
        批量插入模型文件记录
        :return: 插入记录的 _id 列表
        """
        docs = [f.model_dump() for f in model_files]
        result = await cls.collection.insert_many(docs)
        return [str(id) for id in result.inserted_ids]

    # ==================== 查询操作 ====================

    @classmethod
    async def get_by_id(cls, model_file_id: str) -> Optional[dict]:
        """根据 _id 查询模型文件"""
        doc = await cls.collection.find_one({"_id": ObjectId(model_file_id)})
        return serialize_doc(doc)

    @classmethod
    async def get_all(cls, skip: int = 0, limit: int = 100) -> list[dict]:
        """分页查询所有模型文件"""
        cursor = cls.collection.find().skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return serialize_docs(docs)

    # ==================== 更新操作 ====================

    @classmethod
    async def update_by_id(cls, model_file_id: str, update_data: dict) -> int:
        """根据 _id 更新模型文件信息"""
        update_data["updated_at"] = datetime.now()
        result = await cls.collection.update_one(
            {"_id": ObjectId(model_file_id)},
            {"$set": update_data},
        )
        return result.modified_count

    # ==================== 删除操作 ====================

    @classmethod
    async def delete_by_id(cls, model_file_id: str) -> int:
        """根据 _id 删除模型文件"""
        result = await cls.collection.delete_one({"_id": ObjectId(model_file_id)})
        return result.deleted_count
