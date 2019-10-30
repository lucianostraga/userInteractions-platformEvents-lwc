/* eslint-disable no-console */
import { LightningElement,api, track } from 'lwc';
import { subscribe, unsubscribe, onError} from 'lightning/empApi';

export default class EmpApiLWC extends LightningElement {
    @api channelName = '/event/User_Interaction_Event__e';
    subscription = {};

    @track events = [];

    connectedCallback(){
        this.handleSubscribe();
    }

    handleClearLogs(){
        this.events = [];
    }

    handleSubscribe() {
        const messageCallback = (response) => {
            let event = response.data.payload;
           
            if(event.Type__c === 'Connected'){ event.TypeClass = 'connected';}
            else if(event.Type__c === 'Disconnected'){event.TypeClass = 'disconnected';}
            event.UserUrl = '/'+event.User_ID__c;

            this.events.push(event);
            //console.log('New message received : ', JSON.stringify(event));
        };

        subscribe(this.channelName, -1, messageCallback).then(response => {
            console.log('Successfully subscribed to : ', JSON.stringify(response.channel));
            this.subscription = response;
        });
    }

    handleUnsubscribe() {
        unsubscribe(this.subscription, response => {
            console.log('unsubscribe() response: ', JSON.stringify(response));
        });
    }

    registerErrorListener() {
        onError(error => {
            console.log('Received error from server: ', JSON.stringify(error));
        });
    }

    get eventsToDisplay(){
        return (this.events.length > 0);
    }
}