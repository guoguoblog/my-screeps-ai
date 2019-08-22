declare var module: any

/**
 * Memory 内存拓展
 * @property spawnList 要生成的 creep 队列
 */
interface Memory {
    spawnList: string[]
}

/**
 * creep 内存拓展
 * @property role crep的角色
 * @property working 是否在工作
 */
interface CreepMemory {
    role: string
    working: boolean
}

/**
 * creep 的作业操作配置项
 * @property func 要执行的方法名，必须在 Creep 原型上
 * @property args 传递给执行方法的参数数组
 */
interface IWorkOperation {
    func: string
    args: any[]
}

/**
 * creep 的配置项
 * @property source creep非工作(收集能量时)执行的方法
 * @property target creep工作时执行的方法
 * @property spawn 要进行生产的出生点
 */
interface ICreepConfig {
    source: IWorkOperation
    target: IWorkOperation
    spawn: string
    bodys: BodyPartConstant[]
}

/**
 * creep 的配置项列表
 */
interface ICreepConfigs {
    [creepName: string]: ICreepConfig
}