
(function () {
    var app = angular.module("recursos");

    //servico responsavel por administrar o recurso parcelamento
    app.service("parcelamento",[ 'httpf','$timeout','$rootScope','pagamento','dexie','mapper',  function (httpf,$timeout,$rootScope,pagamento,dexie,mapper) {
        var contexto=this;
        function Origem(){
            this.codigoMapeamento=null;
            this.sigla=null;
            this.descricao=null
        }

        function Pessoa(){
            this.cpf=null;
            this.nome=null;
        }

        function Solicitante(){
            this.id=null;
            this.login=undefined;
        }


        function Parcelamento(){
            var thisClass=this;
            this.id=null;
            this.quantidade=null;
            this.origem=null;
            this.situacao=null;
            this.valorParcelado=null;
            this.faseAtual=undefined;

            this.isAtivo=function(){
                var fasesAtivas=[1,2,3];
         
                if(this.fase()!=null){
                    return fasesAtivas.indexOf(this.fase().id)>-1;
                }
                return null;
            };
            
            this.fase=function(){
                if(this.fases.length>0){
                    this.faseAtual=this.fases[this.fases.length-1];
                    this.faseAtual.strData=this.faseAtual.data.toISOString();
                    return this.faseAtual;
                }
                return null;
            };
            
            this.prioridade=function() {
                var fase =this.fase()
                if(fase){
                    if (this.fases[this.fases.length-1].id == '3') {
                        return 0;
                    } else if (this.fases[this.fases.length-1].id == '1') {
                        return 1;
                    } else if (this.fases[this.fases.length-1].id == '6') {
                        return 2;
                    } else if (this.fases[this.fases.length-1].id == '5') {
                        return 3;
                    } else if (this.fases[this.fases.length-1].id == '4') {
                        return 4;
                    }
                }
            };
            this.classe = function() {
                  if(this.fase()==undefined)
                        return '';
                  if (this.fase().id == 1) {
                        return 'label-info';
                  } else if (this.fase().id == 4) {
                        return 'label-default';
                  } else if (this.fase().id == 3) {
                        return 'label-conteudo label-primary'
                  } else if (this.fase().id == 6) {
                        return 'label-success'
                  } else if (this.fase().id == 5) {
                        return 'label-danger'
                  }
            }
            this.loadFases=function(callback){
                thisClass.statusLoading=true;

                contexto.get(thisClass).fases(function(httpFases,parcelamentoEntrada){

                    if(httpFases.length==0){
                        lista.splice(lista.indexOf(parcelamentoEntrada), 1);
                    }else{
                        parcelamentoEntrada.fases=Fase.FromHttpResource(httpFases)
                        parcelamentoEntrada.fase();
                        
                        parcelamentoEntrada.statusLoading=false;
                        
                       
                        if(typeof callback=='function'){
                             callback(parcelamentoEntrada);
                        }else{
                             $rootScope.$broadcast(contexto.event.fase.get,parcelamentoEntrada);
                        }
                    }
                });
            }
            this.loadPagamento=function(callback){
                    thisClass.pagamento={loading:true};
                    var promisse= pagamento.get({codigoParcelamento:thisClass.id,status:1})
                    .pagamento(function(data){
                        thisClass.pagamento.loading=false;
                        angular.merge(thisClass.pagamento,data);
                        if(typeof callback=='function'){
                             callback(thisClass);
                        }else{
                             $rootScope.$broadcast(contexto.event.pagamento.get,thisClass);
                        }
                    });
            }
            this.fases=[];
            this.debitos=[];
        }

        Parcelamento.FromHttpResource=function(httpResourceList) {
            

            function parse(httpResource){
                var parcelamento= new Parcelamento();
                map(parcelamento,httpResource,{quantidade:'quantidadeParcelas'});
                
                parcelamento.loadPagamento(parcelamento.loadFases);
                /*

                parcelamento.statusLoading=true;
                contexto.get(parcelamento).fases(function(httpFases,parcelamentoEntrada){

                    if(httpFases.length==0){
                        lista.splice(lista.indexOf(parcelamentoEntrada), 1);
                    }else{
                        parcelamentoEntrada.fases=Fase.FromHttpResource(httpFases)
                        parcelamentoEntrada.statusLoading=false;
                        $rootScope.$broadcast(contexto.event.fase.get,parcelamentoEntrada);
                    }
                });
                */
                return parcelamento;
            }

            if(angular.isArray(httpResourceList)){
                var lista=[];
                for(var id in httpResourceList){
                    lista.push(parse(httpResourceList[id]));
                }
                return lista;
            }else{
                return parse(httpResourceList);
            }
        }

        function Fase(){
            this.id=null;
            this.data=null;
            this.sigla=null;
            this.descricao=null;
            this.solicitante=null;
            this.motivo=null;
        }

        Fase.FromHttpResource=function(httpResourceList){
            var lista=[];
            for(var id in httpResourceList){
                var httpResource=httpResourceList[id];
                httpResource.data=moment(httpResource.data);
                var fase= new Fase();

                map(fase,httpResource,{id:'idFase'});

                lista.push(fase);
            }
            return lista;
        }

        function Filtro(){
            this.login=null;
            this.ruc=null;

        }

        this.filtro=function(){
            return new Filtro();
        }

        var url={
                parcelamento:'/parcelamento-api/app/parcelamento',
                fase:'/parcelamento-api/app/requisicao'
            };
        
        this.event={
            parcelamento:{
                get: 'parcelamento.get',
                post: 'parcelamento.post'
            },
            fase:{
                get: 'parcelamento.fase.get',
            },
            pagamento:{
                    get:'parcelamento.pagamento.get'
            }
        }
        
        this.get=function(param){
            if(param==undefined){
                param={};

            }
            var tempUrl=url.parcelamento;
            
            function key(){
                return new Date(moment().second(0).toDate());
            }
            function innerGet(callback,url){
                if(!Filtro.prototype.isPrototypeOf(param.filtro)){
                    param.filtro= Filtro(param.filtro);
                }

                var reqObjs={
                    http:tempUrl
                    //,store:{name:'parcelamento',key:dbUser.getLogedUserLogin()}
                };

                httpf.run(reqObjs,function(res){
                    callback(res);
                });
            }

            return {
                raw:innerGet,
                parcelamento:function(callback){
                    tempUrl=url.parcelamento+'/'+param.id;
                    
                    function get(){
                            innerGet(function(res){
                                if(res.status==200){
                                    var data=Parcelamento.FromHttpResource(res.data);
                                    db.acompanhamento.put(data).then (function(){
                                        callback(data);
                                    }).catch(function(error) {

                                       console.warn ("não foi possível salvar o parcelamento no indexdb: " + error);
                                       console.warn (data);
                                        callback(data);
                                    });
                                }
                            });
                    }
                    
                    db.acompanhamento.get(key()).then (function(data){
                        if(data!=undefined){
                            callback(data);
                        }else{
                            get();
                        }
                    }).catch(function(error) {
                        get();
                        console.warn ("não foi possível buscar o parcelamento no indexdb: " + error);
                    });
                    
                },
                vinculo:function(callback){
                    //param é ruc
                    tempUrl=url.parcelamento+'/vinculo/'+param;
                    
                    function get(){
                            innerGet(function(res){
                                if(res.status==200){
                                    var tdata=Parcelamento.FromHttpResource(res.data);
                                    var data=angular.copy(tdata);
                                    callback(tdata);
                                    for(var idArray in data){
                                        var item= data[idArray];
                                        for(var id in item){
              
                                            if(typeof item[id]=='function'){
                                                delete item[id];
                                            }
                                        }
                                       
                                    }
                                    
                                    for(var id in data){
                                        data[id].cod=parseInt(id);
                                        data[id].dataRequisicao=key();
                                      
                                    }

                                    dexie.db.acompanhamento.bulkPut(data).then (function(){  
                                    }).catch(function(error) {
                                       console.warn ("não foi possível salvar o parcelamento no indexdb: " + error);
                                       console.warn (data);
                                        
                                    });

                                }
                            });
                    }
                    /*
                    dexie.db.acompanhamento.where('dataRequisicao').equals(key()).toArray().then(function(data){
                        //dexie.db.acompanhamento.get([1,"201612281424"]).then (function(data){
                        if(data && data.length>0){
                            data= mapper.map(new Parcelamento(),data);
                            for(var id in data){
                                data[id].loadPagamento(data[id].loadFases);
                            }
                            callback(data);
                        }else{
                            get();
                        }
                    }).catch(function(error) {
                        get();
                        console.warn ("não foi possível buscar o parcelamento no indexdb: " + error);
                    });
                    */
                    
                    get();
                    

                },
                fases:function(callback){
                    //param é codigo parcelamento
                    tempUrl=url.fase+'/'+param.id;
                    innerGet(function(res){
                        if(res.status==200){
                            callback(res.data,param);
                        }
                    });
                }
            }

        }


        this.post=function(){

        }

        this.put=function(param){
            function request(callback){
                httpf.put('/parcelamento-api/app/parcelamento/cancelar?codigo='+param.id,function(res){
                    if(typeof callback=='function'){
                        callback(res);
                    }
                });
            }

            return {
                done:request,
                cancelar:function(callback){
                    //callback da requisicao de cancelamento
                    request(function(data){
                        if(data.status=200){
                            //chama callback do usuario
                            param.loadFases(callback);
                            //contexto.get(param).parcelamento(callback);
                        }
                    });
                }
            }
        }

        function map(target,source,alias){
            if(typeof source!='object' || source==null)
                return target;
            if(alias==undefined)
                alias={}
            for(var id in target){
                var value;
                if(source[id]==undefined){
                    value=source[alias[id]];
                }else{
                    value=source[id];
                }

                if(value!=undefined ){
                    target[id]=value;
                }
            }
            return target;
        }

    }]);
})();
