// priority: 0

EntityJSEvents.spawned(event => {
    if (event.entity.type === 'eidolon:zombie_brute') {
        event.cancel(); // Отмена спавна — моб просто не появится
    }
});

ServerEvents.lootTables(event => {
    event.modifyEntity('minecraft:zombie', table => {
        table.addPool(pool => {
            pool.rolls = 1.0;
            pool.addCondition('minecraft:random_chance', { chance: 0.005 }); 
            pool.addEntry({
                type: 'minecraft:item',
                name: 'eidolon:zombie_heart',
                functions: [{
                    function: 'minecraft:set_count',
                    count: 1
                }]
            });
        });
    });
});