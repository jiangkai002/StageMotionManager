"""MongoDB 数据库连接配置（异步 motor 驱动）"""

import os
from typing import Optional

from bson import ObjectId
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection, AsyncIOMotorDatabase

# 加载 .env 文件
load_dotenv()

# MongoDB 连接配置
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "stage_motion_manager")

# 全局数据库实例
_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


def get_database() -> AsyncIOMotorDatabase:
    """获取数据库实例（单例模式）"""
    global _client, _db
    if _db is None:
        _client = AsyncIOMotorClient(MONGO_URI)
        _db = _client[MONGO_DB_NAME]
    return _db


def get_collection(name: str) -> AsyncIOMotorCollection:
    """获取指定集合"""
    return get_database()[name]


async def close_database():
    """关闭数据库连接"""
    global _client, _db
    if _client:
        _client.close()
    _client = None
    _db = None


def serialize_doc(doc: Optional[dict]) -> Optional[dict]:
    """将 MongoDB 文档中的 _id (ObjectId) 转为字符串"""
    if doc is None:
        return None
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["_id"] = str(doc["_id"])
    return doc


def serialize_docs(docs: list[dict]) -> list[dict]:
    """批量序列化"""
    return [serialize_doc(d) for d in docs]
