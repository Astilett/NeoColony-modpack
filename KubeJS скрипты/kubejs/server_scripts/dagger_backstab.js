// Множители урона для кинжалов (складываются при двуручном использовании)
const BACKSTAB_MULTIPLIERS = {
    'epicfight:wooden_dagger': 1.125,
    'epicfight:stone_dagger': 1.25,
    'epicfight:iron_dagger': 1.5,
    'epicfight:diamond_dagger': 2.0,
    'epicfight:netherite_dagger': 2.5
};

// Максимально допустимый угол отклонения (в градусах) для определения "спины"
const BACK_ANGLE_THRESHOLD = 90;

// Цвет частиц #ff4001
const PARTICLE_COLOR = {
    red: 1.0,
    green: 0.251,
    blue: 0.004
};

ForgeEvents.onEvent('net.minecraftforge.event.entity.living.LivingHurtEvent', event => {
    const { source, entity, amount } = event;
    
    // Проверяем, что урон нанесён игроком
    if (!(source.getEntity() instanceof $Player)) return;
    const attacker = source.getEntity();
    
    // Проверяем, что цель — живое существо (игрок или моб)
    if (!(entity instanceof $LivingEntity)) return;
    
    // Получаем предметы в обеих руках
    const mainHand = attacker.getMainHandItem();
    const offHand = attacker.getOffhandItem();
    const mainId = mainHand.getItem().getRegistryName().toString();
    const offId = offHand.getItem().getRegistryName().toString();
    
    // Суммируем множители с обеих рук
    let totalMultiplier = 0;
    if (BACKSTAB_MULTIPLIERS[mainId]) {
        totalMultiplier += BACKSTAB_MULTIPLIERS[mainId];
    }
    if (BACKSTAB_MULTIPLIERS[offId]) {
        totalMultiplier += BACKSTAB_MULTIPLIERS[offId];
    }
    
    // Если ни в одной руке нет кинжала — выходим
    if (totalMultiplier === 0) return;
    
    // Проверка на удар в спину
    if (isBackstab(attacker, entity)) {
        // Применяем суммарный множитель
        const newDamage = amount * totalMultiplier;
        event.setAmount(newDamage);
        
        // Спавним цветные частицы крита
        if (!attacker.level.isClientSide()) {
            spawnColoredCritParticles(entity);
        }
    }
});

/**
 * Проверяет, находится ли атакующий за спиной цели
 */
function isBackstab(attacker, target) {
    const targetYaw = target.getYRot();
    const targetRad = targetYaw * (Math.PI / 180);
    
    // Вектор взгляда цели
    const targetLookX = -Math.sin(targetRad);
    const targetLookZ = Math.cos(targetRad);
    
    // Вектор от цели к атакующему
    const deltaX = attacker.getX() - target.getX();
    const deltaZ = attacker.getZ() - target.getZ();
    
    // Нормализация
    const length = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);
    if (length < 0.001) return false;
    
    const dirX = deltaX / length;
    const dirZ = deltaZ / length;
    
    // Скалярное произведение
    const dotProduct = targetLookX * dirX + targetLookZ * dirZ;
    const threshold = Math.cos(BACK_ANGLE_THRESHOLD * (Math.PI / 180));
    
    return dotProduct < threshold;
}

/**
 * Создаёт цветные частицы критического удара вокруг цели
 */
function spawnColoredCritParticles(target) {
    const level = target.level;
    const pos = target.position();
    const height = target.getBbHeight();
    const width = target.getBbWidth();
    
    const particleCount = Math.floor(width * height * 10);
    
    const packet = new $ClientboundLevelParticlesPacket(
        new $DustParticleOptions(
            new $Vector3f(PARTICLE_COLOR.red, PARTICLE_COLOR.green, PARTICLE_COLOR.blue),
            1.0
        ),
        true,
        pos.x, pos.y + height * 0.5, pos.z,
        width * 0.5, height * 0.5, width * 0.5,
        0.0,
        particleCount
    );
    
    level.players().forEach(player => {
        if (player.distanceToSqr(pos.x, pos.y, pos.z) < 1024) {
            player.connection.send(packet);
        }
    });
}
