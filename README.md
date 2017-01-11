# HttpDb
Ajudar a controlar objetos de banco e http

## Objetivo
Ser uma biblioteca que agiliza manipulação de objetos

## Map
Mapeia um objeto noutro

## SwapFunctions

### Parametros
- keys


### Comportamento
A função possui dois comportamentos, onde:
- Quando o objeto possui funções:
  - Remove todas as funções do JSON. Armazena uma cópia delas no documento _httpdbmetadata
  - as pks são armazenadas no metados em lista
- Quando o objeto NÃO possui funções: 


## Dependências
- Dexie.js
- TypeScript
  - npm install -g typescript
- [yeoman](http://yeoman.io/learning/index.html) npm install -g yo
- [node-npm-scaffold](https://www.npmjs.com/package/node-app-scaffold)