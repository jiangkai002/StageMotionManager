"""场景模型"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field
from bson import ObjectId


class SceneDeviceItem(BaseModel):
    """场景中的设备项"""
    device_id: str = Field(..., description="设备ID")
    target_position: float = Field(..., description="目标位置(mm)")
    speed: float = Field(default=100.0, description="运动速度(mm/s)")


class Scene(BaseModel):
    """场景预设模型"""
    name: str = Field(..., description="场景名称", example="开幕场景")
    description: Optional[str] = Field(None, description="场景描述")
    devices: list[SceneDeviceItem] = Field(default_factory=list, description="设备目标列表")
    duration: float = Field(default=0.0, description="预计执行时长(s)")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    updated_at: datetime = Field(default_factory=datetime.now, description="更新时间")

    class Config:
        json_encoders = {ObjectId: str}


class SceneCollection:
    """场景集合操作"""
    COLLECTION_NAME = "scenes"

    @classmethod
    def get_collection(cls):
        from Models.database import get_collection
        return get_collection(cls.COLLECTION_NAME)

    @classmethod
    def create_indexes(cls):
        """创建索引"""
        collection = cls.get_collection()
        collection.create_index("name", unique=True)
