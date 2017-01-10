# Cancelado!
Melhor criar um js que disponibilize ferramentas para auxiliar 
no processo


# HttpDb
Mannage http and local storage objects and requests

## Objetivo
Ser um middleware entre requisições http e da base local. 
Sincronizando e organizando as requisições de ambos em um único
objeto comum para as duas fontes de dados. Facilitando a sincronização
entre os dois ambientes.

1. Útil quando o serviço não pode ser manipulado para atender todos os seus caprichos
2. Torna as respostas dos serviços mais adequadas para as necessidades da aplicação

## Locais
- base local: indexDB acessado pelo Dexie.js
- http: servidor remoto 

## Função de requisição

Função responsável por retornar http


### Estrutura:
* run: função que realiza a requisição

exemplo:
```
{
    parans: "any parans you want"
    run: function(callback){
        $http.get('www.google.com.br').then(callback(data))
    },
    callback: function (data){console.log(data)}
}

function(){

}
function(callback,filter){
    var filterStr='';
    for (id in filter){
        filterStr+=id+'='+filter[id]+'&';
    }
    
    $.ajax({
    url: "www.google.com.br?"+filterStr,
        data: data,
        success: callback, //depende da implementação do usuário
        dataType: dataType
    });

    return null; //jquery dosent use promisses...
}
```

## Objeto de requisição

Objeto que define como deve ser realizada a requisição sempre que
necessário

### Callback de progresso

Progresso: 
1. realizar requisições
2. 
- Para cada requisição terminada é chamado o callback de progresso
- 

### Requisição encadeada

Alguns objetos de requisição precisam que outra requisição seja realizada para preenchelos



### Estrutura

* name: Nome da requisição. Caso existam configurações 
        cadastradas para esta requisição, estas serão usadas
* filter: objeto com nome dos filtros e seus valores
* request: função responsável por realizar a requisição
  * retorno: a função deve retorna um objeto seguindo as especificações da estrutura de função de requisição 
* callback: função a ser chamada após a conclusão da requisição



## Validade 

Uma função de avaliação que, ao ser acionada, retorna se o 
objeto local ainda é válido

### Estrutura
```

```

## Mapeamento

Para que o objetivo seja alcansado, um objeto de mapeamento deve Ser
fornecido, o Objeto de mapeamento será responsável por pegar todas as
respostas do servidor http e mapear para um único objeto que será armazenado
no banco local.

### Estrutura
```

```


## Dependências
- Angular (tentar remover depenências do angular ou torna-las opcionais)
  - (nativos)
    - $http (usuário poderá escolher qual função realizará a requisição, como tratar promisses assim?)
    - $timeout
- Dexie.js
