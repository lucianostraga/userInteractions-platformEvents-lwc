/* eslint-disable no-console */
import { LightningElement,api, track } from 'lwc';
import { subscribe, unsubscribe, onError} from 'lightning/empApi';

export default class InteractionMonitorCurrentUsers extends LightningElement {
    @api channelName = '/event/User_Interaction_Event__e';
    subscription = {};

    @track users = [];

    connectedCallback(){
        this.handleSubscribe();
    }

    handleSubscribe() {
        const messageCallback = (response) => {
            const event = response.data.payload;

            const existingUserIndex = this.users.findIndex((currentValue) => {
                return (currentValue.User_ID__c === event.User_ID__c);
            });

            if(existingUserIndex > -1){
                if(event.Type__c === 'Disconnected'){
                    this.users.splice(existingUserIndex, 1);
                }else{
                    this.users[existingUserIndex] = event;
                }

            }else{//USER JUST CONNECTED
                this.users.push(event);
            }

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

    get usersToDisplay(){
        return (this.users.length > 0);
    }
}