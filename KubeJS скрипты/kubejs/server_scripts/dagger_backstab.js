console.log('[Dagger] Script loaded');

if (typeof Math.PI === 'undefined') {
    Math.PI = 3.141592653589793;
}

var BACKSTAB_MULTIPLIERS = {
    'epicfight:wooden_dagger': 1.0625,
    'epicfight:stone_dagger': 1.125,
    'epicfight:iron_dagger': 1.3,
    'epicfight:diamond_dagger': 1.35,
    'epicfight:netherite_dagger': 1.5
};

var MinecraftForge = Java.loadClass('net.minecraftforge.common.MinecraftForge');
var LivingHurtEvent = Java.loadClass('net.minecraftforge.event.entity.living.LivingHurtEvent');
var LivingAttackEvent = Java.loadClass('net.minecraftforge.event.entity.living.LivingAttackEvent');
var EventPriority = Java.loadClass('net.minecraftforge.eventbus.api.EventPriority');
var Player = Java.loadClass('net.minecraft.world.entity.player.Player');

var yawStorage = {};

// Сохраняем угол цели до разворота
var attackHandler = new JavaAdapter(
    Java.loadClass('java.util.function.Consumer'),
    {
        accept: function(event) {
            var target = event.entity;
            if (event.source == null) return;
            var attacker = event.source.actual;
            if (attacker == null || !(attacker instanceof Player)) return;
            yawStorage[target.getId()] = target.getYaw();
        }
    }
);

MinecraftForge.EVENT_BUS.addListener(EventPriority.LOWEST, false, LivingAttackEvent, attackHandler);

// Основной обработчик урона
var hurtHandler = new JavaAdapter(
    Java.loadClass('java.util.function.Consumer'),
    {
        accept: function(event) {
            var entity = event.entity;
            var amount = event.amount;
            if (event.source == null) return;
            var attacker = event.source.actual;
            if (attacker == null || !(attacker instanceof Player)) return;

            var mainHand = attacker.getMainHandItem();
            var offHand = attacker.getOffhandItem();
            var mainId = mainHand.id;
            var offId = offHand.id;
            if (mainId === 'minecraft:air') mainId = null;
            if (offId === 'minecraft:air') offId = null;

            var totalMultiplier = 0;
            if (mainId && BACKSTAB_MULTIPLIERS[mainId]) totalMultiplier += BACKSTAB_MULTIPLIERS[mainId];
            if (offId && BACKSTAB_MULTIPLIERS[offId]) totalMultiplier += BACKSTAB_MULTIPLIERS[offId];
            if (totalMultiplier === 0) return;

            var savedYaw = yawStorage[entity.getId()];
            delete yawStorage[entity.getId()];
            if (savedYaw === undefined) return;

            if (isBackstab(savedYaw, attacker, entity)) {
                event.setAmount(amount * totalMultiplier);
                console.log('[Dagger] Backstab! Damage: ' + amount + ' -> ' + event.amount);
                // Частицы можно добавить позже безопасным способом
            }
        }
    }
);

MinecraftForge.EVENT_BUS.addListener(EventPriority.LOWEST, false, LivingHurtEvent, hurtHandler);

function isBackstab(yaw, attacker, target) {
    var rad = yaw * Math.PI / 180;
    var lookX = -Math.sin(rad);
    var lookZ = Math.cos(rad);

    var dx = attacker.x - target.x;
    var dz = attacker.z - target.z;
    var len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.001) return false;

    var dirX = dx / len;
    var dirZ = dz / len;
    var dot = lookX * dirX + lookZ * dirZ;
    return dot < 0.3; // угол > 72°
}