import { LightningElement, track, api } from "lwc";
import createScreenHotspot from "@salesforce/apex/PrototypeController.createScreenHotspot";
import getHotspots from "@salesforce/apex/PrototypeController.getScreenHotspots";
import addScreenHeight from "@salesforce/apex/PrototypeController.addScreenHeight";


export default class ImageHotspot extends LightningElement {
  @api imageUrl;
  @api imageName;
  @api fileDetails;
  @api screenId;
  @api protoType;
  @api screenHotspots;
  @api versionId;
  @api donotReset;
  @api allFiles;
  @track marqueeRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    name:'',
    imageVId:'',
    url:''
  };
  @track $marquee;
  @track $screenshot;
  @track startX = 0;
  @track startY = 0;
  @track rectangles = [];
  $;
  @track hasRendered = true;
  @track isModalOpen = false;
  hotspotX;
  hotspotY;
  hotspotHeight;
  hotspotWidth;
  hName;
  urlVal;

  value1 ='None';

  renderedCallback() {

    this.$ = this.template.querySelector.bind(this.template);
    console.log(this.versionId);
    console.log('***** FILE DETAILS ****');
    console.log(this.fileDetails);

    this.$(".marquee").classList.add("hide");
    if (this.hasRendered){
    this.$(".modalpopup").classList.add("hide_modal");
    }
    if(this.versionId){
      this.template.querySelectorAll(".logo-img").forEach(
        (element) => {
          element.style.display = 'none';
        }
      );
      
      if(this.$('[id^="'+this.versionId+'-"]'))
      {
        this.$('[id^="'+this.versionId+'-"]').style.display = 'block';
        let svgHeight = this.$('[id^="'+this.versionId+'-"]').height;
        console.log(this.$('[id^="'+this.versionId+'-"]').height);
        this.$('.draw').setAttribute('viewBox', '0 0 1920 '+ svgHeight);
        this.$('.draw').setAttribute('height',  svgHeight);
        this.$('.draw').setAttribute('width',  '1920');

        if(this.screenId){
        addScreenHeight({ screenId: this.screenId,height:svgHeight});
        }

      }
    }
    
    // this.rectangles = [];
    
    if (this.hasRendered && this.imageName !== "noLogo") {
      
      this.$marquee = this.$(".marquee");
      this.$screenshot = this.$(".screenshot");
      window.removeEventListener("pointerup", this._stopDrag);
      this.$screenshot.removeEventListener("pointermove", this._moveDrag);
      this.$screenshot.removeEventListener("pointerdown", this._startDrag);
      this._startDrag = this.startDrag.bind(this);
      this.$screenshot.addEventListener("pointerdown", this._startDrag);
      this.hasRendered = false;
    }
  }

  get initialHotspots(){
    return this.screenHotspots;
  }

  createScreenHotspots(){

    createScreenHotspot({
      screenId: this.screenId,
      name: this.marqueeRect.name,
      type: this.value1,
      targetId:this.marqueeRect.imageVId,
      url:this.marqueeRect.url,
      x:this.marqueeRect.x,
      y:this.marqueeRect.y,
      height:this.marqueeRect.height,
      width:this.marqueeRect.width
    }).then((response) => {  

      const selectedEvent = new CustomEvent("hotspotspotadd", {
        detail: {name:this.marqueeRect.name, id:response}
      });
  
      // Dispatches the event.
      this.dispatchEvent(selectedEvent);
      
      [...this.template
        .querySelectorAll('lightning-input')]
        .forEach((input) => { input.value = ''; });
        this.marqueeRect.name = '';
        this.marqueeRect.imageVId = '';
        this.marqueeRect.url = '';
        const startSelect = this.template.querySelector('.screentype');
        if (startSelect) {
            startSelect.value = 'None';
        }
    
      this.fillHotspots();
      this.value1 ='None';
      console.log('HOTSPOT SAVED');
    });
  }

  fillHotspots(){
    
    getHotspots({
      screenId:   this.screenId
    }).then((response) => {  
   let res=   response.map((obj, i) => {
       
        obj.bin_x = obj.X_cordinate__c + obj.Width__c;
        obj.bin_y = obj.Y_cordinate__c - obj.Height__c;

        return obj;

    });
      console.log(response);
      
      this.screenHotspots = res;
      this.template.querySelector(".boxes").innerHTML = "";
      this.rectangles=[];
      
    });
  }


  handleTargetDropdownChange(event){
    this.marqueeRect.imageVId= event.detail.value;
    
  }
  handleChange1(event){
    this.value1 = event.detail.value;
  }
  get options1() {
    return [
      { label: 'None', value: 'None' },
        { label: 'Screen', value: 'Screen' },
        { label: 'URL', value: 'URL' }
    ];
}

hotspotChange(event){

  this.marqueeRect.name = event.target.value;

}
  get options() {

    let fileOptions = [];
    JSON.parse(this.fileDetails).forEach( (item, index)=> {
    if(this.versionId  && this.versionId != item.contentVersionId){
      fileOptions.push({
        label: item.title,
        //value:item.docId
        value:item.contentVersionId
        
      });
    }

    });

   
    return fileOptions;
}

get checkStep2(){
  let disabled = false;
 if(typeof(this.marqueeRect.name) === 'undefined' || this.marqueeRect.name === '')
 {
  disabled = true;
 }
 if((typeof(this.value1) === 'undefined' || this.value1 === '') || this.value1 === 'None')
 {
  disabled = true;
 }

 if( (typeof(this.marqueeRect.imageVId) === 'undefined' || this.marqueeRect.imageVId === '' ) && (typeof(this.marqueeRect.url) === 'undefined' || this.marqueeRect.url === '' ))
{
  disabled = true;
}
   return disabled;
}

get divWidth(){
  return this.imageName === "noLogo"? "width:1500px;":"width:1920px";
}

get isScreenType(){
  
  return this.value1 === 'Screen'?true:false;
}

get isURLtype(){
  
  return this.value1 === 'URL'?true:false;
}
  startDrag(ev) {
    // middle button delete rect
    if (ev.button === 1) {
      const rect = this.hitTest(ev.layerX, ev.layerY);
      if (rect) {
        this.rectangles.splice(this.rectangles.indexOf(rect), 1);
        this.redraw();
        this.marqueeRect.width = 0;
        this.marqueeRect.height = 0;
      }
      return;
    }
    this._moveDrag = this.moveDrag.bind(this);
    this.$screenshot.addEventListener("pointermove", this._moveDrag);
    this._stopDrag = this.stopDrag.bind(this);
    window.addEventListener("pointerup", this._stopDrag);
    this.$marquee.classList.remove("hide");
    this.startX = ev.layerX;
    this.startY = ev.layerY;
    this.drawRect(this.$(".marquee"), this.startX, this.startY, 0, 0);
  }

  stopDrag(ev) {
    this.$marquee.classList.add("hide");
    window.removeEventListener("pointerup", this.stopDrag);
    this.$screenshot.removeEventListener("pointermove", this.moveDrag);
    window.removeEventListener("pointerup", this._stopDrag);
    this.$screenshot.removeEventListener("pointermove", this._moveDrag);
    if (this.marqueeRect.width && this.marqueeRect.height) {
    this.$(".modalpopup").classList.remove("hide_modal");
    }
  }

  submitDetails() {
    this.$(".modalpopup").classList.add("hide_modal");
    
    if (this.marqueeRect.width && this.marqueeRect.height) {
      this.createScreenHotspots();
      //console.log('***********');
      //console.log(this.marqueeRect.width);
      //console.log(this.marqueeRect.height);
      this.rectangles.push(Object.assign({}, this.marqueeRect));
      this.redraw();
      this.marqueeRect.width = 0;
      this.marqueeRect.height = 0;
    }
  }

  handleUrlChange(event) {
    //this.urlVal = event.detail.value;
    this.marqueeRect.url = event.detail.value;
  }

  closeModal() {
    this.$(".modalpopup").classList.add("hide_modal");
  }

  moveDrag(ev) {
    let x = ev.layerX;
    let y = ev.layerY;
    let width = this.startX - x;
    let height = this.startY - y;
    if (width < 0) {
      width *= -1;
      x -= width;
    }
    if (height < 0) {
      height *= -1;
      y -= height;
    }
    Object.assign(this.marqueeRect, { x, y, width, height });
    this.drawRect(this.$(".marquee"), this.marqueeRect);
  }

  hitTest(x, y) {
    return this.rectangles.find(
      (rect) =>
        x >= rect.x &&
        y >= rect.y &&
        x <= rect.x + rect.width &&
        y <= rect.y + rect.height
    );
  }

  redraw() {
    this.template.querySelector(".boxes").innerHTML = "";
    //console.log(this.rectangles);
    this.rectangles.forEach((data) => {
      this.template
        .querySelector(".boxes")
        .appendChild(
          this.drawRect(
            document.createElementNS("http://www.w3.org/2000/svg", "rect"),
            data
          )
        );
    });
  }

  drawRect(rect, data) {
    // console.log(data);
    const { x, y, width, height } = data;

    if (width && height && x && y) {
      rect.setAttributeNS(null, "width", width);
      rect.setAttributeNS(null, "height", height);
      rect.setAttributeNS(null, "x", x);
      rect.setAttributeNS(null, "y", y);
    }
    return rect;
  }
}