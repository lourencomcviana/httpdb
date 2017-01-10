
(function () {
    var app = angular.module("recursos");

    //servico responsavel por administrar o recurso banco e seus sub-recursos (agencia)
    app.service("banco",[ 'ngYdn','$http','$rootScope',  function (ngYdn,$http,$rootScope) {
       var contexto=this;
       function gerarMetadata(){
           return {
               dataAtualizacao:moment().toObject()
           }
       }
       
       function updateOptions(param){
           var options={
               id:'',
               //até agora somente lazy load true está implementado. Buscar todas as agencias de todos os bancos pode ser um tanto custoso...
               //lazyLoad:true,
               withMetada:false,
               forceBancoUpdate:false,
               forceAgenciaUpdate:false,
               forceUpdate:false,
               agenciaUpdating:false,
               callback:function(data){console.log('atualização dos bancos realizada!');console.log(data);}
           }
           //seta as opções
           angular.extend(options,param);
           return options;
       }
       
       this.getOptions=updateOptions;
       
       this.get= function (options){
           options=updateOptions(options);
           //busca metadata
           ngYdn.db.get('metadata','banco').always(function(metadata){
                
                function callback(data){
                    if(data==undefined){
                        console.log('servidor não retornou nenhum dado após a requisição');
                        options.callback(data);
                    }   
                    else{  
                        var dataAtualizacaoAgencia;
                        if(data.codBanco!=undefined){
                            dataAtualizacaoAgencia=metadata['dataAtualizacao_'+data.codBanco];
                        }
                        
                        if(!options.agenciaUpdating && options.id!='' &&( dataAtualizacaoAgencia== undefined ||moment().diff(dataAtualizacaoAgencia)>=86400000 ||options.forceAgenciaUpdate ||options.forceUpdate)){
                            contexto.atualizarAgencia(options);
                        }else{
                            if(options.withMetada)
                                data= {data:data,metadata:metadata};
                            options.callback(data);
                        }
                    }                                 
                }
                
                //cabeçalho de retorno para o callback padrão desta função
                var getoptions=updateOptions();
                angular.copy(options, getoptions);
                getoptions.callback=callback;
                
                //se tempo de existencia maior que um dia, recarrega por http
                if(metadata==undefined || moment().diff( moment(metadata.dataAtualizacao))>=86400000  ||options.forceBancoUpdate ||options.forceUpdate) {
                    contexto.atualizar(getoptions);
                }else{
                    function callbackDb(data){
                        if(data==undefined){

                            contexto.atualizar(getoptions); 
                        }       
                        else
                            callback(data,metadata);
                    }
                    if(options.id!=undefined ){
                        ngYdn.db.get('banco',options.id).always(callbackDb);
                    }else{
                        ngYdn.db.from('banco').list().done(callbackDb);
                        
                    }
                }
           });
       }
       
       this.verificaAgencia=function(codBanco,codAgencia,callback){
           ngYdn.db.from('banco').where('agencias','=',[codBanco,codAgencia]).list().done(function(data){
               callback( data!=undefined && data.length>0);
           });

         
       }
       
       
       this.buscaAgencia=function(codBanco,codAgencia,callback){
           if(codBanco==undefined || codAgencia==undefined || codAgencia=="" || codBanco==""){
                   callback(null);
           }else{
               if( typeof codBanco=="string"){
                   codBanco=parseInt(codBanco);
               }
               if(typeof codAgencia=="string"){
                   codAgencia=parseInt(codAgencia);
               }
                
               return ngYdn.db.from('banco').where('agencias','=',[codBanco,codAgencia]).list().done(function(data,key,teste){
                       if( data!=undefined && data.length>0){
                           var agencias=data[0].agenciasObj;
                           for(var id in agencias){
                               if(agencias[id].codAgencia==codAgencia){
                                   callback(agencias[id]);
                                }
                           }
                       }
                       else callback(null);
                   });    
           }
       }
       
       this.atualizar= function (options){
           options=updateOptions(options);
           
           if(options.id!=undefined){
           $http.get('/parcelamento-api/app/banco/'+options.id).then(
               function(res){
                   if(res.status==200){
                       //seta os metadados
                       var metadata=gerarMetadata();
                       ngYdn.db.put(
                           'metadata' //store
                           ,gerarMetadata()
                           ,'banco'
                       ).then(function(key) {
                           
                            for(var id in res.data){
                                res.data[id].agencias=[];
                            }
                            //salva dados da requisição
                            ngYdn.db.putAll('banco' ,res.data ).then(function(key) {
                                
                                //chama callback
                                if(options.withMetada)
                                    options.callback({data:res.data,metadata:metadata});
                                else
                                    options.callback(res.data);
                            }, function(e) {
                                console.error(e.stack);
                            });
                       }, function(e) {
                           console.error(e.stack);
                       });                  
                   }
                   else{
                       console.log('erro: '+res.status);    
                   }
               },
               function(error){
                   console.log(error)
               }
           );
           }
       }

       this.atualizarAgencia=function(options){
           if(options.id==undefined ){
               console.log('id do banco é obrigatório para atualização de agencias');
               return ;
           }
           var getoptions=updateOptions();
           options=updateOptions(options);

           angular.copy(options, getoptions);
           
           getoptions.withMetada=true;
           getoptions.agenciaUpdating=true;
           getoptions.callback=function(data){
               var dbdata=data.data;
               var metadata=data.metadata;
               $http.get('/parcelamento-api/app/banco/'+dbdata.codBanco+'/agencia').then(
                   function(res){
                       if(res.status==200){
                           //seta os metadados
                           
                           metadata['dataAtualizacao_'+dbdata.codBanco]=moment().toObject();

                           ngYdn.db.put(
                               'metadata' //store
                               ,metadata
                               ,'banco'
                           ).then(function(key) {
                      
                                for(var id in res.data){
                                    delete res.data[id].codBanco;
                                }
                                
                                dbdata.agencias=res.data;
                                dbdata.agenciasObj=res.data;
                                //salva dados da requisição
                                ngYdn.db.put('banco' ,dbdata ).then(function(key) {    
                                    //chama callback
                                    options.callback(res.data);
                                }, function(e) {
                                    console.error(e.stack);
                                });
                           }, function(e) {
                               console.error(e.stack);
                           });                  
                       }
                       else{
                           console.log('erro: '+res.status);    
                       }
                   },
                   function(error){
                       console.log(error)
                   }
               );
           }
           
           
           contexto.get(getoptions);
           

       }
    }]);
})();
