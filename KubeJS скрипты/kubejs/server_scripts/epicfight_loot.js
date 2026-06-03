LootJS.modifiers((event) => {
    const skillbook = "epicfight:skillbook";
    
    event
        .addLootTypeModifier(LootType.CHEST)
        .anyDimension(".*")
        .randomChance(0.04)
        .addLoot(skillbook);
    
    event
        .addLootTypeModifier("minecraft:barrel")
        .anyDimension(".*")
        .randomChance(0.02)
        .addLoot(skillbook);
});