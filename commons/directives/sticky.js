(function () {
    var app = angular.module('parcelamento');

    app.directive("sticky", function ($window,$timeout) {
		return {
            scope: {
				parent:'@parent',
				parentColor:'@parentColor',
				parentWidth:'@parentWidth',
				position:'@position'
            },
            restrict: 'A',
            //replace: true,
            link: function(scope, element, attrs) {
            	var parentColor=scope.parentColor;
            	var position=scope.position;
				if(parent!=undefined){
					scope.parentColor=scope.parentWidth=true;
				}

            	parentColor=parentColor!=undefined;
            	if(position==undefined){
					position='top';
				}else{
					position=position.toLowerCase();
				}
				
				var param={
					position:position,
					parentColor:parentColor,
					parentWidth:scope.parentWidth!=undefined
				}
				var scrollBoss=undefined;
				//descobre qual elemento está controlando o scroll
				if(element.parents('md-content').length>0){
					scrollBoss=element.parents('md-content')[0];
				}else{
					scrollBoss=$window;
				}

				var controlElement=null;
				var elementPrevData={};
				var parent;
				$timeout(function(){
					parent=element.parents();
				});
				
				angular.element(scrollBoss).bind('scroll', function (e) {
					var position;
					var fixarElemento=false;

					if(controlElement!=null){
						position=controlElement.offset().top;
					}else{
						position=element.offset().top;
					}
					position=Math.round(position);
					//inverte a lógica de posicionamento quando o elemento estiver com sticky no bottom
					if(param.position=='bottom'){
						fixarElemento= $(window).height() - position - element.height() <= 0
					}else{
						fixarElemento=position <= 0
					}
					
					if (fixarElemento ){
						if(controlElement===null){
							elementPrevData=element.attr('style');
							
							if(elementPrevData==undefined || elementPrevData==null){
								elementPrevData="";
							}
							
							element.css('position','fixed')
								.css('z-index', '999')
								.css('display','inherit')
							;
							

							if(param.parentWidth){
								element.css('width',parent.css('width'));
							}else{
								element.css('width','100%');
							}

							if(param.parentColor){
								element.css('background-color',parent.css('background-color'));
							}
							

							var sum =0,count=0;
							$('[name=fixed-position-control][position='+position+']').each(function(id,el){
								sum+=$(el).height();
								count++;
							});
							
							if(param.position=='bottom'){
								element.css('bottom',Math.round(sum))
									.css('margin-bottom','0');
							}else{
								element.css('top',Math.round(sum))
									.css('margin-top','0');
							}

							element.before('<div position="'+position+'" style="height:'+element.height()+'px" name="fixed-position-control"></div>')
							controlElement=element.prev();
						}

					} else if(controlElement!=null){
						controlElement.remove();
						controlElement=null;
						element.attr('style',elementPrevData);
						elementPrevData=undefined;

					}
				});
			}
        }
    });
})();
