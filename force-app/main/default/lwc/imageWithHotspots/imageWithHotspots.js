import { LightningElement , api, track, wire} from 'lwc';

import getMyData from "@salesforce/apex/HotspotViewerController.getRelatedFiles";
import { CurrentPageReference } from 'lightning/navigation';
import spinner_logo from "@salesforce/resourceUrl/sfSpinner";





export default class ImageWithHotspots extends LightningElement {
   
   @api pscId ;
   @track imageHotspots;
   allHotspots;
   error;
   imgObj = {};
   showSpinner = false;
   sResource = spinner_logo;

   @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
       if (currentPageReference) {
          this.urlStateParameters = currentPageReference.state;
          this.pscId = this.urlStateParameters.c__id || null;
       }
    }


connectedCallback() {

    this.getFiles( this.pscId  );
}

    getFiles( recordId ) {
        getMyData({ recordId: recordId })
            .then((result) => {
                var temp = JSON.parse(JSON.stringify(result));
                this.showSpinner = true;
                for( let i of temp ) {
                    i.viewBox = '0 0 1920 1080';
                    if( i.prototypeScreenConfig && i.prototypeScreenConfig.sheight__c ) {
                        this.imgObj[i.contentVersionId] = '0 0 1920 '+i.prototypeScreenConfig.sheight__c;
                        i.viewBox = '0 0 1920 '+i.prototypeScreenConfig.sheight__c;
                    }
                   
                    
                    if( i.prototypeScreenConfig && i.prototypeScreenConfig.startFlag__c ) {
                        i.displayClass = 'showIt';
                    }
                    else {
                        i.displayClass = 'hideIt';
                        i.prototypeScreenConfig = { startFlag__c : false};
                    }
                }

                

                this.imageHotspots = temp;
                console.log(result);
                this.error = undefined;

            })
            .catch((error) => {
                this.error = error;
                this.imageHotspots = undefined;
            });
    }
    
    renderedCallback() {
        var imgs = this.template.querySelectorAll('.xyz');
        if( imgs ) { 
            for( let i of imgs ){
                if( i && i.title=='true' ) {
                    i.classList.add('showIt');
                    i.classList.remove('hideIt');
                }
            }
        
        }

        
        
    }

    handleLoad( event ) {
        var height = parseInt(event.target.naturalHeight);
        
        //this.imgObj[event.target.id] = '0 0 1920 '+height;
        console.log('--LOad-->'+JSON.stringify(this.imgObj));

        var svgs = this.template.querySelectorAll('.draw');
        if( svgs ) {
            
            for( let i of svgs ) {
                if( this.imgObj.hasOwnProperty(i.id.substring(0,18)) ){
                    break;
                }
                if( event.target.id == i.id ) {
                    i.setAttribute('viewBox','0 0 1920 '+height);
                    break;
                }
                
            }
            
        }

        /*if( this.imageHotspots ) {
            var temp = this.imageHotspots;
            for( let i of this.imageHotspots ) {
                
                console.log('inside');
                console.log('ID-->'+event.target.id);
                if( event.target.id.includes(i.contentVersionId) ) {
                    console.log('vIEWBOXOLD-->'+i.viewBox);
                    i.viewBox = '0 0 1920 '+height;
                    console.log('vIEWBOX NEW-->'+i.viewBox);
                    break;
                }
                
                
            }
            console.log('temppp-->',temp);
            this.imageHotspots = temp;
        }*/
       window.setTimeout(()=>this.showSpinner = false, 3000);
        
      
       
        
    }

    handleHotspotClicked (event) {
        var targetscreen = event.currentTarget.dataset.targetscreen;
        var targeturl = event.currentTarget.dataset.targeturl;
        
        if( targetscreen ) {
            //dO sOMETHING
            
            /*var imgs = this.template.querySelectorAll('.container');
            for( let i of imgs) {
                    console.log(i.id);
                    if(i.id.includes(targetscreen)) {
                        i.classList.add('showIt');
                        i.classList.remove('hideIt');
                    }
                    else {
                        i.classList.add('hideIt');
                        i.classList.remove('showIt');
                    }
            }*/

            for( let i of this.imageHotspots ) {
                if( i.contentVersionId == targetscreen ) {
                    var imgs = this.template.querySelectorAll('.xyz');
                    for( let i of imgs) {
                            console.log(i.id);
                            if(i.id.includes(targetscreen)) {
                                i.classList.add('showIt');
                                i.classList.remove('hideIt');
                                
                            }
                            else {
                                i.classList.add('hideIt');
                                i.classList.remove('showIt');
                                
                            }
                    }
                           
                        }
                        
            }
        
    }
          
        if( targeturl ) {
            if( targeturl.startsWith('https://')) {
                targeturl = targeturl;
            }
            else {
                targeturl = 'http://'+targeturl;
            }
            window.open(targeturl);
        }
      
       
        console.log(event.currentTarget.dataset.targetscreen);

    }
}