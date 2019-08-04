public without sharing class UserInteractionTriggerEventHandler {
    
    public static void handleAfterInsert(List<User_Interaction_Event__e> newEvents){

        Set<String> trackingIds = new Set<String>();
        Map<String,Id> userSessionTrackingMap = new Map<String,Id>();

        Map<String,User_Session__c> newUserSessionsMap = new Map<String,User_Session__c>();
        List<User_Interaction__c> newInteractions = new List<User_Interaction__c>();

        for(User_Interaction_Event__e uie : newEvents){ trackingIds.add(uie.Tracking_Id__c); }

        List<User_Session__c> existingSessions = [SELECT ID, Tracking_Id__c FROM User_Session__c WHERE Tracking_Id__c IN :trackingIds];

        for(User_Session__c us : existingSessions){ userSessionTrackingMap.put(us.Tracking_Id__c,us.Id); }

        for(User_Interaction_Event__e uie : newEvents){
            User_Interaction__c newUserInteraction = buildUserInteraction(uie);

            if(userSessionTrackingMap.containsKey(uie.Tracking_Id__c)){//SESSION ALREADY EXIST
                newUserInteraction.User_Session__c = userSessionTrackingMap.get(uie.Tracking_Id__c);
            }else{//NEW SESSION
                User_Session__c newUserSession = buildUserSession(uie);
                newUserSessionsMap.put(uie.Tracking_Id__c,newUserSession);
            }

            newInteractions.add(newUserInteraction);

        }

        if(!newUserSessionsMap.values().isEmpty()){ insert newUserSessionsMap.values(); }//INSERT NEW SESSIONS


        for(User_Interaction__c ui : newInteractions){//ASSOCIATE NEW INTERACTIONS WITH THE NEW SESSIONS JUST CREATED
            if(newUserSessionsMap.containsKey(ui.Tracking_Id__c)){ ui.User_Session__c = newUserSessionsMap.get(ui.Tracking_Id__c).Id; }
        }

        if(!newInteractions.isEmpty()){ insert newInteractions; }

    }

    private static User_Interaction__c buildUserInteraction(User_Interaction_Event__e uie){
        User_Interaction__c ui = new User_Interaction__c();
        ui.Click_Coordinate_X__c = uie.Click_Coordinate_X__c;
        ui.Click_Coordinate_Y__c = uie.Click_Coordinate_Y__c;
        ui.Host__c = uie.Host__c;
        ui.Origin__c = uie.Origin__c;
        ui.Path__c = uie.Path__c;
        ui.Query_String__c = uie.Query_String__c;
        ui.Timestamp__c = uie.Timestamp__c;
        ui.Type__c = uie.Type__c;
        ui.URL__c = uie.URL__c;
        ui.Tracking_Id__c = uie.Tracking_Id__c;

        //REDUNDANT FIELDS
        ui.Application__c = uie.Application__c;
        ui.Browser__c = uie.Browser__c;
        ui.City__c = uie.City__c;
        ui.Country_ISO__c = uie.Country_ISO__c;
        ui.Impersonated_By__c = uie.Impersonated_ById__c;
        ui.Impersonated_Session__c = uie.Impersonated_Session__c;
        ui.Coordinates__Longitude__s = uie.Longitude__c;
        ui.Coordinates__Latitude__s = uie.Latitude__c;
        ui.Login_Time__c = uie.Login_Time__c;
        ui.Login_Url__c = uie.Login_Url__c;
        ui.Network_Id__c = uie.Network_ID__c;
        ui.Platform__c = uie.Platform__c;
        ui.PostalCode__c = uie.PostalCode__c;
        ui.Source_IP__c = uie.Source_IP__c;
        ui.Subdivision__c = uie.Subdivision__c;
        ui.User__c = uie.User_ID__c;
        ui.Window_Heigth__c = uie.Window_Heigth__c;
        ui.Window_Width__c = uie.Window_Width__c;
        return ui;
    } 

    private static User_Session__c buildUserSession(User_Interaction_Event__e uie){
        User_Session__c us = new User_Session__c();
        us.Application__c = uie.Application__c;
        us.Browser__c = uie.Browser__c;
        us.City__c = uie.City__c;
        us.Coordinates__Longitude__s = uie.Longitude__c;
        us.Coordinates__Latitude__s = uie.Latitude__c;
        us.Country_ISO__c = uie.Country_ISO__c;
        us.Impersonated_By__c = uie.Impersonated_ById__c;
        us.Impersonated_Session__c = uie.Impersonated_Session__c;
        us.Login_Time__c = uie.Login_Time__c;
        us.Tracking_Id__c = uie.Tracking_Id__c;
        us.Login_Url__c = uie.Login_Url__c;
        us.Network_Id__c = uie.Network_ID__c;
        us.Platform__c = uie.Platform__c;
        us.Postal_Code__c = uie.PostalCode__c;
        us.Source_IP__c = uie.Source_IP__c;
        us.Sub_Division__c = uie.Subdivision__c;
        us.User__c = uie.User_ID__c;
        //us.Window_Heigth__c = uie.Window_Heigth__c;
        //us.Window_Width__c = uie.Window_Width__c;
        return us;
    }

}