(function () {
    var app = angular.module("parcelamento");
    
    app.service("httpf",[ '$http','$rootScope','$timeout','ngYdn','toastService', function ($http,$rootScope,$timeout,ngYdn,toastService) {
        var contexto=this;
        var toasts={};

        //universal ping variables (gambiarra que eu gostaria muito de remover.... Maldito pservicos)
        
        //this.maxTrys=3
        //this.url='/parcelamento-api/app/ping'
        //this.usePing=true;
        this.ping={
            maxTrys:0,
            url:null
        }
        this.Request=Request
        this.loadingMethods=returnLoadingMethodEnum;
        this.get=function(param,callback){
            param=Http.read(param);
            //param.errors.push('httpError404');
            //registerErrors(param.errors,param.url,callback);
            param.method='GET';
            param={http:param };
            return request(param,callback); 
        };
        this.post=function(param,callback){
            param=Http.read(param);
            
            param.method='POST';
            param={http:param };
            return request(param,callback); 
        };
        this.put=function(param,callback){
            param=Http.read(param);
            
            param.method='PUT';
            param={http:param };
            return request(param,callback); 
        };
        this.delete=function(param,callback){
            param=Http.read(param);
            
            param.method='DELETE';
            param={http:param };
            return request(param,callback); 
        };
        
        this.run=function(param,callback) {
            param=paramReader(param);
            return request(param,callback); 
        }

        
        this.events={
            store:{
                put:function(){return 'httpf.store.put'},
                get:function(){return 'httpf.store.put'}
            },
            http:{
                get:function(){return 'httpf.http.get'}
            }
        }

        function Toast(){
            this.delay = 0;
            this.message ='Carregando';
            this.position = 'bottom left';
        }

        function genToast(param){
            var _param={
                delay:0,
                message:'Carregando',
                position: 'bottom left'
            }

            if(typeof param=='string'){
                param={message:param};
            }   
            param=angular.extend({},_param,param);
  
            var toast={
                hideDelay   : param.delay,
                position    : param.position,
                template    : '<md-toast><span class="md-toast-text" flex>'+param.message+'</span></md-toast>'
            }
            return toast;
        }
        
        function showToast(toast){
            toastService.show(toast.message);

            //toasts[toast.name]=$mdToast.show(genToast(toast.message));
        }

        function hideToast(toast){
            delete toasts[toast.name]
        }

        //implementar db-cashing! (usar ydn ou index direto?)
        function DateTime(){
            this.year;
            this.month;
            this.day;
            this.hour;
            this.minute;
            this.second;
        }

        function returnLoadingMethodEnum(){
                return {
                    NONE:1,  //somente guarda o registro de um recurso superior, nao retorna
                    FIRST:2,
                    ALL:3,   //retorna ambas as requisições
                    CONDITIONAL:4
                }
        }

        var loadingMethodEnum =returnLoadingMethodEnum();

        function Store(name){
            var contexto=this;
            this.name=name;
            this.key;
            this.index={};
            //this.addResponseKey=function(key){this.responseKeys.push(key);};
            //this.getResponseKey=function(key){return this.responseKeys.indexOf(key)};
            this.withMetadata=true;
            this.loadingMethod=loadingMethodEnum.ALL;
        }

        Store.read=function(param){
            var _param=new Store();

            if(typeof param=='string'){
                param = new Store(param);
            }else if(typeof param!='object' || param.name==undefined){
               return null;
            }

            angular.extend(_param,param);

            if(_param.index!=undefined){               
                for(var id in _param.index){
                    //indices booleanos tem de ser convertidos para inteiros para que o indexDb os entenda
                    if(typeof _param.index[id]=='boolean'){
                         if(_param.index[id]){
                            _param.index[id]=1;
                        }else{
                            _param.index[id]=0;
                        }
                    }
                }
            }
                                       
            return _param;
        }

        function Http(url){
            this.url=url,
            this.data=undefined,
            this.method='GET',
            this.params=undefined

        }
        Http.read=function(param){
            var _param=new Http();

            if(typeof param=='string'){
                _param.url=param;
                return _param; 
            }

            angular.extend(_param,param);
            return _param;
        }

        function Request(){
            var modelFactory= undefined;

            this.http=new Http();
            this.store=new Store();
            this.toast=undefined;// new Toast();
            this.getModelFactory=function(){
                return modelFactory;
            }
            this.setModelFactory=function(funct,receita){
                if(typeof funct=='function'){
                    modelFactory=funct;
                    modelFactory.returnType=receita;
                }else{
                    throw {message:'the value passed to setModelFactory must be a function',source:'httpf',objectType:typeof funct}
                }
            }
        }

        function paramReader(param){
            var isSomething=false;
            if(param.store!=undefined)
            {
                param.store=Store.read(param.store);
                isSomething=true;
            }
            if(param.http!=undefined){
                param.http=Http.read(param.http);
                isSomething=true;
            }
            if(!isSomething){
                param=Http.read(param);
            }
            return param;
        }      

        

        function request(param,callback){
            if(param.store!=undefined){
                switch (param.store.loadingMethod){
                    case loadingMethodEnum.FIRST:
                        var someoneLoaded=false;
                        function controlCallback (data){
                            if(!someoneLoaded){
                                someoneLoaded=true;
                                callback(data);
                            }
                        }
                        getDb(param,controlCallback);
                        return getHttp(param,controlCallback);
                        break;
                    case loadingMethodEnum.ALL:
                        //nome do store para servir de identificador para o toast

                        param.toast={name:param.store.name,message:param.toast}
                        showToast(param.toast);
                        getDb(param,callback);
                        return getHttp(param,callback);
                        
                        break;
                    case loadingMethodEnum.CONDITIONAL:
                        return getDb(param,callback);
                        break;
                    default:
                        return getHttp(param,callback);
                    break;
                }
            }else{
               return getHttp(param,callback);
            }
        }

        function getHttp(param,callback,numberOfTrys){
            function request(param,callback){
                return $http(param.http).then(function(res){
                    if(param.getModelFactory!=undefined && param.getModelFactory()!=undefined && res.data!= undefined && res.data !=null && res.data != ""){
                        if(isArray(res.data)){
                            for(var id in res.data){
                                res.data[id]=param.getModelFactory()(res.data[id]);
                            }
                        }else{
                            res.data=param.getModelFactory()(res.data);
                        }
                    }
                    if(param.store!=undefined){
                        //se por algum motivo o http retornar primeiro que o store. Não precisa mais carregar o store
                        param.store.httpAlredyReturned=true;
                        putDb(param.store,res);
                        hideToast({name:param.store.name});
                    }
                    res.source='http';
                    callback(res);
                });
            }

            if(param.http==undefined){
                return;
            }

            if(contexto.ping.maxTrys>0 && typeof contexto.ping.url=='string'){
                if(numberOfTrys==undefined|| typeof numberOfTrys!='number' || numberOfTrys<0)
                    numberOfTrys=0;
                 return $http.get(contexto.ping.url).then(function(resPing){
                    if(resPing.status>=200 &&resPing.status<300){
                       return request(param,callback);
                    }else if(resPing.status==404){
                        console.log('ping->' +resPing.status); 
                        if(numberOfTrys<contexto.ping.maxTrys){
                            numberOfTrys++;    
                            return getHttp(param,callback,numberOfTrys)
                        }else{
                            console.log('Número de tentativas ultrapassou '+contexto.ping.maxTrys);
                        }
                    }else{
                        console.error('ping->' +resPing.status); 
                    }
                });
            }else{
               return request(param,callback);
            }

            
        }

        //controle de recuperação e carregamento de recursos
        function gerarMetadata(){
           return {
               dataAtualizacao:moment().toObject()
           }
        }

        function isArray(obj){
                return  Object.prototype.toString.call(obj) === '[object Array]'
        }

        function getInnerPks(name){
            for(var id in config.db.stores){
                if(config.db.stores[id].name===name){
                    return config.db.stores[id].keyPath;
                }
            }
            return null;
        }
        
        function putDb(store,res){
            //atualiza ou cria metadata
            if(res.status<200 || res.status>=300)
                return;

            ngYdn.db.put('metadata' ,gerarMetadata(),store.name);
            
            function getPut(data){
                var keyName=getInnerPks(store.name)
                try{
                        //remover tipos não suportados
                        for(var id in data){
                            if(typeof(data[id])=='function'){
                                 //console.warn('removed function '+data[id].name+' to save in storage');                              
                                 delete data[id];
                            }
                        }
                        ngYdn.db.get( store.name,data[keyName] ).then(function(dbdata) {
                            for(var id in store.index){
                                if(dbdata!=undefined){
                                    data[id]= dbdata[id];
                                }
                                if(data[id]==undefined){
                                    data[id]=[]
                                } 
                                //atualiza chaves de busca locais
                                if(store.index[id]!=undefined){
                                   
                                    if(isArray(data[id])){
                                        if(data[id].indexOf(store.index[id])==-1){
                                            data[id].push(store.index[id]);
                                        }
                                    }else{
                                        console.log('One object alredy came with one column of the same index name '+id);
                                    }
                                }
                            }

                            //salva objeto novo
                            ngYdn.db.put(store.name ,data).then(function(key) {    
                                        //console.log(key);
                                    if(dupKey.indexOf(key)>=0){
                                        console.warn('the key '+key+' is duplicated');
                                    }else{
                                        dupKey.push(key);
                                    }
                                });
                        }, function(e) {
                            console.error(e.stack);
                        });
                }catch(err) {
                    //console.warn('não é possível cachear resposta da requisição');
                    console.warn(err);
                }
            }
            var dupKey=[];
            //criar gerenciamento para salvar relações no objeto key!!!!!!!!!!
            if(isArray(res.data)){
                
                for(var id in res.data){
                     getPut(res.data[id]);
                }

                
            }else{
                 getPut(res.data);
            }
            
        }

        function getDb(param,callback){
            var store =param.store;
            var type=undefined;
            if(param.getModelFactory()!=undefined && param.getModelFactory().returnType!=undefined){
                type=param.getModelFactory().returnType;
            }
            function get(store,indexs,indexNames,parentData){
                function processFinalData(data){
                    $timeout(function () {
                        if(param.getModelFactory()!=undefined && param.getModelFactory().returnType!=undefined){
                                for(var id in data){
                                    //mapeamento simples
                                    data=angular.extend(new type(),data[id]);
                                }
                        }
                        if(data.length==1){
                            //considerar somente o primeiro elemento
                            data=data[0];
                        }

                        if(withMetadata){
                            var metadata={};
                            metadata.dataAtualizacao={loading:true};
                            ngYdn.db.get(
                                'metadata' //store
                                ,store
                            ).then(function(dbmetadata) {
                                metadata.dataAtualizacao=dbmetadata.dataAtualizacao;
                            }); 

                            metadata.source='store';
                            metadata.data=data;

                            callback(metadata);
                        }
                        else{
                            callback(data);
                        } 
                    }); 
                }
                var indexName=indexNames.shift();
                var index=indexs[indexName];
                try{
                    if(index!=undefined && index!=null){
                    
                            var search=IDBKeyRange.only(index);

                            ngYdn.db.values(store,indexName, search).done(function(data){
                                if(data!=undefined && data.length>0 && !originalStore.httpAlredyReturned){
                                    if(parentData!=undefined){
                                        //realiza interseção dos objetos atravez da pk
                                        data=intersect(parentData,data,getInnerPks(store));
                                    }
                                    if(indexNames.length==0){
                                        processFinalData(data);
                                    }else {
                                        //caso haja mais uma chave para filtrar o parametro, recursividade
                                        get(store,indexs,indexNames,data);
                                    }
                                };
                            });
                    }else {
                        if(indexNames.length==0){
                            processFinalData(parentData);
                        }else{
                            get(store,indexs,indexNames,parentData);
                        } 
                    }
                }catch(e){
                     console.warn(e);
                }
            }

            var indexes=store.index;
            var withMetadata = store.withMetadata;
            var originalStore=store;
            var indexNames=[]       
               
            for(var id in store.index){
                indexNames.push(id);
            }

            if(store.key!=undefined){
                ngYdn.db.get( store.name,store.key ).then(function(dbdata) {
                    if(dbdata!=undefined && !originalStore.httpAlredyReturned){
                        if(indexNames.length>0 && dbdata!=undefined){
                            get(store.name,store.index,indexNames,dbdata)
                        }else{
                            callback(dbdata);
                        }
                    }
                }, function(e) {
                    console.error(e.stack);
                });
            }else if(indexNames.length>0){
                get(store.name,store.index,indexNames)
            }else{
                console.error("you must provide at least one key or one index to get an item from a store");
            }
        }   

        function intersect(arr1,arr2,keyPath){
            result=[];
            
            while(arr1.length>0) {
                var arr1Value=arr1.shift();
                for(var id2 in arr2){
                    if(pathValue(arr1Value,keyPath)===pathValue(arr2[id2],keyPath)){ 
                        result.push(arr1Value)
                        arr2.splice(id2, 1);
                        break;
                    }
                }
            }
          
            return result;
        }
        function pathValue(data,path){
            function getValue(data,keyPath,position){
                if(position<keyPath.length){
                    var tempData=data[keyPath[position]];
                    if(tempData ==null || tempData==undefined ||(position<keyPath.length-1 && typeof tempData != 'object')){
                        //não foi possível percorrer todo o caminho do objecto
                        return undefined;
                    }else{
                        position++;
                        return getValue(tempData,keyPath,position);
                    }
                }else{
                    return data;
                }
            }
            var keyPath=path.split('.');
            return getValue(data,keyPath,0);
        }
    }]);
})();