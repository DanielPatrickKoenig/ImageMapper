(function(){
    function createAreaTemplate(){
        return {type:"default",href:"",alt:"",x:36,y:36,width:72,height:72,radius:36,polyCoords:[{x:0,y:0},{x:72,y:0},{x:0,y:72}],defaltCoords:""};
    }
    new Vue({
        el:"#imageMapper",
        data:{
            src:"",
            mapName:"map1",
            tools:{EXPORT:"export",IMPORT:"import"},
            areas:[createAreaTemplate()],
            tool:0,
            types:["default","rect","circle","poly"],
            currentAreaType:"default",
            showAddDialogue:false,
            selectedArea:undefined,
            startPosition:{x:0,y:0},
            stagePressed:false,
            reshaping:false,
            reshapeHandleSize:5,
            handleIndex:undefined,
            dragOffset:{x:0,y:0},
            sizeOffset:{width:0,height:0},
            polyOffset:{x:0,y:0},
            tempPolyCopy:[],
            exportInfo:"",
            importInfo:"",
            showExport:false,
            showImport:false
        },
        methods:{
            onToolClicked:function(e){
                var self = this;
                //console.log(e.currentTarget.getAttribute("tool-index"));
                switch(e.currentTarget.getAttribute("tool-index")){
                    // case self.$data.tools.ADD:{

                    //     self.$data.showAddDialogue = true;
                    //     break;
                    // }
                    case self.$data.tools.IMPORT:{
                        
                        self.$data.showImport = true;
                        break;
                    }
                    case self.$data.tools.EXPORT:{
                        self.$data.exportInfo = document.getElementById("exportingContainer").innerHTML;
                        self.$data.showExport = true;
                        break;
                    }
                }
            },
            addArea:function(){
                var self = this;
                self.$data.areas.push(createAreaTemplate());
            },
            translatePathCoords:function(coords){
                var coordString = "";
                for(var i = 0;i<coords.length;i++){
                    var directive = i==0 ? "M" : "L"
                    coordString+=directive+coords[i].x.toString()+","+coords[i].y.toString();
                }
                coordString+="Z";
                return coordString;
            },
            addPoint:function(a){
                a.polyCoords.push({x:a.polyCoords[a.polyCoords.length-1].x+10,y:a.polyCoords[a.polyCoords.length-1].y+10})
            },
            onStagePressed:function(e){
                var self = this;
                self.$data.stagePressed = true;
                if(self.$data.selectedArea!=undefined){
                    switch(self.$data.selectedArea.type){
                        case 'rect':
                        case 'circle':{
                            self.$data.dragOffset = {x:e.pageX-self.$data.selectedArea.x,y:e.pageY-self.$data.selectedArea.y};
                            break;
                        }
                        case 'poly':
                        {
                            self.$data.dragOffset = {x:e.pageX,y:e.pageY};
                            self.$data.tempPolyCopy = [];
                            for(var i = 0;i<self.$data.selectedArea.polyCoords.length;i++){
                                self.$data.tempPolyCopy.push({x:self.$data.selectedArea.polyCoords[i].x,y:self.$data.selectedArea.polyCoords[i].y});
                            }
                            console.log(self.$data.tempPolyCopy);
                            break;
                        }
                    }
                }
            },
            onStageMotion:function(e){
                var self = this;
                if(self.$data.stagePressed){
                    if(self.$data.selectedArea!=undefined){
                        switch(self.$data.selectedArea.type){
                            case 'rect':
                            case 'circle':{
                                if(self.$data.reshaping){
                                    if(self.$data.selectedArea.type == 'rect'){
                                        switch(self.$data.handleIndex){
                                            case 0:{
                                                self.$data.selectedArea.x = e.pageX;
                                                self.$data.selectedArea.y = e.pageY;
                                                //console.log(sizeOffset);
                                                self.$data.selectedArea.width = self.$data.sizeOffset.x-e.pageX;
                                                self.$data.selectedArea.height = self.$data.sizeOffset.y-e.pageY;
                                                break;
                                            }
                                            case 1:{
                                                
                                                self.$data.selectedArea.y = e.pageY;
                                                //console.log(sizeOffset);
                                                self.$data.selectedArea.width = (e.pageX-self.$data.selectedArea.x);
                                                self.$data.selectedArea.height = self.$data.sizeOffset.y-e.pageY;
                                                break;
                                            }
                                            case 2:{
                                                //self.$data.selectedArea.y = e.pageY;
                                                //console.log(sizeOffset);
                                                self.$data.selectedArea.width = (e.pageX-self.$data.selectedArea.x);
                                                self.$data.selectedArea.height = (e.pageY-self.$data.selectedArea.y);
                                                break;
                                            }
                                            case 3:{
                                                self.$data.selectedArea.x = e.pageX;
                                                //console.log(sizeOffset);
                                                self.$data.selectedArea.width = self.$data.sizeOffset.x-e.pageX;
                                                self.$data.selectedArea.height = (e.pageY-self.$data.selectedArea.y);
                                                break;
                                            }
                                        }
                                    }
                                    else{
                                        //console.log('resizing circle');
                                        switch(self.$data.handleIndex){
                                            case 0:
                                            case 2:{
                                                self.$data.selectedArea.radius = Math.abs(self.$data.selectedArea.y-e.pageY);
                                                
                                                break;
                                            }
                                            case 1:
                                            case 3:{
                                                self.$data.selectedArea.radius = Math.abs(self.$data.selectedArea.x-e.pageX);
                                                
                                                break;
                                            }
                                        }
                                    }
                                }
                                else{
                                    self.$data.selectedArea.x = e.pageX-self.$data.dragOffset.x;
                                    self.$data.selectedArea.y = e.pageY-self.$data.dragOffset.y;   
                                }
                                
                                break;
                            }
                            
                            case 'poly':
                            {
                                if(self.$data.reshaping){
                                    self.$data.selectedArea.polyCoords[self.$data.handleIndex].x = e.pageX;
                                    self.$data.selectedArea.polyCoords[self.$data.handleIndex].y = e.pageY;
                                }
                                else{
                                    self.$data.polyOffset = {x:e.pageX-self.$data.dragOffset.x,y:e.pageY-self.$data.dragOffset.y};
                                    for(var i = 0;i<self.$data.selectedArea.polyCoords.length;i++){
                                        self.$data.selectedArea.polyCoords[i].x = self.$data.tempPolyCopy[i].x+self.$data.polyOffset.x;
                                        self.$data.selectedArea.polyCoords[i].y = self.$data.tempPolyCopy[i].y+self.$data.polyOffset.y;
                                    }
                                }
                                
                                break;
                            }
                        }
                    }

                }
            },
            onStageUp:function(e){
                var self = this;
                self.$data.stagePressed = false;
                self.$data.reshaping = false;
            },
            handleSelected:function(e){
                var self = this;
                self.$data.reshaping = true;
                self.$data.handleIndex = Number(e.currentTarget.getAttribute("handle-index"));
                if(self.$data.selectedArea.type == 'rect'){
                    self.$data.sizeOffset = {x:self.$data.selectedArea.width+self.$data.selectedArea.x,y:self.$data.selectedArea.height+self.$data.selectedArea.y};
                }
            },
            translateCoords:function(a){
                var self = this;
                pointString = "";
                switch(a.type){
                    case "rect":{
                        pointString = a.x.toString()+","+a.y.toString()+","+(a.width+a.x).toString()+","+(a.height+a.y).toString();
                        break;
                    }
                    case "circle":{
                        pointString = a.x.toString()+","+a.y.toString()+","+a.radius.toString();
                        break;
                    }
                    case "poly":{
                        for(var i = 0;i<a.polyCoords.length;i++){
                            if(i>0){
                                pointString+=",";
                            }
                            pointString+=a.polyCoords[i].x.toString()+","+a.polyCoords[i].y.toString();
                        }
                        break;
                    }

                }
                return pointString;
            },
            closeDialogue:function(e){
                var self = this;
                self.$data.showExport = false;
                self.$data.showImport = false;
            },
            confirmImport:function(e){
                var self = this;
                self.$data.showExport = false;
                self.$data.showImport = false;
                self.$data.areas = [];
                document.getElementById("importContainer").innerHTML = self.$data.importInfo;
                self.$data.src = document.getElementById("importContainer").getElementsByTagName("img")[0].getAttribute("src");
                var areaList = document.getElementById("importContainer").getElementsByTagName("area");
                for(var i = 0;i<areaList.length;i++){
                    var type = areaList[i].getAttribute("shape");
                    var areaObject = createAreaTemplate();
                    // /{type:"default",href:"",alt:"",x:36,y:36,width:72,height:72,radius:36,polyCoords:[{x:0,y:0},{x:72,y:0},{x:0,y:72}],defaltCoords:""}
                    areaObject.type = type;
                    areaObject.alt = areaList[i].getAttribute("alt");
                    areaObject.href = areaList[i].getAttribute("href");
                    var coords = areaList[i].getAttribute("coords");
                    switch(type){
                        case "rect":{
                            areaObject.x = Number(coords.split(",")[0]);
                            areaObject.y = Number(coords.split(",")[1]);
                            areaObject.width = Number(coords.split(",")[2])-areaObject.x;
                            areaObject.height = Number(coords.split(",")[3])-areaObject.y;
                            break;
                        }
                        case "circle":{
                            areaObject.x = Number(coords.split(",")[0]);
                            areaObject.y = Number(coords.split(",")[1]);
                            areaObject.radius = Number(coords.split(",")[2]);
                            break;
                        }
                        case "poly":{
                            var coordSplit = coords.split(",");
                            areaObject.polyCoords = [];
                            for(var j = 0;j<coordSplit.length;j+=2){
                                areaObject.polyCoords.push({x:Number(coordSplit[j]),y:Number(coordSplit[j+1])});
                            }
                            break;
                        }

                    }
                    self.$data.areas.push(areaObject);
                }

            }

        }

    });
})();