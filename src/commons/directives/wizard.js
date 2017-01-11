(function () {
    var app = angular.module('parcelamento');

    app.directive('onlyNumber', function (textHelper) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                var valor;


                ngModel.$formatters.push(function(modelValue) {
                    console.log(modelValue);
                    return {valor:modelValue+'-',valorOriginal:modelValue};
                });

                ngModel.$parsers.push(function(viewValue) {

                    // Remember multiplierMap was defined above
                    // in the formatters snippet
                    viewValue=textHelper.replaceAll(viewValue,'',/\D/);
                    scope.valor =viewValue;
                    //ngModel.$modelValue=scope.valor;
                    //ngModel.$setViewValue(scope.valor);
                    return viewValue;
                });

                ngModel.$render = function() {
                    scope.valor = ngModel.$viewValue.valor;
                    scope.valorOriginal  = ngModel.$viewValue.modelValue;
                };

                scope.$watch('valor', function() {
                    console.log( scope.valor);

                });
            }
        };
    });

    app.directive('wizard', function () {
        return {
            scope: {
                    etapaRealizada:'@etapaRealizada',
                    etapaAtual:'@etapaAtual',
                    name:'@name'
            },
            restrict: 'E'
            ,
            transclude: true,
            //template: '<div ng-transclude></div>{{message}}',
            templateUrl:'commons/directives/wizard.html',
            link: function(scope, element,attrs, controller, transcludeFn) {
                //definir fontes de dados, por enquanto mocado
                var wizards={
                    parcelamento: [
                        {
                            titulo:'Vínculo',
                            url:'#/cadastro/vinculo'
                        },
                        {
                            titulo:'Origem',
                            url:'#/origem'
                        },
                        {
                            titulo:'Débitos',
                            url:'#/debitos'
                        },
                        {
                            titulo:'Simulação',
                            url:'#/simulacao'
                        },
                        {
                            titulo:'Confirmação',
                            url:'#/confirmacao'
                        }
                    ]
                };

                scope.wizard= wizards[scope.name];
                    
                scope.tam=scope.wizard.length

                scope.getRota=function(id){
                    if(id-1<=scope.etapaRealizada){
                        return scope.wizard[id].url;
                    }
                    return null;
                }
            }
        }
    });
})();
