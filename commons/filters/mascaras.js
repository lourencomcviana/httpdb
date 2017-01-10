(function () {

    var app = angular.module('filters');

    app.filter('currencyNullable',['textHelper','$filter',function(textHelper,$filter) {
       return function (text, optional1, optional2,optional3,defaultWhenValue) {
            if(optional1==undefined)
                optional1='';
            if(optional2==undefined)
                optional2=2;
            if(optional3==undefined)
                optional3='';
            if(typeof defaultWhenValue!='integer' && typeof text!='number' )
                defaultWhenValue=null;

            if(text==undefined || text==null){
                return optional3;
            }

            if(typeof text!='integer' && typeof text!='number'  && typeof text!='string'){
                text=text.toString();
                text=textHelper.replaceAll(text,'','/[a-zA-Z\s+!@#$%¨&*()"!\'=_´\[\]{}]+/');
                text=Number(text);
            }

            if(isNaN(text)|| (defaultWhenValue!=null && text==defaultWhenValue)){
                return optional3;
            }

            text=$filter('currency')(text, optional1,optional2);
            return text;
       }
    }]);


    app.filter('cpf',['textHelper',function(textHelper) {

       return function (cpf) {
            var text=cpf;
            if(text==undefined||text==null)
               return '';
            if(typeof cpf!='string'){
                text=cpf.toString();
                textHelper.replaceAll(text,'',/\D/);
            }
            text=textHelper.fillLeft(text,'0',11)
            return textHelper.format(text, "000.000.000-00");

       }
    }]);

    app.filter('cnpj',['textHelper',function(textHelper) {
       return function (cnpj) {
            var text=cnpj;
            if(text==undefined||text==null)
               return '';
            if(typeof cnpj!='string'){
                text=cnpj.toString();
                textHelper.replaceAll(text,'',/\D/);
            }

            text=textHelper.fillLeft(text,'0',14)
            return textHelper.format(text, "00.000.000/0000-00");

       }
    }]);

    app.filter('cnpjBase',['textHelper',function(textHelper) {
       return function (cnpj) {
            var text=cnpj;
            if(text==undefined||text==null)
               return '';
            if(typeof cnpj!='string'){
                text=cnpj.toString();
                textHelper.replaceAll(text,'',/\D/);
            }

            text=textHelper.fillLeft(text,'0',8)
            return textHelper.format(text, "00.000.000");

       }
    }]);


    app.filter('placa',['textHelper',function(textHelper) {
       return function (text) {
           if(text==undefined||text==null)
               return '';
            if(typeof text!='string' ){
                text=text.toString();
                textHelper.replaceAll(text,'',/ +/);
            }

            if(text.length==7)
                return textHelper.format(text, "000-0000");
            else if(text.length==6)
                return textHelper.format(text, "00-0000");
            else if(text.length==5)
                return textHelper.format(text, "00-000");
            else if(text.length==3)
                return textHelper.format(text, "000");

            return text;


       }
    }]);

    app.filter('renavam',['textHelper',function(textHelper) {
       return function (text) {
           if(text==undefined||text==null)
               return '';
            if(typeof text!='string' ){
                text=text.toString();
                textHelper.replaceAll(text,'',/\D/);
            }
            return text.substring(0,text.length-1)+'-'+text.substring(text.length-1,text.length);
       }
    }]);


    app.filter('periodo',['textHelper','$filter',function(textHelper,$filter) {
       return function (text,yearStart,yearEnd,monthStart,monthEnd,size) {
            if(text!=undefined){
                if(size==undefined)
                    size=6;

                if(typeof text!='string' ){
                    text=text.toString();
                    textHelper.replaceAll(text,'',/\D/);
                }
                var filledText=textHelper.fillLeft(text,'0',size)
                if(filledText!=text)
                    console.log('texto diferente!');
                text=filledText;

                var mes;
                var ano;
                var data;
                if(yearStart!=undefined&&yearEnd!=undefined&&monthStart!=undefined&&monthEnd!=undefined && typeof yearStart== 'number' ){
                    mes=text.substring(monthStart,monthEnd);
                    ano=text.substring(yearStart,yearEnd);
                    data=moment(ano+'-'+mes);
                    if(data.isValid())
                        return data.format('MM/YYYY');
                    return undefined;
                }else if(yearStart!=undefined && typeof yearStart=='string'){
                    yearStart=yearStart.toUpperCase();
                    if(yearStart.startsWith("Y") || yearStart.startsWith("A"))
                        return $filter('periodo')(text, 0,4,4,6,size);
                    else(yearStart.startsWith("M"))
                        return $filter('periodo')(text, 2,6,0,2,size);
                }
                else{
                    //tentar parsear primeiro por ano, caso falhe, tenta por mes
                    var retorno=$filter('periodo')(text, 0,4,4,6,size);
                    if(retorno==undefined)
                        retorno=$filter('periodo')(text, 2,6,0,2,size);

                    return retorno;
                }
            }
            return '';
       }
    }]);

/*
    app.filter('ruc',['textHelper',function(textHelper) {
       return function (text) {
           if(text==undefined||text==null)
               return '';

           if(typeof text!='string'){
               text=text.toString();
               textHelper.replaceAll(text,'',/\D/);
           }
           if(text.length<9){
               text=textHelper.fillLeft(text,'0',9);
           }
               
           return textHelper.format(text, "0".repeat(text.length-7)+".000.000-0"); 
       }
    }]);
*/
    // Alteração na formatação da ruc (Weslley 01/11/16)
    app.filter('ruc',['textHelper',function(textHelper) {
       return function (text) {
           if(text==undefined||text==null)
               return '';

           if(typeof text!='string'){
               text=text.toString();
               textHelper.replaceAll(text,'',/\D/);
           }
           if(text.length>9)
               return textHelper.format(text, "000.000.000-0");
           else     
               return textHelper.format(text, "00.000.000-0"); 
       }
    }]);


    app.filter('cep',['textHelper',function(textHelper) {
       return function (text) {
           if(text==undefined||text==null)
               return '';

           if(typeof text!='string'){
               text=text.toString();
               textHelper.replaceAll(text,'',/\D/);
           }

           text=textHelper.fillLeft(text,'0',8);


           return textHelper.format(text, "00000-000");;
       }
    }]);

    app.filter('mask',['textHelper',function(textHelper) {
       return function (text,mask) {
           if(text==undefined||text==null)
               return '';
           text=text.toString();
           return textHelper.format(text, mask);
       }
    }]);

    app.filter('gsm', function () {
        return function (tel) {
            if (tel == 'undefined' || tel == 'null') { return 'sem LINHA'; }
            if (!tel) { return 'Sem Nº Linha'; }

            var value = tel.toString().trim().replace(/^\+/, '');

            var retorno = "";
            if (value.length === 9) {
                retorno =
                    value[0] + value[1] + value[2] + value[3] + value[4] + " - " +
                    value[5] + value[6] + value[7] + value[8];

            }
            else if (value.length === 8) {
                retorno =
                    value[0] + value[1] + value[2] + value[3] + " - " +
                    value[4] + value[5] + value[6] + value[7];
            }
            else if (value.length === 0) {
                retorno = "sem LINHA";

            }
            else {
                retorno = "Nº Linha inválido"
            }
            return retorno;
        };
    });

    app.filter('date', function () {
        return function (data, to) {

            if (!data) { return ''; }
            else {

                //VARIABLES
                var parsedDate;

                // TEST IF IS ISO8601 OR C# SERIALIZED DATE
                if (data[0] == '/')
                    parsedDate = new Date(parseInt(data.substr(6)));
                else
                    parsedDate = Date.parse(data);

                if (parsedDate == null) { //método de conversão tradicional, contem falhas! Quando entrar aqui procurar passar um formato aceitavel acima
                    parsedDate = new Date(data);
                }

                if (typeof to == 'undefined') to = "dd/MM/yyyy HH:mm:ss";

                return parsedDate.toString(to);

            }
        };
    });
})();
