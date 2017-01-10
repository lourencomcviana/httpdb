(function () {
    var app = angular.module('parcelamento');

    app.directive('asyncLoader', function () {
        return {
            scope: {
                    loading:'@loading',
                    message:'@message',
                    asyncLoader:'@asyncLoader',
                    size:'@size'
            },
            //restrict: 'E'
            //,
            transclude: true,
            //template: '<div ng-transclude></div>{{message}}',
            templateUrl:'commons/directives/asyncLoader.html',
            link: function(scope, element,attrs, controller, transcludeFn) {

                scope.isTag=element.is('async-loader');
                var tamanho;
                if(scope.asyncLoader!=undefined){
                    tamanho=scope.asyncLoader;
                }
                if(scope.size!=undefined){
                    tamanho=scope.size;
                }
                if(!scope.isTag){
                    if(tamanho==undefined){
                        var altura=element.find('[ng-transclude]').css('height');
                        var largura=element.find('[ng-transclude]').css('width');

                        if(altura.indexOf('px')>-1){
                            altura=Number(altura.substring(0,altura.indexOf('px')));
                        }
                        if(largura.indexOf('px')>-1){
                            largura=Number(largura.substring(0,largura.indexOf('px')));
                        }                   
                        if(typeof altura!="number")
                        {
                            altura=20;
                        }
                        if(typeof largura!="number")
                        {
                            largura=20;
                        }


                        if(altura<=largura){
                            tamanho=altura;
                        }else{
                            tamanho=largura;
                        }
                        tamanho+='px';
                    }
                    
                    
                }else  if(scope.message==undefined){
                    scope.loaderstyle='';
                    scope.message='Carregando...';
                }
                
                if(tamanho!=undefined){
                    scope.loaderstyle={
                        height:tamanho,
                        width:tamanho
                    }
                }
                attrs.$observe('loading', function (newValue) {
                    scope.loading=scope.loading.trim().toLowerCase()=="true";
                });
            }
        }
    });
/*
    app.directive('asyncLoader', function () {

        return {
            scope: {
                    loading:'@loading',
                    message:'@message'
            },
            restrict: 'A',
            transclude: true,
            //replace: true,
            template:'<i ng-show="loading" class="fa fa-circle-o-notch fa-spin fa-1x fa-fw"></i>',
            compile:function(element){
                element.after(loader);
                //element.append(element.context);
                return function(scope) {
                    scope.world = 'World';
                    //$compile()(scope);
                };
            },
            link: function(scope, element,attrs, controller, transcludeFn) {

                scope.isTag=element.is('async-loader');

                if(scope.message==undefined)
                    scope.message='Carregando...';

                attrs.$observe('loading', function (newValue) {
                    scope.loading=scope.loading.trim().toLowerCase()=="true";
                });
            }
        }
    });*/

    
})();


