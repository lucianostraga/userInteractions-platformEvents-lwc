public without sharing class InteractionLoggerController {
    
    @AuraEnabled
    public static void publishEvent(String jsonEvent){

    }

    private class InteractionEvent{
        public Datetime timestamp;
        public String pathName;
        public String origin;
        public String search;
        public String type;
        public Integer cordinateX;
        public Integer cordinateY;
        public Integer windowWidth;
        public Integer windowHeigth;
    }

}