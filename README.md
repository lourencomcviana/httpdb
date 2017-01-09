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
```

```

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
