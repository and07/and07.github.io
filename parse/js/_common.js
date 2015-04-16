/*
;( function( w, q, undefined ) {
        
        "use strict";
        
        var     qObject = {},
                qCollection,
                i = 0,
                urlq = {
                        count: 0,
                        source:null,
                        protocol:null,
                        host:null,
                        port:null,
                        query:null,
                        params:null,
                        file:null,
                        hash:null,
                        relative:null,
                        segments:null,
                        set:function(){},
                        get: function() {},
                        exists: function() {}
                };

        //give it to the people
        w.urlq = urlq;
        
        //If there is no query, exit
        if( !q ) {
                return;
        }
        
        q = decodeURIComponent( q );
        
        var a =  document.createElement('a');
        a.href = q;

        urlq.source = q;
        urlq.protocol = a.protocol.replace(':','');
        urlq.host = a.hostname;
        urlq.port = a.port;
        urlq.query = a.search;
        urlq.params = (function(){
            var ret = {},
                seg = a.search.replace(/^\?/,'').split('&'),
                len = seg.length, i = 0, s;
            for (;i<len;i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })();
        urlq.set = function(){}
        urlq.file = (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1];
        urlq.hash = a.hash.replace('#','');
        urlq.path = a.pathname.replace(/^([^\/])/,'/$1');
        urlq.relative = (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1];
        urlq.segments = a.pathname.replace(/^\//,'').split('/');      
        
        //build query object
        qCollection = q.slice( 1 ).split( '&' );
        for( ; i < qCollection.length; i ++ ) {
                var entry = qCollection[ i ].split( '=' );
                qObject[ entry[ 0 ] ] = entry[ 1 ];
        }
        
        //count of query params
        urlq.count = qCollection.length;

        //get value from key
        urlq.get = function( key ) {
                return qObject[ key ];
        };

        //exists by key
        urlq.exists = function( key ) {
                return qObject[ key ] !== undefined;
        };

}( window, window.location.search ) );
/*
Example url: http://www.google.com?q=kittens
urlq.get( paramName ) returns the value for the given param name (string).
var searchVal = urlq.get( 'q' ); //Returns 'kittens'
var searchFilter = urlq.get( 'z' ); //Returns undefined
urlq.exists( paramName ) returns bool for provided param name.
var hasSearch = urlq.exists( 'q' ); //Returns true
var hasFilter = urlq.exists( 'z' ); //Returns false
urlq.count returns count of paramaters.
urlq.count //returns 1
*/



/***
var myURL = parseURL('http://abc.com:8080/dir/index.html?id=255&m=hello#top');
 
myURL.file;     // = 'index.html'
myURL.hash;     // = 'top'
myURL.host;     // = 'abc.com'
myURL.query;    // = '?id=255&m=hello'
myURL.params;   // = Object = { id: 255, m: hello }
myURL.path;     // = '/dir/index.html'
myURL.segments; // = Array = ['dir', 'index.html']
myURL.port;     // = '8080'
myURL.protocol; // = 'http'
myURL.source;   // = 'http://abc.com:8080/dir/index.html?id=255&m=hello#top'

****/

function parseURL(url) {
    //url = decodeURIComponent( url );
    url = decodeURI( url );
    var a =  document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':',''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function(){
            var ret = {},
                seg = a.search.replace(/^\?/,'').split('&'),
                len = seg.length, i = 0, s;
            for (;i<len;i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^\/])/,'/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
        segments: a.pathname.replace(/^\//,'').split('/'),

    };
}

function fillSel(obj_name, data)
{
	//console.log(data);
	var _obj = document.getElementById(obj_name);
	for(var i=0; i < data.length; i++){
		var NewOpt=document.createElement('OPTION');
		var dataOpt = data[i];
		for(var key in dataOpt){
			if(key === 'text' ){
				 var text = document.createTextNode(dataOpt[key]);
				 NewOpt.appendChild(text);
			}else{
				NewOpt.setAttribute(key, dataOpt[key]);
			}
		}
		 _obj.appendChild(NewOpt);
	}
}
function isInteger(num) {
  return (num ^ 0) === num;
}

var clean = function(arr,deleteValue){
    for (var i = 0; i < arr.length; i++)
    {
        if (arr[i] == deleteValue)
        {         
            arr.splice(i, 1);
            i--;
        }
    }
    return arr;
};
/*
 *USE
 *clean(arr,null);
 *clean(arr,"");
 *clean(arr,undefined);
 */

function sm_ext_validateEmail(email) { 
  // http://stackoverflow.com/a/46181/11236
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function setCookie(c_name,value,exdays)
{
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? ";path=/;" : ";path=/; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name)
{
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++)
    {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
        x=x.replace(/^\s+|\s+$/g,"");
        if (x==c_name)
        {
            return unescape(y);
        }
    }
	return false;
}
function delCookie(c_name)
{
    setCookie(c_name,null,-3);
}

function implode( glue, pieces ) {	
	//// Join array elements with a string
	// 
	// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +   improved by: _argos

	return ( ( pieces instanceof Array ) ? pieces.join ( glue ) : pieces );
}

function sortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'id': prop,
                'name': obj[prop]['name'],
				'order_num':obj[prop]['order_num']
            });
        }
    }
    arr.sort(function(a, b) { return a.order_num - b.order_num; });
    return arr; // returns array
}
var frm = function(value, max, add)
{
	var a = add || '';
	return (value.length > max) ? (value.substring(0, max) + a) : value;
}
