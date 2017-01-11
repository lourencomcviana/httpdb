(function () {
    var app = angular.module('contribuinte');

    app.directive('situacaoDebito', function () {
        return {
            scope: {
                    value:'@value'
            },
            restrict: 'E',

            templateUrl:'commons/directives/contribuinte/situacaoDebito.html',
            link: function(scope, element,attrs, controller, transcludeFn) {

                attrs.$observe('value', function (newValue) {
                    scope.situacaoClass=situacaoClass(parseInt(newValue));
                    scope.situacaoStr=situacaoStr(parseInt(newValue));
                });


                function situacaoStr(situacao){
                    switch(situacao) {
                        case 1:
                            return 'NÃO inscrito(s) em dívida ativa';
                        case 2:
                            return 'Inscrito(s) em dívida ativa NÃO executado(s)';
                        case 3:
                            return 'Inscrito(s) em dívida ativa executado(s)';
                        default:
                            return '';

                    }
                }

                function situacaoClass(situacao){
                    switch(situacao) {
                        case 1:
                            return 'info';
                        case 2:
                            return 'warning';
                        case 3:
                            return 'danger';
                        default:
                            return 'danger';

                    }
                }

            }
        }

    });
})();
