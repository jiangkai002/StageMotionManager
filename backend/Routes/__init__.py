"""Routes 模块"""

from .element_routes import router as element_router
from .model_file_routes import router as model_file_router
from .element_basic_info_routes import router as element_basic_info_router

__all__ = [
    "element_router",
    "model_file_router",
    "element_basic_info_router",
]
