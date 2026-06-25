# StageManager 舞台运动管理系统

用于舞台设备的 3D 模型管理、运动参数配置和运动模拟。前端基于 Vue 3 + Babylon.js 做 3D 可视化，后端用 FastAPI + MongoDB 管理数据和阿里云 OSS 存储模型文件。

## 技术栈

**前端**

- Vue 3 + TypeScript + Vite
- Babylon.js（3D 渲染、模型加载、运动动画）
- Element Plus（UI 组件库）
- Pinia（状态管理）
- axios + swagger-axios-codegen（API 客户端自动生成）

**后端**

- FastAPI + Uvicorn
- MongoDB（Motor 异步驱动）
- Pydantic（数据校验）
- 阿里云 OSS（模型文件存储，STS 临时凭证）

## 项目结构

```
StageManager/
├── backend/
│   ├── app.py                 # FastAPI 入口，路由注册
│   ├── Models/                # 数据模型定义
│   │   ├── element.py         # 舞台构件（运动范围、速度等）
│   │   ├── modelFile.py       # 模型文件记录
│   │   ├── scene.py           # 场景预设
│   │   ├── motion_task.py     # 运动任务
│   │   └── database.py        # MongoDB 连接管理
│   ├── Routes/                # API 路由
│   │   ├── element_routes.py
│   │   ├── model_file_routes.py
│   │   ├── element_basic_info_routes.py
│   │   └── operation_method_routes.py
│   └── Services/              # 业务逻辑
│       ├── oss_service.py     # 阿里云 STS 凭证签发
│       ├── model_file_service.py
│       └── stage_element_service.py
├── frontend/
│   ├── src/
│   │   ├── api/               # API 客户端（自动生成）
│   │   ├── scenes/            # Babylon.js 场景逻辑
│   │   │   ├── ModelScene.ts          # 场景创建、模型加载、拾取
│   │   │   ├── SceneDirector.ts       # 事件总线（Vue 与 Babylon 通信）
│   │   │   ├── SceneMotionController.ts  # 运动动画控制器
│   │   │   └── director-types.ts      # 消息类型定义
│   │   ├── backstage/         # 后台管理页面
│   │   │   └── settings/
│   │   │       ├── ModelUpload.vue        # 模型上传与管理
│   │   │       └── ElementMotionParaSetup.vue  # 构件运动参数配置
│   │   ├── components/
│   │   │   └── ModelViewer.vue    # 3D 模型查看器组件
│   │   ├── stores/            # Pinia 状态
│   │   ├── models/            # 前端类型定义
│   │   │   └── StageMotionTrack.ts  # 运动轨道数据结构
│   │   └── views/
│   │       └── StageMotion.vue     # 舞台运动主视图
│   └── scripts/
│       └── gen-api.mjs        # 从 OpenAPI 生成 axios 客户端
└── README.md
```

## 核心功能

### 模型管理

支持上传 GLB/GLTF 格式的 3D 模型文件到阿里云 OSS，并在数据库中记录文件元信息（名称、所属厅、文件大小等）。上传使用分片上传，支持多文件批量操作。上传完成后可在列表中查看和预览。

### 构件运动配置

每个舞台构件可以配置六个自由度的运动范围（X/Y/Z 平移、绕 X/Y/Z 旋转），包括最小值、最大值、单位和运动速度。配置数据与模型文件关联，用于后续的运动模拟。

### 3D 运动模拟

基于 Babylon.js 渲染舞台 3D 场景，支持：

- 加载 GLB 模型并自动提取 Revit 构件 ID
- 点击拾取构件，高亮选中
- 按运动轨道（Track）驱动构件平移和旋转
- 批量运动命令，支持同步组编排
- 相机自适应聚焦到模型范围

Vue 与 Babylon 之间通过 mitt 事件总线（SceneDirector）通信，不直接暴露 Babylon 对象，保持职责分离。

### 场景预设

可以保存一组设备的目标位置和运动速度为场景预设，后续可一键执行，实现舞台设备的批量定位。

## 快速开始

### 环境要求

- Node.js >= 20.19
- Python >= 3.11
- MongoDB 实例（本地或远程）
- 阿里云 OSS 账号（用于模型存储）

### 后端

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

在 `backend/` 下创建 `.env` 文件，配置 OSS 和数据库连接：

```
OSS_KEY=your_access_key
OSS_SECRET=your_access_secret
OSS_BUCKET_NAME=your_bucket
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
OSS_ROLE_ARN=acs:ram::...
OSS_REGION=oss-cn-hangzhou
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=stage_manager
```

启动后端：

```bash
python app.py
# 默认运行在 http://localhost:8000
```

### 前端

```bash
cd frontend
pnpm install
```

Vite 开发服务器默认将 `/api` 代理到 `http://localhost:8000`，如需修改可在 `vite.config.ts` 中调整。

启动开发服务器：

```bash
pnpm dev
# 默认运行在 http://localhost:5173
```

### API 客户端生成

后端启动后，可从 OpenAPI 文档自动生成前端的 axios 客户端：

```bash
pnpm gen:api
```

生成的代码位于 `src/api/generated/index.ts`，包含所有接口的 Service 类和类型定义。如果后端未运行，脚本会生成一个空的客户端骨架，不会阻断前端编译。

## 架构说明

前后端之间通过 REST API 通信，前端使用自动生成的 Service 类调用接口，不手写请求方法。数据流如下：

```
前端组件 → ModelFilesService 等 → axios (带 token 拦截) → 后端 Router → Service → MongoDB
```

3D 场景部分采用 Director 模式，Vue 端通过 SceneDirector 发送运动命令，Babylon 端的 SceneMotionController 订阅并执行动画，完成后通过事件总线回传结果。两者之间只传递数据，不传递 Babylon 对象引用。
