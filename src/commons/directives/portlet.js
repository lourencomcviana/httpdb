(function () {
    var app = angular.module('parcelamento');
    var defaultErrorMessage='Ocorreu um erro no servidor ao realizar o procedimento.\nEntre em contato com o Call Center SEFA para informar o problema:\nTelefone: 0800-725-5533 ou E-mail: callcenter.sefa@tsjtmk.com';

    app.directive('portlet','toastservice', function (toastservice) {
        return {
            scope: {
                    type:'@type',
                    message:'@message',
                    title:'@title',
                    errorlistener:'@errorlistener'
            },
            restrict: 'E',
            transclude: true,
            //template: '<div ng-transclude></div>{{message}}',
            templateUrl:'commons/directives/portlet.html',
            link: function(scope, element,attrs, controller, transcludeFn) {
                //eventos que estão sendo monitorados pela diretiva para a aprensetação de erros!
                var autoErrorEventListenner=['httpError400','httpError500'];
                scope.show=false;

                if(attrs.errorlistener==undefined)
                    attrs.errorlistener=false;
                else if(attrs.errorlistener=="true")
                    attrs.errorlistener=true;

                var typesEnum={
                    DEFAULT:{class:'portlet-default'},
                    DANGER:{class:'bg-danger'  ,icon:'md md-cancel',title:'error',message:'Erro ao realizar procedimento'},
                    WARNING:{class:'bg-warning',icon:'md md-warning',title:'warn'},
                    SUCCESS:{class:'bg-success',icon:'md md-check',title:'success',message:'Procedimento realizado com sucesso'},
                    INFO:{class:'bg-info',title:'Informação'},
                    PRIMARY:{class:'bg-primary'}
                }

                //indexação por ordem (id)
                var typesArray=[typesEnum.DEFAULT,typesEnum.SUCESS,typesEnum.DANGER,typesEnum.WARNING,typesEnum.INFO,typesEnum.PRIMARY];
                //indexação por nomes (apelidos)
                var typesAlias={
                    DEFAULT:typesEnum.DEFAULT,
                    PADRAO:typesEnum.DEFAULT,

                    DANGER:typesEnum.DANGER,
                    ERROR:typesEnum.DANGER,
                    ERRO:typesEnum.DANGER,
                    FALHA:typesEnum.DANGER,

                    WARNING:typesEnum.WARNING,
                    AVISO:typesEnum.WARNING,
                    CUIDADO:typesEnum.WARNING,

                    SUCCESS:typesEnum.SUCCESS,
                    SUCESSO:typesEnum.SUCCESS,
                    OK:typesEnum.SUCCESS,

                    INFO:typesEnum.INFO,
                    INFORMACAO:typesEnum.INFO,

                    MENSAGEM:typesEnum.PRIMARY,
                    MESSAGE:typesEnum.PRIMARY,
                    TEXTO:typesEnum.PRIMARY,
                    TEXT:typesEnum.PRIMARY,
                    BASICO:typesEnum.PRIMARY,
                    BASIC:typesEnum.PRIMARY,
                    PRIMARIO:typesEnum.PRIMARY,
                    PRIMARY:typesEnum.PRIMARY
                }

                scope.class=typesEnum.DEFAULT;

                var type;
                attrs.$observe('message', function (newValue) {
                    toastservice.show(newValue,scope.title);
                    //if(typeof newValue=='string' && newValue.trim()!=''){
                    //    scope.message=newValue;
                    //    scope.show=true;
                    //}
                });
                /*
                attrs.$observe('title', function (newValue) {
                    if(typeof newValue=='string' && newValue.trim()!=''){
                        scope.title=newValue;
                    }
                });
                */
                attrs.$observe('type', function (newValue) {

                    if(typeof newValue=='string' && newValue.length > 0){
                        var typeEnum;
                        if(!isNaN(newValue)){
                            typeEnum=typesArray[parseInt(newValue)];
                        }else{
                            typeEnum=typesAlias[newValue.toUpperCase()];
                        }

                        if(typeEnum==undefined )
                            typeEnum=typesEnum.DEFAULT;
                    }
                    scope.type=typeEnum;

                    scope.class=typeEnum.class;
                    //atribui titulo padrão
                    if(scope.title==undefined || scope.title=='')
                        scope.title=typeEnum.title;
                    if(scope.message==undefined || scope.message=='')
                        scope.message=typeEnum.message;
                    scope.icon=typeEnum.icon;
                    
                });


                if(attrs.errorlistener){
                    for(var id in autoErrorEventListenner){
                        //não deixa gerar novos eventos para os casos que já existem
                        if(typeof autoErrorEventListenner[id]=='string'){
                            var cancel=scope.$on(autoErrorEventListenner[id], showAutoError);
                            autoErrorEventListenner[id]={event:autoErrorEventListenner[id],cancel:cancel};
                        }
                    }
                }

                function showAutoError(event,res){
                   //if(res!=undefined &&res.data!=undefined)
                   //     scope.message=res.data.message;
                   //else
                   //     scope.message=defaultErrorMessage;

                   //setScopeByType(typesEnum.DANGER);
                   //scope.show=true;
                   
                   if(res!=undefined && res.data!=undefined){
                       var mensagem
                       if(typeof res.data=='object'&&res.data.message!=undefined)
                           mensagem= res.data.message;
                       else
                           mensagem= res.data;
                       toastservice.show(mensagem,'error')
                   }
                   
                }
                function setScopeByType(typeEnum){

                    scope.class=typeEnum.class;
                    //atribui titulo padrão
                    if(scope.title==undefined || scope.title=='')
                        scope.title=typeEnum.title;
                    if(scope.message==undefined || scope.message=='')
                        scope.message=typeEnum.message;
                    scope.icon=typeEnum.icon;
                }
            }
        }

    });
})();
