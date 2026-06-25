"""构件基础信息模型"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from Models.ElementInfo.ElementType import ElementType


class RelatedDocument(BaseModel):
    """关联文档（OSS 上传的 PDF）"""

    name: str = Field(..., description="文档名称", example="设备说明书.pdf")
    oss_path: str = Field(..., description="OSS 存储路径")
    file_size: Optional[int] = Field(None, description="文件大小(字节)")
    uploaded_at: datetime = Field(default_factory=datetime.now, description="上传时间")


class ElementBasicInfo(BaseModel):
    """构件基础信息"""
    name: str = Field(..., description="构件名称", example="主舞台升降台")
    type: ElementType = Field(..., description="构件类型")
    specification: str = Field(default="", description="规格", example="4m×2m")
    supplier: str = Field(default="", description="供应商", example="XXX舞台设备公司")
    rated_load: str = Field(default="", description="额定荷载", example="500kg")
    drive_method: str = Field(default="", description="驱动方式", example="电动")
    function_description: str = Field(default="", description="功能说明")
    related_documents: List[RelatedDocument] = Field(
        default_factory=list, description="关联文档(OSS上传的PDF)"
    )
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    updated_at: datetime = Field(default_factory=datetime.now, description="更新时间")

    class Config:
        use_enum_values = True


class ElementBasicInfoCollection:
    """构件基础信息集合操作"""

    COLLECTION_NAME = "ElementBasicInfo"

    @classmethod
    def get_collection(cls):
        from Models.database import get_collection

        return get_collection(cls.COLLECTION_NAME)

    @classmethod
    def create_indexes(cls):
        """创建索引"""
        collection = cls.get_collection()
        collection.create_index("element_id", unique=True)
        collection.create_index("type") 