public with sharing class PrototypeController {
    public PrototypeController() {

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
        String cvDownloadURL = URL.getSalesforceBaseUrl().toExternalForm() + '/sfc/servlet.shepherd/version/download/' + cv.Id;
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
