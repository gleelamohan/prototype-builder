import { LightningElement , api, track, wire} from 'lwc';

import getMyData from "@salesforce/apex/HotspotViewerController.getRelatedFiles";
import { CurrentPageReference } from 'lightning/navigation';


export default class ImageWithHotspots extends LightningElement {
   
   @api pscId ;
   imageHotspots;
   allHotspots;
   error;

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
                
                for( let i of temp ) {
                    
                    if( i.prototypeScreenConfig && i.prototypeScreenConfig.startFlag__c ) {
                        i.displayClass = 'showIt';
                    }
                    else {
                        i.displayClass = 'hideIt';
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