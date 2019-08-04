import { LightningElement } from 'lwc';
import {fireEvent } from 'c/pubsubCommunities';

export default class LwcExternalEventSender extends LightningElement {

    handleClick(event){
        let pageRef;
        var payload = {type : 'Custom Interaction Event from LWC'}
        fireEvent(pageRef, 'customInteractionEvent', payload);
    }
    
}