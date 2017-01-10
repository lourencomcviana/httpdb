(function () {
    var app = angular.module('parcelamento');

    app.directive('backButton', function(){
        return {
          restrict: 'A',

          link: function(scope, element, attrs) {
            element.bind('click', goBack);

            function goBack() {
              history.back();
              scope.$apply();
            }
          }
        }
    });

})();
