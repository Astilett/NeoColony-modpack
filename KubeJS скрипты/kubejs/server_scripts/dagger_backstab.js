// Файл: kubejs/server_scripts/dagger_backstab.js

const DAGGER_MULTIPLIERS = {
    'epicfight:wooden_dagger': 1.5,
    'epicfight:golden_dagger': 1.5,
    'epicfight:stone_dagger': 2.0,
    'epicfight:iron_dagger': 3.0,
    'epicfight:diamond_dagger': 4.0,
    'epicfight:netherite_dagger': 5.5
};

function isBehindTarget(attacker, target, angleThreshold = 90) {
    if (!attacker || !target) return false;

    const lookVec = target.getViewVector(1.0);
    const lookLength = Math.sqrt(lookVec.x() * lookVec.x() + lookVec.y() * lookVec.y() + lookVec.z() * lookVec.z());
    const targetLookDir = {
        x: lookVec.x() / lookLength,
        z: lookVec.z() / lookLength
    };

    const dx = attacker.getX() - target.getX();
    const dz = attacker.getZ() - target.getZ();
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist === 0) return false;
    
    const toAttackerDir = {
        x: dx / dist,
        z: dz / dist
    };

    const dot = targetLookDir.x * toAttackerDir.x + targetLookDir.z * toAttackerDir.z;
    let angle = Math.acos(Math.min(1, Math.max(-1, dot))) * (180 / Math.PI);

    return angle > angleThreshold;
}

EntityEvents.hurt('living', event => {
    const { entity, source, damage } = event;
    const attacker = source.getEntity();

    if (!(attacker && attacker.isPlayer())) return;
    
    const player = attacker;
    const heldItem = player.getMainHandItem();
    const itemId = heldItem.getId();
    
    if (!DAGGER_MULTIPLIERS.hasOwnProperty(itemId)) return;

    if (!isBehindTarget(player, entity, 90)) return;

    let originalDamage = damage;
    let multiplier = DAGGER_MULTIPLIERS[itemId];
    let newDamage = originalDamage * multiplier;
    
    event.setDamage(newDamage);
});