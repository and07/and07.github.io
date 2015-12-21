function jsonp(url,id)
{
	var script = document.createElement("script");
	script.setAttribute("id", id);
	script.setAttribute("src", url);
	script.setAttribute("type", "text/javascript");
	document.body.appendChild(script);
}

var host = {'/':'n.actionpay.ru','?subaccount=':'promo.actionpay.ru'};

function getLink(){
    var els = document.getElementsByTagName("a");
    var link = [];
    for (var i = 0, l = els.length; i < l; i++) {
        var el = els[i];
        if(el.getAttribute('data-link') !== null){
            link.push(el);
        }
    }
    return link;
}

function replaceLink2Attr(arr,subid){
    var els = document.getElementsByTagName("a");
    for (var i = 0, l = els.length; i < l; i++) {
        var el = els[i];
        if(el.getAttribute('data-link') !== null){
            var a =  document.createElement('a');
            a.href = el.getAttribute('data-link');
            for(var host in arr){
                if(a.hostname === arr[host]){
                   var new_link =  a.href + host + subid
                   el.setAttribute('data-link', new_link);
                }
            }
        }
    }
}

function replaceLink(arr,subid){
    var els = document.getElementsByTagName("a");
    for (var i = 0; i < els.length; i++) {
        var el = els[i];
        for(var host in arr){
            if(el.hostname === arr[host]){
               el.href = el.href + host + subid;
            }
        }
    }
}

var uniqueId = (new Date()).getTime();
var current_page = window.location.href;

replaceLink(host,uniqueId);
replaceLink2Attr(host,uniqueId);
if(document.referrer){
    var urlq = parseURL(document.referrer);
    //if(urlq.params['q'] !== undefined || urlq.params['text'] !== undefined ){
        var query = urlq.params['q']?urlq.params['q']:urlq.params['text'];

		var id = 'test';
		var url = 'http://178.63.193.79:3000/statistic/?host='+urlq.host+'&query='+query+'&unique_id='+uniqueId+'&current_page='+current_page+'&__id='+__id;			
		jsonp(url,id);         
         
    //}
    //console.log(query);
}

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


