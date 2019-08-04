public without sharing class InteractionLoggerController {
    
    @AuraEnabled
    public static void publishEvent(String jsonEvent){
        InteractionEvent ie = (InteractionEvent) JSON.deserialize(jsonEvent, InteractionEvent.class);
        
        User_Interaction_Event__e uie = buildPlatformEvent(ie);

        if(isUserLoggedIn()){ setSessionDetails(uie); }
                
        System.enqueueJob(new EventPublisherQueueable(uie));
    }

    private static void setSessionDetails(User_Interaction_Event__e ie){
        String sessionId = Auth.SessionManagement.getCurrentSession().get('SessionId');
        
        AuthSession currentSession = [SELECT Id, ParentId, LoginHistoryId 
                                      FROM AuthSession
                                      WHERE ID =: sessionId];
        
        System.debug('######## SESSION DETAILS '+currentSession);

        String realSessionId = currentSession.Id;

        if(currentSession.LoginHistoryId == NULL && currentSession.ParentId != NULL){//IMPERSONATED USERS
            ie.Impersonated_Session__c = true; 
            realSessionId = currentSession.ParentId;
        }

        AuthSession realSession = [SELECT Id, ParentId, LoginHistoryId, UsersId
                                   FROM AuthSession
                                   WHERE ID =: realSessionId];

        System.debug('######## REAL SESSION DETAILS '+realSession);
        if(ie.Impersonated_Session__c){ie.Impersonated_ById__c = realSession.UsersId;}

        LoginHistory logHis = [SELECT Id, LoginTime, SourceIp, LoginUrl, NetworkId,Platform, Application, Browser,LoginGeoId
                               FROM LoginHistory 
                               WHERE Id =: realSession.LoginHistoryId];

        System.debug('####### '+logHis);
        ie.Login_Time__c = logHis.LoginTime;
        ie.Source_IP__c = logHis.SourceIp;
        ie.Login_Url__c = logHis.LoginUrl;
        ie.Network_ID__c = logHis.NetworkId;
        ie.Platform__c = logHis.Platform;
        ie.Application__c = logHis.Application;
        ie.Browser__c = logHis.Browser;

        LoginGeo loginGeo = [SELECT Id, Latitude, Longitude, City, Subdivision,PostalCode,CountryIso
                            FROM LoginGeo 
                            WHERE Id =: logHis.LoginGeoId];
    
        System.debug('####### '+loginGeo);
        ie.Latitude__c = loginGeo.Latitude;
        ie.Longitude__c = loginGeo.Longitude;
        ie.City__c = loginGeo.City;
        ie.PostalCode__c = loginGeo.PostalCode;
        ie.Subdivision__c = loginGeo.Subdivision;
        ie.Country_ISO__c = loginGeo.CountryIso;
    }

    private static User_Interaction_Event__e buildPlatformEvent(InteractionEvent ie){
        User_Interaction_Event__e uie = new User_Interaction_Event__e();
        uie.Timestamp__c = ie.timestamp;
        uie.Path__c = ie.pathName;
        uie.Origin__c = ie.origin;
        uie.URL__c = ie.href;
        uie.Host__c = ie.host;
        uie.Query_String__c = ie.search;
        uie.Tracking_Id__c = ie.trackingId;
        uie.Type__c = ie.type;
        uie.Click_Coordinate_X__c = ie.cordinateX;
        uie.Click_Coordinate_Y__c = ie.cordinateY;
        uie.Window_Width__c = ie.windowWidth;
        uie.Window_Heigth__c = ie.windowHeigth;
        uie.User_ID__c = UserInfo.getUserId();
        return uie;
    }

    private static Boolean isUserLoggedIn() {
        Boolean isLoggedIn = false;
        String userType = UserInfo.getUserType();
        if (userType != 'Guest') {isLoggedIn = true;}
        return isLoggedIn;
    }

    private class EventPublisherQueueable implements Queueable {
        private User_Interaction_Event__e event;
        
        public EventPublisherQueueable(User_Interaction_Event__e event){
            this.event = event;
        }
        
        public void execute(QueueableContext context) {
            EventBus.publish(event);     
        }
        
    }

    private class InteractionEvent{
        public Datetime timestamp;
        public String pathName;
        public String origin;
        public String href;
        public String host;
        public String search;
        public String trackingId;
        public String type;
        public Integer cordinateX;
        public Integer cordinateY;
        public Integer windowWidth;
        public Integer windowHeigth;
    }

}