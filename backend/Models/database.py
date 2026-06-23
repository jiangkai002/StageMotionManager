"""MongoDB 数据库连接配置"""

import os
from urllib.parse import quote_plus

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

# 加载 .env 文件
load_dotenv()

# MongoDB 连接配置
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "stage_motion_manager")
MONGO_USERNAME = os.getenv("MONGO_USERNAME")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
MONGO_AUTH_SOURCE = os.getenv("MONGO_AUTH_SOURCE", "admin")

# 全局数据库实例
_client: MongoClient | None = None
_db: Database | None = None


def _build_mongo_uri() -> str:
    """构建带认证的 MongoDB URI"""
    if MONGO_USERNAME and MONGO_PASSWORD:
        # 对用户名和密码进行 URL 编码，防止特殊字符影响连接
        username = quote_plus(MONGO_USERNAME)
        password = quote_plus(MONGO_PASSWORD)
        auth_source = MONGO_AUTH_SOURCE

        # 如果 URI 已包含认证信息，直接返回
        if "@" in MONGO_URI:
            return MONGO_URI

        # 在 URI 中插入用户名和密码
        # mongodb://host:port → mongodb://user:pass@host:port
        protocol, rest = MONGO_URI.split("//", 1)
        return f"{protocol}//{username}:{password}@{rest}?authSource={auth_source}"

    return MONGO_URI


def get_database() -> Database:
    """获取数据库实例（单例模式）"""
    global _client, _db
    if _db is None:
        uri = _build_mongo_uri()
        _client = MongoClient(uri)
        _db = _client[MONGO_DB_NAME]
    return _db


def get_collection(name: str) -> Collection:
    """获取指定集合"""
    return get_database()[name]


def close_database():
    """关闭数据库连接"""
    global _client, _db
    if _client:
        _client.close()
    _client = None
    _db = None
