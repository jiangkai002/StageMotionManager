"""模型文件"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ModelFileType(str, Enum):
    """模型文件类别"""

    REVIT = "revit"
    RHINO = "rhino"
    SKETCHUP = "sketchup"
    IFC = "ifc"
    GLTF = "gltf"
    OTHER = "other"


class ModelFile(BaseModel):
    """舞台模型文件"""

    name: str = Field(..., description="文件名称", example="主舞台模型.rvt")
    file_type: ModelFileType = Field(..., description="模型格式")
    type: str = Field(..., description="模型类型")
    room: str = Field(..., description="所属厅")
    file_path: str = Field(..., description="文件存储路径")
    file_size: Optional[int] = Field(None, description="文件大小(字节)")
    description: Optional[str] = Field(None, description="文件描述")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    updated_at: datetime = Field(default_factory=datetime.now, description="更新时间")


class ModelFileUpdate(BaseModel):
    """更新模型文件"""

    name: Optional[str] = Field(None, description="文件名称")
    file_type: Optional[ModelFileType] = Field(None, description="模型格式")
    type: Optional[str] = Field(None, description="模型类型")
    room: Optional[str] = Field(None, description="所属厅")
    file_path: Optional[str] = Field(None, description="文件存储路径")
    file_size: Optional[int] = Field(None, description="文件大小(字节)")
    description: Optional[str] = Field(None, description="文件描述")


class ModelFileCollection:
    """模型文件集合操作"""

    COLLECTION_NAME = "ModelFile"

    @classmethod
    def get_collection(cls):
        from Models.database import get_collection

        return get_collection(cls.COLLECTION_NAME)

    @classmethod
    def create_indexes(cls):
        """创建索引"""
        collection = cls.get_collection()
        collection.create_index("name", unique=True)
