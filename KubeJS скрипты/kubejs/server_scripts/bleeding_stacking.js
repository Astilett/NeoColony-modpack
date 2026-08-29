const EFFECT_ID = 'kubejs:bleeding';
const EFFECT_DURATION = 4 * 20;
const BASE_DAMAGE = 0.8;
const DAMAGE_INTERVAL = 2 * 20;
const MAX_STACKS = 10;
const STAMINA_DRAIN_PER_STACK = 0.0075;
const STAMINA_THRESHOLD = 0.2;
const BASE_BLEED_CHANCE = 1.0;
const ARMOR_PENALTY_PER_PIECE = 0.15;

const BLEEDING_WEAPONS = {
    // 'epicfight:wooden_tachi':  0.5,
    // 'epicfight:stone_tachi':   0.5,
    // 'epicfight:iron_tachi':    0.5,
    // 'epicfight:golden_tachi':  0.5,
    // 'epicfight:diamond_tachi': 1,
    // 'epicfight:netherite_tachi': 2,
    // 'epicfight:wooden_spear':  0.25,
    // 'epicfight:stone_spear':   0.25,
    // 'epicfight:iron_spear':    0.25,
    // 'epicfight:golden_spear':  0.25,
    // 'epicfight:diamond_spear': 0.5,
    // 'epicfight:netherite_spear': 1 <--- старая карта оружия
};

function getArmorCount(entity) {
    let count = 0;
    const slots = [entity.feetArmorItem, entity.legsArmorItem, entity.chestArmorItem, entity.headArmorItem];
    for (let slot of slots) {
        if (!slot.isEmpty()) count++;
    }
    return count;
}

EntityEvents.hurt(event => {
    const { source, entity, server } = event;
    
    if (!source || !source.player || !server) return;
    
    const player = source.player;
    const weapon = player.getMainHandItem();
    const weaponId = weapon.id;
    const stacksToAdd = BLEEDING_WEAPONS[weaponId];
    
    if (!stacksToAdd) return;
    
    const armorCount = getArmorCount(entity);
    const chance = Math.max(0, BASE_BLEED_CHANCE - armorCount * ARMOR_PENALTY_PER_PIECE);
    
    if (Math.random() > chance) return;
    
    // Накопитель дробных стаков (хранится в persistentData)
    const pData = entity.persistentData;
    let fraction = pData.getDouble('bleedingFraction');
    fraction += stacksToAdd;
    
    // Сколько целых стаков можно наложить
    const wholeStacks = Math.floor(fraction);
    fraction -= wholeStacks;
    pData.putDouble('bleedingFraction', fraction);
    
    if (wholeStacks <= 0) {
        // Целых стаков нет, но эффект уже мог быть — тогда просто обновляем длительность
        const currentEffect = entity.getEffect(EFFECT_ID);
        if (currentEffect) {
            entity.potionEffects.add(EFFECT_ID, EFFECT_DURATION, currentEffect.getAmplifier(), false, true);
            entity.persistentData.putLong('lastBleedUpdateTick', tickCounter);
        }
        return;
    }
    
    // Накладываем целые стаки
    const currentEffect = entity.getEffect(EFFECT_ID);
    if (currentEffect) {
        let newAmplifier = currentEffect.getAmplifier() + wholeStacks;
        if (newAmplifier > MAX_STACKS - 1) newAmplifier = MAX_STACKS - 1;
        entity.potionEffects.add(EFFECT_ID, EFFECT_DURATION, newAmplifier, false, true);
    } else {
        let initialAmplifier = Math.min(wholeStacks, MAX_STACKS) - 1;
        if (initialAmplifier > MAX_STACKS - 1) initialAmplifier = MAX_STACKS - 1;
        entity.potionEffects.add(EFFECT_ID, EFFECT_DURATION, initialAmplifier, false, true);
    }
    
    entity.persistentData.putLong('lastBleedUpdateTick', tickCounter);
});

let tickCounter = 0;

ServerEvents.tick(event => {
    const server = event.server;
    if (!server) return;
    
    tickCounter++;
    
    // --- Подмена чужого эффекта (каждый тик) ---
    server.getAllLevels().forEach(world => {
        world.entities.forEach(entity => {
            if (!entity.isLiving()) return;
            const foreignEffect = entity.getEffect('attributeslib:bleeding');
            if (!foreignEffect) return;
            
            const foreignDuration = foreignEffect.duration;
            entity.removeEffect('attributeslib:bleeding');
            
            const ourEffect = entity.getEffect(EFFECT_ID);
            const lastUpdate = entity.persistentData.getLong('lastBleedUpdateTick');
            
            if (ourEffect && lastUpdate == tickCounter) return;
            
            const armorCount = getArmorCount(entity);
            const chance = Math.max(0, BASE_BLEED_CHANCE - armorCount * ARMOR_PENALTY_PER_PIECE);
            if (Math.random() > chance) return;
            
            const foreignStacks = foreignEffect.amplifier + 1;
            
            if (ourEffect) {
                const currentStacks = ourEffect.amplifier + 1;
                const totalStacks = Math.min(currentStacks + foreignStacks, MAX_STACKS);
                const newAmplifier = totalStacks - 1;
                entity.potionEffects.add(EFFECT_ID, foreignDuration, newAmplifier, false, true);
            } else {
                const initialStacks = Math.min(foreignStacks, MAX_STACKS);
                const initialAmplifier = initialStacks - 1;
                entity.potionEffects.add(EFFECT_ID, foreignDuration, initialAmplifier, false, true);
            }
        });
    });
    
    // --- Периодический урон (каждые 2 секунды) ---
    if (tickCounter % DAMAGE_INTERVAL !== 0) return;
    
    server.getAllLevels().forEach(world => {
        world.entities.forEach(entity => {
            if (!entity.isLiving()) return;
            
            if (!entity.hasEffect(EFFECT_ID)) return;
            
            const effect = entity.getEffect(EFFECT_ID);
            if (!effect) return;
            
            const amplifier = effect.getAmplifier();
            const stacks = amplifier + 1;
            const healthDamage = stacks * BASE_DAMAGE;
            
            entity.attack(entity.level.damageSources().magic(), healthDamage);
            
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