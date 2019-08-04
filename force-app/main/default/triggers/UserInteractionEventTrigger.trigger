trigger UserInteractionEventTrigger on User_Interaction_Event__e (after insert) {

    if(Trigger.isAfter){
        UserInteractionTriggerEventHandler.handleAfterInsert(trigger.new);
    }

}