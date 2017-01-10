(function () {
    var app = angular.module("recursos");

    app.service("pagamento",[ 'httpf', 'textHelper','receita','parcela','mapper','$window',  function (httpf, textHelper,receita,parcela,mapper,$window) {

        function Dae(){

        }

        Dae.Filtro= function(){
            this.codigoReceitaEscolhida=null;
            this.dataCalculo=null;
            this.codigoIdentificacaoDebito=null;
            this.codigoContaDebito=null;
        }

        Dae.geracaoByParcela=function(parcela,callback){
              var params={
                  parcela:null,
                  totalParcelas:null,
              }
              params=angular.extend({},params,parcela);
              httpf.get('/parcelamento-api/app/util/ultimo-dia-util',function(resDia){
                if(resDia.status==200){
                    var dia=resDia.data;
                    var receitaFiltro=new receita.constructor.Filtro();
                    //seta valores do filtro
                    receitaFiltro.codigoIdentificacao=params.parcela.id;
                    receita.get(receitaFiltro).receita(function(data){
                        callback(
                                {
                                "codigoReceitaEscolhida":  data.codigoReceita.toString(),
                                "dataCalculoDae":  moment().format('YYYY-MM-'+dia),
                                "codigoIdentificacaoDebito": [ params.parcela.id.toString()],
                                "codigoContaDebito": ["6"],
                                "informacoesAdicionais": "referente a parcela "+params.parcela.numero.toString()+" de "+params.totalParcelas.toString()+" do período "+ moment(params.parcela.vencimento).format('MM/YYYY')
                                }
                       /*
                        {
                            "dae": {
                                "dataCalculoDae":  moment().format('YYYY-MM-'+dia),
                                "informacoesAdicionais": "parcela 1 de 10",
                                "debitos": {
                                    "debito": {
                                        "codigoConta":6,
                                        "codigoIdentificacao": parcela.id
                                    }
                                },
                                "receitaEscolhida": {
                                    "codigoReceita": data.codigoReceita.toString()
                                }
                            }
                        }
                        */

                        );
                   });
                }
            });
        }
        Dae.Filtro.byParcela=function(parcela,callback){
            httpf.get('/parcelamento-api/app/util/ultimo-dia-util',function(resDia){
                if(resDia.status==200){
                    var dia=resDia.data;
                    var receitaFiltro=new receita.constructor.Filtro();
                    //seta valores do filtro
                    receitaFiltro.codigoIdentificacao=parcela.id;
                    //realiza requisição

                    receita.get(receitaFiltro).receita(function(data){

                        var daeFiltro=mapper.map(new Dae.Filtro(),angular.merge({},parcela,data),{
                            codigoReceitaEscolhida:'codigoReceita',
                            dataCalculo:{
                                //ignorando completamente o valor....
                                parse:function(valor){

                                    return moment().format('YYYY-MM-'+dia);
                                }
                            },
                            codigoIdentificacaoDebito:'id'

                        });
                        //FAZER TRATAMENTO DA COTA ÚNICA AQUI!!!!
                        daeFiltro.codigoContaDebito=6;


                        callback(daeFiltro);
                    });
                }
            });
        }


        function Pagamento() {
            this.id=undefined;
            this.idPedido=undefined;
            this.modalidade=null;
            this.dados=undefined;
            this.status=null;
            this.dataInsercao;
            this.solicitante;

        }
        this.constructor=Pagamento;
        this.Pagamento=Pagamento;
        this.DebitoAutomatico=DebitoAutomatico;
        Pagamento.toHttpResource=function(pagamento){
            var resource= {
                 "id": null,
                 "idRequisicao": undefined,
                 "idSolicitante": undefined,
                 "dataInsercao": undefined,
                 "status": undefined,
                 "debitoAutomatico": undefined
                 
                }
                var debitoAutomatico=function(){
                    return{    
                        "codigoBanco": undefined,
                           "codigoAgencia": undefined,
                           "digitoAgencia": undefined,
                           "codigoConta": undefined,
                           "digitoConta": undefined,
                           "tipoConta": undefined,
                           "codigoOperacao": undefined,
                           "titular": {
                             "identificacaoFiscal": undefined,
                             "nome": undefined
                           }
                    }
                }
         

                mapper.map(resource, pagamento,{
                    status:{
                        alias:'tipo',
                        parse:function(val){
                            return parseInt(val);
                        }
                    },
                    dataInsercao:function(data){
                      if(data!=undefined && typeof data=='object' && data.constructor.name=='Date'){
                          return moment(data).format('YYYY-MM-DD');
                      }
                      return data; 
                    },
                    idSolicitante:'solicitante',
                    idRequisicao:'idPedido',
                    debitoAutomatico:{
                        alias:'dados',
                        parse: function(dados){
                                if(dados!=null && typeof dados=='object'){
                                        dados= mapper.map(debitoAutomatico(), dados,{
                                            codigoAgencia:'agencia',
                                            codigoConta:'conta',
                                            digitoAgencia:'agenciaDV',
                                            digitoConta:'contaDV',
                                            titular:{
                                                //apelido para o objeto raiz
                                                alias:'',
                                                parse:function(data){
                                                    
                                                    return {
                                                        nome:data.titular,
                                                        identificacaoFiscal:data.cpf!=undefined?data.cpf:data.cnpj
                                                    }
                                                }
                                            }
                                        })
                                }
                                return dados;
                            }
                    }
                });

             return resource;
        }
        Pagamento.extrair= function(resource,awaysArray) {
            function run(resource){
                   var pagamento = new Pagamento();
                   pagamento.idPedido=resource.idPedido;

                   pagamento.tipo=resource.tipo;
                   pagamento.modalidade = resource.modalidade;
                   pagamento.status = resource.statusString;
                   pagamento.dataInsercao =moment(resource.dataInsercao).toDate();//.format('YYYY-MM-DD');
                   pagamento.solicitante = resource.idSolicitante;
                   if (pagamento.tipo == 2) {
                        var dados = new DebitoAutomatico();
                        DebitoAutomatico.setCpfCnpj(dados, resource.identificacaoFiscal, resource.tipoPessoa);
                        dados.banco = resource.banco;
                        dados.codigoBanco = resource.codigoBanco;
                        dados.agencia = resource.agencia;
                        dados.agenciaDV = resource.agenciaDigito;
                        dados.conta = resource.conta;
                        dados.contaDV = resource.contaDigito;
                        dados.tipoConta = resource.tipoPessoa;
                        if (resource.codigoOp > 0) {
                            dados.codigoOperacao = resource.codigoOp;
                        }
                        pagamento.dados = dados;
                   }
                   return pagamento;
            }
            if(awaysArray==undefined){
                awaysArray=true;
            }
        
            
            if(!awaysArray && angular.isArray(resource)&& resource.length==1){
                resource=resource[0];
            }
            if(angular.isArray(resource)){
                var lista=[];
                for(id in resource){
                    lista.push(run(resource[id]));
                }
                return lista;
            }else{
                return run(resource);
            }

        }
        //retorna instancia da classe para
        this.factory= function(){return new Pagamento()};
        function DebitoAutomatico() {
            this.titular=undefined;
            this.cpf=undefined;
            this.cnpj=undefined;
            this.banco=null;
            this.codigoBanco=null
            this.agencia=null;
            this.agenciaDV=null;
            this.conta=null;
            this.contaDV=null;
            this.tipoConta=null;
            this.codigoOperacao=undefined;
            this.equals=function(debitoAutomatico){
                function obj(){
                    return {
                            cpf:null,
                            cnpj:null,
                            codigoBanco:null,
                            agencia:null,
                            agenciaDV:null,
                            conta:null,
                            contaDV:null,
                            tipoConta:null,
                            codigoOperacao:null

                        }
                }
                if(typeof(debitoAutomatico)!='object' || debitoAutomatico===null){
                    return false;
                }
                for(var id in obj()){
                    if(this[id]!=debitoAutomatico[id]){
                         return false
                    }
                }
                return true;
            }
        }

        DebitoAutomatico.setCpfCnpj = function(dados, identificacao, tipoPessoa) {
            if (tipoPessoa == 1) {
                if(identificacao==undefined||identificacao==null){
                    dados.cpf = '';
                }
                dados.cpf = textHelper.fillLeft(identificacao,'0',11);
            } else {
                if(identificacao==undefined||identificacao==null){
                    dados.cnpj = '';
                }
                dados.cnpj = textHelper.fillLeft(identificacao,'0',14);
            }
        };


        var url={
            dae:{
                validar:'/modalidade-pagamento-api/dae-conta-corrente/validar',
                gerar:'/modalidade-pagamento-api/dae-conta-corrente'
            },
            pagamento:'/parcelamento-api/app/pagamento'
        }
        this.get = function(param) {
            var req = new httpf.Request();

            function run(callback){
                return httpf.run(req,function(res){
                    if(typeof callback=='function'){
                        callback(res);
                    }
                });
            }
            return {
                raw:function() {
                    return httpf.get(url.pagamento+'/'+param.codigoParcelamento,function(res){
                        callback(res);
                    });
                },
                pagamento:function(callback) {
                    var turl=url.pagamento+'/'+param.codigoParcelamento;
                    var awaysArray=true;
                    if(param.status != null && param.status != undefined){
                        awaysArray=false;
                        turl+='?status='+param.status
                    }
                   
                    return httpf.get(turl,function(res){
                        if(res.status==200){
                            callback(Pagamento.extrair(res.data,awaysArray));
                        }
                    });

                },
                dae:function(callback){
                    req.http.url=url.dae.validar;
                    Dae.Filtro.byParcela(param,function(filtro){
                        req.http.params=filtro;
                        run(callback);
                    });
                }
            }
        }

        this.post = function(param) {
            var req = new httpf.Request();
            req.http.method='POST';

            function run(callback){
                httpf.run(req,function(res){
                    if(typeof callback=='function'){
                        callback(res);
                    }
                });
            }
            return {
                pagamento:function(callback){
                    req.http.url=url.pagamento;
                    
                    if(param.constructor.name=='Pagamento'){
                        param=Pagamento.toHttpResource(param)  
                    }
                    req.http.data=param;

                    run(function(pagamento){
                        callback(pagamento);
                    });
                },
                dae:function(callback){
                    req.http.url=url.dae.gerar;
                    Dae.geracaoByParcela(param,function(data){
                        req.http.data=data;
                        run(function(dae){
                             //readTextFile("/parcelamento/assets/dae.txt");
                             if(dae.status=201){
                                 downloadFile("data:application/pdf;base64," + (dae.data.documentoPDF),'Dae '+dae.data.codigoDocumento);
                             }
                             callback(dae);
                        });
                    });
                }
            }
        }

        function downloadFile(fileContents, fileName)
        {       
            /*
            switch(browser()){
                 case 'chrome':
                    var link = document.createElement('a');
                    link.download = fileName;
                    link.href =  fileContents;
                    link.click();
                    break;
                 default:
                     window.open(fileContents);
                     break;
            }
            */
            window.open(fileContents);
        }
        
        function browser() {

                var userAgent = $window.navigator.userAgent;

                var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i};

                for(var key in browsers) {
                    if (browsers[key].test(userAgent)) {
                        return key;
                    }
               };

               return 'unknown';
        }
    
        //le um arquivo local
        function readTextFile(file)
        {
            var rawFile = new XMLHttpRequest();
            rawFile.open("GET", file, false);
            rawFile.onreadystatechange = function ()
            {
                if(rawFile.readyState === 4)
                {
                    if(rawFile.status === 200 || rawFile.status == 0)
                    {
                        var allText = rawFile.responseText;
                        return allText;
                        downloadFile("data:application/pdf;base64," + (allText),'Dae 12 12 12');
                    }
                }
            }
            rawFile.send(null);
        }

    }]);
})();
