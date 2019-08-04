({
    handleClick : function (component, event, helper) {
        var pubsub = component.find('pubsub');
        var payload = {type : 'Custom Interaction Event From Aura Component'}
        pubsub.fireEvent('customInteractionEvent', payload);
    }
})
