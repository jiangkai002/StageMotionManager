/** 三维向量 */
export interface FVector {
  x: number
  y: number
  z: number
}

/** 旋转（欧拉角，度） */
export interface FRotator {
  pitch: number
  yaw: number
  roll: number
}

/** 运动轨道 — 对应 FStageMotionTrack */
export interface StageMotionTrack {
  /** 构件标识（Revit Element ID） */
  elementId: string

  /** 操作类型，默认 "transform" */
  op?: 'transform' | 'translate' | 'rotate' | 'relative'

  /** 位移（绝对或相对，取决于 relative 字段） */
  translation?: FVector
  /** 位移（translation 的别名） */
  location?: FVector

  /** 旋转 */
  rotation?: FRotator
  /** 旋转（rotation 的别名） */
  rotator?: FRotator

  /** 坐标空间："world" | "local"，默认 "world" */
  space?: 'world' | 'local'

  /** 是否相对变换，默认由 op 决定 */
  relative?: boolean

  // --- 时间控制 ---
  /** 动画持续时间（秒） */
  duration?: number
  /** 延迟启动时间（秒） */
  delay?: number
  /** 绝对开始时间（秒），优先级高于 delay */
  startTime?: number
  /** startTime 的别名 */
  time?: number

  // --- 误差修正 ---
  /** 动画结束时强制对齐目标位置，默认 true */
  snapToEnd?: boolean

  // --- 循环控制 ---
  /** 循环次数：0=无限循环，1=不循环（默认） */
  loop?: number
  /** loop 的别名 */
  loopCount?: number
  /** 乒乓效果：循环时反向播放，默认 false */
  pingPong?: boolean
  /** pingPong 的别名 */
  reverseOnLoop?: boolean

  // --- 同步组 ---
  /** 同步组名称，同组轨道同步开始/结束 */
  syncGroup?: string
}

/** 批量命令 */
export interface StageCommandBatch {
  commands?: StageMotionTrack[]
  sequence?: StageMotionTrack[]
  tracks?: StageMotionTrack[]
}

/** 控制命令（非运动） */
export interface StageControlCommand {
  op:
    | 'clearSequence'
    | 'clearTimeline'
    | 'stopAll'
    | 'pause'
    | 'pauseSequence'
    | 'pauseAll'
    | 'resume'
    | 'resumeSequence'
    | 'resumeAll'
    | 'pauseTrack'
    | 'resumeTrack'
    | 'pauseGroup'
    | 'pauseSyncGroup'
    | 'resumeGroup'
    | 'resumeSyncGroup'
    | 'wait'
    | 'waitGroup'
    | 'waitSyncGroup'
    | 'setParent'
    | 'attach'
    | 'clearParent'
    | 'detach'
  elementId?: string
  syncGroup?: string
  group?: string
  parentElementId?: string
  keepWorld?: boolean
}

/** 所有支持的 JSON 命令 */
export type StageJsonCommand = StageMotionTrack | StageCommandBatch | StageControlCommand
