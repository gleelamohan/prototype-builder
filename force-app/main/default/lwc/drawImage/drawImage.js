import { LightningElement, track } from "lwc";
import TRAILHEAD_LOGO from "@salesforce/resourceUrl/image";
import My_Resource from "@salesforce/resourceUrl/PrototypeAssets";
import createProtoConfig from "@salesforce/apex/PrototypeController.createPrototypeConfig";
import getFiles from "@salesforce/apex/PrototypeController.getRelatedFiles";
import createScreenConfig from "@salesforce/apex/PrototypeController.createScreenConfig";
import getHotspots from "@salesforce/apex/PrototypeController.getScreenHotspots";
import deleteHotspots from "@salesforce/apex/PrototypeController.deleteHotspots";
import updateHomeScreen from "@salesforce/apex/PrototypeController.updateHomeScreen";

export default class DrawImage extends LightningElement {
  desktop = My_Resource + "/desktop.png";
  mobile = My_Resource + "/mobile.png";
  ipad = My_Resource + "/ipad.png";
  staticImage = TRAILHEAD_LOGO;
  trailheadLogoUrl = TRAILHEAD_LOGO;
  imageName = 'noLogo';
  currentStep = 1;
  protoName;
  @track delArray=[];
  protoType;
  orientation = "Landscape";
  withFrame;
  isHome;
  isLoaded=false;
  @track prevHomeScreenId;
  @track configId;
  @track selectedCvId;
  @track selcvId;
  @track configScreenId;
  @track test;
  @track filesDetails;
  @track screenHotspots;
  @track delHotspots =[];
  @track isModalOpen = false;
  @track doNotReset = false;


  renderedCallback() {
   //this.isLoaded = false;

  }

  homeScreenUpdation(){
   
  }
  
  createAppLink(){
    this.currentStep = 4;
  }

  openModal() {
    this.template.querySelector(".modalpopup").classList.remove("hide_modal");
  }

  closeModal() {
    this.template.querySelector(".modalpopup").classList.add("hide_modal");
  }

  fnDelHotspots(){

    let delarr = [];

    this.delHotspots.map((item)=>{
      delarr.push(item.Id);
    });

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
    this.test = JSON.stringify(this.filesDetails);
    this.isLoaded = true;
    this.createScreenConfiguration(event.detail.value);
  
    //setTimeout(function(that){ that.isLoaded = false }, 5000, this);
    
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
}
