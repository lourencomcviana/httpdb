(function () {
  var app = angular.module("recursos");

  //servico responsavel por administrar o recurso parcelamento
  app.service("receita",[ 'httpf','mapper',  function (httpf,mapper) {
    var contexto=this;
    
    // classes ------------------------------------------------------------------------------------------
    function Receita(){
      this.codigoReceita=null;
      this.codigoMapeamento=null;
      this.receita=null;
    };
    
    Receita.Filtro=function Filtro(){
        this.codigoReceita=null;
        this.codigoMapeamento=null;
        this.codigoIdentificacao=null;
        this.getPk=function(){
          return this.codigoReceita;
        }
        this.getParans=function(){
          var saida=null;
          saida = mapper.addParameter(saida,this,'codigoMapeamento');
          saida = mapper.addParameter(saida,this,'codigoIdentificacao');
          return saida;
        }
    };
    Receita.parse=function(data){

      var receita=mapper.map(new Receita(),data,
        {
          
          //por padrão, funções são um parse
          codigoReceita: function(source){
              return Number(source);
            }
          ,
          codigoMapeamento:{
            //sintaxe completa
            alias:null, //no alias (por padrão não tem açlias)
            parse:function(source){
              if(typeof source=='string'){
                var list=souce.split(',');
                list.forEach(function(item,id){
                  list[id]=Number(item);
                });
                return list;
              }
              return source;
            }
          },
          
          //pode vir com este nome
          receita:[function(){ return function(){ return 'detalhe.nome'}},'descricao'],
          //pode vir com estes nomes
          //receita:['descricao','nome','obs','desc','detalhe.nome',function(source){return ....}]
          //pode vir com o resultado desta funcao (que pode retornar um array ou string)
          //receita:{alias:function(source){ return substring(source.toString(),0,3);}}
        }
      );

      return receita;
    }

    //funções publicas ---------------------------------------------------------------------------------
    this.constructor=Receita;

    this.get=function(param){
      param=angular.extend(new Receita.Filtro(),param);
      var req = new httpf.Request();
      req.setModelFactory(Receita.parse,Receita);
      req.toast='Atualizando receitas';
      req.http.url='/parcelamento-api/app/receita';      
      req.store.name='receita';
      req.store.loadingMethod=httpf.loadingMethods().FIRST;
      
      if(param.getPk()!=null){
        req.http.url+='/'+param.getPk();
        req.store.key=param.getPk();
      }else if(param.getParans()!=null){
        req.http.params=param.getParans();
        req.store.index=param.getParans();
      }
      
      //função que executa a requisição de acordo com a parametrização passada
      function run(callback){
        httpf.run(req,function(res){
          if(typeof callback=='function'){
            callback(res);
          }
        });
      }

      return {
        receita:function(callback){
          run(function(res){
            if(res.source=='store' ||res.status>=200 && res.status<300){
              callback(res.data);
            }else {
              callback(null);
            }
          })
        },
        raw:run
      }
    }
  }]);
})();
