"""舞台构件"""

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class MotionType(str, Enum):
    TRANSLATION_X = "translation_x"
    TRANSLATION_Y = "translation_y"
    TRANSLATION_Z = "translation_z"
    ROTATION_X = "rotation_x"
    ROTATION_Y = "rotation_y"
    ROTATION_Z = "rotation_z"


class MotionRange(BaseModel):
    motion_type: MotionType = Field(..., description="运动类型")
    min: float = Field(..., description="最小范围")
    max: float = Field(..., description="最大范围")
    unit: str = Field(default="mm", description="单位，平移默认 mm，旋转默认度")


class StageElement(BaseModel):
    """舞台构件"""

    name: str = Field(..., description="构件名称")
    elementId: int = Field(..., description="构件Id")
    guid: str = Field(default="uniqueId", description="唯一标识")
    code: str = Field(default="", description="编号")
    size: str = Field(default="", description="尺寸")
    speed: float = Field(default=0, description="速度")
    model_file_id: str = Field(..., description="关联的模型文件ID")
    basic_info_id: Optional[str] = Field(None, description="关联的构件基础信息ID")
    motion_ranges: list[MotionRange] = Field(
        default_factory=list, description="构件可运动方位及范围"
    )


class StageElementUpdate(BaseModel):
    """更新舞台构件"""

    name: Optional[str] = Field(None, description="构件名称")
    elementId: Optional[int] = Field(None, description="构件Id")
    guid: Optional[str] = Field(None, description="唯一标识")
    code: Optional[str] = Field(None, description="编号")
    size: Optional[str] = Field(None, description="尺寸")
    speed: Optional[float] = Field(None, description="速度")
    model_file_id: Optional[str] = Field(None, description="关联的模型文件ID")
    basic_info_id: Optional[str] = Field(None, description="关联的构件基础信息ID")
    motion_ranges: Optional[list[MotionRange]] = Field(
        None, description="构件可运动方位及范围"
    )


class StageElementCollection:
    """舞台构件集合操作"""

    COLLECTION_NAME = "StageElement"

    @classmethod
    def get_collection(cls):
        from Models.database import get_collection

        return get_collection(cls.COLLECTION_NAME)

    @classmethod
    def create_indexes(cls):
        """创建索引"""
        collection = cls.get_collection()
        collection.create_index("elementId", unique=True)
        collection.create_index("guid", unique=True)
