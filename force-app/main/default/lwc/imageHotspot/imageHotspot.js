import { LightningElement, track, api } from "lwc";
import createScreenHotspot from "@salesforce/apex/PrototypeController.createScreenHotspot";


export default class ImageHotspot extends LightningElement {
  //trailheadLogoUrl = TRAILHEAD_LOGO;
  @api imageUrl;
  @api imageName;
  @api fileDetails;
  @api screenId;
  @api screenHotspots;
  @api versionId;
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

  value1 ='None';

  renderedCallback() {
    
    console.log(this.versionId);
    this.$ = this.template.querySelector.bind(this.template);
    this.template.querySelector(".boxes").innerHTML = "";

    
    this.$(".marquee").classList.add("hide");

     this.rectangles = [];
    if (this.hasRendered && this.imageName === "noLogo") {
      this.$(".modalpopup").classList.add("hide_modal");
      

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
      
      [...this.template
        .querySelectorAll('lightning-input')]
        .forEach((input) => { input.value = ''; });

        const startSelect = this.template.querySelector('.screentype');
        if (startSelect) {
            startSelect.value = 'None';
        }
      //this.value1 = 'None';
      //this.hName = '';
      console.log('HOTSPOT SAVED');
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
