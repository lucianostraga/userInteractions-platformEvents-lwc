/* eslint-disable no-useless-return */
/* eslint-disable @lwc/lwc/no-inner-html */
/* eslint-disable no-console */
import { LightningElement,api} from 'lwc';
import { registerListener, unregisterAllListeners} from 'c/pubsubCommunities';
import publishEvent from '@salesforce/apex/InteractionLoggerController.publishEvent';

export default class InteractionLogger extends LightningElement {

    @api trackNavigation;
    @api trackSessionStart;
    @api trackSessionEnd;
    @api trackClicks;  

    anotherTrackerActive; 

    constructor(){
        super();

        if(!window.history.trackingId){//AVOID DUPLICATE EVENT LISTENERS
            window.history.trackingId = this.generateTrackingId(18);
        }else{
            this.anotherTrackerActive= true;
        }

    }

    connectedCallback(){

        console.log(this.trackNavigation);
        console.log(this.trackSessionStart);
        console.log(this.trackSessionEnd);
        console.log(this.trackClicks);

        registerListener('customInteractionEvent', this.handleCustomInteractionEvent, this);

        if(this.anotherTrackerActive){return;}//ANOTHER LOGGER COMPONENT ALREADY ADDED ALL THE WINDOW EVENT LISTENERS

        if(this.trackSessionStart){
            this.handleTrackSessionStart();
        }

        if(this.trackSessionEnd){
            this.handleTrackSessionEnd();
        }

        if(this.trackClicks){
            this.handleTrackClicks();
        }

        if(this.trackNavigation){
            this.handleTrackNavigation();
        }

        console.log('LOGGER INITIALIZED');
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    handleCustomInteractionEvent(payload){
        this.publishInteractionEvent(payload.type);
    }

    handleTrackSessionStart(){
        this.publishInteractionEvent('Connected');
    }

    handleTrackSessionEnd(){
        window.addEventListener("beforeunload", (event) => {
            this.publishInteractionEvent("Disconnected",event.clientX,event.clientY);
        });
    }

    handleTrackClicks(){
        window.addEventListener("mousedown", (event) => {
            this.publishInteractionEvent("Click",event.clientX,event.clientY);
        });
    }

    publishNavigateToEvent(){
        this.publishInteractionEvent('Navigate To');
    }

    handleTrackNavigation(){
        let pushState = window.history.pushState;
        let publishNavigateToEvent = () => {this.publishNavigateToEvent();}

        window.history.pushState = function(){
            pushState.apply(history, arguments);
            publishNavigateToEvent();
        }

        window.addEventListener("popstate", (event) => {
            event.stopImmediatePropagation();
            this.publishInteractionEvent('Manual Navigation');
        })
    }
    

    publishInteractionEvent(type, cordinateX, cordinateY){
        console.log('NEW EVENT: '+type);
        let eventDescriptor = 
        {
            timestamp : new Date().toISOString(),
            origin: window.location.origin,
            pathName : window.location.pathname,
            href : window.location.href,
            host : window.location.host,
            search : window.location.search,
            type : type,
            cordinateX : cordinateX,
            cordinateY : cordinateY,
            windowWidth : window.innerWidth,
            windowHeigth : window.innerHeight,
            trackingId : window.history.trackingId
        };
        console.log(JSON.stringify(eventDescriptor));
    
        publishEvent({ jsonEvent: JSON.stringify(eventDescriptor) })
            .then(result => {
                console.log('Event Published');
            })
            .catch(error => {
                console.log(JSON.stringify(error));
            });
                
        
    }

    generateTrackingId(length){
        let sessionId = "";
        var possibleChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            
        for (let i = 0; i < length; i++)
            sessionId += possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
        
        return sessionId;    
    }

}