(function () {
    var app = angular.module("data");

    app.service("ngYdn", function () {
        this.db = new ydn.db.Storage(config.db.name, {stores: config.db.stores});
    });

    //dexie js
    app.service("dexie", function () {
          //Dexie.delete('parcelamento_dexie');
          this.db= new Dexie("parcelamento_dexie");
          this.db.version(1).stores({
              acompanhamento: '[cod+dataRequisicao],dataRequisicao,id,quantidade,origem,situacao,valorParcelado'
          });
          this.db.open().catch(function (e) {
              console.error ("Open dexieDB failed: " + e);
          });

          this.removeFunctions = function(obj){
              
          }
    });
})();