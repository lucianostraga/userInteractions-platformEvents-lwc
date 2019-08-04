/* eslint-disable no-console */
import { LightningElement, track, wire,api } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

export default class InteractionMap extends LightningElement {
    @api recordId;
    @track mapMarkers;

    @wire(getRecord, { recordId: '$recordId', layoutTypes: ['Full'], modes: ['View'] })
    wiredSession({ error, data }) {
        if (data) {
            
            this.mapMarkers = [{
                location: {
                    Latitude: data.fields.Coordinates__Latitude__s.value,
                    Longitude: data.fields.Coordinates__Longitude__s.value
                }
            }];

        } else if (error) {
            console.log(JSON.stringify(error));
        }
    }

}