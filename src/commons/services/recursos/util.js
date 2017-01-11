
(function () {
  var app = angular.module("recursos");

  //servico responsavel por administrar o recurso parcelamento
  app.service("util",[ 'httpf',  function (httpf) {
    var contexto=this;

    this.diaUtil=function(data,dias,callback){
     
      httpf.get('/parcelamento-api/app/util/dia-util?q&data='+ moment(data).format('YYYY-MM-DD')+'&dias='+dias,function(res){
        callback(res.data);
      });
    }
    

  }]);
})();
