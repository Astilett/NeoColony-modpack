const EFFECT_ID = 'kubejs:bleeding';
const EFFECT_DURATION = 4 * 20;
const BASE_DAMAGE = 0.5;
const DAMAGE_INTERVAL = 2 * 20;

const BLEEDING_WEAPONS = {
    'epicfight:golden_tachi': 1,
    'epicfight:stone_tachi':   1,
    'epicfight:iron_tachi':    1,
    'epicfight:diamond_tachi': 2,
    'epicfight:netherite_tachi': 3
};

EntityEvents.hurt(event => {
    const { source, entity, server } = event;
    
    if (!source || !source.player || !server) return;
    
    const player = source.player;
    const weapon = player.getMainHandItem();
    const stacksToAdd = BLEEDING_WEAPONS[weapon.id];
    
    if (!stacksToAdd) return;
    
    const currentEffect = entity.getEffect(EFFECT_ID);
    
    if (currentEffect) {
        const newAmplifier = currentEffect.getAmplifier() + stacksToAdd;
        entity.potionEffects.add(EFFECT_ID, EFFECT_DURATION, newAmplifier, false, true);
    } else {
        const initialAmplifier = stacksToAdd - 1;
        entity.potionEffects.add(EFFECT_ID, EFFECT_DURATION, initialAmplifier, false, true);
    }
});

let tickCounter = 0;

ServerEvents.tick(event => {
    const server = event.server;
    if (!server) return;
    
    tickCounter++;
    
    if (tickCounter % DAMAGE_INTERVAL !== 0) return;
    
    server.getWorlds().forEach(world => {
        world.getLivingEntities().forEach(entity => {
            if (!entity.hasEffect(EFFECT_ID)) return;
            
            const effect = entity.getEffect(EFFECT_ID);
            if (!effect) return;
            
            const amplifier = effect.getAmplifier();
            const damage = (amplifier + 1) * BASE_DAMAGE;
            
            entity.attack(damage, 'magic');
            
            entity.level.spawnParticles(
                'minecraft:damage_indicator',
                true,
                entity.x,
                entity.y + entity.eyeHeight,
                entity.z,
                amplifier + 1,
                0.3, 0.3, 0.3,
                0.05
            );
        });
    });
});