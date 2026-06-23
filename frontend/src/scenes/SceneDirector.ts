import mitt from 'mitt'
import type {
  DirectorCommandPayload,
  DirectorEventPayload,
  DirectorMessageType,
} from './director-types'
import { DirectorCommand, DirectorEvent } from './director-types'

/**
 * 消息总线类型映射
 * mitt 需要一个 Record<EventType, Payload> 类型
 */
type BusEvents = {
  [K in DirectorCommand]: DirectorCommandPayload[K]
} & {
  [K in DirectorEvent]: DirectorEventPayload[K]
}

/**
 * 事件总线单例
 * Vue 和 Babylon.js 之间唯一的通信通道
 * 所有数据通过 JSON 序列化传递，不暴露 Babylon 对象
 */
export const bus = mitt<BusEvents>()
class SceneDirector {
  /**
   * 执行单个运动轨道
   */
  executeTrack(track: StageMotionTrack): void {
    bus.emit(DirectorCommand.ExecuteTrack, { track })
  }

  /**
   * 执行批量运动命令
   */
  executeBatch(batch: StageCommandBatch): void {
    bus.emit(DirectorCommand.ExecuteBatch, { batch })
  }

  /**
   * 执行控制命令
   */
  executeControl(cmd: StageControlCommand): void {
    bus.emit(DirectorCommand.ExecuteControl, { cmd })
  }

  /**
   * 设置网格位置（瞬移，无动画）
   */
  setPosition(name: string, x: number, y: number, z: number): void {
    bus.emit(DirectorCommand.SetPosition, { name, x, y, z })
  }

  /**
   * 获取所有 mesh 名称（异步）
   */
  async getMeshNames(): Promise<string[]> {
    return this.asyncCommand<string[]>(DirectorCommand.GetMeshNames)
  }

  /**
   * 获取当前 FPS（异步）
   */
  async getFps(): Promise<number> {
    return this.asyncCommand<number>(DirectorCommand.GetFps)
  }

  // ─── 异步命令辅助 ─────────────────────────

  /**
   * 发送命令并等待 Babylon 端回传结果
   * 通过 CommandFinished 事件匹配 commandType
   */
  private async asyncCommand<T>(commandType: DirectorCommand): Promise<T> {
    return new Promise<T>((resolve) => {
      const handler = (payload: DirectorEventPayload[DirectorEvent.CommandFinished]) => {
        if (payload.commandType === commandType) {
          bus.off(DirectorEvent.CommandFinished, handler)
          resolve(payload.result as T)
        }
      }
      bus.on(DirectorEvent.CommandFinished, handler)
      bus.emit(commandType, undefined as never)
    })
  }

  // ─── 事件监听 ─────────────────────────────

  /**
   * 监听 Babylon 端发来的事件
   * @returns 取消监听函数
   */
  on<K extends DirectorEvent>(
    event: K,
    handler: (payload: DirectorEventPayload[K]) => void,
  ): () => void {
    bus.on(event, handler)
    return () => bus.off(event, handler)
  }

  /**
   * 取消监听
   */
  off<K extends DirectorEvent>(
    event: K,
    handler: (payload: DirectorEventPayload[K]) => void,
  ): void {
    bus.off(event, handler)
  }
}

// ─── 导入类型（避免循环依赖） ─────────────────
import type {
  StageCommandBatch,
  StageControlCommand,
  StageMotionTrack,
} from '@/models/StageMotionTrack'

/** Director 单例 */
export const director = new SceneDirector()
