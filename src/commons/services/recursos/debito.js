(function () {
    var app = angular.module("recursos");

    app.service("debito",[ 'httpf',  function (httpf) {
      var contexto=this;
      function Debito() {
        this.id=null;
        this.conta=null;
        this.descricaoConta=null;
        this.imposto=null;
        this.descricao=null;
        this.numeroDocumento=null;
        this.periodo=null;
        this.situacao=null;
        this.principal=null;
        this.juros=null;
        this.multa=null;
        this.montante=null;

        this.loadAmortizacao=function(){
          this.amortizacao={loading:true};
          contexto.get(this).amortizacao(function(data,debito){
            debito.amortizacao = data;
          });
        }   
      }

      
      function Amortizacao(){
        function Valor(){
          this.parcelado;
          this.amortizado;
          this.residual;    
        }
        
        this.principal = new Valor();
        this.juros     = new Valor();
        this.multa     = new Valor();
        this.totalResidual;
        this.totalAmortizado;
      }

      Amortizacao.extrair=function(recurso){
        function parse(recurso){
          var amortizacao = new Amortizacao();
          
          
          amortizacao.principal.parcelado  = recurso.dividaPrincipal;
          amortizacao.principal.amortizado = recurso.principalAmortizado;
          amortizacao.principal.residual   = recurso.principalResidual;

          amortizacao.juros.parcelado  = recurso.juros;
          amortizacao.juros.amortizado = recurso.jurosAmortizado;
          amortizacao.juros.residual   = recurso.jurosResidual;

          amortizacao.multa.parcelado  = recurso.multa;
          amortizacao.multa.amortizado = recurso.multaAmortizado;
          amortizacao.multa.residual   = recurso.multaResidual;
          
          amortizacao.totalResidual    = recurso.totalResidual 
          amortizacao.totalAmortizado  = recurso.totalAmortizado
          
          for(var tipoPag in amortizacao){
            if(!tipoPag.startsWith("total")){
              for(var id in amortizacao[tipoPag]){
                if(amortizacao[tipoPag][id]==undefined)
                  amortizacao[tipoPag][id]=0;
              }
            } 
          }
          
          if(amortizacao.totalResidual==undefined)
            amortizacao.totalResidual    = amortizacao.principal.residual+amortizacao.juros.residual+amortizacao.multa.residual ;
          if(amortizacao.totalAmortizado==undefined)
            amortizacao.totalAmortizado  = amortizacao.principal.amortizado+amortizacao.juros.amortizado+amortizacao.multa.amortizado;
          
          return amortizacao;
        }

        if(angular.isArray(recurso)){
          if(recurso.length==1){
            return this.extrair(recurso[0]);
          }
          var lista=[];
          if(recurso.length==0){
            return (parse({}));
          }else{
            for(var id in recurso){
              lista.push(parse(recurso[id]));
            }
          }
          return lista;
        }else{
          return parse(recurso);
        }
      }

      var url={
        debito:'/parcelamento-api/app/debitos',
        amortizacao:'/parcelamento-api/app/debitos/amortizacao'
      }

      this.get = function(param) {
        return {
          raw:function() {
            httpf.get(url.debito+'/'+param.codigoParcelamento,function(res){
                  callback(res);
            });
          },
          debito:function(callback) {
            httpf.get(url.debito+'/'+param.codigoParcelamento,function(res){
              if(res.status==200){
                  callback(httpResourceToDebito(res.data));
              }
            });
          },
          debitoComAmortizacao:function(callback) {
            httpf.get(url.debito+'/'+param.codigoParcelamento,function(res){
              if(res.status==200){
                  callback(httpResourceToDebito(res.data,{sincronizarAmortizacao:true,parcelamento:param}));
              }
            });
          },
          amortizacao:function(callback) {
            var path='';
            
            //é um objeto q contem o campo conta corrente. 

            if(param.parcelamento!=undefined){
              if(param.parcelamento.codigoParcelamento!=undefined){
                path+='/'+param.parcelamento.codigoParcelamento;
              }else{
                path+='/'+param.parcelamento.id;
              }
            }else if(param.codigo_parcelamento!= undefined){
              path+='/'+param.codigo_parcelamento;
            }else if(param.id!=undefined){
              path+='/'+param.id;
            } else {
              console.log('parametros insuficientes. No mínimo é necessário o codigo do parcealmento para consultar amrotização');
              callback(null,param);
              return;  
            }

            if(param.codigo_identificacao!=undefined){
              path+='/'+param.codigo_identificacao;
            }else{
              path+='/'+param.id;
            }
            if(param.conta!=undefined ){
              path+='/'+param.conta;
            }

            httpf.get(url.amortizacao+path,function(res){
              if(res.status==200){
                  callback(Amortizacao.extrair(res.data),param);
              }
            });
           
          },
        }
      }

      function httpResourceToDebito(httpResourceList,param){
          var lista=[];
          for(var id in httpResourceList){
              lista.push(extrairDebito(httpResourceList[id],param));
          }
          return lista;
      }

      function extrairDebito(resource,param){
          var debito = new Debito();
          debito.id = resource.codigoDebito;
          debito.numeroDocumento = resource.numDocumento;
          debito.periodo = resource.periodo;
          debito.conta = resource.codigoConta;
          debito.imposto = resource.codigoImposto;
          debito.principal = resource.dividaPrincipal;
          debito.juros = resource.juros;
          debito.multa = resource.multa;
          debito.montante = resource.montante;
          if(param.parcelamento!=undefined){
            debito.parcelamento=param.parcelamento;
          }
          if(param.sincronizarAmortizacao){
            debito.loadAmortizacao();
          }else if(param.loadAmortizacaoFromResource){
            debito.amortizacao= Amortizacao.extrair(resource,param);
          }
          
          return debito;
      }

     

    }]);
  }
)();
