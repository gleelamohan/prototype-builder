public with sharing class PrototypeController {
    public PrototypeController() {

    }

    @AuraEnabled
    public static void updateHomeScreen(String prevId, string currId, string cId){
       
        List<Prototype_Screen_Configuration__c> pscSelect = [select Id,startFlag__c	 from Prototype_Screen_Configuration__c where Prototype_Configuration__c=:cId];

        for(Prototype_Screen_Configuration__c psc : pscSelect){
            if(psc.Id == currId){
                psc.startFlag__c	= true;
            }else {
                psc.startFlag__c	= false;
            }
        }
/*
        if(!pscSelect.isEmpty()){
            if(!pscSelect[0].startFlag__c)
            {
                SYSTEM.DEBUG('TRUE');
                pscSelect[0].startFlag__c	= true;
            }
            else{
                SYSTEM.DEBUG('FALSE');
                pscSelect[0].startFlag__c	= false;
            }
            update pscSelect;
        }

        
        List<Prototype_Screen_Configuration__c> pscUnselect = [select Id,startFlag__c	 from Prototype_Screen_Configuration__c where Id=:prevId];

        if(!pscUnselect.isEmpty()){
            pscUnselect[0].startFlag__c	= false;
            update pscUnselect;
        }*/
        update pscSelect;

    }

    @AuraEnabled
    public static String deleteDocument(String docId){
        try{
            delete [SELECT Id FROM ContentDocument WHERE Id=:docId];
            return 'SUCCESS';
        }
        catch(Exception ex){
            throw new AuraHandledException(ex.getMessage());
        }
    }

 @AuraEnabled
  public static String createScreenHotspot(string screenId, string name, string type, string targetId, string url, integer x, integer y, integer height, integer width) {

    Hotspots__c hspost = new Hotspots__c();
    hspost.Prototype_Screen_Configuration__c = screenId;
    hspost.name = name;
    if(!String.isBlank(targetId))
    {
    hspost.Target_Screen__c = targetId;
    }
    else{
        hspost.Target_URL__c = url;
    }
    hspost.X_cordinate__c = x;
    hspost.Y_cordinate__c = y;
    hspost.Height__c = height;
    hspost.Width__c = width;

    insert hspost;

    return hspost.Id;

  }

  @AuraEnabled
  public static void deleteHotspots(List<string> hIds){
        delete [select Id from Hotspots__c where Id =: hIds];
  }

  @AuraEnabled
  public static void addScreenHeight(string screenId, integer height) {

    Prototype_Screen_Configuration__c psc=  [select sheight__c from Prototype_Screen_Configuration__c where Id=:screenId];
System.Debug(string.isBlank(String.valueOf(psc.sheight__c)));
   if(string.isBlank(String.valueOf(psc.sheight__c))){
    psc.sheight__c = height;
    update psc;
   }
  }

  @AuraEnabled
  public static string createScreenConfig(string cId, string cvId, string fName, boolean startFlag) {


    List<Prototype_Screen_Configuration__c> pscSelect = [select Id from Prototype_Screen_Configuration__c where Prototype_Configuration__c =:cId and File_VersionId__c=:cvId];
    string screenConfigId;
    if(pscSelect.isEmpty()){
    Prototype_Screen_Configuration__c psc = new Prototype_Screen_Configuration__c();
    psc.Prototype_Configuration__c = cId;
    psc.Name = fName;
    psc.File_VersionId__c = cvId;
    psc.startFlag__c = startFlag;
    
    insert psc;

    screenConfigId = psc.Id;
    } else{
        screenConfigId = pscSelect[0].Id;
    }
    return screenConfigId;

  }
  

    @AuraEnabled
  public static string createPrototypeConfig(string name, string type, string orientation, Boolean withFrame) {
  
    PrototypeConfiguration__c pc_Config = new PrototypeConfiguration__c();
    pc_Config.Name = name;
    pc_Config.Type__c = type;
    pc_Config.Orientation__c = orientation;
    pc_Config.with_Frame__c = withFrame;

    insert pc_Config;

    return pc_Config.Id;

}

    @AuraEnabled
    public static Prototype_Screen_Configuration__c checkHomeScreen(string screenId){
        Prototype_Screen_Configuration__c psc = [select  Id, startFlag__c from Prototype_Screen_Configuration__c where Id=:screenId];
        return psc;
    }

    @AuraEnabled
    public static List<Hotspots__c> getScreenHotspots(string screenId){
    List<Hotspots__c> hs=[select Id, Name,X_cordinate__c,Y_cordinate__c,Height__c,Width__c from Hotspots__c where Prototype_Screen_Configuration__c=:screenId];
    return hs;
}

@AuraEnabled
public static List<FilesWrapper> getRelatedFiles(Id recordId){
    List<ContentDocument> cdList = new List<ContentDocument>();
    List<ContentDocumentLink> cdlList = [SELECT ContentDocumentId FROM ContentDocumentLink
                                         WHERE LinkedEntityId = :recordId];
    Set<Id> cdIds = new Set<Id>();
    List<FilesWrapper> lstFiles = new List<FilesWrapper>();
    for (ContentDocumentLink cdl : cdlList) {
        cdIds.add(cdl.ContentDocumentId); 
    }        
    cdList = [SELECT Id, Title, FileType, OwnerId, Owner.Name, CreatedDate,
              CreatedById, CreatedBy.Name, ContentSize
              FROM ContentDocument WHERE Id IN :cdIds];

    for (ContentDocument cd : cdList) {
        ContentVersion cv = [SELECT Id FROM ContentVersion WHERE ContentDocumentId = :cd.Id AND IsLatest = true];
        //String cvDownloadURL = URL.getSalesforceBaseUrl().toExternalForm() + '/sfc/servlet.shepherd/version/download/' + cv.Id;
        String cvDownloadURL = '/sfc/servlet.shepherd/version/download/' + cv.Id;

        FilesWrapper fw = new FilesWrapper();
        fw.docId = cd.Id;
        fw.title = cd.Title;
        fw.fileType = cd.FileType;
        fw.contentVersionId = cv.Id;
        fw.docURL = cvDownloadURL;
        lstFiles.add(fw);
    }
    return lstFiles;
}

    @AuraEnabled
    public static void sendEmail(List<String> toAddress, String subject, String body) {      
        Messaging.reserveSingleEmailCapacity(1);
        try{
        messaging.SingleEmailMessage mail = new messaging.SingleEmailMessage();
        
        System.debug(toAddress);
        System.debug(body);
        System.debug(subject);
        // toAddress.add('er.rajat15@gmail.com');
                
        mail.setToAddresses(toAddress);
        mail.setReplyTo('no-reply@xooa.com');
        mail.setSenderDisplayName('Your name here');
        mail.setSubject(subject);
        mail.setHtmlBody(body);
        // mail.setEntityAttachments(files);
        Messaging.sendEmail(new List<messaging.SingleEmailMessage> {mail});
        }
        catch (exception e){
            throw new AuraHandledException(e.getMessage());
            //return null;
        }
    }

public class FilesWrapper{

    @AuraEnabled
    public string docId { get; set;}

    @AuraEnabled
    public string title { get; set;}

    @AuraEnabled
    public string fileType { get; set;}

    @AuraEnabled
    public string contentVersionId { get; set;}
    
    @AuraEnabled
    public string docURL { get; set;}
}


}
