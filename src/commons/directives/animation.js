(function () {
    var app = angular.module('parcelamento');
    app.directive('animateOnChange', ['$animate', '$timeout', function($animate, $timeout) {
        return function(scope, elem, attr) {
            scope.$watchCollection(attr.animateOnChange, function() {
                console.log('items changed');
                $animate.addClass(elem, 'on').then(function() {
                    $timeout(function(){
                        $animate.removeClass(elem, 'on');
                    }, 3);
                });
            });
        };
    }]);
})();
