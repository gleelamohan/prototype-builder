import { LightningElement, track } from "lwc";
import TRAILHEAD_LOGO from "@salesforce/resourceUrl/image";
import My_Resource from "@salesforce/resourceUrl/PrototypeAssets";
import createProtoConfig from "@salesforce/apex/PrototypeController.createPrototypeConfig";
import getFiles from "@salesforce/apex/PrototypeController.getRelatedFiles";
import createScreenConfig from "@salesforce/apex/PrototypeController.createScreenConfig";
import getHotspots from "@salesforce/apex/PrototypeController.getScreenHotspots";
import updateHomeScreen from "@salesforce/apex/PrototypeController.updateHomeScreen";

export default class DrawImage extends LightningElement {
  desktop = My_Resource + "/desktop.png";
  mobile = My_Resource + "/mobile.png";
  ipad = My_Resource + "/ipad.png";
  trailheadLogoUrl = TRAILHEAD_LOGO;
  imageName = 'noLogo';
  currentStep = 1;
  protoName;
  protoType;
  orientation = "Landscape";
  withFrame;
  isHome;

  @track prevHomeScreenId;
  @track configId;
  @track selectedCvId;
  @track selcvId;
  @track configScreenId;
  @track test;
  @track filesDetails;
  @track screenHotspots;

  renderedCallback() {
   

  }

  homeScreenUpdation(){
   
  }

  createAppLink(){
    this.currentStep = 4;
  }

  fillHotspots(){
    console.log(this.configScreenId);
    getHotspots({
      screenId:   this.configScreenId
    }).then((response) => {  
      console.log(response);
      this.screenHotspots = response;
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

  createScreenConfiguration(){

    createScreenConfig({
      cId: this.configId,
      cvId: this.selectedCvId,
      fName: this.imageName,
      startFlag:false
    }).then((response) => {
      this.configScreenId = response;

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
    });
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
    const result = this.filesDetails.filter(item => item.docId === event.detail.value);
    
    //this.test = JSON.stringify(this.filesDetails);
   this.selectedCvId = result[0].contentVersionId;
   this.selcvId = result[0].contentVersionId;
    this.trailheadLogoUrl = result[0].docURL;
    this.imageName = result[0].title;
    this.test = JSON.stringify(this.filesDetails);
    this.createScreenConfiguration();
    
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
