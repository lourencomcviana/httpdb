(function () {
  var app = angular.module("recursos");

  //servico responsavel por administrar o recurso parcelamento
  app.service("vinculo",[ 'ngYdn','httpf','$rootScope','dbUser','textHelper','$http',  function (ngYdn,httpf,$rootScope,dbUser,textHelper,$http) {
    var contexto=this;
    
     

    function Vinculo(){
      function Empresa(){
        this.cnpjBase=undefined;
      }
      function Veiculo(){
        this.renavam=null;
        this.placa=null;
        this.categoria=null;
        this.tipo=null;
      }

      this.Veiculo=Veiculo;
      this.Empresa=Empresa;
      this.ruc=null;
      this.ie=undefined;
      this.nome=null;
      this.cpf=undefined;
      this.cnpj=undefined;
      this.veiculo=undefined;
      this.empresa=undefined;
    }

    function Grupo(){
      this.nome=null;
      this.cpf=undefined;
      this.cnpjBase=undefined;
      this.ruc=undefined;
      this.vinculos=[];
    }

    this.Vinculo=Vinculo;
    this.get=function(param){
      var _param = {
          ie:null,
          ruc:null,
          hasParcelamento:undefined
      };
      var param=angular.extend({},_param,param);
      var req = new httpf.Request();
      req.setModelFactory(extrairVinculo2);
      req.toast='Atualizando Vinculos';
      req.http.url='/parcelamento-api/app/vinculo';      
      
      req.store.name='vinculo';
      req.store.index={user:dbUser.getLogedUserLogin()};
      req.store.index.hasParcelamento=undefined;
      req.store.index.isParcelavel=undefined;
      
      if ( param.ruc != null){
        req.http.url +='/'+param.ruc;
        req.store.key=parseInt(param.ruc);
      }
      req.http.url+='?q';
      
      if(param.hasParcelamento!= undefined){
          req.http.url+='&hasParcelamento='+(param.hasParcelamento==1).toString();
          req.store.index.hasParcelamento=(param.hasParcelamento);
      }
      
      if(param.isParcelavel){
          req.http.url+='&parcelavel='+param.isParcelavel;
          req.store.index.isParcelavel=param.isParcelavel;
      }

      function run(callback){
         httpf.run(req,function(res){
            if(typeof callback=='function'){
                callback(res);
            }
        });
      }

      return {
        vinculo:function(callback){
          run(function(res){
            if(typeof callback!='function'){
              callback=function(res){
                console.log(res);
              }
            }
            if(res.source=='store' ||res.status>=200 && res.status<300){
              var resposta;
              if(angular.isArray(res.data)){
                resposta=extrairVinculos(res.data);
              }else{
                resposta=extrairVinculo2(res.data);
              }
              callback(resposta);
            }else {
              callback(res);
            }
          })
        },
        raw:run
      }
    }

    this.events={
      get:{
        ok:function(){return 'vinculo.get.ok'},
        error:function(){return 'vinculo.get.error'}
      }
    }


    function extrairVinculo2(httpVinculoResource){
        if(httpVinculoResource.constructor.name=='Vinculo')
            return  httpVinculoResource;
            
        var groupKey;
        
        //lista.push(extrairVinculo(httpResourceList[id]));

        var vinculo = new Vinculo();
        
        //httpVinculoResource.veiculo=map(new Veiculo(),httpVinculoResource.veiculo);
        map(vinculo,httpVinculoResource)//,{cpf:'identificacaoVinculo'})
        
        if(vinculo.ie!=undefined){
            vinculo.ie=Number(textHelper.replaceAll(vinculo.ie,'',/[\D]+/));
            if(httpVinculoResource.ruc==undefined){
                vinculo.ruc=Number(vinculo.ie.toString().substring(0,vinculo.ie.toString().length-1));
            }
        }
        vinculo.ruc=Number(textHelper.replaceAll(vinculo.ruc,'',/[\D]+/));
        
        var cpfCnpj=textHelper.replaceAll(httpVinculoResource.cpfCnpj,'',/[\D]+/);
        
        if(cpfCnpj!=undefined){
            if(cpfCnpj.length==11){
              vinculo.cpf=cpfCnpj;

            }
            else if(cpfCnpj.length==14){
              vinculo.cnpj=cpfCnpj;
              vinculo.empresa= new vinculo.Empresa();
              vinculo.empresa.cnpjBase=cpfCnpj.substring(0,8);
            }
            else{
              if(cpfCnpj!="")
              vinculo.cpfCnpj=cpfCnpj;
            }
        }

        if(httpVinculoResource.veiculo!= undefined ||httpVinculoResource.placaVeiculo!= undefined ){
          var veiculo= new vinculo.Veiculo();

          if(httpVinculoResource.veiculo!= undefined){
            map(veiculo,httpVinculoResource.veiculo);
          }else if(httpVinculoResource.placaVeiculo!= undefined){
            veiculo.placa=httpVinculoResource.placaVeiculo;
          }

          vinculo.veiculo=veiculo;
        }

       return vinculo;
    }

    function extrairVinculos(httpResourceList){

      var lista=[];
      var listaAgrupada=[];
      var grupos={};
      for(var id in httpResourceList){

        var vinculo=extrairVinculo2(httpResourceList[id]);
        lista.push(vinculo);
        function keyGen(vinculo){
          var retorno={nome:null,valor:null};
          if(vinculo.empresa!=null){
            retorno.nome='cnpjBase';
            retorno.valor=vinculo.empresa.cnpjBase;

          }else if(vinculo.cpf!=null){
            retorno.nome='cpf';
            retorno.valor=vinculo.cpf;
          }else{
            //impossível agrupar...
            retorno.nome='ruc';
            retorno.valor=vinculo.ruc;
          }
          return retorno;
        }

        var key=keyGen(vinculo);
        var grupo=grupos[key.nome+"_"+key.valor];

        if(grupo!= undefined){
          grupo.vinculos.push(vinculo);
        }else{
          novoGrupo=new Grupo();
          novoGrupo.nome=vinculo.nome;
          novoGrupo[key.nome]=key.valor;
          novoGrupo.vinculos.push(vinculo);

          listaAgrupada.push(novoGrupo);
          grupos[key.nome+"_"+key.valor]=novoGrupo;
           
        }

      }
      //testes------------------------------------\
      //var x=    listarEmpresaComFiliais(lista);//|
      //var y=    listarVeiculos(lista);         //|
      //testes------------------------------------/

      return {vinculos:lista,vinculosAgrupados:listaAgrupada };
    }


    function listarEmpresaComFiliais(lista){
      var novaLista=[];
      for(var id in lista){
        if(lista[id].empresa!= null && lista[id].empresa!= undefined && lista[id].empresa.filiais.length>0)
        novaLista.push(lista[id]);
      }
      return novaLista;
    }

    function listarVeiculos(lista){
      var novaLista=[];
      for(var id in lista){
        if(lista[id].veiculo!= null)
        novaLista.push(lista[id]);
      }
      return novaLista;
    }

    function map(target,source,alias){
      if(typeof source!='object' || source==null)
      return target;
      if(alias==undefined)
      alias={}
      for(var id in target){
        var value;
        if(source[id]==undefined){
          value=source[alias[id]];
        }else{
          value=source[id];
        }

        if(value!=undefined && value!=null && value!=""  ){
          target[id]=value;
        }
      }
      return target;
    }

  }]);
})();
