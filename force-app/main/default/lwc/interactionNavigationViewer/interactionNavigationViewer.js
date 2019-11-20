/* eslint-disable no-console */
import { LightningElement, api,track,wire} from 'lwc';
import getUserClicks from '@salesforce/apex/InteractionNavigationViewerController.getUserClicks';
import getDevicesWithScreens from '@salesforce/apex/InteractionNavigationViewerController.getDevicesWithScreens';

export default class InteractionNavigationViewer extends LightningElement {
    @api recordId;
    imageUrl;
    path;
    width;
    height;
    pageTitle = 'Clicks Viewer';

    @track isLoading;
    devicesJson = {};
    screensJson = {};
    @track device;
    @track screen;
    @track devicesOptions = [];
    @track screenOptions = [];
    @track displayCanvas;
    @track noInteractions;

    get devicesOptionsAvailable(){
        return (this.devicesOptions.length > 0);
    }

    get screenOptionsAvailable(){
        return (this.screenOptions.length > 0);
    }

    handleDeviceChange(event) {
        this.device = event.detail.value;
        this.screenOptions = [];
        this.displayCanvas = false;
        this.noInteractions = false;

        if(this.devicesJson[this.device].Screens__r){
            this.devicesJson[this.device].Screens__r.forEach(screen => {
                this.screenOptions.push( {label : screen.Name, value : screen.Id} );
                this.screensJson[screen.Id] = screen;
            });
        }
    }

    handleScreenChange(event) {
        this.screen = event.detail.value;
        if(this.screen){
            this.path = this.screensJson[this.screen].Path__c;
            this.imageUrl = this.screensJson[this.screen].Screenshot_URL__c;
            
            if(this.screensJson[this.screen].Orientation__c === 'Landscape'){
               this.width = this.devicesJson[this.device].Landscape_Width__c;
               this.height = this.devicesJson[this.device].Landscape_Height__c;
            }else{
                this.width = this.devicesJson[this.device].Portrait_Width__c;
                this.height = this.devicesJson[this.device].Portrait_Height__c;
            }

            this.displayCanvas = true;
            this.getAllClicks();
        }
    }

    @wire(getDevicesWithScreens)
    wiredDevices({ error, data }) {
        if (data) {
            data.forEach(device => {
                this.devicesOptions.push( {label : device.Name, value : device.Id} );
                this.devicesJson[device.Id] = device;
            });
        } else if (error) {
            console.error(error);
        }
    }

    getAllClicks(){
        getUserClicks({urlPath : this.path, width: this.width, height: this.height})
            .then(result => {
                console.log(result);
                if(result.length > 0 ){
                    this.displayCanvas = true;
                    this.noInteractions = false;
                    this.drawCanvas(result); 
                }else{
                    this.displayCanvas = false;
                    this.noInteractions = true;
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
    
    drawCanvas(interactions){
        let canvas = this.template.querySelector('canvas');
        let ctx = canvas.getContext("2d");
        
        let averageWidth = 0;
        let averageHeight = 0;

        interactions.forEach(element => {
            averageWidth += element.Window_Width__c
            averageHeight += element.Window_Heigth__c
        });

        averageWidth = averageWidth/interactions.length;
        averageHeight = averageHeight/interactions.length;

        ctx.canvas.width = averageWidth;
        ctx.canvas.height = averageHeight;

        let background = new Image();
    
        background.onload = ()=>{
            ctx.drawImage(background,0,0,averageWidth,averageHeight);

            interactions.forEach(element => {  
                let xCoordinate =  element.Click_Coordinate_X__c * (element.Window_Width__c / averageWidth);   
                let yCoordinate =  element.Click_Coordinate_Y__c * (element.Window_Heigth__c / averageHeight);   

                ctx.beginPath();
                ctx.arc(xCoordinate, yCoordinate, 10, 0, 2 * Math.PI);
                ctx.fillStyle = "red";
                ctx.strokeStyle = "red";
                ctx.fill();
                ctx.stroke();    
            });

        }

        background.src = this.imageUrl; 
    }

    handleRefresh(){
        if(this.screen){this.getAllClicks(); }
    }

}