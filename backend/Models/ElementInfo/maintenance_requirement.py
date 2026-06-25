"""维保要求模型"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class MaintenancePeriod(str, Enum):
    """维保周期单位"""

    DAY = "天"
    WEEK = "周"
    MONTH = "月"
    YEAR = "年"


class Frequency(BaseModel):
    """维保频率"""

    times: int = Field(default=1, description="次数", example=2)
    period: MaintenancePeriod = Field(
        default=MaintenancePeriod.MONTH, description="周期单位"
    )


class MaintenanceRequirement(BaseModel):
    """维保要求"""

    name: str = Field(..., description="维保名称", example="升降台月度保养")
    content: str = Field(..., description="维保内容")
    frequency: Frequency = Field(..., description="维保频率")
    video_url: str = Field(default="", description="教学视频地址")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    updated_at: datetime = Field(default_factory=datetime.now, description="更新时间")

    class Config:
        use_enum_values = True


class MaintenanceRequirementUpdate(BaseModel):
    """更新维保要求"""

    name: Optional[str] = Field(None, description="维保名称")
    content: Optional[str] = Field(None, description="维保内容")
    frequency: Optional[Frequency] = Field(None, description="维保频率")
    video_url: Optional[str] = Field(None, description="教学视频地址")

    class Config:
        use_enum_values = True


class MaintenanceRequirementCollection:
    """维保要求集合操作"""

    COLLECTION_NAME = "MaintenanceRequirement"

    @classmethod
    def get_collection(cls):
        from Models.database import get_collection

        return get_collection(cls.COLLECTION_NAME)

    @classmethod
    def create_indexes(cls):
        """创建索引"""
        collection = cls.get_collection()
        collection.create_index("name")
