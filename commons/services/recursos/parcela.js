(function () {
    var app = angular.module("recursos");

    app.service("parcela",[ 'httpf',  function (httpf) {

        function Parcela() {
            this.codigoParcelamento=null;
            this.id=null;
            this.numero=null;
            this.vencimento=null;
            this.pagamento=null;
            this.total=null;
            this.valorPago=null;
            this.situacao=null;
            this.principal=null;
            this.juros=null;
            this.honorarios=null;
            this.dae=null;
            this.situacaoCobranca=null;
            this.complemento=undefined;
            this.fonte=null;
        }

        this.get = function(param) {
            return {
                raw:function() {
                    httpf.get('/parcelamento-api/app/parcelas/'+param.codigoParcelamento,function(res){
                        callback(res);
                    });
                },
                parcela:function(callback) {
                    httpf.get('/parcelamento-api/app/parcelas/'+param.codigoParcelamento,function(res){
                        if(res.status==200){
                            callback(httpResourceToParcela(res.data));
                        }
                    });
                }
            }
        }

        function httpResourceToParcela(httpResourceList){
            var lista=[];
            for(var id in httpResourceList){
                lista.push(extrairParcela(httpResourceList[id]));
            }
            return lista;
        }

        function getSituacao(data) {
            if (data.dataPagamento != null) {
                return 'PAGO';
            } else if (data.dataPagamento == null && moment(data.dataVencimento).toDate() < moment.now() ) {
                return 'VENCIDO';
            } else {
                return 'VINCENDO';
            }
        }

        function extrairParcela(resource){
            var parcela = new Parcela();
            parcela.id=resource.id;
            parcela.numero=resource.numero;
            parcela.vencimento=resource.dataVencimento;
            parcela.pagamento=resource.dataPagamento;
            parcela.total=resource.total;
            parcela.valorPago=resource.valorPago;
            parcela.situacao=getSituacao(resource);
            parcela.principal=resource.principal;
            parcela.juros=resource.juros;
            parcela.honorarios=resource.honorarios;
            parcela.dae=resource.taxaDae;
            parcela.situacaoCobranca=resource.situacaoCobranca;
            parcela.fonte=resource.fonte;
            if (resource.complemento != null || resource.complemento != undefined) {
                parcela.complemento=resource.complemento;
            }
            return parcela;
        }

    }]);
}
)();
