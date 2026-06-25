"""Routes 模块"""

from .element_routes import router as element_router
from .model_file_routes import router as model_file_router
from .element_basic_info_routes import router as element_basic_info_router
from .operation_method_routes import router as operation_method_router
from .scene_routes import router as scene_router
from .motion_task_routes import router as motion_task_router
from .maintenance_requirement_routes import router as maintenance_requirement_router

__all__ = [
    "element_router",
    "model_file_router",
    "element_basic_info_router",
    "operation_method_router",
    "scene_router",
    "motion_task_router",
    "maintenance_requirement_router",
]
