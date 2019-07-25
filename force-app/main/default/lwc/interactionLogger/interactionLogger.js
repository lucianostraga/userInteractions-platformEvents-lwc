/* eslint-disable @lwc/lwc/no-inner-html */
/* eslint-disable no-console */
import { LightningElement,api } from 'lwc';

export default class InteractionLogger extends LightningElement {

    @api trackSessionStart;
    @api trackSessionEnd;
    @api trackClicks;
    
    mouseCoordinatesArray = [];

    connectedCallback(){

        if(!this.trackSessionStart){
            this.publishInteractionEvent('Connected');
        }

        if(!this.trackSessionEnd){
            this.handleTrackSessionEnd();
        }

        if(!this.trackClicks){
            this.handleTrackClicks();
        }

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

    publishInteractionEvent(type, cordinateX, cordinateY){
        let eventDescriptor = 
        {
            timestamp : new Date().toISOString(),
            origin: window.location.origin,
            pathName : window.location.pathname,
            search : window.location.search,
            type : type,
            cordinateX : cordinateX,
            cordinateY : cordinateY,
            windowWidth : window.innerWidth,
            windowHeigth : window.innerHeight
        }
        console.log(JSON.stringify(eventDescriptor));
    }

}