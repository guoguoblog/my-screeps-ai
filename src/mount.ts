import mountCreep from './mount.creep'
import mountRoom from './mount.room'
import mountGlobal from './mount.global'
import mountStructure from './mount.structure'

/**
 * 挂载所有的额外属性和方法
 */
export default function (): void {
    if (!global.hasExtension) {
        console.log('[mount] 重新挂载拓展')
        global.hasExtension = true

        // 挂载全部拓展
        mountGlobal()
        mountRoom()
        mountCreep()
        mountStructure()
    }
}