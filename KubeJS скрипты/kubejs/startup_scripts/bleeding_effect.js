StartupEvents.registry('mob_effect', event => {
    event.create('bleeding')          
        .harmful()                    
        .color(0x8B0000)              
        .effectTick(entity => {
        });
});