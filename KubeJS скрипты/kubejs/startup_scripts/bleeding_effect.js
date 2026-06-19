StartupEvents.registry('mob_effect', event => {
    event.create('bleeding')
        .harmful()
        .color(0x8B0000);
});

StartupEvents.registry('damage_source', event => {
    event.create('bleeding_damage')
        .bypassArmor()
        .magic();
});