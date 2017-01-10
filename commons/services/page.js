(function () {
    var app = angular.module("parcelamento");
    app.service("rawPage",[ '$location','$route','$timeout','ngYdn','$http','$mdDialog', function ($location,$route,$timeout,ngYdn,$http,$mdDialog) {
        var contexto=this;
        
        var routes=$route.routes;
        this.add=function(page){
             ngYdn.db.put(this.store,page);
        }

        this.addHelp=function(help,page){
            
             ngYdn.db.get(contexto.helpStore,help.path).then(function(data){
                  if(page!=undefined){
                        if(data==undefined){
                            data={};
                        }
                        if(data.pages==undefined){
                            data.pages=[page];
                        }else if(data.pages.indexOf(page)<0){
                            data.pages.push(page);
                        }
                        
                        help.pages=data.pages;

                        ngYdn.db.get(contexto.store,page).then(function(data){
                            //verifica integridade, page precisa existir
                            if(data.helps==undefined){
                                data.helps=[help.path];
                            }else if(data.helps.indexOf(help.path)<0){
                                data.helps.push(help.path);
                            }
                            //salva as alterações
                            contexto.add(data);
                            ngYdn.db.put(contexto.helpStore,help);
                        })
                  }else{
                      ngYdn.db.put(contexto.helpStore,help);
                  }
                  
                  
             });
             
        }
        
        //implementação pura indexDB
        function getAllItems(callback) {
            var db;
            var request = indexedDB.open("parcelamento");
            request.onerror = function(event) {
              console.log("Why didn't you allow my web app to use IndexedDB?!");
            };
            request.onsuccess = function(event) {
              db = event.target.result;
               var trans = db.transaction(contexto.helpStore, IDBTransaction.READ_ONLY);
                var store = trans.objectStore(contexto.helpStore);
                var items = [];

                trans.oncomplete = function(evt) {  
                    callback(items);
                };

                var cursorRequest = store.openCursor();

                cursorRequest.onerror = function(error) {
                    console.log(error);
                };

                cursorRequest.onsuccess = function(evt) {                    
                    var cursor = evt.target.result;
                    if (cursor) {
                        items.push(cursor.value);
                        cursor.continue();
                    }
                };
            };
            
        }

        this.help=function(filtro){
            if(filtro==undefined){
                filtro={
                    indice:'pages',
                    valor:$location.path()
                }
            }

            function getHelpByPage(callback){
                //var search=IDBKeyRange.only(lugar);
                //ngYdn.db.values(contexto.helpStore,'pages', search).done(function(data){

                var search=IDBKeyRange.only(filtro.valor);
         
                //var k2 = new ngYdn.db.Key(contexto.helpStore, 'abc');
                ngYdn.db.values(contexto.helpStore,filtro.indice, search).done(function(data){
                    if(data.length>0){
                        var files=[];
                        function getMarkdown(item,tam,callback){
                            $http({
                                method: 'GET',
                                url: item.path
                            }).then(function successCallback(response) {

                                files.push(angular.merge(item,response));
                                if(files.length==tam){
                                    callback(data);
                                }
                            }, function errorCallback(response) {  
                                console.warn(response);
                            });
                        }

                        data.sort(function(data1,data2){
                            return data1.order-data2.order;
                        })
                        
                        for(var id in data){
                            getMarkdown(data[id],data.length,callback)
                        }
                    }else{
                        
                    }
                });
            }

            return{
                show:function(scope){
                    getHelpByPage(function(data){
                        function DialogController($scope, $mdDialog,helps) {
                            $scope.helpIndex=function(){
                                if($scope.help!=undefined && $scope.helps!=undefined && $scope.helps.length>1){
                                     return $scope.helps.indexOf($scope.help)
                                }
                                return 0;
                            }
                            //$scope.helpIndex=0;
                            $scope.helps=helps;
                            $scope.help=helps[$scope.helpIndex()];
                            
                            
                            $scope.next = function() {
                                var index=$scope.helpIndex()+1;
                                if(index<helps.length){
                                     //$scope.helpIndex=index;
                                     $scope.help=helps[index];
                                }
                            };
                            
                            $scope.previous = function() {
                                var index=$scope.helpIndex()-1;
                                if(index>=0){
                                     //$scope.helpIndex=index;
                                     $scope.help=helps[index];
                                }
                            };

                            $scope.cancel = function() {
                                $mdDialog.cancel();
                            };

                      
                        }

                       
                        $mdDialog.show({
                            controller: DialogController,
                            templateUrl: 'templates/helpDialog.tmpl.html',
                            parent: angular.element(document.body),
                            //targetEvent: ev,
                            locals:{helps:data},
                            clickOutsideToClose:true,
                            fullscreen: true // Only for -xs, -sm breakpoints.
                        })
                        .then(function(answer) {
                            
                            //$scope.status = 'You said the information was "' + answer + '".';
                        }, function() {
                            //$scope.status = 'You cancelled the dialog.';
                        });
                   
                    });
                },
                get:function(callback){
                    getHelpByPage(function(data){
                        callback(data);
                    });
                }
            };
        }
        
        
    }]);

        
    app.provider('page', function () {
    
        var store ='page';
        var helpStore ='help';
        var pages=[];
        var helps=[];
        this.addPage = function(val) {
            pages.push(val);
            return val.path;
        };

        this.addHelp = function(val,page) {
            helps.push({help:val,page:page});
        };
        
        //configuração da base
        config.db.stores.push({
            name:store,
            keyPath:'path',
            indexes:[
                {
                    name: 'nodes', // optional
                    keyPath: 'nodes',
                    unique: false, // optional, default to false
                    multiEntry: true, // optional, default to false
                    generator: function(record) {
                        return record.path.split('/');
                    }
                },
                {
                    name:'tags',
                    keypagePath:'tags',
                    multiEntry: true
                },
                {
                    name:'helps',
                    keyPath:'helps',
                    multiEntry: true
                }
            ]
        });

        config.db.stores.push({
            name:helpStore,
            keyPath:'path',
            indexes:[
                {
                    keyPath: 'name',
                    unique: false, // optional, default to false
                    multiEntry: false // optional, default to false
                },
                {
                    name: 'order', // optional
                    keyPath: 'order',
                    unique: true, // optional, default to false
                },
                {
                    name: 'nodes', // optional
                    keyPath: 'nodes',
                    unique: false, // optional, default to false
                    multiEntry: true, // optional, default to false
                    generator: function(record) {
                        return record.path.split('/');
                    }
                },
                {
                    keyPath: 'fileName',
                    unique: false, // optional, default to false
                    multiEntry: false, // optional, default to false
                    generator: function(record) {
                        return record.nodes[record.nodes.length-1].split('.')[0];
                    }
                },
                {
                    keyPath: 'fileFormat',
                    unique: false, // optional, default to false
                    multiEntry: false, // optional, default to false
                    generator: function(record) {
                        return  record.nodes[record.nodes.length-1].split('.')[1];            
                    }
                },
                {
                    name:'tags',
                    keyPath:'tags',
                    multiEntry: true
                },
                {
                    name:'pages',
                    keyPath:'pages',
                    multiEntry: true
                }
            ]
        });

        this.$get = ["rawPage", function (pageService) {
            

            pageService.store=store;
            pageService.helpStore=helpStore;
            for(var id in pages){
                pageService.add(pages[id]);
            }
            for(var id in helps){
                helps[id].help.order=parseInt(id);
                pageService.addHelp(helps[id].help,helps[id].page);
            }

            return pageService;
        }];
    });

    /*
    app.service('page','$route','$location','ydnService', function($route,$location,ydnService) {
      var store ='page';
      var lugar =$location.path();
      var topics={
          cadastro:{
              vinculo:{
                  titulo:'Selecione seu VÍNCULO',
                  detalhe:'Se seu acesso estiver vinculado a mais de uma inscrição estadual, clique naquele vínculo em que você deseja fazer o parcelamento.'
              }
          } 
      }
      var routes=$route.routes;
      //ngngYdn.db.put(store,{
      //    store.
      //});

      this.show=function(){

      }
      this.get=function(){

      }
    });
    */
})();