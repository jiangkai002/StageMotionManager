"""模型文件"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ModelFileType(str, Enum):
    """模型文件类别"""

    REVIT = "revit"  # Revit 模型
    RHINO = "rhino"  # Rhino 模型
    SKETCHUP = "sketchup"  # SketchUp 模型
    IFC = "ifc"  # IFC 模型
    GLTF = "gltf"  # GLTF/GLB 模型
    OTHER = "other"  # 其他


class ModelFile(BaseModel):
    """舞台模型文件"""

    name: str = Field(..., description="文件名称", example="主舞台模型.rvt")
    file_type: ModelFileType = Field(..., description="模型格式")
    type: str = Field(..., description="模型类型")
    room: str = Field(..., description="属于哪个厅")
    file_path: str = Field(..., description="文件存储路径")
    file_size: Optional[int] = Field(None, description="文件大小(字节)")
    description: Optional[str] = Field(None, description="文件描述")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    updated_at: datetime = Field(default_factory=datetime.now, description="更新时间")


class ModelFileCollection:
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
