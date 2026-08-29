

ServerEvents.recipes(event => {

  // 1. Удаляем старые рецепты
  event.remove({ id: 'refm:iron_rapier' });
  event.remove({ id: 'refm:gold_rapier' });
  event.remove({ id: 'refm:diamond_rapier' });

  // 2. Добавляем новый рецепт для железного рапира
  event.shaped('refm:iron_rapier', [
    '   ',
    'NL ',
    'HII'
  ], {
    N: 'minecraft:iron_nugget',
    L: 'minecraft:leather',
    H: 'spartanweaponry:handle',
    I: 'minecraft:iron_ingot'
  });

  // 3. Добавляем новый рецепт для золотого рапира
  event.shaped('refm:gold_rapier', [
    '   ',
    'NL ',
    'HII'
  ], {
    N: 'minecraft:gold_nugget',
    L: 'minecraft:leather',
    H: 'spartanweaponry:handle',
    I: 'minecraft:gold_ingot'
  });

  // 4. Добавляем новый рецепт для алмазного рапира
  event.shaped('refm:diamond_rapier', [
    '   ',
    'NL ',
    'HII'
  ], {
    N: 'minecraft:diamond',
    L: 'minecraft:leather',
    H: 'spartanweaponry:handle',
    I: 'minecraft:diamond'
  });

});