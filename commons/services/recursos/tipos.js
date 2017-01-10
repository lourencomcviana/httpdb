
(function () {
    var app = angular.module("recursos");

    //servico responsavel por administrar o recurso parcelamento
    app.service("tipos",[ 'httpf','$timeout','$rootScope',  function (httpf,$timeout,$rootScope) {
        var contexto=this;
       
        function Fase(id,sigla,descricao,status){
            this.id=id;
            this.sigla=sigla;
            this.descricao=descricao;
            this.status=status;
        }

        function Origem(id,codImposto,sigla,descricao){
            this.id=id;
            this.codImposto=codImposto;
            this.sigla=sigla;
            this.descricao=descricao;
            
        }

        function SituacaoParcelamento(id,sigla,descricao){
            this.id=id;
            this.sigla=sigla;
            this.descricao=descricao;
        }

        var url={
                fase:undefined
            };
        
       
        this.get=function(param){
            if(param==undefined){
                param={};

            }
            var tempUrl=url.parcelamento;

            function innerGet(callback,url){

                httpf.run(reqObjs,function(res){
                    callback(res);
                });
            }

            return {
                fases:function(callback){
                    $timeout(function(){
                        //um dia criar serviço para ler esta informação do banco...
                        var fases=[]
                        fases.push(new Fase(1,'GERACÃO','AGUARDANDO PAGAMENTO',1))
                        fases.push(new Fase(2,'ACEITACÃO','AGUARDANDO ACEITACÃO',0))
                        fases.push(new Fase(3,'ATIVACÃO','ATIVO',1))
                        fases.push(new Fase(4,'CANCELAMENTO','CANCELADO',1))
                        fases.push(new Fase(5,'RESCISÃO','RESCINDIDO',1))
                        fases.push(new Fase(6,'LIQUIDACÃO','LIQUIDADO',1))
                        callback({data:fases});
                    });
                },
                origens:function(callback){
                    $timeout(function(){
                        //um dia criar serviço para ler esta informação do banco...
                        var origens=[]
                        origens.push(new Origem(1,121,'ICMS','Imposto sobre operações relativas a circulação de mercadorias e sobre prestações de serviços de transporte interestadual, intermunicipal e de comunição'))
                        origens.push(new Origem(2,135,'IPVA','Imposto sobre a propriedade de veiculos automotores'))
                        origens.push(new Origem(3,130,'ITCD','Imposto sobre a transmissão "CAUSA MORTIS" e doação de quaisquer bens ou direitos'))
                        origens.push(new Origem(4,161,'TFRH','Taxa de controle, acompanhamento e fiscalização das atividades de exploração e aproveitamento de recursos hidricos'))
                        origens.push(new Origem(5,141,'TFRM','Taxa de controle, monitoramento e fiscalizac?o das atividades de pesquisa, lavra, exploração e aproveitamento de recursos minerários'))
                        origens.push(new Origem(6,129,'DANT','Divida ativa não tributaria'))
                        origens.push(new Origem(7,9,'TDAE','Taxa de servico - SEFA'))
                        callback({data:origens});
                    });
                },
                situacoesParcelamento:function(callback){
                    $timeout(function(){
                        //um dia criar serviço para ler esta informação do banco...
                        var situacoesParcelamento=[]
                        situacoesParcelamento.push(new SituacaoParcelamento(1,'NÃO INSCRITO EM D.A.','NÃO INSCRITO EM DÍVIDA ATIVA'))
                        situacoesParcelamento.push(new SituacaoParcelamento(2,'INSCRITO EM D.A.','INSCRITO EM DÍVIDA ATIVA'))
                        situacoesParcelamento.push(new SituacaoParcelamento(3,'EXECUTADO','INSCRITO EM DÍVIDA ATIVA E EXECUTADO'))
                        callback({data:situacoesParcelamento});
                    });
                },
            }
        }
    }]);
})();





