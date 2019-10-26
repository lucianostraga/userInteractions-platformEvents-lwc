/* eslint-disable no-console */
import { LightningElement, api} from 'lwc';
import getUserInteractions from '@salesforce/apex/InteractionNavigationViewerController.getUserInteractions';

export default class InteractionNavationViewer extends LightningElement {
    @api recordId;
    @api imageUrl;
    @api path;
    @api pageTitle;

    connectedCallback(){
        this.pageTitle = 'Session Navigation Clicks on : '+this.pageTitle;

        getUserInteractions({ userSessionId: this.recordId , urlPath : this.path})
            .then(result => {
                if(result.length > 0 ){
                    this.drawCanvas(result); 
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
    
    drawCanvas(interactions){
        let canvas = this.template.querySelector('canvas');
        let ctx = canvas.getContext("2d");
        ctx.canvas.width = interactions[0].User_Session__r.Window_Width__c;
        ctx.canvas.height = interactions[0].User_Session__r.Window_Heigth__c;

        let background = new Image();
    
        background.onload = ()=>{
            let sizer = this.scalePreserveAspectRatio(background.width,background.height,ctx.canvas.width,ctx.canvas.height);
            ctx.drawImage(background,0,0,background.width,background.height,0,0,background.width*sizer,background.height*sizer);

            interactions.forEach(element => {               
                ctx.beginPath();
                ctx.arc(element.Click_Coordinate_X__c, element.Click_Coordinate_Y__c, 10, 0, 2 * Math.PI);
                ctx.fillStyle = "red";
                ctx.strokeStyle = "red";
                ctx.fill();
                ctx.stroke();    
            });

        }

        background.src = this.imageUrl; 
    }

    scalePreserveAspectRatio(imgW,imgH,maxW,maxH){
        return Math.min((maxW/imgW),(maxH/imgH));
    }
}