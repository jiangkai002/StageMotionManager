import type {
  StageCommandBatch,
  StageControlCommand,
  StageMotionTrack,
} from '@/models/StageMotionTrack'

/**
 * Vue → Babylon.js 的命令消息
 * Vue 端通过 SceneDirector 发送，Babylon 端订阅处理
 */
export enum DirectorCommand {
  /** 执行单个运动轨道 */
  ExecuteTrack = 'director:executeTrack',
  /** 执行批量运动命令 */
  ExecuteBatch = 'director:executeBatch',
  /** 执行控制命令 */
  ExecuteControl = 'director:executeControl',
  /** 设置网格位置（瞬移，无动画） */
  SetPosition = 'director:setPosition',
  /** 获取所有 mesh 名称 */
  GetMeshNames = 'director:getMeshNames',
  /** 获取当前 FPS */
  GetFps = 'director:getFps',
}

/**
 * Babylon.js → Vue 的事件消息
 * Babylon 端处理完命令后回传，或主动通知
 */
export enum DirectorEvent {
  /** 命令执行完成 */
  CommandFinished = 'director:commandFinished',
  /** 单个轨道动画完成 */
  TrackComplete = 'director:trackComplete',
  /** 批量动画完成 */
  BatchComplete = 'director:batchComplete',
  /** 序列动画完成 */
  SequenceComplete = 'director:sequenceComplete',
  /** FPS 上报 */
  Fps = 'director:fps',
  /** 场景就绪 */
  SceneReady = 'director:sceneReady',
  /** 构件被选中（点击拾取） */
  MeshSelected = 'director:meshSelected',
  /** 错误 */
  Error = 'director:error',
}

/**
 * Vue → Babylon 的命令 payload
 */
export interface DirectorCommandPayload {
  [DirectorCommand.ExecuteTrack]: { track: StageMotionTrack }
  [DirectorCommand.ExecuteBatch]: { batch: StageCommandBatch }
  [DirectorCommand.ExecuteControl]: { cmd: StageControlCommand }
  [DirectorCommand.SetPosition]: { name: string; x: number; y: number; z: number }
  [DirectorCommand.GetMeshNames]: undefined
  [DirectorCommand.GetFps]: undefined
}

/**
 * Babylon → Vue 的事件 payload
 */
export interface DirectorEventPayload {
  [DirectorEvent.CommandFinished]: {
    /** 对应的命令类型 */
    commandType: DirectorCommand
    /** 返回值（如有） */
    result?: unknown
  }
  [DirectorEvent.TrackComplete]: { elementId: string }
  [DirectorEvent.BatchComplete]: undefined
  [DirectorEvent.SequenceComplete]: undefined
  [DirectorEvent.Fps]: { value: number }
  [DirectorEvent.SceneReady]: undefined
  [DirectorEvent.MeshSelected]: { elementId: string; meshName: string }
  [DirectorEvent.Error]: { message: string; commandType?: DirectorCommand }
}

/** 所有消息类型 */
export type DirectorMessageType = DirectorCommand | DirectorEvent
