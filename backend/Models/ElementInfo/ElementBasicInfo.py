"""构件基础信息模型"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class ElementType(str, Enum):
    """构件类型"""

    UNDER_STAGE_TOWER = "台下设备-台塔"
    UNDER_STAGE_FRONT = "台下设备-舞台前部"
    UNDER_STAGE_AUX = "台下设备-辅助舞台"
    OVER_STAGE_TOWER = "台上设备-台塔"
    OVER_STAGE_FRONT = "台上设备-舞台前部"
    OVER_STAGE_SUPPORT = "台上设备-支持舞台"
    CONTROL_SYSTEM = "控制系统"
    EXTRA_EQUIPMENT = "额外设备"
    REHEARSAL_HALL = "合成排练厅设备"
    BUILDING_INFRA = "建筑基础设施"
    UNDER_STAGE = "台下设备"
    OVER_STAGE = "台上设备"


class RelatedDocument(BaseModel):
    """关联文档（OSS 上传的 PDF）"""

    name: str = Field(..., description="文档名称", example="设备说明书.pdf")
    oss_path: str = Field(..., description="OSS 存储路径")
    file_size: Optional[int] = Field(None, description="文件大小(字节)")
    uploaded_at: datetime = Field(default_factory=datetime.now, description="上传时间")


class ElementBasicInfo(BaseModel):
    """构件基础信息"""

    element_id: int = Field(..., description="构件ID")
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