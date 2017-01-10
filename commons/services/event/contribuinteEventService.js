
(function () {
    var app = angular.module("eventService");
    
    //define um serviço de controle de eventos.
    //encapsula os eventos para não deixar eles soltos por ai.
    app.service("contribuinteEventService",[ '$rootScope',  function ($rootScope) {
        //pega o nome dos eventos do arquivo de configuração
        var salvouContribuinte= config.events().contribuinte.salvou;
        var retornouContribuinte=config.events().contribuinte.retornou;
        
        //implementar pilha de escuta?
        this.salvouContribuinteBroadcast = function(data) {$rootScope.$broadcast(salvouContribuinte,data)}
        this.salvouContribuinteListen = function(callback) {return $rootScope.$on(salvouContribuinte,callback)}
        
        this.retornouContribuinteBroadcast = function(data) {$rootScope.$broadcast(retornouContribuinte,data)}
        this.retornouContribuinteListen = function(callback) {return $rootScope.$on(retornouContribuinte,callback)}
        
    }]);
})();