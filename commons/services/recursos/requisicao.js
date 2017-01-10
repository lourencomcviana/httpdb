(function () {
  var app = angular.module("recursos");

  app.service("requisicao",[ 'httpf',  function (httpf) {

    function Requisicao() {
      this.fase = null;
      this.sigla = null;
      this.situacao = null;
      this.data = null;
      this.solicitante = null;
      this.motivo = null;
    }

    this.get = function(param) {
      return {
        requisicoes:function(callback) {
          httpf.get('/parcelamento-api/app/requisicao/'+param.codigoParcelamento,function(res) {
            if(res.status==200){
              callback(extrairRequisicoes(res.data));
            }
          });
        }
      }
    }

    function extrairRequisicoes(resource) {
      var requisicoes = [];
      for (var id in resource) {
        var requisicao = new Requisicao();
        requisicao.fase = resource[id].idFase;
        requisicao.situacao = resource[id].descricao;
        requisicao.sigla = resource[id].sigla;
        requisicao.data = resource[id].data;
        requisicao.solicitante = resource[id].solicitante;
        requisicao.motivo = resource[id].motivo;
        requisicoes.push(requisicao);
      }
      return requisicoes;
    }

  }])
})();
