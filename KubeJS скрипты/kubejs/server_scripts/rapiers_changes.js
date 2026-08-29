console.log('[Rapier] Script loaded');

if (typeof Math.PI === 'undefined') {
    Math.PI = 3.141592653589793;
}

var RAPIER_BONUS = {
    'refm:iron_rapier': 30,
    'refm:gold_rapier': 30,
    'refm:diamond_rapier': 30,
    'refm:netherite_rapier': 30,
    'refm:witherite_rapier': 25,
    'refm:oceanite_rapier': 20,
    'refm:enderite_rapier': 40
};

var MinecraftForge = Java.loadClass('net.minecraftforge.common.MinecraftForge');
var LivingHurtEvent = Java.loadClass('net.minecraftforge.event.entity.living.LivingHurtEvent');
var EventPriority = Java.loadClass('net.minecraftforge.eventbus.api.EventPriority');
var Player = Java.loadClass('net.minecraft.world.entity.player.Player');
var EquipmentSlot = Java.loadClass('net.minecraft.world.entity.EquipmentSlot');
var MobEffects = Java.loadClass('net.minecraft.world.effect.MobEffects');
var MobEffectInstance = Java.loadClass('net.minecraft.world.effect.MobEffectInstance');
var Consumer = Java.loadClass('java.util.function.Consumer');

var lastHitTime = {};
var lastDamageTime = {};

var hurtHandler = new JavaAdapter(
    Consumer,
    {
        accept: function(event) {
            var entity = event.entity;
            var amount = event.amount;
            if (event.source == null) return;
            var attacker = event.source.actual;
            if (attacker == null || !(attacker instanceof Player)) return;

            var now = new Date().getTime();
            var entityId = entity.getId();
            if (lastHitTime[entityId] && now - lastHitTime[entityId] < 100) return;
            lastHitTime[entityId] = now;

            var weapon = attacker.getMainHandItem();
            if (weapon == null || weapon.isEmpty()) return;
            var weaponId = weapon.id;
            if (!RAPIER_BONUS.hasOwnProperty(weaponId)) return;

            var baseBonus = RAPIER_BONUS[weaponId];

            // 1. Бонус/штраф к урону в зависимости от брони
            var armorCount = 0;
            var slots = [EquipmentSlot.HEAD, EquipmentSlot.CHEST, EquipmentSlot.LEGS, EquipmentSlot.FEET];
            for (var i = 0; i < slots.length; i++) {
                var stack = entity.getItemBySlot(slots[i]);
                if (!stack.isEmpty()) armorCount++;
            }
            var bonusPercent = baseBonus - 15 * armorCount;
            var multiplier = 1 + bonusPercent / 100;
            event.setAmount(amount * multiplier);
            amount = event.amount;

            // 2. Замедление для эндеритовой рапиры
            if (weaponId === 'refm:enderite_rapier') {
                if (Math.random() < 0.15) {
                    var hasSlowness = entity.hasEffect(MobEffects.MOVEMENT_SLOWDOWN);
                    if (!hasSlowness) {
                        entity.addEffect(new MobEffectInstance(MobEffects.MOVEMENT_SLOWDOWN, 15, 4));
                    }
                }
            }

            // 3. Повышенный износ оружия
            var playerId = attacker.getId();
            if (!lastDamageTime[playerId] || now - lastDamageTime[playerId] > 200) {
                lastDamageTime[playerId] = now;
                var extraDamage = 0;
                for (var k = 0; k < slots.length; k++) {
                    var armorStack = entity.getItemBySlot(slots[k]);
                    if (!armorStack.isEmpty() && Math.random() < 0.10) {
                        extraDamage++;
                    }
                }
                if (extraDamage > 0) {
                    weapon.hurtAndBreak(1 + extraDamage, attacker, null);
                }
            }
        }
    }
);

MinecraftForge.EVENT_BUS.addListener(EventPriority.LOWEST, false, LivingHurtEvent, hurtHandler);