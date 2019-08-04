import { LightningElement, api } from 'lwc';
import {registerListener, unregisterListener, unregisterAllListeners, fireEvent} from 'c/pubsubCommunities';

export default class AuraPubsub extends LightningElement {

    connectedCallback() {
        this.dispatchEvent(new CustomEvent('ready'));
    }

    @api
    registerListener(eventName, callback) {
        registerListener(eventName, callback, this);
    }

    @api
    unregisterListener(eventName, callback) {
        unregisterListener(eventName, callback, this);
    }

    @api
    unregisterAllListeners() {
        unregisterAllListeners(this);
    }

    @api
    fireEvent(eventName, data) {
        let pageRef;
        fireEvent(pageRef, eventName, data);
    }
}
