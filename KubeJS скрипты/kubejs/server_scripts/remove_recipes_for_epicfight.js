ServerEvents.recipes(event => {
    event.remove({ output: 'epicfight:glove' });
    event.remove({
        output: '@epicfight',     
        id: /.*dagger.*/      
    });
    event.remove({
        output: '@epicfight',     
        id: /.*greatsword.*/      
    });
    event.remove({
        output: '@epicfight',     
        id: /.*spear.*/      
    });
    event.remove({
        output: '@epicfight',     
        id: /.*tachi.*/      
    });
    event.remove({
        output: '@epicfight',     
        id: /.*longsword.*/      
    });
});