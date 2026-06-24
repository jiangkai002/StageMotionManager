"""Models 模块"""

from .database import get_database, get_collection, close_database
from .element import MotionType, MotionRange, StageElement, StageElementCollection
from .modelFile import ModelFile, ModelFileType, ModelFileCollection
from .scene import Scene, SceneDeviceItem, SceneCollection
from .motion_task import MotionTask, TaskStatus, MotionTaskCollection
from .ElementInfo import (
    ElementType,
    RelatedDocument,
    ElementBasicInfo,
    ElementBasicInfoCollection,
)

__all__ = [
    # 数据库
    "get_database",
    "get_collection",
    "close_database",
    # 构件
    "MotionType",
    "MotionRange",
    "StageElement",
    "StageElementCollection",
    # 模型文件
    "ModelFile",
    "ModelFileType",
    "ModelFileCollection",
    # 场景
    "Scene",
    "SceneDeviceItem",
    "SceneCollection",
    # 运动任务
    "MotionTask",
    "TaskStatus",
    "MotionTaskCollection",
    # 构件基础信息
    "ElementType",
    "RelatedDocument",
    "ElementBasicInfo",
    "ElementBasicInfoCollection",
]
