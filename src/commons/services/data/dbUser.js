//talvez seja interessante criar um redirecionamento para login caso o usuário atual seja null
(function () {
    var app = angular.module("data");

    //serviço de controle de usuário logado
    app.service("dbUser",[ 'ngYdn','$http','$location','$rootScope',  function (ngYdn,$http,$location,$rootScope,textHelper) {
        var contexto=this;
        var store="usuario"; //variavel


        this.checkLogIn=function(callback,noredirect){
           if(noredirect==undefined)
                noredirect=true;

           //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-==-=-*\
           /*|* INI TO DO:REMOVER QUANDO O PSERVIÇOS CORRIGIR O ERRO DE DUPLICAÇÃO DE FINAL DE URL     /*|*/
           /*|*/var numberOfTrys=0;                                                                    /*|*/
           /*|*/$rootScope.$on('httpError404',function(event,data){                                    /*|*/
           /*|*/    if(numberOfTrys<2 && data.config.url.startsWith('/parcelamento-api/app/usuario')){ /*|*/
           /*|*/        numberOfTrys++;                                                                /*|*/
           /*|*/        resquestUser(callback,noredirect);                                             /*|*/
           /*|*/    }                                                                                  /*|*/
           /*|*/});                                                                                    /*|*/
           /*|* FIM TO DO:REMOVER QUANDO O PSERVIÇOS CORRIGIR O ERRO DE DUPLICAÇÃO DE FINAL DE URL     /*|*/
           //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*/

            resquestUser(callback,noredirect);
        };



        function resquestUser(callback,noredirect){
            $http.get('/parcelamento-api/app/usuario?noredirect='+noredirect).then(
                function(res){
                var response;
                if(res.status!=403 &&typeof res === 'object' && typeof res.data === 'object'){
                    contexto.logIn(res.data,false);

                    response=res.data;
                }else
                    response=null;

                if(typeof callback=='function')
                    callback(response);
                },
                function(error){
                    console.log('usuário não está logado ou algum erro ocorreu na requisição');
                }
            );
        };

        this.logIn=function(user,rememberMe){
            //sempre o login sera o cpf
            user.cpf=user.login;
            //token e login são dados que necessitam de acesso direto, são repetidos em sessão
            if(rememberMe){
                localStorage.setItem(store,user.login);
                localStorage.setItem(store+'Token',user.token);
            }else{
                //limpa sessão
                this.logOut(true);

                //guarda na sessão somente, fechou o navegador, esquece usuário
                sessionStorage.setItem(store,user.login);
                sessionStorage.setItem(store+'Token',user.token);
            }

            user.dataLogin=dateObject(moment());
            //insere usuário com todos os detalhes no banco
            ngYdn.db.put(store,user,user.login);

            $rootScope.$broadcast(config.events().usuario.logar,user);
        }

        this.clean=function(){
            localStorage.removeItem(store);
            localStorage.removeItem(store+'Token');
            sessionStorage.removeItem(store);
            sessionStorage.removeItem(store+'Token');
        };

        this.logOut=function(noBroadCast){
            var user =getLocalStorageData(store);
            contexto.clean();
            if(noBroadCast==undefined||!noBroadCast)
                $rootScope.$broadcast(config.events().usuario.deslogar,user);
            //ngYdn.db.remove(store,contexto.getLogedUser().login());
        };

        this.getLogedUserLogin=function(){
            var saida=getLocalStorageData(store);
            //se a sessão de login estiver vazia. Redirecionar para o início.
            if(saida==null){
                console.log('redirecionado para início. Sem login local');
                $location.path('/');
            }
            return saida;

        }
        this.getLogedUserLogin.unformated=function(){
            var saida = this.getLogedUserLogin();
            saida.replace
        }
        this.getLogedUserToken=function(){
            contexto.getLogedUserLogin();
            return getLocalStorageData(store+'token');
        }

        this.getLogedUser=function(callback,forceCheck){
            if(this.getLogedUserLogin()==null || forceCheck){
                contexto.checkLogIn(callback);
            }else{
                ngYdn.db.get(store,this.getLogedUserLogin()).always(callback);
            }
        }

        this.testLogin=function(){

            $http.get('/parcelamento-api/app/usuario/dados?noredirect=true').then(
                function(data){
                    if(data.requisicaoPservicos){
                        console.log('pservicos informa: usuário necessita realizar novo login');
                        contexto.logOut();
                    }else{
                        console.log('usuário logado corretamente');
                    }


                },
                function(error){
                    console.log('usuário não está logado ou algum erro ocorreu na requisição');
                }
            );
            //ngYdn.db.remove(store,contexto.getLogedUser().login());
        };

        function getLocalStorageData(store){
            var storeData=null;
            if(localStorage.getItem(store)!=null ){
                storeData= localStorage.getItem(store);
            }else{
                storeData= sessionStorage.getItem(store);
            }

            if(storeData=="undefined" || storeData===undefined){
                contexto.clean();
                storeData=null;
            }

            return storeData;
        }

        function dateObject(data){
             return{
                year:data.year(),
                month:data.month(),
                day:data.day(),
                hour:data.hour(),
                minute:data.minute(),
                second:data.second()
             }
        }

    }]);
})();
