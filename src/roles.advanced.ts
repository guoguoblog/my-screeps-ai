/**
 * 高级房间运营角色组
 * 本角色组包括了有 Storage 和 Link 的房间内运维所需的角色
 */
export default {
    /**
     * 运输者
     * 从 Storage 中获取能量，并填充 Spawn Extension 和 Tower
     * 
     * @param spawnName 出生点名称
     * @param sourceId 从该建筑中获取能量 (可选, 默认 Storage)
     */
    transfer: (spawnName: string, sourceId: string = null): ICreepConfig => ({
        source: creep => creep.getEngryFrom(sourceId ? Game.getObjectById(sourceId) : creep.room.storage),
        target: creep => {
            // // 没有要填能量的建筑时就待机
            // if (!creep.room._needFillEnergyStructure) {
            //     creep.room.memory.allStructureFillEnergy = true
            //     return
            // }

            // const target: StructureSpawn | StructureExtension | StructureTower = Game.getObjectById(creep.room._needFillEnergyStructure.id)
            // if (!target) return console.log(creep.name, '未找到该建筑')
            // // else console.log(`明白了! ${creep.name} 填充 ${target}`)
            // // const amount = creep.room._needFillEnergyStructure.amount 
            // const transferResult = creep.transfer(target, RESOURCE_ENERGY)
            // if (transferResult === ERR_NOT_IN_RANGE) creep.moveTo(target)
            // else if (transferResult != OK) creep.say(`错误! ${transferResult}`)

            let target: StructureSpawn | StructureExtension | StructureTower
            // 有缓存就从缓存获取
            if (creep.memory.fillStructureId) {
                target = <StructureSpawn | StructureExtension | StructureTower>Game.getObjectById(creep.memory.fillStructureId)
                // 如果找不到对应的建筑或者已经填满了就移除缓存
                if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) delete creep.memory.fillStructureId
            }
            if (!creep.memory.fillStructureId) {
                // 获取有需求的建筑
                target = <StructureSpawn | StructureExtension | StructureTower>creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: s => (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_TOWER) && s.energy < s.energyCapacity
                })
                if (!target) return 

                // 写入缓存
                creep.memory.fillStructureId = target.id
            }

            // 获取填充的数量
            // let amount = target.store.getFreeCapacity(RESOURCE_ENERGY)
            // if (amount > creep.store[RESOURCE_ENERGY]) amount = undefined
            
            // 有的话就填充能量
            const transferResult = creep.transfer(target, RESOURCE_ENERGY)
            if (transferResult === ERR_NOT_IN_RANGE) creep.moveTo(target, { reusePath: 20 })
            else if (transferResult != OK) creep.say(`错误! ${transferResult}`)
        },
        switch: creep => creep.store[RESOURCE_ENERGY] > 0,
        spawn: spawnName,
        bodyType: 'transfer'
    }),

    /**
     * 中心搬运者
     * 从 centerLink 中获取能量，并填充 Storage
     * 
     * @param spawnName 出生点名称
     * @param x 要移动到的 x 坐标
     * @param y 要移动到的 y 坐标
     * @param centerLinkId 中央 link 的 id
     */
    centerTransfer: (spawnName: string, x: number, y: number): ICreepConfig => ({
        // 移动到指定位置
        prepare: creep => creep.moveTo(x, y, { reusePath: 20 }),
        isReady: creep => creep.pos.isEqualTo(x, y),
        // 从中央任务队列中取出任务并执行
        source: creep => {
            // 快死了就拒绝执行任务
            if (creep.ticksToLive <= 5) return
            // 获取订单
            const task = creep.room.getTask()
            if (!task) return 

            const structure: AnyStructure = Game.getObjectById(task.sourceId)
            const result = creep.withdraw(structure, task.resourceType)
            if (result === ERR_NOT_ENOUGH_RESOURCES) {
                creep.room.hangTask()
            }
            else if (result !== OK) {
                creep.say(`取出 ${result}`)
                creep.room.hangTask()
            }
        },
        // 身上有能量就放到 Storage 里
        target: creep => {
            const task = creep.room.getTask()
            if (!task) return

            // 提前获取携带量
            const amount: number = creep.store.getUsedCapacity(task.resourceType)

            const structure: AnyStructure = Game.getObjectById(task.targetId)
            const result = creep.transfer(structure, task.resourceType)
            // 如果转移完成则增加任务进度
            if (result === OK) creep.room.handleTask(amount)
            else {
                creep.say(`存入 ${result}`)
                creep.room.hangTask()
            }
        },
        switch: creep => creep.store.getUsedCapacity() > 0,
        spawn: spawnName,
        bodyType: 'transfer'
    })
}