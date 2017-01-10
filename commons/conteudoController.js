(function () {

    app = angular.module('parcelamento');

    app.controller('corpoController', [ '$scope','$window', function ($scope,$window) {

    }]);

    app.controller('conteudoController', [ '$scope','$timeout','dbUser','page',  function ($scope,$timeout,dbUser,page) {
        
        var contexto=this;
        this.programa="Portal de Serviços";
        this.projeto="Parcelamento";
        this.pagina="Bem Vindo!";
       

        $scope.$on('$locationChangeStart', function(event,url) {
            contexto.hasPageHelp=false;
            page.help().get(function(data){
                contexto.hasPageHelp = data !=undefined && data.length>0;
            });
        });

        
        contexto.onHelpClick=function(){
            page.help().show();
        }

        $scope.$on(config.events().conteudo.mudarTituloPagina,function(event,data){
            console.log('mudar titulo da pagina: '+data);
            contexto.pagina=data;
        });

        dbUser.getLogedUser(function(data){
           //inserindo o usuário atual no controller comum de conteudo
           contexto.user=data;

           $timeout(function () {
                   //aplicando
                   $scope.$apply();
               })
        });

   }]);

   app.controller('logedUserController', [ '$scope','$timeout','$http','dbUser',  function ($scope,$timeout,$http,dbUser) {
        var contexto=this;
        
        contexto.loged=false;
        contexto.nome='';
        contexto.help='';
        dbUser.getLogedUser(function(data){
           //inserindo o usuário atual no controller comum de conteudo
           if(data!=undefined){
                contexto.loged=true;
                contexto.nome=data.nome;
                console.log('logado!');
                console.log(data);
           }
           else{
               contexto.loged=false;
           }

           $timeout(function () {
                   //aplicando
                   $scope.$apply();
               })
        },true);

        contexto.logOut =function(){
            $http.get('/parcelamento-api/app/usuario/sair').then(function(){
              dbUser.logOut();
              contexto.loged=false;
            })
        }

        contexto.logIn =function(){
            dbUser.checkLogIn(null,false);
            //contexto.loged=true;
        }

        $scope.$on(config.events().help.set,function(event,data){
            contexto.nome=data.nome;
            contexto.loged=true;
        });
        
        $scope.$on(config.events().usuario.logar,function(event,data){
            contexto.nome=data.nome;
            contexto.loged=true;
        });

        $scope.$on(config.events().usuario.deslogar,function(event,login){
            contexto.loged=false;
        });

   }]);


})();
