//
//
//
var storageSup = {
   "has_html5_storage" : function () {
        try {
          return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
          return false;
        }
     },
   "putCsv": function(csvdata,chkHeader,delimiter,quoteChar,backslash) {
       if (!this.has_html5_storage()) return;
       //alert("LocalStorage:" + chkHeader + "/" + delimiter);
       localStorage.setItem("csv",csvdata);
       localStorage.setItem("csvChkHeader",chkHeader);
       localStorage.setItem("csvDelimiter",delimiter);
       localStorage.setItem("csvQuote",quoteChar||'"');
       localStorage.setItem("csvBackslash",backslash);

    },

   "getCsv": function() {
        if (!this.has_html5_storage()) return "";
        return localStorage.getItem("csv") || "";
   }

};
