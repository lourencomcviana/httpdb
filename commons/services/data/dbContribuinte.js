
(function () {
    var app = angular.module("data");

    //servico responsavel por escrever e recuperar dados referentes a um cadastro de parcelamento local.
    app.service("dbContribuinte",[ 'ngYdn','dbUser','contribuinteEventService','$timeout','$location',  function (ngYdn,dbUser,contribuinteEventService,$timeout,$location) {
        var contexto=this;

        var store="parcelamento"; //variavel
        var keyName="key";

        function makeKey(key){
             if(key==undefined|| key==null) key=localStorage.getItem(store+keyName);
             if(key==undefined|| key==null) key='';

             return [dbUser.getLogedUserLogin(),key];
        }
        //etapas do parcelamento, em ordem
        var etapas=[
            //primeira etapa, selecionar vinculo, cria registro na base
            {
                funcao:function (dbData,data){
                    //dbData=contexto.baseParcelamento();
                    //extensao de objetos
                    data.dataInicioProcessoParcelamento=moment().toObject();
                    angular.extend(dbData,data);
                    return {salvar:true};
                },
                invalidaSelecao:function(dbData){
                    dbData=contexto.baseParcelamento();
                },
                rota:'/cadastro/vinculo'
            },
            //segunda etapa, selecionar grupo de débitos
            {
                funcao:function (dbData,data){
                    if(data==null || data==undefined){
                        //se a quantidade de débitos selecionada for igual a 0 na hora do processamento, volta uma etapa
                        etapas[etapas.indexOf(this)].invalidaSelecao(dbData);
                        return {salvar:true,return: true,reload:false,redirect:false};
                    }else{

                        angular.extend(dbData.grupoDebitos,data.grupoDebitos);
                        dbData.totalDebitosRuc=data.totalDebitosRuc;
                        dbData.debitosSelecionados=[];
                    }
                    return {salvar:true};

                },
                invalidaSelecao:function(dbData){
                    dbData.etapa=-1;
                    dbData.grupoDebitos={};
                },
                rota:'/origem'
            },
            //terceira etapa, seleciona lista de débitos
            {
                funcao:function (dbData,data){
                    //apagar registros e voltar para etapa anterior
                    dbData.debitosSelecionados=[];

                    if(data==null || data==undefined){
                         etapas[etapas.indexOf(this)].invalidaSelecao(dbData);
                         return {salvar:true,return: true,reload:false,redirect:false};
                    }else{
                        etapas[3].invalidaSelecao(dbData);
                        for(var id in data){
                            var base=contexto.baseDebito();
                            if(data[id].valor!=undefined && data[id].valor>0)
                                data[id].total=data[id].valor;

                            angular.extend(base,data[id]);

                            dbData.debitosSelecionados.push(base);
                        }

                        if(dbData.debitosSelecionados.length==0){
                            //se a quantidade de débitos selecionada for igual a 0 na hora do processamento, volta uma etapa
                            dbData.etapa=etapas.indexOf(this)-1;
                        }
                    }

                    return {salvar:true};
                },
                invalidaSelecao:function(dbData){
                    //entende que somente a primeira etapa foi svalida
                    dbData.etapa=0;
                    //invalida a seleção do grupo de débitos
                    dbData.grupoDebitos={};
                    dbData.debitosSelecionados=[];
                },
                rota:'/debitos'
            },
            //quarta etapa simulação
            {
                funcao:function (dbData,data){
                    if(data==null || data==undefined){
                         etapas[etapas.indexOf(this)].invalidaSelecao(dbData);
                         return {salvar:true,return: false,reload:false,redirect:false};
                    }else{
                         angular.extend(dbData,data.simulacao);
                         dbData.modoPagamento.tipo=data.tipoPagamento;
                         return {salvar:true};
                    }
                },
                invalidaSelecao:function(dbData){
                    var baseParc=contexto.baseParcelamento();
                    dbData.etapa=etapas.indexOf(this)-1;
                    dbData.confirmacao={};
                    dbData.valor=baseParc.valor;

                    dbData.numeroParcelas = baseParc.numeroParcelas;
                    dbData.valorParcela = baseParc.valorParcela;
                    dbData.valor = baseParc.valor;
                    dbData.valorEntrada = baseParc.valorEntrada;
                    dbData.juros = baseParc.juros;
                    dbData.honorarios = baseParc.honorarios;
                    dbData.taxaServico = baseParc.taxaServico;
                    dbData.dataVencimento = baseParc.dataVencimento;
                    dbData.totalEntrada = baseParc.totalEntrada;

                },
                rota:'/simulacao'
            },
            //quinta etapa processamento e conclusão do parcelamento
            //nesta etapa a requisição de efetivação do parcelamento é realizada, caso um sucesso, remover registro da base local
            {
                funcao:function (dbData,data){
                    
                    if(data.pagamento.tipo==2){
                            data.pagamento.opcoes.tipoIdentTitular=data.pagamento.opcoes.numeroIdentTitular.length<=11?1:2;
                    }
                    var temp={confirmacao:{
                                parametros:{
                                    //mais pertinentes
                                    numeroParcelas:dbData.numeroParcelas,
                                    valorSinal:dbData.valorEntrada,
                                    codigoMapeamento:dbData.grupoDebitos.codigoMapeamento,

                                    //menos pertinentes
                                    ruc:dbData.ruc,
                                    cpfCnpj:dbData.pessoa.cpf==undefined?dbData.pessoa.cnpj:dbData.pessoa.cpf, //empresa ou pessoa ipva
                                    dataCalculo:moment().format('DD/MM/YYYY'),
                                    valorParcela:dbData.valorParcela,

                                    //soma do total dos débitos
                                    montante:dbData.valor,
                                },

                                debitos:contexto.toDebitoPkArray(dbData.debitosSelecionados),

                                modoPagamento:data.pagamento
                            }};
                    dbData.modoPagamento.opcoes=data.pagamentoDetalhe
                    angular.extend(dbData.pessoa,data.pessoaDetalhe);
                    angular.extend(dbData,temp);
                        
                    return {salvar:true};
                },
                rota:'/confirmacao'
            },
            {
                funcao:function(dbData,data){
                    if(data.continuarParcelamento){

                    }
                },
                rota:'/sucesso',
                //permite que a etapa seja acessada sem redirecioamentos quando algum dado for encontrado na chamada.
                directAcess:true
            }
        ];

        //retorna um parcelamento vazio
        this.baseParcelamento=function(){
            return {
                etapa:-1,
                confirmacao:{},
                dataInicioProcessoParcelamento:moment().toDate(),
                ruc:null,

                pessoa:{
                    nome:null,
                    cpfCnpj:null
                },
                grupoDebitos:{
                    origem:null,
                    grupo:null
                },
                debitosSelecionados:[

                ],
                totalDebitosRuc:null,
                //ini simulacao
                numeroParcelas:null,
                valorParcela:null,
                valor:null,
                valorEntrada:null,
                juros:null,
                honorarios:null,
                taxaServico:null,
                dataVencimento:null,
                totalEntrada:null,
                //fim simulacao

                modoPagamento:{
                        tipo:null,
                        opcoes:null
                    }
                }
        };

        /*
        this.baseModosPagamento= function(tipo){

            var tipos={
                dae:{
                    tipo:1,
                },
                debitoAutomatico:{
                    tipo:2,
                    opcoes:{
                        tipoIdentTitular:null,
                        numeroIdentTitular:null,
                        nomeTitular:null,
                        codigoBanco:null,
                        codigoOperacao:null,
                        codigoAgencia:null,
                        codigoAgenciaDigitoValidado:null,
                        codigoContaCorrente:null,
                        codigoCcontaCcorrenteDigitoValidado:null
                    }
                }
            };
            return tipo;
        }
        */

        //retorna um debito(pk) vazio
        this.baseDebito=function(){
            return {
                codigoDebito:null,
                codigoConta:null,
                checked:null,
                descricao:null,
                periodo:null,
                numeroDocumento:null,
                dividaPrincipal:0,
                multa:0,
                juros:0,
                total:0
            };
        };

        this.returnStoreData=function(options,funcao,errorFuncao){
             if(funcao==undefined) funcao=function(data){console.log(data)};
             if(errorFuncao==undefined) errorFuncao= function(e) {console.error(e.stack);}

             function processaRetorno(data){
                if(data==undefined && options.etapa>0){
                    redirecionar(0);
                //se a data da solicitação for superior a um dia, deletar solicitação
                }else if(data!=undefined
                        && !etapas[options.etapa].directAcess
                        && (data.dataInicioProcessoParcelamento ==undefined  || Math.abs(moment().diff(moment(data.dataInicioProcessoParcelamento)))>=86400000)){
                    //alert('Este processo de parcelamento expirou (existe a mais de um dia). Por favor, reinicie');
                    contexto.remover(options.key);
                    processaRetorno();
                }else{
                    if(data==undefined || data.etapa==undefined){
                        data=contexto.baseParcelamento();
                    }

                    if(options.etapa<0  )
                        options.etapa=0
                    if(options.etapa>=contexto.getEtapasLength())
                        options.etapa=contexto.getEtapasLength()-1;
                    var dif= options.etapa-data.etapa

                    //caso seja maior do que 1, seta pra avançar somente 1
                    if(dif>1){
                            options.etapa=data.etapa+1;
                            redirecionar(options.etapa);
                    }else
                        funcao(data);
                }
            }

             var key=makeKey(options.key);
             if(key!=null && key != undefined)
             {

                ngYdn.db.get(contexto.getStore(), key).always(
                    processaRetorno,
                    errorFuncao
                );
             }
        }

        //retorna o store que esta sendo utilizado
        this.getStore=function(){ //propriedade
            return store;
        };

        this.getEtapasLength=function(){
             return etapas.length;
        }

        this.saveKey=function(key){
             localStorage.setItem(store+keyName)
        }

        this.processarEtapa=function(etapa,data,key,options){
             run(data,key,etapa,options);
        };

        this.remover=function(key,callback){

            ngYdn.db.remove(store,makeKey(key)).then(function(key) {
                if(key==undefined)
                    console.log('registro não encontrado, nada foi deletado!');
                else
                    console.log('deletou registro'+key);
                if(callback!= undefined){
                     callback();
                }
            });
        };

        //arquiva um parcelamento com uma chave
        this.arquivar=function(key,callback){
            if(key!=null && key != undefined)
            {
                var oldKey=makeKey();
                ngYdn.db.get(contexto.getStore(), oldKey).always(
                    function (data) {
                        ngYdn.db.put(contexto.getStore(),data,makeKey(key)).then(function(key) {
                            console.log('arquivou registro'+key);
                        });

                        contexto.remover("",callback);
                    }
                );
            }else
                console.error('parametro key é obrigatório');
        };
        function run(data,key,etapa,options){

            if(options==undefined )
                options={}
            //chave do cadastro sendo realizado, caso nenhuma chave seja passada, tratar como um cadastro de parcelamento que não necessita de revisao local posterior.
            if( options.redirect==undefined)
                options.redirect=true;

            if( options.reload==undefined)
                options.reload=false;

            contexto.returnStoreData({'key':key,'etapa':etapa},function(dbData){

                //valida para não processar etapa futura
                if(etapa<0 || etapa>=contexto.getEtapasLength() ){
                    console.log('não pode processar uma etapa menor do que 0 ou maior que o tamanho máximo de etapas');
                    console.log('Quantidade de etapas: '+contexto.getEtapasLength());
                    console.log('Etapa a ser processada: '+etapa);
                    return ;
                }
                dbData.etapa=etapa;
                //executa a etapa
                var retornoOtp=etapas[etapa].funcao(dbData,data);
                angular.extend(options,retornoOtp);

                if(options.salvar){
                    //salva modificacoes
                    ngYdn.db.put(
                        contexto.getStore() //store
                        ,dbData             //objeto a ser salvo
                        ,makeKey(key)       //chave -> login,'nomeChave'
                    ).then(function(key) {
                        contribuinteEventService.salvouContribuinteBroadcast({key:key,data:dbData});
                        console.log('salvo etapa '+etapa+': '+key[0]+','+key[1]);

                        if(options.reload)
                            redirecionar(etapa);
                        else if(options.redirect)
                            redirecionar(etapa+1);
                        else if(options.return)
                            redirecionar(etapa-1);

                    }, function(e) {
                        console.error(e.stack);
                    });
                }else{
                    if(options.reload)
                        redirecionar(etapa);
                    else if(options.redirect)
                        redirecionar(etapa+1);
                    else if(options.return)
                        redirecionar(etapa-1);
                }


            }, function(e) {
                console.error(e.stack);
            });
        };

        this.listenSaveSucess=function(callback){
            return contribuinteEventService.salvouContribuinteListen(callback);
        }


        function redirecionar(etapa){

            // realizando no próximo digest, chamadas async saem do escopo de digestao, necessario esperar pelo proximo
            $timeout(function () {
                //redireciona somente depois que salva
                //redirecionando para próxima fase
                if(etapas[etapa]!=undefined){
                    console.log('redirecionando para '+etapas[etapa].rota);
                    $location.path(etapas[etapa].rota);
                }else
                    console.log('não existe rota para redirecionar')
            });
        };

        this.toDebitoPkArray =function(debitos){
            var debitoList=[];

            for(var id in debitos){
                debitoList.push({codigoConta:debitos[id].codigoConta,codigoIdentificacao:debitos[id].codigoDebito});
            }

            return debitoList;
        }

    }]);
})();
