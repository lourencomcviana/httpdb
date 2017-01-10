(function () {
    var app = angular.module('acompanhamento');

    app.directive('situacaoPedido', function () {
        return {
            scope: {
                fase:'@fase',
                descricao:'@descricao'
            },
            restrict: 'E',

            templateUrl:'commons/directives/acompanhamento/situacaoPedido.html',
            link: function(scope, element,attrs, controller, transcludeFn) {

                attrs.$observe('fase', function (data) {
                    scope.faseClass=faseClass(parseInt(data));
                });

                attrs.$observe('descricao', function (data) {
                    scope.descricao=data;
                });

                /*
                1	GERAC?O
                2	ACEITAC?O
                3	ATIVAC?O
                4	CANCELAMENTO
                5	RESCIS?O
                6	LIQUIDAC?O
                */
                function faseClass(id){
                    switch(id) {
                        case 1:
                            return 'label-primary';
                        case 2:
                            return 'label-primary';
                        case 3:
                            return 'label-primary';
                        case 4:
                            return 'label-warning' ;
                        case 5:
                            return 'label-danger';
                        case 6:
                            return 'label-success';
                        default:
                            return '';
                    }
                }
            }
        }
    });
})();
