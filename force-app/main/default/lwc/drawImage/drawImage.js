import { LightningElement, track } from "lwc";
import TRAILHEAD_LOGO from "@salesforce/resourceUrl/image";
import My_Resource from "@salesforce/resourceUrl/PrototypeAssets";
import createProtoConfig from "@salesforce/apex/PrototypeController.createPrototypeConfig";
import getFiles from "@salesforce/apex/PrototypeController.getRelatedFiles";

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

  @track configId;
  @track test;
  @track filesDetails;

  renderedCallback() {
   

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
   
    this.trailheadLogoUrl = result[0].docURL;
    this.imageName = result[0].title;
    this.test = JSON.stringify(this.filesDetails);
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
}
