from enum import Enum

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
    unit: str = Field(default="mm", description="单位，平移默认mm，旋转默认度")


class StageElement(BaseModel):
    name: str = Field(..., description="构件名称")
    elementId: int = Field(..., description="构件Id")
    guid: str = Field(default="uniqueId", description="")
    size: str = Field(default="", description="尺寸")
    speed: float = Field(default=0, description="速度")
    model_file_id: str = Field(..., description="关联的模型文件ID")
    motion_ranges: list[MotionRange] = Field(
        default_factory=list,
        description="构件可运动方位及范围"
    )


class StageElementCollection:
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
