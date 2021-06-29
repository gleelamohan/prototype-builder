import { LightningElement, track, api } from "lwc";
import TRAILHEAD_LOGO from "@salesforce/resourceUrl/image";
import My_Resource from "@salesforce/resourceUrl/PrototypeAssets";
import sendEmail from "@salesforce/apex/PrototypeController.sendEmail";
import createProtoConfig from "@salesforce/apex/PrototypeController.createPrototypeConfig";
import getFiles from "@salesforce/apex/PrototypeController.getRelatedFiles";
import createScreenConfig from "@salesforce/apex/PrototypeController.createScreenConfig";
import getHotspots from "@salesforce/apex/PrototypeController.getScreenHotspots";
import deleteHotspots from "@salesforce/apex/PrototypeController.deleteHotspots";
import updateHomeScreen from "@salesforce/apex/PrototypeController.updateHomeScreen";
import checkHomeScreen from "@salesforce/apex/PrototypeController.checkHomeScreen";
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class DrawImage extends LightningElement {
  @api recordId;
  desktop = My_Resource + "/desktop.png";
  mobile = My_Resource + "/mobile.png";
  ipad = My_Resource + "/ipad.png";
  staticImage = TRAILHEAD_LOGO;
  trailheadLogoUrl = TRAILHEAD_LOGO;
  emailIds;
  isShare=false;
  imageName = 'noLogo';
  show2 = true;
  currentStep;
  protoName;
  @track delArray=[];
  protoType;
  orientation = "Landscape";
  withFrame;
  isHome;
  isLoaded=false;
  createMode;
  @track prevHomeScreenId;
  @track configId;
  @track selectedCvId;
  @track selcvId;
  @track configScreenId;
  @track parsedFiledetails;
  @track filesDetails;
  @track screenHotspots;
  @track delHotspots =[];
  @track isModalOpen = false;
  @track doNotReset = false;
  finalAppUrl = '';
  isPrototypeNameFilled = true;


  connectedCallback() {
   if(this.recordId){
    this.protoType ='Desktop'
     this.configId = this.recordId;
    getFiles({
      recordId: this.recordId
    }).then((response) => {
      console.log(response);
      this.filesDetails = response;
      this.currentStep = 3;
      this.createMode = false;
    });
   }
   else{
    this.currentStep = 1;
    this.protoType = 'Desktop';
    this.orientation = 'Landscape';
    this.withFrame = 'withoutFrame';
    this.createMode = true;
   }
  }

  checkIsHome(){
    checkHomeScreen({
      screenId:this.configScreenId
    }).then((response) => {  
      if(response){
        console.log(response);
        this.isHome = true;
        const checkbox = this.template.querySelector('.homepage');
        checkbox.disabled = true;
      }
    });
  }
  
  createAppLink(){
    this.currentStep = 4;
    this.finalAppUrl = 'https://'+window.location.hostname+'/c/ConfiguredHotspotsApp.app?pscId=' + this.configId;
  }

  openModal() {
    this.template.querySelector(".modalpopup").classList.remove("hide_modal");
  }

  closeModal() {
    this.template.querySelector(".modalpopup").classList.add("hide_modal");
  }

  fnDelHotspots(){

    let delarr = this.delArray;

   /* this.delHotspots.map((item)=>{
      delarr.push(item.Id);
    });*/

    deleteHotspots({
      hIds:  delarr
    }).then((response) => {  
  

      this.fillHotspots();
      this.closeModal();
    });
  }

  fillHotspots(){
    console.log(this.configScreenId);
    getHotspots({
      screenId:   this.configScreenId
    }).then((response) => {  
   let res=   response.map((obj, i) => {
       
        obj.bin_x = obj.X_cordinate__c + obj.Width__c;
        obj.bin_y = obj.Y_cordinate__c - obj.Height__c;

        return obj;

    });
      console.log(response);
      this.screenHotspots = res;
      this.delHotspots = res;
    });
  }


  get options() {
    let fileOptions = [];
    this.filesDetails.forEach(function (item, index) {
      fileOptions.push({
        label: item.title,
        value:item.docId
      });
    });
    return fileOptions;
}

  nameChange(event) {
    this.protoName = event.target.value;
    if( this.protoName ) {
      this.isPrototypeNameFilled = false;
    }
    else {
      this.isPrototypeNameFilled = true;
    }
  }

  handleStep1Click(event) {
    this.createConfig();
    this.currentStep = 2;
  }

  handleStep2Click(event) {
    getFiles({
      recordId: this.configId
      //recordId:'a7w5a000000bovKAAQ'
    }).then((response) => {
      console.log(response);
      this.filesDetails = response;
      this.currentStep = 3;
    });
   
  }

  createScreenConfiguration(dId){

    if(this.imageName != 'noLogo')
    {
    createScreenConfig({
      cId: this.configId,
      cvId: this.selectedCvId,
      fName: this.imageName,
      startFlag:false
    }).then((response) => {
      this.configScreenId = response;
      const result = this.filesDetails.filter(item => item.docId === dId);
    
      this.trailheadLogoUrl = result[0].docURL;
      this.fillHotspots();
      this.checkIsHome();
      const checkbox = this.template.querySelector('.homepage');
      if(checkbox && this.prevHomeScreenId === this.configScreenId){
        checkbox.checked = true;
        checkbox.disabled= true;
      }
      else if(checkbox){
        checkbox.checked = false;
        checkbox.disabled= false;
      }

      console.log(this.cvId);
      console.log(response);
      this.isLoaded = false;
    });
  }
  }

  handleStep3Click(event) {}

  createConfig() {
    createProtoConfig({
      name: this.protoName,
      type: this.protoType,
      orientation: this.orientation,
      withFrame: this.withFrame
    }).then((response) => {
      this.configId = response;
      console.log(response);
    });
  }

  handleHomeChange(event){
    updateHomeScreen({
      prevId: this.prevHomeScreenId,
      currId: this.configScreenId
    }).then((response) => {
      const checkbox = this.template.querySelector('.homepage');
      checkbox.disabled = true;
      this.prevHomeScreenId = this.configScreenId;
      console.log(this.prevHomeScreenId);
      this.isHome = true;
      console.log('HOME SCREEN UPDATED');
    });

  }

  handleChangeDeleteCheck(event){
    this.delArray.push(event.target.dataset.value);
    console.log(this.delArray);
  }
  
  addHotspotDelList(event){
    this.doNotReset = true;
   this.delHotspots.push({Name:event.detail.name, Id: event.detail.id});
    console.log(this.delHotspots);
  }

  filesUploaded(event){

    this.show2 = false;

  }

  bindDeleteInnerHTML(){

  }

  handleChangeEvent(event) {
    Array.from(this.template.querySelectorAll(".device-type")).forEach(
      (element) => {
        element.checked = false;
      }
    );
    this.protoType = event.target.dataset.value;
    const checkbox = this.template.querySelector(
      'lightning-input[data-value="' + event.target.dataset.value + '"]'
    );
    checkbox.checked = true;
  }

  handleFrameChangeEvent(event) {
    Array.from(this.template.querySelectorAll(".frame-type")).forEach(
      (element) => {
        element.checked = false;
      }
    );
    this.withFrame = event.target.dataset.value;
    const checkbox = this.template.querySelector(
      'lightning-input[data-value="' + event.target.dataset.value + '"]'
    );
    checkbox.checked = true;
  }


  handleChange(event){
    this.doNotReset = false;
    this.trailheadLogoUrl = this.staticImage;
    const result = this.filesDetails.filter(item => item.docId === event.detail.value);
    
    this.selectedCvId = result[0].contentVersionId;
    this.selcvId = result[0].contentVersionId;
    
    this.imageName = result[0].title;
    this.parsedFiledetails = JSON.stringify(this.filesDetails);
    this.isLoaded = true;
    this.createScreenConfiguration(event.detail.value);
  
    //setTimeout(function(that){ that.isLoaded = false }, 5000, this);
    
  }

  handleCopyToClipboard(){
    const container = this.template.querySelector(".applink");
    const range = document.createRange();
    range.selectNode(container);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);      
    const successful = document.execCommand('copy');
  }

  handleShareClick(){
    this.isShare = true;
  }
  handleEmailChange(event) {
    if (event.target.name === 'emailAddress') {
        this.emailIds = event.target.value;
    }
}

backHome(){
  window.location.reload();
}
sendEmailHandler(event) {
  // send mail
  console.log("Sending email to", this.emailIds);
  let email = this.emailIds.indexOf(',')!==-1?this.emailIds.split(','):this.emailIds;
  sendEmail({ toAddress: email, subject: this.protoName+" App URL", body: this.finalAppUrl}).then((response) => {
    this.isShare = false;
    this.dispatchEvent(
      new ShowToastEvent({
          title: 'Success',
          message: 'App URL shared with the recepients.' ,
          variant: 'success',
      }),
  );
  });;
}

  get checkStep1(){

   return (typeof(this.protoName) === 'undefined' || this.protoName === '') === true?true:false;

  }

  get isDesktop(){

    return this.protoType ==='Desktop'?true:false;
  }

  get isMobile(){
    return this.protoType ==='Mobile'?true:false;

  }
  get isDelHotspots(){
    return this.delHotspots.length > 0?true:false;
  }

  get isStep1() {
    return this.currentStep === 1 ? true : false;
  }
  get isStep2() {
    return this.currentStep === 2 ? true : false;
  }

  get isStep3() {
    return this.currentStep === 3 ? 'main-container' : 'main-container slds-hide';
  }

  get isStep4() {
    return this.currentStep === 4 ? true : false;
  }

  get isAppLink(){
    console.log(this.isHome && this.createMode);
    return (this.isHome && this.createMode) === true? true:false;
  }
}