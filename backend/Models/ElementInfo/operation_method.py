"""操作方法模型"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field

from Models.ElementInfo.elementType import ElementType


class OperationType(str, Enum):
    NORMAL = "常规操作"
    URGENT = "紧急停止"
    MSSWITCH = "主备切换"


class OperationStep(BaseModel):
    index: int = Field(..., description="操作顺序", example=1)
    step_name: str = Field(..., description="操作名称", example="启动升降台")
    operation_detail: str = Field(default="", description="具体操作细节", example="按下控制面板的启动按钮")
    operation_type: OperationType = Field(..., description="操作类型", example="常规操作")


class OperationMethod(BaseModel):
    type: ElementType = Field(..., description="构件类别")
    operation_steps: List[OperationStep] = Field(
        default_factory=list, description="操作步骤列表"
    )
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    updated_at: datetime = Field(default_factory=datetime.now, description="更新时间")

    class Config:
        use_enum_values = True


class OperationMethodUpdate(BaseModel):
    type: Optional[ElementType] = Field(None, description="鏋勪欢绫诲埆")
    operation_steps: Optional[List[OperationStep]] = Field(
        None, description="鎿嶄綔姝ラ鍒楄〃"
    )

    class Config:
        use_enum_values = True


class OperationMethodCollection:
    """操作方法集合操作"""

    COLLECTION_NAME = "OperationMethod"

    @classmethod
    def get_collection(cls):
        from Models.database import get_collection

        return get_collection(cls.COLLECTION_NAME)

    @classmethod
    def create_indexes(cls):
        """创建索引"""
        collection = cls.get_collection()
        collection.create_index("type", unique=True)
