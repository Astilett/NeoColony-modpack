// server_scripts/rapier_recipes.js

ServerEvents.recipes(event => {

  // ======== 1. РЕЦЕПТЫ ДЛЯ РАПИРОВ (было ранее) ========

  // Удаляем старые рецепты
  event.remove({ id: 'refm:iron_rapier' });
  event.remove({ id: 'refm:gold_rapier' });
  event.remove({ id: 'refm:diamond_rapier' });

  // Железный рапир
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

  // Золотой рапир
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

  // Алмазный рапир
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


  // ======== 2. НОВЫЙ РЕЦЕПТ ДЛЯ ВАРП-КАМНЯ ========

  // Удаляем оригинальный рецепт (все варианты, если их несколько)
  event.remove({ id: 'waystones:warp_stone' });

  // Добавляем свой форменный крафт
  event.shaped('waystones:warp_stone', [
    'APA',
    'YBY',
    'APA'
  ], {
    A: 'minecraft:amethyst_block',
    P: 'minecraft:ender_pearl',
    Y: 'minecraft:ender_eye',
    B: 'minecraft:emerald_block'
  });

});