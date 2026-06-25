"""运动任务模型"""

from datetime import datetime
from enum import Enum
from typing import Optional

from bson import ObjectId
from pydantic import BaseModel, Field


class TaskStatus(str, Enum):
    """任务状态"""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class MotionTask(BaseModel):
    """运动任务模型"""

    device_id: str = Field(..., description="设备ID")
    scene_id: Optional[str] = Field(None, description="关联场景ID")
    target_position: float = Field(..., description="目标位置(mm)")
    speed: float = Field(default=100.0, description="运动速度(mm/s)")
    status: TaskStatus = Field(default=TaskStatus.PENDING, description="任务状态")
    priority: int = Field(default=0, description="优先级，数字越大优先级越高")
    error_message: Optional[str] = Field(None, description="错误信息")
    started_at: Optional[datetime] = Field(None, description="开始执行时间")
    completed_at: Optional[datetime] = Field(None, description="完成时间")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")

    class Config:
        json_encoders = {ObjectId: str}
        use_enum_values = True


class MotionTaskUpdate(BaseModel):
    """更新运动任务"""

    device_id: Optional[str] = Field(None, description="设备ID")
    scene_id: Optional[str] = Field(None, description="关联场景ID")
    target_position: Optional[float] = Field(None, description="目标位置(mm)")
    speed: Optional[float] = Field(None, description="运动速度(mm/s)")
    status: Optional[TaskStatus] = Field(None, description="任务状态")
    priority: Optional[int] = Field(None, description="优先级")
    error_message: Optional[str] = Field(None, description="错误信息")
    started_at: Optional[datetime] = Field(None, description="开始执行时间")
    completed_at: Optional[datetime] = Field(None, description="完成时间")

    class Config:
        json_encoders = {ObjectId: str}
        use_enum_values = True


class MotionTaskCollection:
    """运动任务集合操作"""

    COLLECTION_NAME = "motion_tasks"

    @classmethod
    def get_collection(cls):
        from Models.database import get_collection

        return get_collection(cls.COLLECTION_NAME)

    @classmethod
    def create_indexes(cls):
        """创建索引"""
        collection = cls.get_collection()
        collection.create_index([("device_id", 1), ("status", 1)])
        collection.create_index("priority")
        collection.create_index("created_at")
