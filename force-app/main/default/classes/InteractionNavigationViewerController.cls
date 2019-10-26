public class InteractionNavigationViewerController {
    
    @AuraEnabled
    public static List<User_Interaction__c> getUserInteractions(String userSessionId, String urlPath){
        
        if(userSessionId != NULL){
            return [SELECT Id, Click_Coordinate_X__c, Click_Coordinate_Y__c,
                    User_Session__r.Window_Heigth__c, User_Session__r.Window_Width__c
                    FROM User_Interaction__c
                    WHERE User_Session__c =: userSessionId AND Type__c = 'Click' AND Path__c LIKE: urlPath+'%'];
        }else{
            return [SELECT Id, Click_Coordinate_X__c, Click_Coordinate_Y__c,
                    User_Session__r.Window_Heigth__c, User_Session__r.Window_Width__c
                    FROM User_Interaction__c
                    WHERE Type__c = 'Click' AND Path__c LIKE: urlPath+'%'];
        }
        
    }

}