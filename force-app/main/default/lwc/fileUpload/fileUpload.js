import { LightningElement, api, track } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import deleteDocument from "@salesforce/apex/PrototypeController.deleteDocument";


export default class FileUpload extends LightningElement {
  @api recordId;
  @track uploadedFiles = [];

  renderedCallback(){
    console.log(this.recordId);
  }
    get acceptedFormats() {
        return ['.png','.jpg','.jpeg'];
    }

    handleClick(event) {
      
let delDoc= event.target.value;

deleteDocument({
    docId: delDoc
  }).then((response) => {
    console.log(response);
    this.uploadedFiles.splice(this.uploadedFiles.findIndex(function(i){
        return i.documentId === delDoc;
    }), 1);
  });
    }
    handleUploadFinished(event) {
        // Get the list of uploaded files
        const uploadedFiles = event.detail.files;

        console.log(uploadedFiles);
      
        let uploadedFileNames = '';
        for(let i = 0; i < uploadedFiles.length; i++) {
            uploadedFileNames += uploadedFiles[i].name + ', ';

            let arr = {
                name : uploadedFiles[i].name,
                documentId: uploadedFiles[i].documentId,
                contentVersionId: uploadedFiles[i].contentVersionId,
            };

            this.uploadedFiles.push(arr);
        }

        if(this.uploadedFiles.length > 0){

        const selectedEvent = new CustomEvent("fileuploaded", {
            detail: this.uploadedFiles.length
          });
          this.dispatchEvent(selectedEvent);
        }

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: uploadedFiles.length+' Files uploaded Successfully: ' ,
                variant: 'success',
            }),
        );
    }
}