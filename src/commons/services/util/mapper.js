
(function () {
    var app = angular.module("utilService");

    app.service("mapper",[   function () {
        var service=this;
        //funções publicas -----------------------------------------------------------------------
        
        
        /* funcao map -> 
        * mapeia um objecto para outro possibilitando o uso de apelidos e funções que processem 
        * resultados durante a execução
        * Parametros:
        * - target[Object]: Objeto que será usado como referencia do mapeamento. deve ser uma classe instanciada
        * - source[Object]: Objeto que contem os dados que serão aplicados no target
        * - config[Object]: contem os alias e os processadores para cada campo do target quando especificado 
        * - options[Object]: Objeto que contem opções que influenciam no funcionamento do map
        * -- treatArrayAsValue[boolean]: quando verdadeiro e source seja um array. vão ser tratados como um único valor
        Exemplo:
        function Teste(){
            this.descricao=null;
            this.id=null;
            this.valor=null;
        }
       
        var source=[
            {id:'222-435.2',nome:'fulano',valor:100},
            {codigo:'33-123,2',sobrenome:'ciclano',valor:2},
            {id:'222,2',nOmeMeIo:'declano',valor:3},
            'Uma pessoa qualquer'
        ]
        
        //usando o mapper
        var saida = mapper.map(new Teste(),source,{
            //nome do campo que deseja mapear no target
            id:{  
                //quando for encontrado o campo codigo associar ao campo id
                alias:'codigo',
                //gostaria que o id fosse um número, uma função dentro da opção parse permite processar o valor adiquirido
                parse:function(valor){
                    if(valor==undefined)
                      return null;
                    return Number(valor.replace('-','').replace(',','.'));
                }
            },
            //quando um array ou string são passados. Eles são automaticamente considerado alias
            descricao:[
              //uma string simples pode ser passada como alias
              'nome',
              //funções podem ser usadas para retornar o nome do alias
              function(data){ 
                console.log('este é o objeto presente dentro do parametro passado quando se trabalha com alias: '+JSON.stringify(data)) 
                return 'sobrenome'
              },
              //caso seja retornado um valor booleano. Quando verdadeiro, o valor de source será usado para definir o valor em target
              function(data){ 
                //nomemeio não está cammel case. As vezes vem caixa alta, as vezes baixa, uma solução seria esta:
                for(var id in data.source){
                  if(id.toLowerCase()=='nomemeio'){
                    return id;
                  }
                }
              },

              //caso source seja uma string, iremos considerar este campo para receber o valor de source
              //quando um valor booleano é retornado e ele for verdadeiro
              //  o mapper vai tentar reconhecer source como um valor válido para o campo. 
              //  Onde se source for um objeto, ele tentará extrair o valor de source baseado do nome em target, nesse caso
              //  o mapper tentará executar o comando: source.descricao.
              //  quando source não for um Objeto, o mapper associará o valor diretamente ao campo, como no caso do quarto item do array
              //caso o valor seja falso
              //  o valor é ignorado e não será atribuido no target
              function(data){ 
                return typeof data.source==='string';
              }
            ],
            //quando uma função for especificada. O mapper vai considerar que ela é um parse e não um alias
            valor:function(data){
              //quando nenhum valor for especificado, associar 0
              if(data==undefined|| data==null){
                return 0;
              }
              return data;
            },
            //quando um campo não existir em target, ele não será utilizado
            campoInexistente:'aliasDummy'
        });
        console.log(saida);
        // para outro exemplo de implementação checar. Método que usa internamente o mapper para mapear as configurações que o usuário passa (objeto que construimos acima)
        // bem mais complexo que o exemplo a cima
        // mapper.mapConfig.factory.toString()
        */
        this.map=map;
        this.mapConfig=Config;
        //recupera valor a partir de um caminho (string) especificado
        this.path=pathValue;
        //adiciona parametros somente quando possuirem valor
        this.addParameter=addParameter;
        //funções privadas -----------------------------------------------------------------------
        function Config(){
            this.alias=null;
            this.parse=null;

        };
        //parse all configs
        Config.factory=function(param){
            if(param==undefined){
                return null;
            }
            if(param.constructor.name=="Config"){
                return param;
            }
            for(var id in param){
                var config=param[id];
                if(config==undefined){
                    param[id]= new Config();
                    continue;
                }
                //já foi parseado
                if(config.constructor.name=="Config"){
                    continue;
                }
                
                //configuração do parse da configuração (que lindo)
                var configConfigurantion= {
                    alias:new Config(),
                    parse:new Config()
                }
        
                configConfigurantion.alias.alias=function(data){
                    //caso seja função na raiz, NÃO é um alias
                    return (data!=null && data!=undefined && typeof data.source !='function');   
                }
                
                configConfigurantion.parse.alias=function(data){
                    //caso seja função na raiz, é um alias
                    return (data!=null && data!=undefined && typeof data.source =='function');
                }

                param[id]=map(new Config(),config,configConfigurantion,{treatArrayAsValue:true});
            }
            return param;
        }
        
          
        function map(target,source,config,options){
            
            function alias(config,source,idSource){
                var value=null;
                if(typeof config=='string'){
                    if(config==''){
                        value=source;
                    }else{
                        value =  pathValue(source,config);//source[ config];
                    }
                }else if(typeof config=='function'){
                    var saida=config({
                        source:source,
                        name:idSource,
                        getSource:function(){return this.source[this.name]}
                    });
                    
                    if(saida!=null && saida !=undefined){
                            //se for verdadeiro, a fonte já é um alias
                            if(saida===true){
                               if(typeof source==='object' && !isArray(source) &&  source[idSource]!=undefined )
                                   return source[idSource];
                               else
                                  //utilizado quando o elemento passado não é um objeto
                                  return source;
                            }else {
                               //utilizar resultado da função para calcular o alias
                               return alias(saida,source,idSource);
                            }
                    }

                    
                 
                    
                    
                }else if(isArray(config)){
                    for(var id in config){
                        value=alias(config[id],source,idSource);
                        if(value!=null){
                            break;
                        }
                    }
                }
                
                //se for nullo tentar ignorar o alias e utilizar método padrão
                if((value==undefined || value==null) &&  source[idSource]!=undefined &&  source[idSource]!=null ){
                    return source[idSource];                   
                }
                return value;

            }

            function extrair(target,source){
                 for(var id in target){
                    
                    if(config==null ||config[id]==null || config[id]==undefined){     
                        if(typeof target[id]!='function' || typeof source[id]=='function' ){
                             target[id]=source[id];
                        }
                    }else{
                        var value;
                        if(config[id].alias!=undefined || config[id].alias!=null){
                            value=alias(config[id].alias,source,id);
                        }else{
                            value=source[id];
                        }
                        
                        if( config[id].parse!=undefined || config[id].parse !=null){
                            value=config[id].parse(value);
                        }
                            
                        //if(value!=null){
                        target[id]=value;
                        //}
                    }
                }
                return target;
            }
            //validação
            if(target==null || target==undefined){
                console.warn('Its not possible to work with null or undefined target type')
                return target;
            }
            if(typeof target!='object'){
                console.warn('Its not possible to work with this target type: '+typeof target)
                return target;
            }
            //if(target.constructor.name=='Object' ){
            //    console.warn('Target must be a instance of a class diferent tham Object');
            //    return target;
            //}
            
            if(source==null|| source==undefined) {
                console.warn('Its not possible to work with null or undefined source type')
                return target;
            }

            if(options==undefined)
                options={};
            //adequa o config
            config=Config.factory(config);
            
            
            if(isArray(source)){
                if(options.treatArrayAsValue===true){
                    return extrair(target,source);
                }else{
                    var lista=[];
                    for(var id in source){
                        var t=new target.constructor();
                        lista.push(extrair(t,source[id]));
                    }
                    return lista;
                }
            }else{
                return extrair(target,source);
            }
        }
        
        function addParameter(target,source,param){
            var saida;
            if(target == null || typeof target != 'object'){
                //perde a referência quando é cosntruido um novo objeto
                saida={};
            }else{
                saida=target;
            }

            var valor;
            if(typeof source=='object'){
                valor=source[param];
            }else{
                valor=source;
            }
            
            if(valor!=null && valor!=undefined && valor!=''){
                 saida[param]=valor;
            }

            return saida;
        }

        function pathValue(data,path){
            function getValue(data,keyPath,position){
                if(position<keyPath.length){
                    var tempData=data[keyPath[position]];
                    if(tempData ==null || tempData==undefined){
                        return tempData;
                    }else if(position<(keyPath.length-1) && typeof tempData != 'object')
                    {
                        return undefined;
                    }else{
                        position++;
                        return getValue(tempData,keyPath,position);
                    }
                }else{
                    return data;
                }
            }
            if(data==null || data==undefined)
                return data;

            var keyPath=path.split('.');
            return getValue(data,keyPath,0);
        }

        function isArray(obj){
            return  Object.prototype.toString.call(obj) === '[object Array]'
        }
    }]);
})();