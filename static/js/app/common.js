
"use strict";

// этот код будет работать по стандарту ES5

/*
* use
* lazyLoad('plugins/js/bootstrap-accessibility.min.js');
*/
var lazyLoad = function(jsWithPath, callback) {
var script = document.createElement('script');
script.type = 'text/javascript';
if (typeof callback != 'undefined') {
    if (script.readyState) {
        script.onreadystatechange = function() {
            if (script.readyState == 'loaded' || script.readyState == 'complete') {
                callback();
            }
        }
    } else {
        script.onload = function() {
            callback();
        }
    }
}
script.src = jsWithPath;
document.getElementsByTagName('head')[0].appendChild(script);
}
/*
  if (window.addEventListener){
    window.addEventListener("load", function(){
       lazyLoad('plugins/js/bootstrap-accessibility.min.js');
    }, false);
  }else if (window.attachEvent) {
    window.attachEvent("onload", function(){
       lazyLoad('plugins/js/bootstrap-accessibility.min.js');
    });
  }
*/

//https://developer.tizen.org/dev-guide/2.2.1/org.tizen.web.appprogramming/html/tutorials/w3c_tutorial/comm_tutorial/upload_ajax.htm

   function upload() 
   {
      var client = new XMLHttpRequest();
      var file = document.getElementById("uploadfile");
     
      /* Create a FormData instance */
      var formData = new FormData();
      /* Add the file */ 
      formData.append("upload", file.files[0]);

      client.open("post", "/upload", true);
      client.setRequestHeader("Content-Type", "multipart/form-data");
      client.send(formData);  /* Send to server */ 
       /* Check the response status */  
       client.onreadystatechange = function() 
       {
          if (client.readyState == 4 && client.status == 200) 
          {
             alert(client.statusText);
          }
       }
   }
     
function form2obj(form) {
    var obj = {};
        var names = [], customCallback = false, i, opt, action, href = "";
        var selects = form.getElementsByTagName("select");


        // селекты
        for (i = 0; i < selects.length; i++) {

            var options = selects[i].options;

            for (opt = 0; opt < options.length; opt++) {

                if (options[opt].selected ) {
                    obj[selects[i].name] = options[opt].value;

                    //names.push(selects[i].name);
                    //href += "&" + selects[i].name + "=" + options[opt].value;
                    break;
                }

            }

        }


        // текстарии
        var texts = form.getElementsByTagName("textarea");

        for (i = 0; i< texts.length; i++) {                
                obj[texts[i].name] = texts[i].value;

                //names.push(texts[i].name);
                //href += "&" + texts[i].name + "=" + encodeURIComponent(texts[i].value);
        }


        var elems = form.getElementsByTagName("input");


        // инпуты
        for (i = 0; i< elems.length; i++) {


                names.push(elems[i].name);


                if (elems[i].type == "checkbox" && elems[i].checked) {
                    //href += "&" + elems[i].name + "=on";
                     obj[elems[i].name] = 'on';


                } else if (elems[i].type == "text" || elems[i].type == "password" || elems[i].type == "hidden") {

obj[elems[i].name] = elems[i].value;

/* 
                   if (elems[i].type == "hidden" && elems[i].name == "callback") {
                        customCallback = elems[i].value;
                         
                    } else {
                        href += "&" + elems[i].name + "=" + encodeURIComponent(elems[i].value);
                    }
*/

            }else if (elems[i].type == "file"){
            obj[elems[i].name]= elems[i].files[0];
            }


        }

	return obj;
}

function _form2obj(form) {
    var obj = {};
     var formData = new FormData();
        var names = [], customCallback = false, i, opt, action, href = "";
        var selects = form.getElementsByTagName("select");


        // селекты
        for (i = 0; i < selects.length; i++) {

            var options = selects[i].options;

            for (opt = 0; opt < options.length; opt++) {

                if (options[opt].selected ) {
                    obj[selects[i].name] = options[opt].value;
                    formData.append(selects[i].name, options[opt].value);
                    //names.push(selects[i].name);
                    //href += "&" + selects[i].name + "=" + options[opt].value;
                    break;
                }

            }

        }


        // текстарии
        var texts = form.getElementsByTagName("textarea");

        for (i = 0; i< texts.length; i++) {                
                obj[texts[i].name] = texts[i].value;
                formData.append(texts[i].name, texts[i].value);
                //names.push(texts[i].name);
                //href += "&" + texts[i].name + "=" + encodeURIComponent(texts[i].value);
        }


        var elems = form.getElementsByTagName("input");


        // инпуты
        for (i = 0; i< elems.length; i++) {


                names.push(elems[i].name);


                if (elems[i].type == "checkbox" && elems[i].checked) {
                    //href += "&" + elems[i].name + "=on";
                     obj[elems[i].name] = 'on';
                     formData.append(elems[i].name, 'on');

                } else if (elems[i].type == "text" || elems[i].type == "password" || elems[i].type == "hidden") {

obj[elems[i].name] = elems[i].value;
formData.append(elems[i].name, elems[i].value);
/* 
                   if (elems[i].type == "hidden" && elems[i].name == "callback") {
                        customCallback = elems[i].value;
                         
                    } else {
                        href += "&" + elems[i].name + "=" + encodeURIComponent(elems[i].value);
                    }
*/

            }else if (elems[i].type == "file"){
            formData.append(elems[i].name, elems[i].files[0]);
            }


        }

	return formData;
}

function createRow(data)
{
var cell,currenttext;
var row = document.createElement("tr");
for(var key in data) {
    cell = document.createElement("td");
    if(key === 'elm'){
        //currenttext = document.createTextNode(data[key]);
        //cell.appendChild(currenttext);  
        cell.innerHTML   = data[key];
    }else{
        currenttext = document.createTextNode(data[key]);
        cell.appendChild(currenttext);
    }
    row.appendChild(cell);

}
return row;
}



/*
* http://htmlweb.ru/ajax/no_ajax.php
*/
function makeIFrame(url) {
    var id = 'f' + Math.floor(Math.random() * 99999);
    var ifrm = document.createElement("IFRAME"); 
    ifrm.setAttribute("src", url); 
    ifrm.id = id;
    ifrm.style.width = 0; 
    ifrm.style.height = 0; 
    document.body.appendChild(ifrm);
    return document.getElementById(id);
} 
function createIFrame() {
  var id = 'f';// + Math.floor(Math.random() * 99999);
  var div = document.createElement('div');
  div.innerHTML = '<iframe style="display:none" src="about:blank"'+' id="'+id+'" name="'+id+'" onload="sendComplete('+id+')"></iframe>';
  document.body.appendChild(div);
  return document.getElementById(id);
}
function getFrameContents(iFrame){
   var iFrameBody;
   if ( iFrame.contentDocument ) 
   { // FF
     iFrameBody = iFrame.contentDocument.getElementsByTagName('body')[0];
   }
   else if ( iFrame.contentWindow ) 
   { // IE
     iFrameBody = iFrame.contentWindow.document.getElementsByTagName('body')[0];
   }

   return iFrameBody.innerHTML;
 }

function getIFrameXML(iframe) {
  var doc=iframe.contentDocument;
  if (!doc && iframe.contentWindow) doc=iframe.contentWindow.document;
  if (!doc) doc=window.frames[iframe.id].document;
  if (!doc) return null;
  if (doc.location=="about:blank") return null;
  if (doc.XMLDocument) doc=doc.XMLDocument;
  return doc;
}


/***
*
*
*
*
*
***/
/*
﻿var o = [{
tes:1,
ref :'g'
},
{
tes:1,
ref :'g'
},
{
tes:1,
ref :'g'
},
{
tes:1,
ref :'y'
},
{
tes:1,
ref :'y'
},
{
tes:1,
ref :'m'
}
];
*/
function obj2arr4key(o,key){
	var arr = new Array();
	for(var k in o){
		if(o[k][key]){
			arr.push(o[k][key]);
		}
	}
	return arr;
};

function groupData(x){
	var obj = {};
	for(var k in x){
		if(obj[x[k]]){
			obj[x[k]] = parseInt(obj[x[k]])+1;
		}else{
			obj[x[k]] = 1;
		}
	}
	return obj;
};

function obj2chart(obj){
	var arr = new Array();
	for(var k in obj){
		arr.push([k,obj[k]]);
	}
	return arr;
};


 //console.log(obj2chart(groupData(obj2arr4key(o,'ref'))));

 


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
/**************PARSE*******************/


   //http://jsperf.com/virtual-dom-vs-real-dom

    function virtualH(tagName, props, children) {
        if (Array.isArray(props) || typeof props === 'string') {
            children = props;
            props = {};
        }
        children = children || [];
        if (typeof children === 'string') {
            children = [children];
        }
    
        return {
            tagName: tagName,
            props: props || {},
            childNodes: children.map(function toNode(n) {
                if (typeof n === 'string') {
                    return { data: n };
                } else {
                    return n;
                }
            })
        };
    }
    
    //
    function domH(tagName, props, children) {
        if (Array.isArray(props) || typeof props === 'string') {
            children = props;
            props = {};
        }
        children = children || [];
        props = props || {};
        if (typeof children === 'string') {
            children = [children];
        }
    
        var node = document.createElement(tagName);
        Object.keys(props).forEach(function setProp(propName) {
            //
            if (typeof props[propName] === 'string' && propName != 'className') {
                 node.setAttribute(propName, props[propName]);
            }else{
                node[propName] = props[propName];
            }

        });
    
        children.forEach(function addNode(n) {
            if (typeof n === 'string') {
                node.appendChild(document.createTextNode(n));
            } else {
                node.appendChild(n);
            }
        });
        return node;
    }
	function v() {
	var type = {}.toString
	var parser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g, attrParser = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/
	var voidElements = /AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TR‌​ACK|WBR/        
		var args = arguments
		var hasAttrs = args[1] != null && type.call(args[1]) == "[object Object]" && !("tag" in args[1]) && !("subtree" in args[1])
		var attrs = hasAttrs ? args[1] : {}
		var classAttrName = "class" in attrs ? "class" : "className"
		var cell = {tag: "div", attrs: {}}
		var match, classes = []
		while (match = parser.exec(args[0])) {
			if (match[1] == "") cell.tag = match[2]
			else if (match[1] == "#") cell.attrs.id = match[2]
			else if (match[1] == ".") classes.push(match[2])
			else if (match[3][0] == "[") {
				var pair = attrParser.exec(match[3])
				cell.attrs[pair[1]] = pair[3] || (pair[2] ? "" :true)
			}
		}
		if (classes.length > 0) cell.attrs[classAttrName] = classes.join(" ")

		cell.children = hasAttrs ? args[2] : args[1]

		for (var attrName in attrs) {
			if (attrName == classAttrName) cell.attrs[attrName] = (cell.attrs[attrName] || "") + " " + attrs[attrName]
			else cell.attrs[attrName] = attrs[attrName]
		}
		
		return domH(cell.tag,cell.attrs,cell.children)    
	}

/**USE
*********************************************    
    function virtualLink(uri, text, isSelected) {
        return virtualH('li', [
            virtualH('a', {
                className: isSelected ? 'selected' : '',
                href: uri
            }, text)
        ]);
    }
    
    function domLink(uri, text, isSelected) {
        return domH('li', [
            domH('a', {
                className: isSelected ? 'selected' : '',
                href: uri
            }, text)
        ]);
    }


console.log(v('div#fghfgh.dfg', {}, [m('a.dfg',{},[m('.rr',{},[m('span',{},'ddddddd')])])]));
console.log(virtualLink('ffg', 'test', true));
console.log(domLink('fghfgh', 'test', true));
*/



