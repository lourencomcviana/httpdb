(function () {
    var app = angular.module('parcelamento');
    
    
         
    function numberMaskDirective(textHelper) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ctrl) {
        

              
                function parser(value) {
                    if (ctrl.$isEmpty(value)) {
                        return undefined;
                    }

                    if(typeof value!='string' ){
                        value=value.toString();
                        
                    }
                    value=textHelper.replaceAll(value,'',/\D/);
                    
                    ctrl.$setViewValue(value);
					ctrl.$render();

                    return parseInt(value);
                }

                function formatter(value) {
                    if (ctrl.$isEmpty(value)) {
                        return value;
                    }
                   
    
                    return value;
                }

               /* function clearViewValueIfMinusSign() {
                    if (ctrl.$viewValue === '-') {
                        ctrl.$setViewValue('');
                        ctrl.$render();
                    }
                }

                element.on('blur', clearViewValueIfMinusSign);
*/
                ctrl.$formatters.push(formatter);
                ctrl.$parsers.push(parser);

               
            }
        };
    }
    //numberMaskDirective.$inject = ['$locale', '$parse', 'PreFormatters', 'NumberMasks'];
    app.directive('numberMask',numberMaskDirective);
    
})();
