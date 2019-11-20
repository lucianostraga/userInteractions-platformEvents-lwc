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

    coordinatesLatitude;
    coordinatesLongitude;

    anotherTrackerActive = false; 

    constructor(){
        super();
        console.log('LOGGER INIT');
        console.log(window.history.trackingId);
        
        if(!window.history.trackingId){//AVOID DUPLICATE EVENT LISTENERS
            window.history.trackingId = this.generateTrackingId(18);
        }else{
            this.anotherTrackerActive= true;
        }

        if (window.navigator.geolocation){
            window.navigator.geolocation.getCurrentPosition( (position)=> { this.getGeoCoordinates(position); });
        }

    }

    initilizeVariables(){
        if(this.trackSessionStart === undefined){this.trackSessionStart = true;}
        if(this.trackNavigation === undefined){this.trackNavigation = true;}
        if(this.trackSessionEnd === undefined){this.trackSessionEnd = true;}
        if(this.trackClicks === undefined){this.trackClicks = true;}
    }

    connectedCallback(){
        this.initilizeVariables();

        if(this.anotherTrackerActive){return;}//ANOTHER LOGGER COMPONENT ALREADY ADDED ALL THE WINDOW EVENT LISTENERS

        registerListener('customInteractionEvent', this.handleCustomInteractionEvent, this);

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
            /*alert(event.clientY.toString())
            alert(event.screenY.toString())
            alert(event.pageY.toString())*/
            this.publishInteractionEvent("Click",event.pageX,event.pageY);
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
            /*windowWidth : window.innerWidth,
            windowHeigth : window.innerHeight,*/
            windowWidth : document.documentElement.clientWidth,
            windowHeigth : document.documentElement.scrollHeight,
            trackingId : window.history.trackingId,
            appCodeName : window.navigator.appCodeName,
            appName : window.navigator.appName,
            appVersion : window.navigator.appVersion,
            browserPlatform : window.navigator.platform,
            coordinatesLatitude : this.coordinatesLatitude,
            coordinatesLongitude : this.coordinatesLongitude,
            language : window.navigator.language,
            product : window.navigator.product,
            screenWidth : window.screen.width,
            screenHeigth : window.screen.height,
            userAgent : window.navigator.userAgent,
            vendor : window.navigator.vendor,
        };

        console.log(eventDescriptor);
    
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

    getGeoCoordinates(position){
        this.coordinatesLatitude = position.coords.latitude;
        this.coordinatesLongitude = position.coords.longitude;
    }

}