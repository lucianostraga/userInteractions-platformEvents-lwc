public class InteractionNavigationViewerController {
    
    private static String CLICK_EVENT = 'Click';

    @AuraEnabled(cacheable=true)
    public static List<Device__c> getDevicesWithScreens(){
        return [SELECT Id, Portrait_Height__c, Portrait_Width__c, Landscape_Width__c, Landscape_Height__c, Name, 
                    (select Id, Name, Path__c, Screenshot_URL__c, Image__c, Orientation__c from Screens__r order by Name asc) 
                FROM Device__c
                ORDER BY Name ASC];
    }

    @AuraEnabled
    public static List<User_Interaction__c> getUserClicks(String urlPath,Decimal width,Decimal height){
        return [SELECT Id, Click_Coordinate_X__c, Click_Coordinate_Y__c, Window_Width__c, Window_Heigth__c, Screen_Height__c, Screen_Width__c
                FROM User_Interaction__c
                WHERE Type__c =: CLICK_EVENT 
                    AND Path__c LIKE: urlPath+'%' 
                    AND Screen_Width__c =: width
                    AND Screen_Height__c =: height];
    }

    @AuraEnabled
    public static List<User_Interaction__c> getUserClicksBySessionId(String urlPath,Decimal width,Decimal height,String sessionId){
        return [SELECT Id, Click_Coordinate_X__c, Click_Coordinate_Y__c, Window_Width__c, Window_Heigth__c, Screen_Height__c, Screen_Width__c
                FROM User_Interaction__c
                WHERE Type__c =: CLICK_EVENT 
                    AND Path__c LIKE: urlPath+'%' 
                    AND User_Session__c =: sessionId
                    AND Screen_Width__c =: width
                    AND Screen_Height__c =: height];
    }

}