(function () {
    var app = angular.module('parcelamento');
    
    app.directive("timeline", function ($window,$timeout) {
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

				var scrollBoss=undefined;
				//descobre qual elemento está controlando o scroll
				if(element.parents('md-content').length>0){
					scrollBoss=element.parents('md-content')[0];
				}else{
					scrollBoss=$window;
				}
				var $timeline_block =element.find('div');


				$timeout(function(){
					
					var firstTimeLine=$($timeline_block[0]);
					firstTimeLine.find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden')
					firstTimeLine.find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('bounce-in')

					$timeline_block.each(function(){
						if ($(this).offset().top > 500){
							$(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden')
						}
					});
				});

				angular.element(scrollBoss).bind('scroll', function (e) {
					var position=element.offset().top;
	

					$timeline_block.each(function(){
						if ($(this).offset().top <= 500){
							$(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('bounce-in')
							//console.log('apareceu: '+$(this).offset().top+ ', '+($(scrollBoss).scrollTop() + $(scrollBoss).height()*0.75));
						}
					});
				});
			}
        }
    });
})();
