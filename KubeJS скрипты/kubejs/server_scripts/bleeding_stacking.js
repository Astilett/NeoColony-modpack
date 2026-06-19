const EFFECT_ID = 'kubejs:bleeding';
const EFFECT_DURATION = 4 * 20;
const BASE_DAMAGE = 0.5;
const DAMAGE_INTERVAL = 2 * 20;
const MAX_STACKS = 12;
const STAMINA_DRAIN_PER_STACK = 0.0125;
const STAMINA_THRESHOLD = 0.2;
const BASE_BLEED_CHANCE = 1.0;
const ARMOR_PENALTY_PER_PIECE = 0.15;

const BLEEDING_WEAPONS = {
    'epicfight:wooden_tachi':  1,
    'epicfight:stone_tachi':   1,
    'epicfight:iron_tachi':    1,
    'epicfight:golden_tachi':  1,
    'epicfight:diamond_tachi': 2,
    'epicfight:netherite_tachi': 3
};

// ============================================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: подсчёт надетых слотов брони
// ============================================================
function getArmorCount(entity) {
    let count = 0;
    const slots = [entity.feetArmorItem, entity.legsArmorItem, entity.chestArmorItem, entity.headArmorItem];
    for (let slot of slots) {
        if (!slot.isEmpty()) count++;
    }
    return count;
}

// ============================================================
// НАЛОЖЕНИЕ ЭФФЕКТА ПРИ УДАРЕ
// ============================================================
EntityEvents.hurt(event => {
    const { source, entity, server } = event;
    
    if (!source || !source.player || !server) return;
    
    const player = source.player;
    const weapon = player.getMainHandItem();
    const stacksToAdd = BLEEDING_WEAPONS[weapon.id];
    
    if (!stacksToAdd) return;
    
    const armorCount = getArmorCount(entity);
    const chance = Math.max(0, BASE_BLEED_CHANCE - armorCount * ARMOR_PENALTY_PER_PIECE);
    
    if (Math.random() > chance) return;
    
    const currentEffect = entity.getEffect(EFFECT_ID);
    
    if (currentEffect) {
        let newAmplifier = currentEffect.getAmplifier() + stacksToAdd;
        if (newAmplifier > MAX_STACKS - 1) newAmplifier = MAX_STACKS - 1;
        entity.potionEffects.add(EFFECT_ID, EFFECT_DURATION, newAmplifier, false, true);
    } else {
        let initialAmplifier = stacksToAdd - 1;
        if (initialAmplifier > MAX_STACKS - 1) initialAmplifier = MAX_STACKS - 1;
        entity.potionEffects.add(EFFECT_ID, EFFECT_DURATION, initialAmplifier, false, true);
    }
});

// ============================================================
// ПЕРИОДИЧЕСКИЙ УРОН + СНЯТИЕ ВЫНОСЛИВОСТИ (каждые 2 секунды)
// ============================================================
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
            const stacks = amplifier + 1;
            
            const healthDamage = stacks * BASE_DAMAGE;
            entity.attack(entity.level.damageSources().bleeding_damage(), healthDamage);
            
            const staminaAttribute = entity.attributes.getInstance('epicfight:staminar');
            if (staminaAttribute) {
                const currentStamina = staminaAttribute.value;
                const maxStamina = staminaAttribute.maxValue;
                
                if (currentStamina > maxStamina * STAMINA_THRESHOLD) {
                    const staminaDrain = maxStamina * STAMINA_DRAIN_PER_STACK * stacks;
                    entity.attack(staminaDrain, 'epicfight:stamina_damage');
                }
            }
            
            entity.level.spawnParticles(
                'minecraft:damage_indicator',
                true,
                entity.x,
                entity.y + entity.eyeHeight,
                entity.z,
                stacks,
                0.225, 0.225, 0.225,
                0.05
            );
        });
    });
});