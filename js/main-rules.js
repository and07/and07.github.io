"use strict";
function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
} catch (e) {
    return false;
  }
}

Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   var _hh = this.getHours().toString(); 
   var _mm = this.getMinutes().toString();  
   var _ss = this.getSeconds().toString();  
   return yyyy + '-' + ( mm[1]?mm:"0"+ mm[0] ) +'-' + (dd[1]?dd:"0"+dd[0]) + ' '+ _hh+':'+_mm+':'+_ss; // padding
};

function setlocalStorageParser (data){
	localStorage['parser']= JSON.stringify(data); 
}
function getParserData(){
	if(localStorage['parser']){
		var parser = JSON.parse(localStorage['parser']) || {};
		return parser;
	}
	return false;
}
function getlocalStorageParser (){
	return getParserData(); 
}


function addParseList(){
	var parser = getParserData();
	for(var k in parser){
		parseList.add(parser[k]);
	}
}
function loadXMLString(txt) 
{
	if (window.DOMParser)
	  {
	  var parser=new DOMParser();
	  var xmlDoc=parser.parseFromString(txt,"text/xml");
	  }
	else // code for IE
	  {
	  var xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
	  xmlDoc.async=false;
	  xmlDoc.loadXML(txt); 
	  }
	return xmlDoc;
}
function delBaseTag(el){
	var head = el.getElementsByTagName("head")[0]
	var oldBase = el.getElementsByTagName("base")[0];
	if(oldBase){
		head.removeChild(oldBase);
	}
}

function addBaseTag(el,url){
	delBaseTag(el);
	var newBase = el.createElement("base");
	newBase.setAttribute("href", url);
	var head = el.getElementsByTagName("head")[0];
	var theFirstChild = head.firstChild;
	// Insert the new element before the first child
	head.insertBefore(newBase, theFirstChild);	
    //el.getElementsByTagName("head")[0].appendChild(newBase);
}
function getIframeContent(id) { 

    var iframe = document.getElementById(id); 

    var doc; 

    if(iframe.contentDocument) { 
        doc = iframe.contentDocument; 
    } else {
        doc = iframe.contentWindow.document; 
    }
    return doc;
} 
function populateIframe(id,text) {
	var doc = getIframeContent(id);

	doc.body.innerHTML = text;
		
	return doc;
} 
function getRadioVal(name) {
    	var val = null;
	var radios = document.getElementsByName(name);

	for (var i = 0, length = radios.length; i < length; i++) {
	    if (radios[i].checked) {
	        // do whatever you want with the checked radio
	        return radios[i].value;
	
	        // only one radio can be logically checked, don't check the rest
	        break;
	    }
	}
    	return val; // return value of checked radio or undefined if none checked
}
/*****************************************************************************************/
var SetIntervalID = -1;

function showRunDialog(row)
{
	var scrid = $(row).parent().parent().find('td:nth-child(1)').text();
	var data = {};
	/*
	$.ajax({url: '/main/runstatus',
        type: 'POST',
        dataType: 'json',
        data: {scrid: scrid},
        success: function(data) {
		*/
        	var $win = $('#runcontrol');
        	$win.find('#btnstop').hide();
        	$win.find('#btnrun').show();
        	
        	$win.find('input[name="scrid"]').val(scrid);
        	$win.find('input[name="runtype"]').val([data.runtype]);
        	$win.find('input[name="sheduledate"]').val(data.sheduledate);
        	$win.find('input[name="sheduletime"]').val(data.sheduletime);
        	$win.find('select[name="repeat"]').val(data.repeat);
        	
        	setstatus(data);
        	
        	SetIntervalID = setInterval(updatestatus, 10000);
        	        	
        	$win.fadeIn('slow').css('left', ($(window).width()-$win[0].offsetWidth)/2);
        	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2);
	/*
        }, 
	});
	*/
}

function updatestatus()
{
	var scrid = $('#runcontrol input[name="scrid"]').val();
	/*
	$.ajax({url: '/main/runstatus',
        type: 'POST',
        dataType: 'json',
        data: {scrid: scrid},
        success: function(data) {
        	setstatus(data);
        }, 
	});
	*/
}

function runclick()
{
	var data = {};
	data.scrid = $('#runcontrol input[name="scrid"]').val();
	data.runtype = $('#runcontrol input[name="runtype"]:checked').val();
	data.sheduledate = $('#runcontrol input[name="sheduledate"]').val();
	data.sheduletime = $('#runcontrol input[name="sheduletime"]').val();
	data.repeat = $('#runcontrol select[name="repeat"]').val();
	
	$.ajax({url: '/main/runcontrol',
        type: 'POST',
        dataType: 'json',
        data: {data: data},
        success: setstatus, 
	});
}

function setstatus(data)
{
	$('#runcontrol .runstatus').hide();
	$('#runcontrol #'+data.runstatus).show();
	if (data.runstatus == 'run' || data.runstatus == 'waitshed' || data.runstatus == 'wait')
	{
		$('#runcontrol #btnrun').hide();
		$('#runcontrol #btnstop').show();
	}
	else {
		$('#runcontrol #btnrun').show();
		$('#runcontrol #btnstop').hide();
	}
	$('#runcontrol .myprogressbar span').css('width', data.runprogress+'%');
}

var files = {};
var curdir = '';
var delmsg;

function showResultDialog(row)
{
	var scrid = $(row).parent().parent().find('td:nth-child(1)').text();
	var data = {};
	/*
	$.ajax({url: '/main/runresult',
        type: 'POST',
        dataType: 'json',
        data: {scrid: scrid},
        success: function(data) {
		*/
        	var $win = $('#runresult');
        	
        	$win.find('#scrname').text(data.name);
        	$win.find('#startpage').text(data.startpage);
        	$win.find('#lastrun').text(data.lastrun);
        	$win.find('#runoutput').html(data.runoutput);
        	
        	$win.find('#zip').attr('href', data.zip);
        	$win.find('#delall').attr('href', data.deleteall);
        	
        	files = data.files ? data.files : {};
        	delmsg = data.delmsg;
        	showResultDir(files);
        	
        	$win.fadeIn('slow').css('left', ($(window).width()-$win[0].offsetWidth)/2);
        	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2);
	/*
        }
	});
	*/
}


function showResultDir(dir)
{
	$('#runresult #files tbody').empty();
	for (var name in dir)
	{
		var url = (dir[name] instanceof Object || dir[name]=='..') ? '#' : dir[name];
		var str = '<tr>';
		var cls = (name == '..') ? 'folderup' : 'folderdown'; 
		str += '<td><a href="'+url+'" class="'+cls+'">'+name+'</a></td>';
		str += '<td style="width: 30px">';
		if (url != '#')
			str += '<a href="#" onclick="delfile(this);" title="'+delmsg+'"><i class="icon-remove"></i></a>';
		str += '</td>';
		str += '</tr>';
		$('#runresult #files tbody').append(str);
	}
}


function findResultDir(cdir)
{
	var path = cdir.split('/');
	var dir = files;
	for (var i=1; i<path.length; i++)
		dir = dir[path[i]];
	return dir;
}


function delfile(el)
{
	$tr = $(el).parent().parent();
	var url = $tr.find('td:nth-child(1) a').prop('href');
	url += '&delete=1';
	$.ajax({url: url,
			success: function() {
				$tr.remove();
			}
	});
}


function SaveZip(el)
{
	window.location = $(el).attr('href');
}

function DeleteAll(el)
{
	var url = $(el).attr('href');
	$.ajax({url: url,
		success: function() {
			files = {};
			curdir = '';
			showResultDir(files);
		}
	});
}












//Редактор. Страница "Браузер", сохранение

var IsSaved = true;

var FrameIsLoaded = false;

var GoLink = false;
var SelectLink = false;
var SelectText = false;
var SelectImage = false;
var SelectHTML = false;
var ItemSelected;
var ItemName = false;


function hashCode(str)
{
    var hash = 0, i, char;
    if (str.length == 0) return hash;
    for (i = 0, l = str.length; i < l; i++) {
        char  = str.charCodeAt(i);
        hash  = ((hash<<5)-hash)+char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};


function urlDir(url)
{
	var pos = url.lastIndexOf('/');
	var dir = url.substring(0, pos+1); 
	if (dir != 'http://' && dir != 'https://')
		return dir;
	else
		return url;
}


function href2url(href)
{
	var url = '';
	if (href)
	{
		var base = evaluateXPath('//html/head/base', document.getElementById(HtmlFrames.activeFrame).contentWindow.document);
		base = base[0];
		var dir = urlDir($('#url').val());
		
		if (base && href.substring(0, base.href.length) == base.href)
			href = href.substring(base.href.length);
				
		var domain = $('#url').val().match(/(((http:)|(https:))\/\/.+?)\/|$/);
		if (href.search(/^http/) == -1 && href[0] != '/')
		{
			if (base)
				url = base.href+href;
			else
				url = dir+href;
		}
		else if (href.search(/^http/) == -1 && href[0] == '/')
			url = domain[1]+href;
		else
			url = href;
	}
	return url;
}




function createXPathFromElement(elm) { 
    //var allNodes = document.getElementsByTagName('*'); 
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) 
    {
    	if (elm.nodeName.toLowerCase() == 'html' || elm.nodeName.toLowerCase() == 'body')
    	{
    		segs.unshift(elm.nodeName.toLowerCase());
    	}
    	else if (elm.hasAttribute('id')) { 
                /*var uniqueIdCount = 0; 
                for (var n=0;n < allNodes.length;n++) { 
                    if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++; 
                    if (uniqueIdCount > 1) break; 
                }; 
                if ( uniqueIdCount == 1) { 
                    segs.unshift('id("' + elm.getAttribute('id') + '")'); 
                    return segs.join('/'); 
                } else { 
                */
                    segs.unshift(elm.nodeName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'); 
                //} 
        } else if (elm.hasAttribute('class')) {
        	var classname = elm.getAttribute('class');
        	var childs = elm.parentNode.childNodes;
        	var pos = 0;
        	var isPosCount = true;
        	var total = 0;
        	for (var i=0; i<childs.length; i++)
        	{
        		if (childs[i].nodeType == 1 && childs[i].hasAttribute('class'))
        			if (childs[i].nodeName==elm.nodeName && childs[i].getAttribute('class')==classname)
        			{
        				if (isPosCount) pos++;
        				if (childs[i] == elm) isPosCount = false;
        				total++;
        			}	
        	}
        	var str = elm.nodeName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]';
        	if (total > 1)
        		str += '[' + pos + ']';
        	segs.unshift(str); 
        } else { 
            for (var i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
                if (sib.nodeName == elm.nodeName)  i++; 
            }; 
            segs.unshift(elm.nodeName.toLowerCase() + '[' + i + ']'); 
        }; 
    };
    
    if (PagesList.get() && PagesList.get().type == 'html' && segs[0] == 'html' && segs[1] == 'body')
    	segs.splice(0, 3);    	
    
    return segs.length ? '//' + segs.join('/') : null; 
};


function evaluateXPath(xpath, doc, context) {
	if (isIe)
	{
		//в IE в xpath в div[1] нумерация начинается с 0
		var p = xpath.split('/');
		for (var i=0; i<p.length; i++)
		{
			if (p[i] != '')
			{
				var result = p[i].match(/\[(\d+)\]/i);
				if (result != null)
				{
					var num = parseInt(result[1])-1;
					p[i] = p[i].replace(/\[\d+\]/i, '['+num+']');
				}
			}
		}
		xpath = p.join('/'); 
	}
	
	var nodes = [];
	if (context == undefined) context = doc;
	var result = doc.evaluate(xpath, context, null, 0, null);
    var node = result.iterateNext();
    while (node) {
    	nodes.push(node);
    	node = result.iterateNext();
    }
    return nodes;
}

function xpathtest()
{
	var doc = document.getElementById(HtmlFrames.activeFrame).contentWindow.document;
	////html/body/table[1]/tbody[1]/tr[1]/td[@class="t2"]/table[@class="s6"][1]/tbody[1]/tr[1]/td[@id="bv2"]/td[@id="bv1"]/table[@class="s10"]/tbody[1]/tr[2]/td[@class="td3"]/a[@class="rbr"]
	var nodes = evaluateXPath('//html/body/div[@id="content"]/div',  doc);
	for (var i=0; i<nodes.length; i++)
	{
		var nodes2 = evaluateXPath('div[@class="title"]', doc, nodes[i]);
		for (var j=0; j<nodes2.length; j++)
			$(nodes2[j]).css('border', '3px dashed red');
	}
}


function XPathToJQuery(xpath) {
	var xpatharr = xpath.split('/');
	var jqarr = [];
	for (var i=0; i<xpatharr.length; i++)
	{
		if (xpatharr[i] != '') 
		{
			var node = xpatharr[i];
			
			/*var leftbr = node.indexOf('[');
			var rightbr = node.indexOf(']');
			var nodename = node.substring(0, leftbr);
			var nodepos = node.substring(leftbr+1, rightbr);
			*/
			
			var result = node.match(/(\w+)(\[(.+)\])?/i);
			if (result != null)
			{
				var nodename = result[1];
				var nodepos = result[3];
				
				if (nodepos != undefined)
				{
					var notmatch = true;
					result = nodepos.match(/\@id="(\w+)"/i); 
					if (result != null)
					{
						jqarr.push(nodename+'#'+result[1]);
						notmatch = false;
					}
					if (notmatch)
					{
						result = nodepos.match(/(\d+)/i);
						if (result != null)
						{
							jqarr.push(nodename+':nth-child('+result[1]+')');
							notmatch = false;
						}
					}
				}
				else jqarr.push(nodename);
			}
		}
	}
	return jqarr.join(' ');
}


function rulessave(successfunc)
{
	if (!$('#tab-script').parent().hasClass('active'))
		tabScriptClick();
	
	if (successfunc == undefined)
	{
		$('#rules-right-btns div div').html('');
		$('#rules-right-btns div img').show();
		successfunc = function(data) {
        	if (data.success)
        	{
        		var cls = 'success';
        		if (data.iserror)
        		{
        			$('#output').val(data.error_msg+'. line:'+data.error_line+' column: '+data.error_column);
        			setCursorPos(document.getElementById('script'), data.error_start, data.error_start+data.error_length);
        			cls = 'warning';
        		}
        		else
        		{
        			IsSaved = true;
        			$('#output').val('');
        			cls = 'success';
        		}
        		$('#rules-right-btns > div img').hide();
        		$('#rules-right-btns > div').removeClass().addClass(cls).find('div').html(data.message);
        	}
        };
	}
	
	$.ajax({url: '/main/rulessave',
        type: 'POST',
        dataType: 'json',
        data: {scraperid: $('#tabScript input[name="scraperid"]').val(),
        	   script: $('#script').val(),
        	   disablebrowser: disBrowser,
        	   },
        success: successfunc, 
	});
}

function rulesclose(loc)
{
	if (!IsSaved)
	{
		if (loc)
		{
			$('#closeModal').find('#yes-close-btn').attr('data-url', loc);
			$('#closeModal').find('#no-close-btn').attr('data-url', loc);
		}
		$('#closeModal').modal('show');
	}
	else
	{
		/*
		if (loc)
			location.href = loc;
		else
			location.href = $('#btnclose').attr('href');
		*/
		//$('#editModal').modal('hide');
	}
}

function SetNotSaved()
{
	IsSaved = false;
	$('#rules-right-btns div').removeClass().find('div').html('');
}

var LoadpageParams = {};

function loadpage_nourl(save, refresh)
{
	var url = _PARSE.url;
	if (url != '')
	{
		var cookstr = HTTPHeaders.getCookiesStrForSite(url);
		var cookparam = '';
		if (cookstr != '')
			cookparam = '&cookie='+encodeURIComponent(cookstr);
		
		FrameIsLoaded = false;
		$('#rulestbl tbody tr').remove();
		var index = undefined;
		if (save == undefined || save == true)
		{
			var activeInd = PagesList.getActiveInd();
			activeInd.splice(activeInd.length-1, 1);
			if (activeInd.length == 0)
			{
				var page = PagesList.add(url);
				PagesList.addObjVert(page);
			}
			else
			{
				var p = PagesList.getByInd(activeInd);
				var page = p.links.add(false, url);
				PagesList.addObj(page);
			}
			index = page.index;
		}
		else
			PagesList.add(url);
		
		loadtreeupdate();
		
		var method, params, encoding;
		if (LoadpageParams.url == url)
		{
			method = LoadpageParams.method ? LoadpageParams.method : 'get';
			params = LoadpageParams.params ? LoadpageParams.params : {};
			encoding = LoadpageParams.encoding ? LoadpageParams.encoding : 'UTF-8';
			index = LoadpageParams.index ? LoadpageParams.index : index;
		}
		else
		{
			method = 'get';
			params = {};
			encoding = 'UTF-8';
		}
		
		var obj = undefined;
		var iframeid = undefined;
		if (!refresh)
		{
			obj = HtmlCache.find(url, method, params, encoding);
			iframeid = HtmlFrames.getFrameId(url, method, params, encoding, [], index);
		}

		LoadpageParams = {url: url, method: method, params: params, encoding: encoding, index: index};
		console.log('loadpage_nourl '+url+' '+(index ? index.join(':') : ''));

		if (iframeid)
		{
			console.log('same frame');
			LoadpageParams.frameshowed = true;
			HtmlFrames.show(iframeid.id);
			setTimeout(setFrameFunctions, 50); 
		}
		else if (obj && !index)
		{
			var iframe = document.getElementById('html');
			iframe.contentWindow.contents = obj.html;
			iframe.src = 'javascript:window.contents';
		}
		else
		{
			if (!refresh)
			{
				if (index)
					HtmlFrames.create(url, method, params, encoding, [], index);
				else
					HtmlFrames.show('html');
			}
			
			LoadpageParams.showprocess = true;
			showLoadingProcess();
			//document.getElementById(HtmlFrames.activeFrame).src = '/proxy/index?url='+encodeURIComponent(url)+cookparam+'&refresh='+refresh;
			
			//document.getElementById(HtmlFrames.activeFrame).src = './frame.html';
			var iframe = document.getElementById('html');
			iframe.contentWindow.contents = _PARSE.html;
			iframe.src = 'javascript:window.contents';
		}
	} 
}

function loadpage(save, url, type, params, encoding, index)
{
	if (url == undefined)
	{
		loadpage_nourl(save, false);
	}
	else
	{
		var url2 = url;
		var method = (type != undefined) ? type.toLowerCase() : 'get';
		if (encoding == undefined) encoding = 'UTF-8';
		
		var paramsstr = '';
		if (method == 'post')
        {
        	for (name in params)
        	{
        		if (params[name] instanceof Array)
        		{
        			var pos = name.indexOf('[');
        			var n = (pos == -1) ? name : name.substring(0, pos);
        			var n2 = (pos == -1) ? '[]' : name.substring(pos);
        			for (var i=0; i<params[name].length; i++)
        				paramsstr += '&'+encodeURIComponent('params['+n+']'+n2)+'='+encodeURIComponent(params[name][i]);
        		}
        		else if (params[name] instanceof Object)
        		{
        			var pos = name.indexOf('[');
        			var n = (pos == -1) ? name : name.substring(0, pos);
        			//var n2 = (pos == -1) ? '[]' : name.substring(pos);
        			for (var i in params[name])
        				paramsstr += '&'+encodeURIComponent('params['+n+']['+i+']')+'='+encodeURIComponent(params[name][i]);
        		}
        		else
        			paramsstr += '&'+encodeURIComponent('params['+name+']')+'='+encodeURIComponent(params[name]);
        	}
        }
        else if (method == 'get')
        {
        	var num = 0;
        	for (name in params)
        	{
        		if (params[name] instanceof Array)
        		{
        			for (var i=0; i<params[name].length; i++)
        				paramsstr += '&'+encodeURIComponent(name)+'='+encodeURIComponent(params[name][i]);
        		}
        		else
        			paramsstr += '&'+encodeURIComponent(name)+'='+encodeURIComponent(params[name]);
        		num++;
        	}
        	if (num > 0)
        	{
        		paramsstr = paramsstr.substring(1, paramsstr.length);
        		var char = (url.indexOf('?') != -1) ? '&' : '?';
       			url2 += char+paramsstr;
       			paramsstr = '';
        	}
        }
                    
        if (url2 != '')
		{
        	var cookstr = HTTPHeaders.getCookiesStrForSite(url2);
			var cookparam = '';
			if (cookstr != '')
				cookparam = '&cookie='+encodeURIComponent(cookstr);
        	
        	$('#url').val(url);
        	$('#rulestbl tbody tr').remove();
        	if (save == undefined || save == true)
        	{
        		var activeInd = PagesList.getActiveInd();
				activeInd.splice(activeInd.length-1, 1);
				if (activeInd.length == 0)
				{
					var page = PagesList.add(url, method, params, encoding);
					PagesList.addObjVert(page);
				}
				else
				{
					var p = PagesList.getByInd(activeInd);
					var page = p.links.add(false, url, method, params, encoding);
					PagesList.addObj(page);
				}
				index = page.index;
        	}
        	
        	console.log('loadpage '+url2+' '+(index ? index.join(':') : ''));
        	LoadpageParams = {url: url, method: method, params: params, encoding: encoding, index: index};
        	
        	var obj = HtmlCache.find(url, method, params, encoding);
        	var iframeid = HtmlFrames.getFrameId(url, method, params, encoding, [], index);
        	
        	if (iframeid)
        	{
				console.log('same frame');
				LoadpageParams.frameshowed = true;
				HtmlFrames.show(iframeid.id);
				setTimeout(setFrameFunctions, 50); 
        	}
        	else if (obj && !index)
			{
				HtmlFrames.show('html');
				LoadpageParams.showprocess = true;
				showLoadingProcess();
				var iframe = document.getElementById('html');
				iframe.contentWindow.contents = obj.html;
				iframe.src = 'javascript:window.contents';
			}
			else
			{
				var prevFrame = HtmlFrames.activeFrame;
				if (index)
			    	HtmlFrames.create(url, method, params, encoding, [], index);
				else
					HtmlFrames.show('html');
				
				if (method == 'html')
				{
					var prevdoc = document.getElementById(prevFrame).contentWindow.document;
					var iframe = document.getElementById(HtmlFrames.activeFrame);
					var body = '';
					if (params.content.search(/^\<tr/i) != -1)
						body = '<table>'+params.content+'</table>';
					else
						body = params.content;
						
					iframe.contentWindow.contents = '<html><head>'+prevdoc.head.innerHTML+'</head><body>'+body+'</body></html>';
					iframe.src = 'javascript:window.contents';
				}
				else
				{
					LoadpageParams.showprocess = true;
					showLoadingProcess();
					//document.getElementById(HtmlFrames.activeFrame).src = '/proxy/index?url='+encodeURIComponent(url2)+'&type='+method+paramsstr+'&encoding='+encoding+cookparam;
					var iframe = document.getElementById('html');
					iframe.contentWindow.contents = _PARSE.html;
					iframe.src = 'javascript:window.contents';
				}
			}
		}
	}
}

function loadprev()
{
	if (PagesList.prev())
	{
		loadtreeupdate();
		var page = PagesList.get();
		loadpage(false, page.url, page.type, page.params, page.encoding, page.index);
	}
}

function loadnext()
{
	if (PagesList.next())
	{
		loadtreeupdate();
		var page = PagesList.get();
		loadpage(false, page.url, page.type, page.params, page.encoding, page.index);
	}
}

function rulesshow(rules)
{
	var arr = [];
	for (var name in rules.array)
	{
		var obj = {name: rules.array[name].name,
				   type: rules.array[name].type, 
				   path: rules.array[name].path,
				   group: rules.array[name].group
				  };
		arr.push(obj);
		
		var nodes = rules.getNodesByName(rules.array[name].name);
		for (var i=0; i<nodes.length; i++)
		{
			selectBorder(nodes[i], rules.array[name].type, null, false);
			if (rules.array[name].options.next)
				selectBorderNext(nodes[i], rules.array[name].type, null, false);
		}
	}
	
	var html = HTMLRenderer.render('ruleformattable', {array: arr, Lang: Lang});
	$('#rulestbl tbody tr').remove();
	$('#rulestbl tbody').append(html);
}

function rulesshowfilter(rules, group)
{
	var arr = [];
	for (name in rules.array)
	{
		if (rules.array[name].group == group || group == 'all')
		{
			var obj = {name: rules.array[name].name,
						type: rules.array[name].type, 
						path: rules.array[name].path,
						group: rules.array[name].group
				  	  };
			arr.push(obj);
		}
	}
	
	var html = HTMLRenderer.render('ruleformattable', {array: arr, Lang: Lang});
	$('#rulestbl tbody tr').remove();
	$('#rulestbl tbody').append(html);
}

function rulegetchecked()
{
	var rulesnames = [];
	$('#rulestbl tbody input[name="checkbox"]:checked').each(function(i, el) {
		var id = $(el).parent().parent().prop('id').match(/\-(.+)$/);
		rulesnames.push(id[1]);
	});
	return rulesnames;
}

function elembyruleid(name)
{
	var el = document.getElementById('rule-'+name);
	return el;
}

function rulegroup()
{
	var rulesnames = rulegetchecked();
	var r = PagesList.get().rules;
	var rule1 = r.getByName(rulesnames[0]);
	var rule2 = r.getByName(rulesnames[1]);
	if (rule1.type == rule2.type && rule1.type != 'form')
	{
		var path1 = rule1.path.split('/');
		var path2 = rule2.path.split('/');
		var path = [];
		if (path1.length == path2.length)
		{
			//формируем часть пути - общий корень
			for (var i=0; i<path1.length; i++)
			{
				if (path1[i] == path2[i])
					path.push(path1[i]);
				else break;
			}
			for (var i = path.length; i<path1.length; i++)
			{
				if (path1[i] != path2[i])
				{
					var node1 = path1[i].replace(/\[\d+\]/i, '');
					var node2 = path2[i].replace(/\[\d+\]/i, '');
					
					var res1 = ScriptFunctions.preg_match_all('/\\[\\@(.+?)="(.+?)"\\]/g', node1);
					var res2 = ScriptFunctions.preg_match_all('/\\[\\@(.+?)="(.+?)"\\]/g', node2);
					
					if (res1.length > 0 && res2.length > 0 && res1[1].length == res2[1].length)
						for (var j=0; j<res1[1].length; j++)
							if (res1[1][j] == res2[1][j])
							{
								if (res1[2][j] != res2[2][j])
								{
									var class1 = res1[2][j].split(' ');
									var class2 = res2[2][j].split(' ');
									var diffclass = [];
									for (var k=0; k<class1.length; k++)
										for (var m=0; m<class2.length; m++)
											if (class1[k] == class2[m])
												diffclass.push(class1[k]);
									
									var str = '';
									if (diffclass.length > 0)
									{
										for (k=0; k<diffclass.length; k++)
											str += 'and contains(@'+res1[1][j]+', "'+trim(diffclass[k])+'")';
										str = '['+str.substring(4)+']';
									}
									node1 = node1.replace(res1[0][j], str);
								}	
							}
							else
								node1 = node1.replace(res1[0][j], '');
					
					path.push(node1);
				}
				else
					path.push(path1[i]);
			}
			//path.push(path1[path1.length-1]);
		}
		
		var links = PagesList.get().links;
		if ((rule2.type == 'link' || rule2.type == 'form') && links.isSet(rulesnames[1]))
		{
			links.deleteByName(rulesnames[1]);
		}
		r.deleteByName(rulesnames[0]);
		r.deleteByName(rulesnames[1]);
		PagesList.get().vars.del(rulesnames[1]);
		
		var exp = PagesList.get().exp;
		if (exp)
		{
			for (var i=0; i<exp.length; i++)
				exp[i].delByRulename(rulesnames[1]);
		}
		
		if (PagesList.get().type == 'html')
		{
			r.addWithPath(rulesnames[0], rule1.type, path.join('/'), false, null, null, '');
			PagesList.get().groups.add('');
			r.idname.opt = {html: PagesList.get().additparams.idname.id};
			r.options.html = PagesList.get().params.content;
			r.defvals.opt = {html: r.options.html};
		}
		else
			r.addWithPath(rulesnames[0], rule1.type, path.join('/'));
		
		var nodes = r.getNodesByName(rulesnames[0]);
		for (var i=0; i<nodes.length; i++)
		{
			selectBorder(nodes[i], rule1.type, null, false);
		}
		SetNotSaved();
	}
}

function ruledel()
{
	var rulesnames = rulegetchecked();
	var r = PagesList.get().rules;
	var exp = PagesList.get().exp;
	for (var i=0; i<rulesnames.length; i++)
	{
		var rule = r.getByName(rulesnames[i]);
		var links = PagesList.get().links;
		if ((rule.type == 'link' || rule.type == 'form') && links.isSet(rulesnames[i]))
		{
			links.deleteByName(rulesnames[i]);
		}
		
		var nodes = r.getNodesByName(rulesnames[i]);
		for (var j=0; j<nodes.length; j++)
		{
			deselectBorder(nodes[j]);
			if (rule.options.next)
				deselectBorderNext(nodes[j]);
		}
		r.deleteByName(rulesnames[i]);
		PagesList.get().vars.del(rulesnames[i]);
		if (exp)
		{
			for (var j=0; j<exp.length; j++)
				exp[j].delByRulename(rulesnames[i]);
		}
		SetNotSaved();
	}
}

function ruleactions_getname(elem)
{
	var id = elem.parentNode.parentNode.parentNode.parentNode.parentNode.id.match(/\-(.+)/);
	//var id = $(elem).parent().parent().parent().parent().parent().prop('id').match(/\-.+?/);
	return id[1];	
}

function ruleload(elem)
{
	var name = ruleactions_getname(elem);
	var links = PagesList.get().links;
	if (!links.isSet(name))
	{
		var r = PagesList.get().rules.getByName(name);
		if (r.type == 'html')
		{
			 var url = 'html://'+name;
			 var values = ScriptFunctions.getDataForGroup(r.group, PagesList.get(), true);
			 var html = values[name][0];
			 links.add(name, url, 'html', {content: html});
		}
		else
		{
			//получаем url
			var nodes = PagesList.get().rules.getNodesByName(name);
			var url = href2url($(nodes[0]).attr('href'));
			links.add(name, url);
		}
		SetNotSaved();
	}
	PagesList.loadLink(name);
	loadtreeupdate();
	var page = PagesList.get();
	if (page.additparams.idname.array == undefined)
		page.additparams.idname.array = name;
	if (page.additparams.idname.id == undefined)
		page.additparams.idname.id = 'st';
    loadpage(false, page.url, page.type, page.params, page.encoding, page.index);
}

function rulelables($win, type)
{
	$win.find('#labels .label').hide();
	if (type == 'text')
		$win.find('#text').show();
	else if (type == 'link')
		$win.find('#link').show();
	else if (type == 'image')
		$win.find('#image').show();
	else if (type == 'regexp')
		$win.find('#regexp').show();
	else if (type == 'html')
		$win.find('#htmltype').show();
}


function ruleedit(elem)
{
	var name = ruleactions_getname(elem);
	var rule = PagesList.get().rules.getByName(name);
	
	var $win = $('#ruleedit');
	$win.find('#rulename').html('<b>'+name+'</b>');
	$win.find('input[name="name"]').val(name);
	rulelables($win, rule.type);
	
	$win.find('textarea').val(rule.path);
	$win.fadeIn('slow').css('left', ($(window).width()-$win[0].offsetWidth)/2);
	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2);
}

function pageexport()
{
	var curexp = [];
	if (PagesList.get())
		curexp = PagesList.get().exp;
	
	$('#pageexport-list-table table tbody tr').remove();
	if (curexp.length > 0)
	{
		var exparr = [];
		for (var i=0; i<curexp.length; i++)
			exparr.push(curexp[i].objForAjax());
		
		var html = HTMLRenderer.render('exportlistformattable', {exp: exparr, Lang: Lang});
		$('#pageexport-list-table table tbody').append(html);
	}
	else
	{
		$('#pageexport-list-table table tbody').append('<tr><td colspan="5">'+Lang.t('Нет ни одного правила экспорта')+'</td></tr>');
	}
	
	var $win = $('#pageexport');
	$win.fadeIn('slow').css('left', ($(window).width()-$win[0].offsetWidth)/2);
	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2);
	$('#pageexport .popup-btns').css('top', $win[0].offsetHeight-40);
}

function ruleoptions(elem)
{
	var name = ruleactions_getname(elem);
	var rule = PagesList.get().rules.getByName(name);
	$('#ruleoptions input[name="rulename"]').val(name);
	
	$('#ruleoptions #linkopt').hide();
	$('#ruleoptions #textopt').hide();
	$('#ruleoptions #imageopt').hide();
	$('#ruleoptions #formopt').hide();
	$('#ruleoptions #htmlopt').hide();
	
	if (rule.type == 'link')
	{
		$('#linkopt input[name="optstore"]').prop('checked', rule.options.store);
		$('#linkopt input[name="optnext"]').prop('checked', rule.options.next);
		$('#linkopt input[name="optstorefile"]').prop('checked', rule.options.storefile);
		$('#linkopt input[name="optcontinue"]').prop('checked', rule.options.cont);
		$('#linkopt select[name="optnexttype"]').val('link');
				
		$('#ruleoptions #linkopt').show();
	}
	else if (rule.type == 'text')
	{
		$('#textopt input[name="optstore"]').prop('checked', rule.options.store);
		$('#textopt input[name="optnext"]').prop('checked', rule.options.next);
		$('#textopt select[name="optnexttype"]').val('text');
		$('#textopt input[name="optnodeonly"]').prop('checked', rule.options.nodeonly);
		$('#textopt input[name="optword"]').prop('checked', rule.options.word>0);
		$('#textopt input[name="optwordnumber"]').val(rule.options.word);
		$('#textopt input[name="optwordnumber2"]').val(rule.options.wordend);
		$('#textopt input[name="optdecode"]').prop('checked', rule.options.decode);
		$('#textopt input[name="optimplode"]').prop('checked', rule.options.implode);
		$('#textopt input[name="optimplodestr"]').val(rule.options.implodestr);
		
		if (rule.options.replace)
		{
			$('#textopt input[name="optreplace"]').prop('checked', true);
			$('#textopt input[name="optreplacesearch"]').val(rule.options.replace[0]);
			$('#textopt input[name="optreplacereplace"]').val(rule.options.replace[1]);
		}
		else
		{
			$('#textopt input[name="optreplace"]').prop('checked', false);
			$('#textopt input[name="optreplacesearch"]').val('');
			$('#textopt input[name="optreplacereplace"]').val('');
		}
		
		$('#ruleoptions #textopt').show();
	}
	else if (rule.type == 'image')
	{
		$('#imageopt input[name="optstore"]').prop('checked', rule.options.store);
		$('#imageopt input[name="optstorefile"]').prop('checked', rule.options.storefile);
		$('#imageopt input[name="optnext"]').prop('checked', rule.options.next);
		$('#imageopt select[name="optnexttype"]').val('image');
		
		$('#ruleoptions #imageopt').show();
	}
	else if (rule.type == 'html')
	{
		var $win = $('#htmlopt');
		$win.find('input[name="optstore"]').prop('checked', rule.options.store);
		$win.find('input[name="optcontent"]').prop('checked', rule.options.content);
		$win.find('input[name="optnext"]').prop('checked', rule.options.next);
		$win.find('select[name="optnexttype"]').val('html');

		$('#ruleoptions #htmlopt').show();
	}
	
	var $win = $('#ruleoptions');
	$win.fadeIn('slow').css('left', ($(window).width()-$win[0].offsetWidth)/2);
	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2);
	$('#ruleoptions .popup-btns').css('top', $win[0].offsetHeight-40);
}


function rulesetgroup(elem)
{
	var name = ruleactions_getname(elem);
	var rule = PagesList.get().rules.getByName(name);
	
	$('#rulesetgroup #rulename').html('<b>'+name+'</b>');
	$('#rulesetgroup input[name="name"]').val(name);
	$('#rulesetgroup input[name="setname"]').val('');
	
	var $win = $('#rulesetgroup');
	rulelables($win, rule.type);
	
	$('#rulesetgroup select[name="groups"] option').remove();
	var sel = '';
	if (!rule.group)
		sel = 'selected="selected"';
	$('#rulesetgroup select[name="groups"]').append('<option value="-none-" '+sel+'>-none-</option>');
	
	var array = PagesList.get().groups.array;
	for (var name in array)
	{
		if (name != '')
		{
			var sel = '';
			if (name == rule.group) sel = 'selected="selected"';
			$('#rulesetgroup select[name="groups"]').append('<option value="'+name+'" '+sel+'>'+name+'</option>');
		}
	}
	
	$win.fadeIn('slow').css('left', ($(window).width()-$win[0].offsetWidth)/2);
	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2);
	$('#rulesetgroup .popup-btns').css('top', $win[0].offsetHeight-40);
}

function refreshpagedata()
{
	var page = PagesList.get(); 
	if (page)
	{
		var groups = page.rules.getGroupsObj();
		var groups2 = {};
		for (var name in groups)
		{
			var values = ScriptFunctions.getDataForGroup(name, page, true);
			name2 = (name == '') ? '-none-' : name;
			groups2[name2] = values;
		}
		
		var data = {};
		var totallen = {};
		var headers = {};
		for (var group in groups2)
		{
			var rules = groups2[group];
			var maxelems = 0;
			var maxlen = {};
			totallen[group] = 0;
			for (var rname in rules)
			{
				var rvalue = rules[rname];
				var keys = ScriptFunctions.array_keys(rvalue);
				var count = keys[keys.length-1]; 
				if (count > maxelems)
					maxelems = count;
				
				maxlen[rname] = 0;
				var len = 0;
				for (var val in rvalue)
				{
					maxlen[rname] += rvalue[val].length;
					len++;
				}
				totallen[group] += maxlen[rname] / len;
			}
			totallen[group] *= 5;
			
			headers[group] = {};
			for (var rname in rules)
			  	headers[group][rname] = rname;
			
			data[group] = [];
			for (var i=0; i<=maxelems; i++)
			{
				var line = {i__: {val: i}};
				var notempty = false;
				for (var rname in rules)
				{
					var rvalue = rules[rname];
				  	if (rvalue[i])
					{ 
						line[rname] = {};
						line[rname].val = rvalue[i];
						var r = PagesList.get().rules.getByName(rname);
						line[rname].type = ((r.type == 'image' || rvalue[i].search(/\.(jpeg|png|gif|jpg|bmp)$/i)!=-1) && r.options.storefile) ? 'image' : 'text';
						notempty = true;
					}
				  	else
				  		line[rname] = '';
				}
				if (notempty)
					data[group].push(line);
			}
		}
		
		var html = HTMLRenderer.render('pagedataformat', {data: data, headers: headers, totallen: totallen, Lang: Lang});
		$('#pagedata-data').empty().append(html);
	}
}

function pagedata()
{
	refreshpagedata();
	
	var $win = $('#pagedata');
	$win.fadeIn('slow').css('left', ($(window).width()-$win[0].offsetWidth)/2);
	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2);
	$('#pagedata .popup-btns').css('top', $win[0].offsetHeight-40);
}


function rulefilter(elem)
{
	var name = ruleactions_getname(elem);
	var rule = PagesList.get().rules.getByName(name);
	var $win = $('#rulefilter');
	
	$('#rulefilter #rulename').html('<b>'+name+'</b>');
	$('#rulefilter input[name="name"]').val(name);
	if (rule.filter)
	{
		$('#rulefilter input[name="filtertype"]').val(rule.filter.type);
		$('#rulefilter input[name="filterstr"]').val(rule.filter.str);
	}
	else
	{
		$('#rulefilter input[name="filterstr"]').val('');
	}
	
	rulelables($win, rule.type);
	
	$win.fadeIn('slow').css('left', ($(window).width()-$win[0].offsetWidth)/2);
	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2);
}

function getregexp_exec()
{
	var pattern = $('#getregexp input[name="pattern"]').val();
	var subject = $('#getregexp #source').text();
	var index = [];
	var result = ScriptFunctions.preg_match_all(pattern, subject, index);

	var out = '';
	for (var i=0; i<result.length; i++)
	{
		out += 'result['+i+'] = \n';
		for (var j=0; j<result[i].length; j++)
			out += '    ['+j+'] = '+result[i][j]+'\n';
	}
	$('#getregexp #reout').text(out);

	var doc = document.getElementById(HtmlFrames.activeFrame).contentWindow.document;
	var source = (PagesList.get() && PagesList.get().type == 'html') ? doc.body.innerHTML : doc.documentElement.outerHTML;
	$('#getregexp #source').empty();
	var sourceElem = document.getElementById('source');
	var start = 0;
	for (i=0; i<index.length; i++)
	{
		var pered = source.substring(start, index[i]);
		var colored = source.substring(index[i], index[i]+result[0][i].length);
		start = index[i] + result[0][i].length;
		
		var span = document.createElement('span');
		span.className = 'colored';
		span.appendChild(document.createTextNode(colored));
		
		sourceElem.appendChild(document.createTextNode(pered));
		sourceElem.appendChild(span);
	}
	sourceElem.appendChild(document.createTextNode(source.substring(start)));
}

function getregexp(elem)
{
	var $win = $('#getregexp');
	if (elem)
	{
		var name = ruleactions_getname(elem);
		var rule = PagesList.get().rules.getByName(name);
		$win.find('input[name="rulename"]').val(name);
		$win.find('input[name="rulename"]').prop('disabled', true);
		$win.find('input[name="pattern"]').val(rule.path);
		$win.find('input[name="resultind"]').val(rule.options.resultind);
	}
	else
	{
		$win.find('input[name="rulename"]').val('');
		$win.find('input[name="rulename"]').prop('disabled', false);
		$win.find('input[name="pattern"]').val('');
		$win.find('input[name="resultind"]').val(0);
	}
	
	getregexp_exec();
	
	$win.fadeIn('slow').css('left', ($(window).width()-$win[0].offsetWidth)/2);
	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2);
	$win.find('.popup-btns').css('top', $win[0].offsetHeight-40);
}

function collectPageLinks(lp, name)
{
	var obj = {text: name+lp.url+' '+lp.type.toUpperCase(), children: []};
	for (var i=0; i<lp.links.array2.length; i++)
	{
		var link = lp.links.array2[i];
		var n = '';
		if (typeof link == 'string')
		{
			n = link+' ';
			link = lp.links.array[link];
		}
		obj.children.push(collectPageLinks(link, n));		
	}
	return obj;
}


function loadtreeupdate()
{
	var data = [];
	for (var i=0; i<PagesList.array2.length; i++)
		data.push(collectPageLinks(PagesList.array2[i], ''));
	
	var activeInd = PagesList.getActiveInd();
	LoadTree.isclosed = false;
	LoadTree.update(data, activeInd);	
}


function loadtree()
{
	var $win = $('#loadtree');
	
	loadtreeupdate();
	
	$win.fadeIn('slow').css('left', ($(window).width()-$win[0].offsetWidth)/2);
	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2);
	$win.find('.popup-btns').css('top', $win[0].offsetHeight-40);
}


function collectHtmlTree(node)
{
	var text = '';
	if (node.nodeType == 1)
	{
		var attrs = '';
		for (var i=0; i<node.attributes.length; i++)
		{
			if (node.attributes[i].name != 'style')
				attrs += ' '+node.attributes[i].name+'="'+node.attributes[i].value+'"';
		}
		text = '<'+node.nodeName.toLowerCase()+attrs+'>';
	}
	else if (node.nodeType == 3)
	{
		text = trim(node.nodeValue);
		if (text == '')
			return null;
	}
	
	var obj = {text: text, children: [], node: node};
	for (i=0; i<node.childNodes.length; i++)
	{
		var n = node.childNodes[i];
		if (n.nodeType == 1 || n.nodeType == 3)
		{
			var child = collectHtmlTree(n);
			if (child)
				obj.children.push(child);
		}
	}
	return obj;
}


function loadXMLString(txt) 
{
	if (window.DOMParser)
	  {
	  var parser=new DOMParser();
	  var xmlDoc=parser.parseFromString(txt,"text/xml");
	  }
	else // code for IE
	  {
	  var xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
	  xmlDoc.async=false;
	  xmlDoc.loadXML(txt); 
	  }
	return xmlDoc;
}

function htmltree(elem)
{
	var $win = $('#htmltree');
/*	var name = ruleactions_getname(elem);
	var rule = PagesList.get().rules.getByName(name);
	var node = PagesList.get().rules.getNodesByName(name)[0];
	var doc = document.getElementById(HtmlFrames.activeFrame).contentWindow.document;
	
	$win.find('textarea[name="xpath"]').val(rule.path);
	$win.find('input[name="name"]').val(name);
	$win.find('#rulename').html('<b>'+name+'</b>');
	
	rulelables($win, rule.type);
	*/
	$win.fadeIn('slow').css('left', ($(window).width()-$win[0].offsetWidth)/2);
	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2);
	$win.find('.popup-btns').css('top', $win[0].offsetHeight-40);
/*	
	if (!node) //если нет узла, то переходим к родительскому элементу в xpath и снова ищем узел
	{
		var patharr = rule.path.split('/');
		do {
			patharr.pop();
			var shortpath = patharr.join('/');
			var node2 = ScriptFunctions.nodesOfGetFunc(shortpath, {})[0];
		} while (!node2 && patharr.length > 0);
		node = node2;
	}
	*/
	var ind = [0];
	/*
	if (node)
	{
		var node2 = node;
		do {
			var parent = node2.parentNode;
			var index = 0;
			for (var i=0; i<parent.childNodes.length; i++)
			{
				var child = parent.childNodes[i];
				if (child == node2)
					break;
				if (child.nodeType == 1 || (child.nodeType == 3 && trim(child.nodeValue) != ''))
					index++;
			}
			ind.splice(0, 0, index);
			node2 = parent;
		} while (node2 != doc);
	}
	*/

//xxx
	//var doc =  document.getElementById(HtmlFrames.activeFrame).contentWindow.document;
	
	
	var type = parseInt(getRadioVal('type'));
	if(type === 1){
		var doc =  document.getElementById('html').contentWindow.document;
	}else if(type === 2){
		var content = _PARSE.html ;
		var doc =  loadXMLString(content);
	}		

	var data = [];
	var root;
	if (PagesList.get() && PagesList.get().type == 'html')
	{
		root = doc.body;
		ind.splice(0, 1);
		ind[0] = 0;
	}
	else
		root = doc.documentElement;
	
	data.push(collectHtmlTree(root));
	
	HtmlTree.isclosed = true;
	HtmlTree.update(data, ind);
	
}


function getsel(e)
{
    var wnd = document.getElementById(HtmlFrames.activeFrame).contentWindow;
    if (wnd.getSelection)
    {
        var range = wnd.getSelection().getRangeAt(0);
        if (range.startContainer != range.endContainer) {
            selectBorder(range.commonAncestorContainer, 'text', e);
        }
        else {
            selectBorder(range.startContainer.parentNode, 'text', e);
        }
    }
    else    // IE browser
    {
        var range = document.getElementById(HtmlFrames.activeFrame).contentWindow.document.selection.createRange();
        selectBorder(range.parentElement(), 'text', e);
    }
}

function selectBorder(elem, type, e, dialog)
{
	var ToSelect = 'first';
	if ($(elem).data('selected') == 1 && (dialog == undefined || dialog == true))
	{
		var rule = PagesList.get().rules.getByName($(elem).data('itemname'));
		if (rule != undefined)
		{
			if (rule.type == type)
				ToSelect = 'none';
			else
				ToSelect = 'second';
		}
	}
    /*if ($(elem).data('selected') == 1) {
        $(elem).css('border', $(elem).data('oldstyle2'));
        $(elem).data('selected', 0);
        
        ItemSelected = null;
        PagesList.get().rules.deleteByName($(elem).data('itemname'));
        $('#itemname').fadeOut('slow');
    }
    else {
    */
	if (ToSelect != 'none')
	{
		if (ToSelect == 'first')
		{
        	$(elem).data('oldstyle2', $(elem).css('border'));
        	//alert($(elem).data('oldstyle2'));
        	$(elem).data('selected', 1);
        	$(elem).css('border', '3px dashed red');
		}
        
        ItemSelected = elem;
        if (dialog == undefined || dialog == true)
        {
        	rulelables($('#itemname'), type);
        	$('#itemname input[name="type"]').val(type);
        	$('#itemname input[name="name"]').val('');
            $('#itemname').css('left', e.clientX+50).css('top', e.clientY+10).fadeIn('slow');
            ItemName = true;
        }
    }
}


function deselectBorder(elem)
{
	if ($(elem).data('selected') == 1)
	{
		$(elem).css('border', $(elem).data('oldstyle2'));
		$(elem).data('selected', 0);
	}
}


function selectBorderNext(node, type, e, dialog)
{
	var nextnode = node.nextSibling;
	while (nextnode && nextnode.nodeType != 1)
		nextnode = nextnode.nextSibling;
	
	if (nextnode)
		selectBorder(nextnode, type, e, dialog);
}


function deselectBorderNext(node)
{
	var nextnode = node.nextSibling;
	while (nextnode && nextnode.nodeType != 1)
		nextnode = nextnode.nextSibling;
	
	if (nextnode)
		deselectBorder(nextnode);
}


function deselectRules(rules, frmid)
{
	if (!frmid) frmid = HtmlFrames.activeFrame;
	
	for (var name in rules.array)
	{
		var nodes = [];
		if (rules.array[name].type != 'regexp')
    	{
    		var doc = document.getElementById(frmid).contentWindow.document;
    		nodes = evaluateXPath(rules.array[name].path, doc);
    	}
		
		for (var i=0; i<nodes.length; i++)
		{
			deselectBorder(nodes[i], rules.array[name].type, null, false);
			if (rules.array[name].options.next)
				deselectBorderNext(nodes[i], rules.array[name].type, null, false);
		}
	}
}


function setFrameFunctions()
{
    var doc = document.getElementById(HtmlFrames.activeFrame).contentWindow.document;
    //initxpath(document.getElementById(HtmlFrames.activeFrame).contentWindow, doc);
    
    var d = $('#'+HtmlFrames.activeFrame).data('setFrameFunctions'); 
    if ($('#url').val() == '' || doc.URL == 'about:blank')
    	return;
    
    if (!LoadpageParams.frameshowed)   //если фрейм не переключили, а загрузили новый
    {
	    HTTPHeaders.setCookiesFromPage($('#url').val(), doc);
	    HtmlCache.store(doc.documentElement.outerHTML, LoadpageParams.url,
	    					LoadpageParams.method, LoadpageParams.params, LoadpageParams.encoding);
	    
	    if (LoadpageParams.showprocess) closeLoadingProcess();
	    
	    var loc = HTTPHeaders.getLocationFromPage(doc);
	    if (loc)
	    {
	    	$('#url').val(loc);
	    	loadpage_nourl(false, true);
	    	return;
	    }
    }
    
    if (ASTExec && ASTExec.pause)
		execContinue();
    else
    {
    	
    $('a', doc).click(function(e) {
    	e.preventDefault();
        if (GoLink && !ItemName)
        {
            var pos = this.href.indexOf('#');
            if (pos == -1)
            {
            	var rules = PagesList.get().rules;
            	var href = href2url($(this).attr('href'));
            	var find = false;
            	for (var name in rules.array)
            	{
            		if (rules.array[name].type == 'link')
            		{
            			var nodes = rules.getNodesByName(name);
            			for (var i=0; i<nodes.length; i++)
            				if (nodes[i] == this)
            				{
            					var links = PagesList.get().links;
            					if (!links.isSet(name))
            					{
            						links.add(name, href);
            					}
            					var link = links.get(name);
            					link.url = href;
            					PagesList.addObj(link);
            					
            					var page = PagesList.get();
            				    loadpage(false, page.url, page.type, page.params, page.encoding, page.index);
            				    find = true;
            				    break;
            				}
            		}
            		if (find) break;
            	}
            	
            	if (!find)
            	{
                	$('#url').val(href);
                	loadpage(true);
            	}
            }
            else
            {
                var hash = this.href.substr(pos+1);
                document.getElementById(HtmlFrames.activeFrame).contentWindow.location.hash = hash;
            }
            e.stopPrapagation();
        }
        else if (SelectLink && !ItemName)
        {
        	selectBorder(this, 'link', e);
        }
    });
    
    $('img', doc).click(function(e) {
    	if (SelectImage && !ItemName)
    		selectBorder(this, 'image', e);
    });
    
    $('body', doc).click(function(e) {
    	if (!(e.target instanceof HTMLImageElement) && !(e.target instanceof HTMLInputElement)
    			&& !(e.target instanceof HTMLButtonElement) && (SelectText || SelectHTML) && !ItemName)
    	{
    		if (SelectHTML)
    			selectBorder(e.target, 'html', e);
    		else
    			selectBorder(e.target, 'text', e);
    	}
    });
    
    $('form', doc).submit(function (e) {
    	e.preventDefault();

    	var method = (this.method != undefined) ? this.method : 'get';
    	var paramsArr = $(this).serializeArray();
    	var params = {};
    	for (var i=0; i<paramsArr.length; i++)
    	{
   			params[paramsArr[i].name] = paramsArr[i].value;
    	}
    	var encoding = $('meta[name="OriginalEncoding"]', doc).attr('content');
    	
    	var links = PagesList.get().links;
    	var name = 'form' + $('form', doc).index(this);
    	if (!links.isSet(name))
    	{
    		links.add(name, href2url(this.action), method, params, encoding);
    		var r = PagesList.get().rules.add(this, name, 'form');
    		r.group = '';
    	}
    	else
    	{
    		var page = links.get(name);
    		page.url = href2url(this.action);
    		page.type = method;
    		page.params = params;
    		page.encoding = encoding;
    		var r = PagesList.get().rules.getByName(name);
    	}
    	
    	r.newparams = {};
		$.extend(r.newparams, params);
		
		if (!r.formsetparam) r.formsetparam = {};  
		for (var pname in r.newparams)
			if (!r.formsetparam[pname])
				r.formsetparam[pname] = {idname: {}, defvals: {name: pname}};
    	
    	PagesList.loadLink(name);
    	var page = PagesList.get();
        loadpage(false, page.url, page.type, page.params, page.encoding, page.index);
        e.stopPrapagation();
    	return false;
    });

    if (isParseFinish == 3)
    	closeLoadingProcess();
    
    if (PagesList.get())
    {
    	var rules = PagesList.get().rules;
    	var groups = rules.getGroupsObj();
    	addToGroupFilterAll(groups);
    	rulesshow(rules);
    }
    
    }
}

function pushBtnFunction(obj, func1, func2)
{
	if ($(obj).hasClass('active'))
		func2();
    else
    	func1();
}


function setItemName()
{
	var type = $('#itemname input[name="type"]').val();
	var name = $('#itemname input[name="name"]').val();
	var rules = PagesList.get().rules;
	if (name != '' && name.search(/^[A-Za-z][A-Za-z0-9_]*$/) != -1 && !rules.getByName(name)) 
	{
		$('#itemname').fadeOut('slow');
		grp = (PagesList.get().type == 'html') ? '' : 'group1';
		var r = rules.add(ItemSelected, name, type, false, null, undefined, grp);
		PagesList.get().vars.add(name, 'array', [], true);
		
		/*if (r.options.store)
		{
			var exp = PagesList.get().exp;
			if (exp) exp.add(name);
		}*/
		
		if (PagesList.get().type == 'html')
		{
			PagesList.get().groups.add('');
			r.idname.opt = {html: PagesList.get().additparams.idname.id};
			r.options.html = PagesList.get().params.content;
			r.defvals.opt = {html: r.options.html};
		}
		
		$(ItemSelected).data('itemname', name);
		ItemName = false;
		SetNotSaved();
	}
}

function setRuleXPath()
{
	var name = $('#ruleedit input[name="name"]').val();
	var path = $('#ruleedit textarea').val();
		
	if (path != '')
	{
		var path2 = '';
		for (var i=0; i<path.length; i++)
		{
			if (path.charAt(i) != '\n' && path.charAt(i) != '\t')
				path2 += path.charAt(i);
		}
		
		$('#ruleedit').fadeOut('slow');
		
		var rule = PagesList.get().rules.getByName(name);
		if (path2 != rule.path)
		{
			PagesList.get().links.deleteByName(name);
			
			nodes = PagesList.get().rules.getNodesByName(name);
			for (i=0; i<nodes.length; i++)
				deselectBorder(nodes[i]);
			
			rule.path = path2;
			nodes = PagesList.get().rules.getNodesByName(name);
			for (i=0; i<nodes.length; i++)
				selectBorder(nodes[i], rule.type, null, false);
			
			//$('#rulestbl tbody #rule_'+name+' td:nth-child(5)').text(rule.path);
			$(elembyruleid(name)).find('td:nth-child(5)').text(rule.path);
			SetNotSaved();
		}
	}
}

function cancelRuleXPath()
{
	$('#ruleedit').fadeOut('slow');
}

function setPageExportList()
{
	$('#pageexport').fadeOut('slow');
}

function cancelPageExportList()
{
	$('#pageexport').fadeOut('slow');
}

function pageExportProfile(ind, curexp)
{
	$('#pageexport-profile input[name="pageexport-profile-ind"]').val(ind);
	$('#pageexport select[name="exportname"] option').remove();
	
	var array = ExportRules.array;
	var findsel = false;
	for (var name in array)
	{
		var sel = '';
		if (name == curexp.name)
		{
			sel = 'selected="selected"';
			findsel = true;
		}
		$('#pageexport select[name="exportname"]').append('<option value="'+name+'" '+sel+'>'+name+'</option>');
	}
	
	if (!findsel)
	{
		$('#pageexport select[name="exportname"] option:first-child').prop('selected', true);
		var name = $('#pageexport select[name="exportname"]').val();
		var profile = ExportRules.get(name);
		curexp = new PageExportClass(name, profile.type, '');
	}
	
	$('#pageexport-profile .label').hide();
	if (curexp.type == 'csv')
		$('#pageexport-profile #labelcsv').show();
	else if (curexp.type == 'xml')
		$('#pageexport-profile #labelxml').show();
	else if (curexp.type == 'sql')
		$('#pageexport-profile #labelsql').show();
	else if (curexp.type == 'excel')
		$('#pageexport-profile #labelexcel').show();
	else if (curexp.type == 'rdb')
		$('#pageexport-profile #labelrdb').show();
	
	var rules = PagesList.get().rules;
	var vars = PagesList.get().vars.array;
	for (var name in vars)
		if (rules.getByName(name))
			vars[name].isrule = true;

	vars = PagesList.get().vars.getSortedArray();
	var gvars = GlobalVars.getSortedArray();

	$('#pageexport #divfilename input[name="filename"]').val(curexp.filename);
	$('#pageexport #divretvarname input[name="retvarname"]').val(curexp.retvarname ? curexp.retvarname : '');
	if (curexp.type == 'csv' || curexp.type == 'excel')
	{
		$('#savearray-table table tr').remove();
		var html = exportpageformat('array', {array: curexp.array, vartypes: curexp.vartypes, rules: vars, global: gvars});
		$('#savearray-table table').append(html);
		
		$('#pageexport #savearray').show();
		$('#pageexport #savedict').hide();
	}
	else
	{
		$('#savedict-table table tr').remove();
		var html = exportpageformat('dict', {array: curexp.array, vartypes: curexp.vartypes, rules: vars, global: gvars});
		$('#savedict-table table').append(html);
		if (curexp.type == 'rdb')
			$('#savedict-table table tr td:first-child').click(function() {
				$point = $(this).find('span');
				if ($point.length > 0)
					$point.remove();
				else
					$(this).append('<span title="'+Lang.t('Обновлять')+'">*</span>');
			});
		
		$('#pageexport #savearray').hide();
		$('#pageexport #savedict').show();
	}
	
	$('#pageexport-list').hide();
	$('#pageexport-profile').show();
}

function pageExportListEdit(elem)
{
	var ind = $(elem).parent().find('input[name="exportid"]').val();
	if (PagesList.get())
	{
		var curexp = PagesList.get().exp[ind];
		pageExportProfile(ind, curexp);
	}
}

function pageExportListNew()
{
	if (PagesList.get())
	{
		pageExportProfile(-1, {});
	}
}

function pageExportListUp(elem)
{
	var ind = parseInt($(elem).parent().find('input[name="exportid"]').val());
	var tr = $(elem).parent().parent();
	var prev = tr.prev().detach();
	if (ind > 0)
	{
		tr.after(prev);
		//var ex = tr.find('td:nth-child(1)').text();
		//tr.find('td:nth-child(1)').text(prev.find('td:nth-child(1)').text());
		tr.find('input[name="exportid"]').val(ind-1);
		//prev.find('td:nth-child(1)').text(ex);
		prev.find('input[name="exportid"]').val(ind);
		tr.effect('highlight', {}, 600);
		
		var exp = PagesList.get().exp;
		var tmp = exp[ind];
		exp.splice(ind, 1);
		exp.splice(ind-1, 0, tmp);
		if (exp[ind].astnode && exp[ind-1].astnode)
		{
			var node = TreeUtils.deleteNode(exp[ind].astnode);
			TreeUtils.insertAfter(exp[ind-1].astnode, node);
		}
	}
}

function pageExportListDown(elem)
{
	var ind = parseInt($(elem).parent().find('input[name="exportid"]').val());
	var tr = $(elem).parent().parent();
	var next = tr.next().detach();
	if (next.length > 0)
	{
		tr.before(next);
		//var ex = tr.find('td:nth-child(1)').text();
		//tr.find('td:nth-child(1)').text(next.find('td:nth-child(1)').text());
		tr.find('input[name="exportid"]').val(ind+1);
		//next.find('td:nth-child(1)').text(ex);
		next.find('input[name="exportid"]').val(ind);
		tr.effect('highlight', {}, 600);
		
		var exp = PagesList.get().exp;
		var tmp = exp[ind+1];
		exp.splice(ind+1, 1);
		exp.splice(ind, 0, tmp);
		
		if (exp[ind].astnode && exp[ind+1].astnode)
		{
			var node = TreeUtils.deleteNode(exp[ind+1].astnode);
			TreeUtils.insertAfter(exp[ind].astnode, node);
		}
	}
}

function pageExportListDelete(elem)
{
	$('#ok-del-exppage').click(function() {
		var ind = parseInt($(elem).parent().find('input[name="exportid"]').val());
		var tr = $(elem).parent().parent();
		tr.remove();
		$('#pageexport-list-table table tbody tr').each(function(i, el) {
			$(el).find('input[name="exportid"]').val(i);
		});
		
		var exp = PagesList.get().exp;
		if (exp[ind].astnode)
			TreeUtils.deleteNode(exp[ind].astnode);
		if (exp[ind].retvarname_node)
			TreeUtils.deleteNode(exp[ind].retvarname_node);
		
		exp.splice(ind, 1);
	});
	$('#delpageexpModal').modal('show');
}

function setPageExport()
{
	var name = $('#pageexport select[name="exportname"] option:selected').val();
	var ind = $('#pageexport-profile input[name="pageexport-profile-ind"]').val();
	var filename = $('#divfilename input[name="filename"]').val();
	var retvarname = $('#divretvarname input[name="retvarname"]').val();
	
	var exp = ExportRules.get(name);
	var newexp = new PageExportClass(name, exp.type, filename);
	
	if (retvarname != '')
	{
		var res = retvarname.match(/(@global)?\s*([A-Za-z0-9][A-Za-z0-9_]*)(\[.*?\])*/);
		var vartype = (exp.type == 'rdb') ? 'array' : 'string';
		var varval = (exp.type == 'rdb') ? [] : '';
		if (res[1] == '@global')
			GlobalVars.add(res[2], vartype, varval);
		else
			PagesList.get().vars.add(res[2], vartype, varval);
	}
	
	if (exp.type == 'csv' || exp.type == 'excel')
	{
		$('#savearray-table table tr').each(function(i, el) {
			var rname = $(el).find('td:nth-child(2) select[name="rulename"] option:selected').val();
			if (rname == '{const}')
			{
				var val = $(el).find('td:nth-child(2) input').val();
				newexp.addConst(val == '' ? "''" : val);
			}
			else
				newexp.add(rname);
		});
	}
	else
	{
		$('#savedict-table table tr').each(function(i, el) {
			var varname = $(el).find('td:nth-child(1)').text();
			var rname = $(el).find('td:nth-child(3) select[name="rulename"] option:selected').val();
			if (!rname) rname = null;
			if (rname == '{const}')
			{
				var val = $(el).find('td:nth-child(3) input').val();
				newexp.addConst(val == '' ? "''" : val, varname);
			}
			else
				newexp.add(rname, varname);
		});
	}

	newexp.retvarname = retvarname != '' ? retvarname : undefined;
	var textind, $tr;
	if (ind < 0)  //добавляем новый экспорт в конец
	{
		var prevind = PagesList.get().exp.length-1;
		PagesList.get().exp.push(newexp);

		$tr = $('#pageexport-list-table table tbody tr td input[value="'+prevind+'"]').parent().parent();
		textind = prevind+1;
	}
	else
	{
		var oldexp = PagesList.get().exp[ind];
		newexp.astnode = oldexp.astnode;
		newexp.retvarname_node = oldexp.retvarname_node; 
		$.extend(true, newexp.idname, oldexp.idname);
		$.extend(true, newexp.defvals, oldexp.defvals);

		PagesList.get().exp[ind] = newexp;
		$tr = $('#pageexport-list-table table tbody tr td input[value="'+ind+'"]').parent().parent();
		textind = $tr.find('td:first-child').text();
	}
	
	var html = HTMLRenderer.render('exportlistformatrow', {i: textind, e: newexp.objForAjax(), Lang: Lang});
	if (ind < 0)
	{
		if ($tr.length > 0)
			$tr.after(html);
		else
			$('#pageexport-list-table table tbody').empty().append(html);
	}
	else
		$tr.after(html).remove();
	
	SetNotSaved();
	$('#pageexport-profile').hide();
	$('#pageexport-list').show();
}

function cancelPageExport()
{
	$('#pageexport-profile').hide();
	$('#pageexport-list').show();
}

function pageExportUp(elem)
{
	var tr = $(elem).parent().parent();
	var prev = tr.prev().detach();
	if (prev.length > 0)
	{
		tr.after(prev);
		var ex = tr.find('td:nth-child(1)').text();
		tr.find('td:nth-child(1)').text(prev.find('td:nth-child(1)').text());
		prev.find('td:nth-child(1)').text(ex);
		tr.effect('highlight', {}, 600);
	}
}

function pageExportDown(elem)
{
	var tr = $(elem).parent().parent();
	var next = tr.next().detach();
	if (next.length > 0)
	{
		tr.before(next);
		var ex = tr.find('td:nth-child(1)').text();
		tr.find('td:nth-child(1)').text(next.find('td:nth-child(1)').text());
		next.find('td:nth-child(1)').text(ex);
		tr.effect('highlight', {}, 600);
	}
}

function pageExportItemAdd()
{
	var vars = PagesList.get().vars.getSortedArray();
	var gvars = GlobalVars.getSortedArray();
	var num = $('#savearray-table table tr:last-child td:first-child').text();
	
	var html = exportpageformat('arrayrow', {num: num ? parseInt(num)+1 : 0, rules: vars, global: gvars, vartypes: 'var'});
	$('#savearray-table table').append(html);
}


function pageExportItemDelete(elem)
{
	$(elem).parent().parent().remove();
}


function exportpageformat(type, data)
{
	for (var r in data.rules)
		r.global = false;
	for (var gl in data.global)
	{
		var gl2 = {};
		$.extend(gl2, gl);
		gl2.global = true;
		data.rules.push(gl2);
	}
	
	data.Lang = Lang;
	var tmpl; 
	if (type == 'array')
		tmpl = 'exportpageformatarray';
	else if (type == 'dict')
		tmpl = 'exportpageformatdict';
	else if (type == 'arrayrow')
	{
		data.elem = null;
		tmpl = 'exportpageformatarrayrow';
	}
	return HTMLRenderer.render(tmpl, data);
}


function setRuleOptions()
{
	var name = $('#ruleoptions input[name="rulename"]').val();
	var rule = PagesList.get().rules.getByName(name);
	var storechanged = false;
	var nexttype;
	var nextchanged = false;
	
	if (rule.type == 'link')
	{
		var tmp = $('#linkopt input[name="optstore"]').prop('checked');
		if (tmp != rule.options.store) storechanged = true; 
		rule.options.store = tmp;
		var next = $('#linkopt input[name="optnext"]').prop('checked');
		nexttype = $('#linkopt select[name="optnexttype"] option:selected').val();
		nextchanged = rule.options.next != next || nexttype != rule.type;
		rule.options.next = next;
		rule.options.storefile = $('#linkopt input[name="optstorefile"]').prop('checked');
		rule.options.cont = $('#linkopt input[name="optcontinue"]').prop('checked');
	}
	else if (rule.type == 'text')
	{
		var tmp = $('#textopt input[name="optstore"]').prop('checked');
		if (tmp != rule.options.store) storechanged = true;
		rule.options.store = tmp;
		var next = $('#textopt input[name="optnext"]').prop('checked');
		nexttype = $('#textopt select[name="optnexttype"] option:selected').val();
		nextchanged = rule.options.next != next || nexttype != rule.type;
		rule.options.next = next;
		rule.options.nodeonly = $('#textopt input[name="optnodeonly"]').prop('checked');
		rule.options.decode = $('#textopt input[name="optdecode"]').prop('checked');
		
		if ($('#textopt input[name="optword"]').prop('checked'))
		{
			rule.options.word = $('#textopt input[name="optwordnumber"]').val();
			if (rule.options.word < 0) rule.options.word = 0; 
			rule.options.wordend = $('#textopt input[name="optwordnumber2"]').val();
			if (rule.options.wordend < 1) rule.options.wordend = 0;
		}
		else
		{
			rule.options.word = 0;
			rule.options.wordend = 0;
		}
		
		if ($('#textopt input[name="optreplace"]').prop('checked'))
		{
			if (!rule.options.replace) rule.options.replace = [];
			rule.options.replace[0] = $('#textopt input[name="optreplacesearch"]').val();
			rule.options.replace[1] = $('#textopt input[name="optreplacereplace"]').val();
		}
		else
			rule.options.replace = null;
		
		rule.options.implode = $('#textopt input[name="optimplode"]').prop('checked');
		if (rule.options.implode)
			rule.options.implodestr = $('#textopt input[name="optimplodestr"]').val();
	}
	else if (rule.type == 'image')
	{
		var tmp = $('#imageopt input[name="optstore"]').prop('checked');
		if (tmp != rule.options.store) storechanged = true;
		rule.options.store = tmp;
		rule.options.storefile = $('#imageopt input[name="optstorefile"]').prop('checked');
		var next = $('#imageopt input[name="optnext"]').prop('checked');
		nexttype = $('#imageopt select[name="optnexttype"] option:selected').val();
		nextchanged = rule.options.next != next || nexttype != rule.type;
		rule.options.next = next;
	}
	else if (rule.type == 'html')
	{
		var tmp = $('#htmlopt input[name="optstore"]').prop('checked');
		if (tmp != rule.options.store) storechanged = true;
		rule.options.store = tmp;
		rule.options.content = $('#htmlopt input[name="optcontent"]').prop('checked');
		var next = $('#htmlopt input[name="optnext"]').prop('checked');
		nexttype = $('#htmlopt select[name="optnexttype"] option:selected').val();
		nextchanged = rule.options.next != next || nexttype != rule.type;
		rule.options.next = next;
	}
	
	if (nextchanged && rule.options.next)
	{
		PagesList.get().links.deleteByName(name);
		
		nodes = PagesList.get().rules.getNodesByName(name);
		rule.options.origtype = rule.type; 
		rule.type = nexttype;
		for (var i=0; i<nodes.length; i++)
			selectBorderNext(nodes[i], rule.type, null, false);
		
		var html = HTMLRenderer.render('ruleformatrow', {rule: {name: name,
																type: rule.type,
																path: rule.path,
																group: rule.group},
														 Lang: Lang});
		$(elembyruleid(name)).after(html).remove();
	}
	if (nextchanged && !rule.options.next)
	{
		PagesList.get().links.deleteByName(name);
		
		nodes = PagesList.get().rules.getNodesByName(name);
		rule.type = (rule.options.origtype != undefined) ? rule.options.origtype : 'text';
		for (var i=0; i<nodes.length; i++)
			deselectBorderNext(nodes[i]);
		
		var html = HTMLRenderer.render('ruleformatrow', {rule: {name: name,
																type: rule.type,
																path: rule.path,
																group: rule.group},
														 Lang: Lang});
		$(elembyruleid(name)).after(html).remove();
	}
	
	SetNotSaved();
	$('#ruleoptions').fadeOut('slow');
}

function cancelRuleOptions()
{
	$('#ruleoptions').fadeOut('slow');
}

function setRuleSetGroup()
{
	var name = $('#rulesetgroup input[name="name"]').val();
	var newgroup = $('#rulesetgroup input[name="setname"]').val();
	var group = (newgroup) ? newgroup : $('#rulesetgroup select[name="groups"]').val();
	group = (group == '-none-') ? '' : group;
	
	var groups = PagesList.get().groups;
	if (groups.getByName(group) == undefined)
		groups.add(group);
		
	var rule = PagesList.get().rules.getByName(name);
	if (rule.group != group && rule.astnode)
	{
		TreeUtils.deleteNode(rule.astnode);
		rule.astnode = null;
	}
	rule.group = group;
	//$('#rulestbl tbody #rule_'+name+' td:nth-child(4)').text(group);
	$(elembyruleid(name)).find('td:nth-child(4)').text(group);
	var groupsobj = PagesList.get().rules.getGroupsObj();
	addToGroupFilterAll(groupsobj);
	SetNotSaved();
	$('#rulesetgroup').fadeOut('slow');
}

function cancelRuleSetGroup()
{
	$('#rulesetgroup').fadeOut('slow');
}

function setPageData()
{
	$('#pagedata').fadeOut('slow');
}

function cancelPageData()
{
	$('#pagedata').fadeOut('slow');
}


function setRuleFilter()
{
	var name = $('#rulefilter input[name="name"]').val();
	var type = $('#rulefilter select[name="filtertype"]').val();
	var str = $('#rulefilter input[name="filterstr"]').val();
	var rule = PagesList.get().rules.getByName(name);
	
	if (!rule.filter)
	{
		rule.filter = {type: type, str: str, idname: {}, defvals: {}};
	}
	else
	{
		rule.filter.type = type;
		rule.filter.str = str;
	}
	
	refreshpagedata();
}

function cancelRuleFilter()
{
	$('#rulefilter').fadeOut('slow');
}


function setGetRegExp()
{
	$win = $('#getregexp');
	var rulename = $('#getregexp input[name="rulename"]').val();
	var pattern = $('#getregexp input[name="pattern"]').val();
	var resultind = $('#getregexp input[name="resultind"]').val();
	var isedit = $win.find('input[name="rulename"]').prop('disabled');

	if (isedit)
	{
		if (PagesList.get())
		{
			var rule = PagesList.get().rules.getByName(rulename);
			rule.path = pattern;
			rule.options.resultind = resultind ? parseInt(resultind, 10) : 0;
			//$('#rulestbl tbody #rule_'+rulename+' td:nth-child(5)').text(pattern);
			$(elembyruleid(rulename)).find('td:nth-child(5)').text(pattern);
		}
	}
	else
	{
		if (PagesList.get())
		{
			var rules = PagesList.get().rules;
			var r = rules.addWithPath(rulename, 'regexp', pattern);
			r.options.resultind = resultind ? parseInt(resultind, 10) : 0;
			PagesList.get().vars.add(rulename, 'array', [], true);
			
			if (PagesList.get().type == 'html')
			{
				r.idname.opt = {html: PagesList.get().additparams.idname.id};
				r.options.html = PagesList.get().params.content;
				r.defvals.opt = {html: r.options.html};
			}
		}
	}
	
	$win.fadeOut('slow');
}


function cancelGetRegExp()
{
	$('#getregexp').fadeOut('slow');
}


function setLoadTree()
{
	$('#loadtree').fadeOut('slow');
}


function cancelLoadTree()
{
	$('#loadtree').fadeOut('slow');
}


function setHtmlTree()
{
	var $win = $('#htmltree');
	var name = $win.find('input[name="name"]').val();
	var rule = PagesList.get().rules.getByName(name);
	var newpath = $win.find('textarea[name="xpath"]').val();
	
	HtmlTree.onpreactive(HtmlTree, HtmlTree.active);
	
	if (rule.path != newpath && newpath != '')
	{
		var nodes = PagesList.get().rules.getNodesByName(name);
		for (var j=0; j<nodes.length; j++)
		{
			deselectBorder(nodes[j]);
			if (rule.options.next)
				deselectBorderNext(nodes[j]);
		}
		
		rule.path = newpath;
		
		nodes = PagesList.get().rules.getNodesByName(name);
		for (var j=0; j<nodes.length; j++)
		{
			selectBorder(nodes[j], rule.type, false, false);
			if (rule.options.next)
				selectBorderNext(nodes[j], rule.type, false, false);
		}
		
		//$('#rulestbl tbody #rule_'+name+' td:nth-child(5)').text(rule.path);
		$(elembyruleid(name)).find('td:nth-child(5)').text(rule.path);
		SetNotSaved();
	}	
	
	$win.fadeOut('slow');
}


function cancelHtmlTree()
{
	HtmlTree.onpreactive(HtmlTree, HtmlTree.active);
	$('#htmltree').fadeOut('slow');
}


function togglebrowser()
{
	$('#html').slideToggle();
}

function addToGroupFilter(group)
{
	var groupsobj = {};
	$('#tabBrowser select[name="groupfilter"] option').each(function(i, el) {
		groupsobj[$(el).val()] = true;
	});
	
	if (!groupsobj[group])
	{
		groupsobj[group] = true;
		addToGroupFilterAll(groupsobj);
	}
}

function addToGroupFilterAll(groupsobj)
{
	$('#tabBrowser select[name="groupfilter"] option').not('option[value="all"]').remove();
	for (var name in groupsobj)
		if (name != 'all')
			$('#tabBrowser select[name="groupfilter"]').append('<option value="'+name+'">'+name+'</option>');
}


//Помощник в редакторе скрипта

function showHelper()
{
	$('#helper').fadeToggle('slow');
}

function insertFunc()
{
	var str = '';
	var $div = $('#helper .tab-content .tab-pane.active');
	
	if ($div.attr('id') == 'func1')  //loadpage
	{
		var url = $div.find('input[name="url"]').val();
		var method = $div.find('select[name="method"]').val();
		var params = $div.find('input[name="params"]').val();
		var encoding = $div.find('input[name="encoding"]').val();
		var headers = $div.find('input[name="headers"]').val();
		//var isauto = $div.find('input[name="auto"]').prop('checked');
		
		//if (isauto) str += '@auto ';
		str += 'loadpage(';
		var paramstr = '';
		var notdefault = false;
		if (headers != '')
		{
			paramstr = ", "+headers;
			notdefault = true;
		}
		if (encoding != '')
		{
			paramstr = ", "+encoding+paramstr;
			notdefault = true;
		}
		else if (notdefault)
			paramstr = ", 'UTF-8'"+paramstr;
		
		if (params != '')
		{
			paramstr = ", "+params+paramstr;
			notdefault = true;
		}
		else if (notdefault)
			paramstr = ", dict()"+paramstr;
		
		if (method == 'post' || notdefault)
		{
			paramstr = ", '"+method+"'"+paramstr;
			notdefault = true;
		}
		paramstr = url + paramstr;
		str += paramstr +')\n{\n}';
	}
	else if ($div.attr('id') == 'func2')  //gettext
	{
		var xpath = $div.find('input[name="xpath"]').val();
		var istextnode = $div.find('input[name="textnode"]').prop('checked');
		var isnext = $div.find('input[name="next"]').prop('checked');
		var isword = $div.find('input[name="word"]').prop('checked');
		var wordnumber = $div.find('input[name="wordnumber"]').val();
		var wordnumber2 = $div.find('input[name="wordnumber2"]').val();
		//var isauto = $div.find('input[name="auto"]').prop('checked');
		
		var optstr = '';
		if (istextnode)
			optstr += ", 'nodeonly' => 'true'";
		if (isnext)
			optstr += ", 'next' => 'true'";
		if (isword)
		{
			wordnumber = (wordnumber > 0) ? wordnumber : 1;
			wordnumber2 = (wordnumber2 > 0) ? wordnumber2 : 1;
			optstr += ", 'word' => "+wordnumber+", 'wordend' => "+wordnumber2;
		}
		if (istextnode || isnext || isword)
			optstr = ', dict('+optstr.substring(2)+')';
		str = 'gettext('+xpath+optstr+');\n';
	}
	else if ($div.attr('id') == 'func3')  //getlink
	{
		var xpath = $div.find('input[name="xpath"]').val();
		var isnext = $div.find('input[name="next"]').prop('checked');
		//var isauto = $div.find('input[name="auto"]').prop('checked');
		
		var optstr = '';
		if (isnext)
			optstr += ", 'next' => 'true'";
		if (isnext)
			optstr = ', dict('+optstr.substring(2)+')';
		str = 'getlink('+xpath+optstr+');\n';
	}
	else if ($div.attr('id') == 'func4')  //getimglink
	{
		var xpath = $div.find('input[name="xpath"]').val();
		var isnext = $div.find('input[name="next"]').prop('checked');
		//var isauto = $div.find('input[name="auto"]').prop('checked');
		
		var optstr = '';
		if (isnext)
			optstr += ", 'next' => 'true'";
		if (isnext)
			optstr = ', dict('+optstr.substring(2)+')';
		str = 'getimglink('+xpath+optstr+');\n';
	}
	else if ($div.attr('id') == 'func5')  //getregexp
	{
		var pattern = $div.find('input[name="pattern"]').val();
		str = 'getregexp('+pattern+');\n';
	}
	else if ($div.attr('id') == 'func6')  //getattr
	{
		var xpath = $div.find('input[name="xpath"]').val();
		var attr = $div.find('input[name="attr"]').val();
		var isnext = $div.find('input[name="next"]').prop('checked');
				
		optstr = ", 'attr' => "+attr;
		if (isnext)
			optstr += ", 'next' => 'true'";
		optstr = ', dict('+optstr.substring(2)+')';
		str = 'getattr('+xpath+optstr+');\n';
	}
	else if ($div.attr('id') == 'func7')  //store
	{
		var profile = $div.find('input[name="profile"]').val();
		var filename = $div.find('input[name="filename"]').val();
		var data = $div.find('input[name="data"]').val();
		//var isauto = $div.find('input[name="auto"]').prop('checked');
		
		//if (isauto) str += '@auto ';
		str += 'store('+profile+', '+filename+', '+data+');\n';
	}
	else if ($div.attr('id') == 'func8')  //storefile
	{
		var link = $div.find('input[name="link"]').val();
		//var isauto = $div.find('input[name="auto"]').prop('checked');
		
		//if (isauto) str += '@auto ';
		str += 'storefile('+link+');\n';
	}
	else if ($div.attr('id') == 'func9')  //continue
	{
		var link = $div.find('input[name="link"]').val();
		//var isauto = $div.find('input[name="auto"]').prop('checked');
		
		//if (isauto) str += '@auto ';
		str += 'continue('+link+');\n';
	}
	else if ($div.attr('id') == 'func10')  //dump
	{
		var varname = $div.find('input[name="varname"]').val();
		str = 'dump('+varname+');\n';
	}
	else if ($div.attr('id') == 'func11')  //generateurl
	{
		var pattern = $div.find('input[name="pattern"]').val();
		var params = $div.find('input[name="params"]').val();
		str = 'generateurl('+pattern+', '+params+');\n';
	}
	else if ($div.attr('id') == 'func12')  //concat
	{
		var string1 = $div.find('input[name="string1"]').val();
		var string2 = $div.find('input[name="string2"]').val();
		str = 'concat('+string1+', '+string2+');\n';
	}
	else if ($div.attr('id') == 'func13')  //regexp
	{
		var pattern = $div.find('input[name="pattern"]').val();
		var string = $div.find('input[name="str"]').val();
		str = 'regexp('+pattern+', '+string+');\n';
	}
	else if ($div.attr('id') == 'func14')  //filter_key
	{
		var data = $div.find('input[name="data"]').val();
		var type = $div.find('select[name="type"]').val();
		var string = $div.find('input[name="str"]').val();
		str = 'filter_key('+data+', \''+type+'\', '+string+');\n';
	}
	else if ($div.attr('id') == 'func15')  //filter_value
	{
		var data = $div.find('input[name="data"]').val();
		var type = $div.find('select[name="type"]').val();
		var string = $div.find('input[name="str"]').val();
		str = 'filter_value('+data+', \''+type+'\', '+string+');\n';
	}
	else if ($div.attr('id') == 'func16')  //foreach
	{
		var data = $div.find('input[name="data"]').val();
		var key = $div.find('input[name="key"]').val();
		var val = $div.find('input[name="val"]').val();
		
		var params = '';
		if (key != '')
			params += key+' => ';
		
		str = 'foreach ('+data+' as '+params+val+')\n';
	}
	else if ($div.attr('id') == 'func17')  //if
	{
		var cond = $div.find('input[name="condition"]').val();
		var iselse = $div.find('input[name="else"]').prop('checked');
				
		str = 'if ('+cond+') { }';
		if (iselse)
			str += ' else { }';
		str += '\n';
	}
	else if ($div.attr('id') == 'func18')  //count
	{
		var data = $div.find('input[name="data"]').val();
		str = 'count('+data+');\n';
	}
	else if ($div.attr('id') == 'func19')  //store_table
	{
		var profile = $div.find('input[name="profile"]').val();
		var filename = $div.find('input[name="filename"]').val();
		var data = $div.find('input[name="data"]').val();
		
		str += 'store_table('+profile+', '+filename+', '+data+');\n';
	}
	else if ($div.attr('id') == 'func20')  //maketable
	{
		var data = $div.find('input[name="data"]').val();
		str = 'maketable('+data+');\n';
	}
	else if ($div.attr('id') == 'func21')  //dbconnect
	{
		var host = $div.find('input[name="host"]').val();
		var user = $div.find('input[name="user"]').val();
		var password = $div.find('input[name="password"]').val();
		var dbname = $div.find('input[name="dbname"]').val();
		str = 'dbconnect('+host+', '+user+', '+password+', '+dbname+');\n';
	}
	else if ($div.attr('id') == 'func22')  //dbfind
	{
		var conn = $div.find('input[name="conn"]').val();
		var table = $div.find('input[name="table"]').val();
		var attrs = $div.find('input[name="attrs"]').val();
		var condition = $div.find('input[name="condition"]').val();
		var params = $div.find('input[name="params"]').val();
		
		paramstr = '';
		if (condition != '')
		{
			paramstr += ', '+condition;
			if (params != '')
				paramstr += ', '+params;
		}
		
		str = 'dbfind('+conn+', '+table+', '+attrs+paramstr+');\n';
	}
	else if ($div.attr('id') == 'func23')  //dbinsert
	{
		var conn = $div.find('input[name="conn"]').val();
		var table = $div.find('input[name="table"]').val();
		var attrs = $div.find('input[name="attrs"]').val();
		str = 'dbinsert('+conn+', '+table+', '+attrs+');\n';
	}
	else if ($div.attr('id') == 'func24')  //dbupdate
	{
		var conn = $div.find('input[name="conn"]').val();
		var table = $div.find('input[name="table"]').val();
		var attrs = $div.find('input[name="attrs"]').val();
		var whereattrs = $div.find('input[name="whereattrs"]').val();
		str = 'dbupdate('+conn+', '+table+', '+attrs+', '+whereattrs+');\n';
	}
	else if ($div.attr('id') == 'func25')  //dbdelete
	{
		var conn = $div.find('input[name="conn"]').val();
		var table = $div.find('input[name="table"]').val();
		var whereattrs = $div.find('input[name="whereattrs"]').val();
		str = 'dbdelete('+conn+', '+table+', '+whereattrs+');\n';
	}
	else if ($div.attr('id') == 'func26')  //dbclose
	{
		var conn = $div.find('input[name="conn"]').val();
		str = 'dbclose('+conn+');\n';
	}
	else if ($div.attr('id') == 'func27')  //mail
	{
		var to = $div.find('input[name="to"]').val();
		var subject = $div.find('input[name="subject"]').val();
		var body = $div.find('input[name="body"]').val();
		
		if (subject == '') subject = "''";
		if (body == '') body = "''";
		str = 'mail('+to+', '+subject+', '+body+');\n';
	}
	else if ($div.attr('id') == 'func28')  //filter_eqkeys
	{
		var params = $div.find('input[name="data"]').val();
		str = 'filter_eqkeys('+params+');\n';
	}
	else if ($div.attr('id') == 'func29')  //group
	{
		var groupname = $div.find('input[name="name"]').val();
		//var isauto = $div.find('input[name="auto"]').prop('checked');
		
		//if (isauto) str += '@auto ';
		str += 'group '+groupname+' {\n}\n';
	}
	else if ($div.attr('id') == 'func30')  //getform
	{
		var xpath = $div.find('input[name="xpath"]').val();
		//var isauto = $div.find('input[name="auto"]').prop('checked');
		
		//if (isauto) str += '@auto ';
		str += 'getform('+xpath+');\n';
	}
	else if ($div.attr('id') == 'func31')  //submitform
	{
		var form = $div.find('input[name="form"]').val();
		var encoding = $div.find('input[name="encoding"]').val();
		var headers = $div.find('input[name="headers"]').val();
		//var isauto = $div.find('input[name="auto"]').prop('checked');
		
		//if (isauto) str += '@auto ';
		str += 'submitform(';
		var paramstr = '';
		var notdefault = false;
		if (headers != '')
		{
			paramstr = ", "+headers;
			notdefault = true;
		}
		if (encoding != '')
		{
			paramstr = ", "+encoding+paramstr;
			notdefault = true;
		}
		else if (notdefault)
			paramstr = ", 'UTF-8'"+paramstr;
		
		paramstr = form + paramstr;
		str += paramstr +'){\n}\n';
	}
	else if ($div.attr('id') == 'func32')  //formgetparam
	{
		var form = $div.find('input[name="form"]').val();
		var param = $div.find('input[name="param"]').val();
		str += 'formgetparam('+form+', '+param+');\n';
	}
	else if ($div.attr('id') == 'func33')  //formsetparam
	{
		var form = $div.find('input[name="form"]').val();
		var param = $div.find('input[name="param"]').val();
		var value = $div.find('input[name="value"]').val();
		//var isauto = $div.find('input[name="auto"]').prop('checked');
		
		//if (isauto) str += '@auto ';
		str += 'formsetparam('+form+', '+param+', '+value+');\n';
	}
	else if ($div.attr('id') == 'func34')  //formgetselectkey
	{
		var form = $div.find('input[name="form"]').val();
		var param = $div.find('input[name="param"]').val();
		var value = $div.find('input[name="value"]').val();
		str += 'formgetselectkey('+form+', '+param+', '+value+');\n';
	}
	else if ($div.attr('id') == 'func35')  //formgetselectvalue
	{
		var form = $div.find('input[name="form"]').val();
		var param = $div.find('input[name="param"]').val();
		var value = $div.find('input[name="value"]').val();
		str += 'formgetselectvalue('+form+', '+param+', '+value+');\n';
	}
	else if ($div.attr('id') == 'func36')  //gethtml
	{
		var xpath = $div.find('input[name="xpath"]').val();
		var iscontent = $div.find('input[name="content"]').prop('checked');
		
		var optstr = '';
		if (iscontent)
			optstr += ", 'content' => 'true'";
		if (iscontent)
			optstr = ', dict('+optstr.substring(2)+')';
		str = 'gethtml('+xpath+optstr+');\n';
	}
	else if ($div.attr('id') == 'func37')  //removetags
	{
		var html = $div.find('input[name="html"]').val();
		var tags = $div.find('input[name="tags"]').val();
		str += 'removetags('+html+', '+tags+');\n';
	}
	else if ($div.attr('id') == 'func38')  //basename
	{
		var path = $div.find('input[name="path"]').val();
		str += 'basename('+path+');\n';
	}
		
	insertCodeInTextArea(str);
	decorator.update();
	SetNotSaved();
}

function insertCodeInTextArea(textValue) {
    //Get textArea HTML control 
    var txtArea = document.getElementById('script');
	//IE
    if (document.selection) {
        txtArea.focus();
        var sel = document.selection.createRange();
        sel.text = textValue;
        return;
    }
    //Firefox, chrome, mozilla
    else if (txtArea.selectionStart || txtArea.selectionStart == '0') {
        var startPos = txtArea.selectionStart;
        var endPos = txtArea.selectionEnd;
        txtArea.value = txtArea.value.substring(0, startPos) + textValue + txtArea.value.substring(endPos, txtArea.value.length);
        txtArea.focus();
        txtArea.selectionStart = startPos + textValue.length;
        txtArea.selectionEnd = startPos + textValue.length;
    }
}







function exportNew()
{
	$('#exportedit input[name="newedit"]').val('new');
	$('#exportedit h3:nth-child(1)').show();
	$('#exportedit h3:nth-child(2)').hide();
	
	$('#exportedit #tabCSV #exportName').prop('disabled', false);
	$('#exportedit #tabXML #exportName').prop('disabled', false);
	$('#exportedit #tabSQL #exportName').prop('disabled', false);
	$('#exportedit #tabExcel #exportName').prop('disabled', false);
	$('#exportedit #tabRDB #exportName').prop('disabled', false);
	
	$('#exportedit #tabCSV #exportName').val('');
	$('#exportedit #tabCSV #exportExtension').val('csv');
	$('#exportedit #tabCSV #exportDelimiter').val(',');
	$('#exportedit #tabCSV #exportIssave').prop('checked', true);
	
	$('#exportedit #tabXML #exportName').val('');
	$('#exportedit #tabXML #exportExtension').val('xml');
	$('#exportedit #tabXML #exportTemplateHead').val('<?xml version="1.0" encoding="utf-8" ?>');
	$('#exportedit #tabXML #exportTemplateBody').val('');
	$('#exportedit #tabXML #exportTemplateTail').val('');
	$('#exportedit #tabXML #exportIssave').prop('checked', true);
	
	$('#exportedit #tabSQL #exportName').val('');
	$('#exportedit #tabSQL #exportExtension').val('sql');
	$('#exportedit #tabSQL #exportTemplateHead').val('');
	$('#exportedit #tabSQL #exportTemplateBody').val('');
	$('#exportedit #tabSQL #exportTemplateTail').val('');
	$('#exportedit #tabSQL #exportIssave').prop('checked', true);
	
	$('#exportedit #tabExcel #exportName').val('');
	$('#exportedit #tabExcel #exportExtension').val('xls');
	$('#exportedit #tabExcel #exportTemplateHead').val('');
	$('#exportedit #tabExcel #exportinsimage').prop('checked', false);
	
	$('#exportedit #tabRDB #exportName').val('');
	$('#exportedit #tabRDB #exportRDBType option:first-child').prop('selected', true);
	$('#tabRDB #dbparams').show();
	$('#tabRDB #dbparams #exportDBHost').val('');
	$('#tabRDB #dbparams #exportDBUser').val('');
	$('#tabRDB #dbparams #exportDBPass').val('');
	$('#tabRDB #dbparams #exportDBName').val('');
		
	$('#exporttable').hide();
	$('#exportedit').show();
}

function exportEdit(elem)
{
	$('#exportedit input[name="newedit"]').val('edit');
	$('#exportedit h3:nth-child(1)').hide();
	$('#exportedit h3:nth-child(2)').show();
	
	var name = $(elem).parent().parent().find('td:nth-child(1)').text();
	var exp = ExportRules.get(name);
	$('#exportedit input[name="exportType"]').val(exp.type);
	$('#exportedit #tabCSV #exportName').prop('disabled', true);
	$('#exportedit #tabXML #exportName').prop('disabled', true);
	$('#exportedit #tabSQL #exportName').prop('disabled', true);
	$('#exportedit #tabExcel #exportName').prop('disabled', true);
	$('#exportedit #tabRDB #exportName').prop('disabled', true);
	
	$('#exportedit #tabCSV #exportName').val(name);
	$('#exportedit #tabCSV #exportExtension').val('csv');
	$('#exportedit #tabCSV #exportDelimiter').val('');
	$('#exportedit #tabCSV #exportIssave').prop('checked', true);
	
	$('#exportedit #tabXML #exportName').val(name);
	$('#exportedit #tabXML #exportExtension').val('xml');
	$('#exportedit #tabXML #exportTemplateHead').val('<?xml version="1.0" encoding="utf-8" ?>');
	$('#exportedit #tabXML #exportTemplateBody').val('');
	$('#exportedit #tabXML #exportTemplateTail').val('');
	$('#exportedit #tabXML #exportIssave').prop('checked', true);
	
	$('#exportedit #tabSQL #exportName').val(name);
	$('#exportedit #tabSQL #exportExtension').val('sql');
	$('#exportedit #tabSQL #exportTemplateHead').val('');
	$('#exportedit #tabSQL #exportTemplateBody').val('');
	$('#exportedit #tabSQL #exportTemplateTail').val('');
	$('#exportedit #tabSQL #exportIssave').prop('checked', true);
	
	$('#exportedit #tabExcel #exportName').val(name);
	$('#exportedit #tabExcel #exportExtension').val('xls');
	$('#exportedit #tabExcel #exportTemplateHead').val('');
	
	$('#exportedit #tabRDB #exportIssave').prop('checked', true);
	$('#tabRDB #dbparams').show();
	$('#tabRDB #dbparams #exportDBHost').val('');
	$('#tabRDB #dbparams #exportDBUser').val('');
	$('#tabRDB #dbparams #exportDBPass').val('');
	$('#tabRDB #dbparams #exportDBName').val('');
	
	$('#exportedit #tabRDB #exportName').val(name);
	
	if (exp.type == 'csv')
	{
		$('#exportRadio a').each(function(i, el) {
			if (el.href.search('#tabCSV') != -1)
				$(el).tab('show');
		});
		
		$('#exportedit #tabCSV #exportExtension').val(exp.extension);
		$('#exportedit #tabCSV #exportDelimiter').val(exp.delimiter);
		$('#exportedit #tabCSV #exportIssave').prop('checked', exp.issave);
	}
	else if (exp.type == 'xml')
	{
		$('#exportRadio a').each(function(i, el) {
			if (el.href.search('#tabXML') != -1)
				$(el).tab('show');
		});
		
		$('#exportedit #tabXML #exportExtension').val(exp.extension);
		$('#exportedit #tabXML #exportTemplateHead').val(exp.head);
		$('#exportedit #tabXML #exportTemplateBody').val(exp.body);
		$('#exportedit #tabXML #exportTemplateTail').val(exp.tail);
		$('#exportedit #tabXML #exportIssave').prop('checked', exp.issave);
	}
	else if (exp.type == 'sql')
	{
		$('#exportRadio a').each(function(i, el) {
			if (el.href.search('#tabSQL') != -1)
				$(el).tab('show');
		});
		
		$('#exportedit #tabSQL #exportExtension').val(exp.extension);
		$('#exportedit #tabSQL #exportTemplateHead').val(exp.head);
		$('#exportedit #tabSQL #exportTemplateBody').val(exp.body);
		$('#exportedit #tabSQL #exportTemplateTail').val(exp.tail);
		$('#exportedit #tabSQL #exportIssave').prop('checked', exp.issave);
	}
	else if (exp.type == 'excel')
	{
		$('#exportRadio a').each(function(i, el) {
			if (el.href.search('#tabExcel') != -1)
				$(el).tab('show');
		});
		
		$('#exportedit #tabExcel #exportExtension').val(exp.extension);
		$('#exportedit #tabExcel #exportTemplateHead').val(exp.head);
		$('#exportedit #tabExcel #exportinsimage').prop('checked', exp.tail == 'true' ? true:false);
	}
	else if (exp.type == 'rdb')
	{
		$('#exportRadio a').each(function(i, el) {
			if (el.href.search('#tabRDB') != -1)
				$(el).tab('show');
		});
		
		$('#exportedit #tabRDB #exportRDBType').val(exp.extension);
		$('#exportedit #tabRDB #exportDataset').val(exp.head);
		$('#exportedit #tabRDB #exportIssave').prop('checked', exp.issave);
		
		$('#tabRDB #dbparams #exportDBHost').val(exp.tail.host);
		$('#tabRDB #dbparams #exportDBUser').val(exp.tail.user);
		$('#tabRDB #dbparams #exportDBPass').val(exp.tail.pass);
		$('#tabRDB #dbparams #exportDBName').val(exp.tail.dbname);
		
		if (exp.issave)
			$('#tabRDB #dbparams').show();
		else
			$('#tabRDB #dbparams').hide();
	}
	
	$('#exporttable').hide();
	$('#exportedit').show();
}

//удаляем удалившиеся параметры из правил для загружаемых страниц
//и добавляем добавленные параметры
function deleteExportParams(page, name, varnames)
{
	var pageexp = page.exp;
	if (pageexp && pageexp.name == name)
	{
		var findtable = {};
		for (var rname in pageexp.array)
			findtable[rname] = false;

		for (var i=0; i<varnames.length; i++)
			if (findtable[varnames[i]] === false) 
				findtable[varnames[i]] = true;
			else if (findtable[varnames[i]] == undefined)
				pageexp.add(null, varnames[i]);
		
		for (rname in findtable)
			if (findtable[rname] === false)
				pageexp.delByVarname(rname);
	}
	var links = page.links;
	for (i=0; i<links.array2.length; i++)
	{
		var rname = links.array2[i]; 
		if (typeof rname == 'string')
			deleteExportParams(links.array[rname], name, varnames);
		else
			deleteExportParams(rname, name, varnames);
	}
}

function exportEditOk()
{
	var newedit = $('#exportedit input[name="newedit"]').val();
	var type = $('#exportedit input[name="exportType"]').val();
	
	var name;
	var params = {};
	if (type == 'csv')
	{
		name = $('#tabCSV #exportName').val();
		params.extension = $('#tabCSV #exportExtension').val();
		params.delimiter = $('#tabCSV #exportDelimiter').val();
		params.issave = $('#tabCSV #exportIssave').prop('checked');
	}
	else if (type == 'xml')
	{
		name = $('#tabXML #exportName').val();
		params.extension = $('#tabXML #exportExtension').val();
		params.head = $('#tabXML #exportTemplateHead').val();
		params.body = $('#tabXML #exportTemplateBody').val();
		params.tail = $('#tabXML #exportTemplateTail').val();
		params.issave = $('#tabXML #exportIssave').prop('checked');
	}
	else if (type == 'sql')
	{
		name = $('#tabSQL #exportName').val();
		params.extension = $('#tabSQL #exportExtension').val();
		params.head = $('#tabSQL #exportTemplateHead').val();
		params.body = $('#tabSQL #exportTemplateBody').val();
		params.tail = $('#tabSQL #exportTemplateTail').val();
		params.issave = $('#tabSQL #exportIssave').prop('checked');
	}
	else if (type == 'excel')
	{
		name = $('#tabExcel #exportName').val();
		params.extension = $('#tabExcel #exportExtension').val();
		params.head = $('#tabExcel #exportTemplateHead').val();
		params.tail = $('#tabExcel #exportinsimage').prop('checked') ? 'true':'false';
		params.issave = true;
	}
	else if (type == 'rdb')
	{
		name = $('#tabRDB #exportName').val();
		params.extension = $('#tabRDB #exportRDBType').val();
		params.body = RDBFlat[params.extension];
		params.head = $('#tabRDB #exportDataset').val();
		params.issave = $('#tabRDB #exportIssave').prop('checked');
		params.tail = {};
		params.tail.host = $('#tabRDB #dbparams #exportDBHost').val();
		params.tail.user = $('#tabRDB #dbparams #exportDBUser').val();
		params.tail.pass = $('#tabRDB #dbparams #exportDBPass').val();
		params.tail.dbname = $('#tabRDB #dbparams #exportDBName').val();
	}
	if (name == '') return;
	ExportRules.add(name, type, params);
	
	if (PagesList.array.length>0 && newedit=='edit' && (type=='xml' || type=='sql'))
	{
		var varnames = params.body.match(/\$[A-Za-z][A-Za-z0-9_]*/g);
		deleteExportParams(PagesList.array[0], name, varnames);
	}
		
	if (newedit == 'new')
	{
		$.ajax({url: '/main/exportrulenew',
            type: 'POST',
            dataType: 'html',
            data: {scraperid: $('#tabScript input[name="scraperid"]').val(), name: name,
            		type: type, params: params},
            success: function(data) {
            	$('#exporttbl tbody tr').remove();
            	$('#exporttbl tbody').append(data);
            }
		});
	}
	else if (newedit == 'edit')
	{
		$.ajax({url: '/main/exportruleupdate',
            type: 'POST',
            dataType: 'html',
            data: {scraperid: $('#tabScript input[name="scraperid"]').val(), name: name,
            		type: type, params: params},
            success: function(data) {
            	$('#exporttbl tbody tr').remove();
            	$('#exporttbl tbody').append(data);
            }
		});
	}
	
	//SetNotSaved();
	$('#exportedit').hide();
	$('#exporttable').show();
}

function exportEditCancel()
{
	$('#exportedit').hide();
	$('#exporttable').show();
}

function exportDelete(elem)
{
	$('#delexpModal #ok-del-exp').click(function() {
		exportDelete2(elem);
	});
	$('#delexpModal').modal('show');
}


function deleteAllPageExport(name)
{
	this.deleteFromLinks = function(links)
	{
		for (var i=0; i<links.array2.length; i++)
		{
			var page = links.array2[i];
			if (typeof page == 'string')
				page = links.array[page];
			
			var exp = page.exp;
			var j = 0;
			while (j<exp.length)
			{
				if (exp[j].name == name)
					exp.splice(j, 1);
				else
					j++;
			}
			this.deleteFromLinks(page.links);
		}
	};
	for (var i=0; i<PagesList.array2.length; i++)
	{
		var exp = PagesList.array2[i].exp;
		var j = 0;
		while (j<exp.length)
		{
			if (exp[j].name == name)
				exp.splice(j, 1);
			else
				j++;
		}
		this.deleteFromLinks(PagesList.array2[i].links);
	}
}


function exportDelete2(elem)
{
	var name = $(elem).parent().parent().find('td:nth-child(1)').text();
	ExportRules.del(name);
	$(elem).parent().parent().remove();
	
	$.ajax({url: '/main/exportruledelete',
        type: 'POST',
        dataType: 'html',
        data: {scraperid: $('#tabScript input[name="scraperid"]').val(), name: name},
        success: function(data) {
        }
	});
	
	deleteAllPageExport(name);
}


function rdb2flat(rdbarray, ret)
{
	for (var name in rdbarray)
		if (rdbarray[name] instanceof Object)
		{
			ret[name] = rdbarray[name];
			rdb2flat(rdbarray[name], ret);
		}
}

function rdb2text(rdbarray)
{
	var str = '<ul>';
	for (var name in rdbarray)
	{
		if (rdbarray[name] instanceof Object)
		{
			str += '<li style="padding-top: 5px;"><p><strong>'+name+'</strong></p>';
			str += rdb2text(rdbarray[name]);
		}
		else
			str += '<li><p>'+name+'</p>';
					
		str += '</li>';
	}
	str += '</ul>';
	return str;
}



//Редактор. Страница "Скрипт", сканер, парсер и преобразователь скрипта в объекты браузер

var ldtparser;
var IsScriptChanged = true;



function escapeStr(str)
{
	if (typeof str == 'string')
		return str.replace(/([^\\])'/g, "$1\\'");
	return str;
}

function trim(str)
{
    return str.replace(/^\s+|\s+$/g,"");
}

function value2output(val)
{
	if (typeof val == 'string')
		return "'"+escapeStr(val)+"'";
	
	if (typeof val == 'number')
		return val;
	
	if (typeof val == 'boolean')
		return "'"+val.toString()+"'";
	
	if (val instanceof Array)
	{
		var str = '';
		for (var i=0; i<val.length; i++)
			str += ', '+value2output(val[i]);
		return 'array('+str.substring(2)+')';
	}
	if (val instanceof Object)
	{
		var str = '';
		for (var i in val)
			str += ', \''+i+'\'=>'+value2output(val[i]);
		return 'dict('+str.substring(2)+')';
	}
}

function valequal(val1, val2)
{
	if (val1 instanceof Array && val2 instanceof Array)
	{
		if (val1.length != val2.length)
			return false;
		for (var i=0; i<val1.length; i++)
			if (!valequal(val1[i], val2[i]))
				return false;
		return true;
	}
	else if (val1 instanceof Object && val2 instanceof Object)
	{
		for (var i in val1)
			if (!valequal(val1[i], val2[i]))
				return false;
		for (var j in val2)
			if (!valequal(val1[j], val2[j]))
				return false;
		return true;
	}
	else if (val1 == val2)
		return true;
	
	return false;
}


function setCursorPos(o, n, m)
{
	m = (m == undefined) ? n : m;
	
	if(!document.all)
	{
		var end = o.value.length; 
		o.setSelectionRange(n,m); 
		o.focus(); 
	}
	else
	{     
		var r = o.createTextRange();     
		r.collapse(true);
		r.moveStart("character", n);
		r.moveEnd("character", m);
		r.select();
	}
}

function getCursorPos(el)
{
	if (el.selectionStart) {
		return (el.selectionStart <= el.selectionEnd) ? el.selectionStart : el.selectionEnd;
		//return el.selectionStart;
	} else if (document.selection) {
		el.focus();

		var r = document.selection.createRange();
		if (r == null) {
			return 0;
		}

		var re = el.createTextRange(),
		rc = re.duplicate();
		re.moveToBookmark(r.getBookmark());
		rc.setEndPoint('EndToStart', re);

		return rc.text.length;
	} 
	return 0;
}


function getLineColumn(el)
{
	var pos = getCursorPos(el);
	var text = el.value;
	var coord = {line: 0, column: 0};
	for (var i=0; i<pos; i++)
	{
		if (text.charAt(i) == '\n')
		{
			coord.line++;
			coord.column = 0;
		}
		else
			coord.column++;
	}
	return coord;
}

function linecolumnEvent(el)
{
	var coord = getLineColumn(el);
	$('#lineid').text(coord.line);
	$('#columnid').text(coord.column);
}


function tabScriptClick()
{
	if (!IsSaved)
	{
		var SLScript = new SLScriptClass();
		SLScript.createFromPages(PagesList);
		$('#script2').val(SLScript.script);
		var script1 = $('#script').val();
		if (!disBrowser)
		{
			/*var merger = new ScriptMergeClass2();
			var script3 = merger.merge(script1, SLScript.script);*/
			$('#script3').val(script1);
			var result = (AST) ? TreeUtils.tree2script(AST) : SLScript.script;
			$('#script').val(result);
			decorator.update();
			IsScriptChanged = true;
		}
		/*else if (SLScript.script != '' && script1 == '' && !disBrowser)
		{
			$('#script').val(SLScript.script);
			decorator.update();
			IsScriptChanged = true;
		}*/
	}
}


function mergetest()
{
	var script2 = $('#script2').val();
	var script1 = $('#script').val();
	if (script2 != '' && script1 != '')
	{
		var merger = new ScriptMergeClass2();
		var script3 = merger.merge(script1, script2);
		$('#script3').val(script3);
	}
}


function mergetest2()
{
	var script2 = $('#script2').val();
	var script1 = $('#script').val();
	if (script2 != '' && script1 != '')
	{
		var merger = new ScriptMergeClass2();
		var script3 = merger.mergetest(script1, script2);
		$('#script3').val(script3);
	}
}

var LoadingProcessCount = 0;
function showLoadingProcess()
{
	if (LoadingProcessCount <= 0)
	{
		var $layer = $('<div id="layer1" class="toplayer"></div>');
		$layer.css('top', $('#header').height()-5);
		$layer.width($(window).width());
		$layer.height($(document).height());
		$layer.appendTo('body');
	
		$('#loader').show();
		var $win = $('#loader');
		$win.css('left', ($(window).width()-$win[0].offsetWidth)/2);
		$win.css('top', ($(window).height()-$win[0].offsetHeight-100)/2);
		LoadingProcessCount = 0;
	}
	LoadingProcessCount++;
}


function closeLoadingProcess()
{
	LoadingProcessCount--;
	if (LoadingProcessCount <= 0)
	{
		$('#loader').hide();
		$('#layer1').remove();
		LoadingProcessCount = 0;
	}
}

function tabBrowserClick()
{
	if (!disBrowser && $('#script').val() != '' && IsScriptChanged)
	{
		//showLoadingProcess();
		//parsetest2();
	}
}


function parsetest()
{
	var scanner = new ScriptScannerClass($('#script').val());
	lexems = [];
	var lex;
	do {
		lex = scanner.getNextToken();
		lexems.push(lex);
	} while (lex.type != 'SMB_END');
	
	var str = '';
	for (var i=0; i<lexems.length; i++)
	{
		var l = lexems[i];
		str += l.type+' '+l.token+' start:'+l.start+' len:'+l.length+' line:'+l.line+' col:'+l.column+' val:'+l.value+'\n';
	}
	$('#output').val(str);
}


function resetRulesSelectionForPage(page)
{
	var iframeid = HtmlFrames.getFrameId(page.url, page.type, page.params, page.encoding, [], page.index);
	var frmid = iframeid ? iframeid.id : 'html'; 
	deselectRules(page.rules, frmid);
	
	for (var i=0; i<page.links.array2.length; i++)
	{
		var link = page.links.array2[i];
		if (typeof link == 'string')
			link = page.links.array[link];
		resetRulesSelectionForPage(link);
	}
}


function resetRulesSelectionAll()
{
	if (PagesList)
	{
		for (var i=0; i<PagesList.array2.length; i++)
		{
			var page = PagesList.array2[i];
			resetRulesSelectionForPage(page);
		}
	}
}

var AST = null;
var ASTExec = null;
var isParseFinish = 0;
var showScriptTab = false;
var TabsHistory = [];


function parsetest2()
{
	isParseFinish = 1;
	showScriptTab = false;
	$('#output').val('');
	resetRulesSelectionAll();   //убираем все rules selection со страниц во фреймах
	
	var parser = new ScriptParserClass($('#script').val());
	try {
		parser.parse();
		TreeUtils.prepareTree(parser.ast);
		AST = parser.ast;
		ASTExec = new ScriptASTExecClass(parser.ast);
		ASTExec.run();
		if (!ASTExec.pause)
		{
			PagesList = ASTExec.pages_list;
			isParseFinish = 3;
			closeLoadingProcess();
			$('#output').val(ASTExec.output);
			TabsHistory.push('browser');
		}
	}
	catch(e) {
		closeLoadingProcess();
		showScriptTab = true;
		$('#tab-script').tab('show');
		if (e.name == 'SLSError')
		{
			$('#output').val(e.message+'. line: '+e.line+' column: '+e.column);
			setCursorPos(document.getElementById('script'), e.start, e.start+e.length);
		}
		else
			$('#output').val(e.toString());
	}
}


function execContinue()
{
	try {
		isParseFinish = 2;
		ASTExec.run();
		if (ASTExec.pages_list && !ASTExec.pause)
		{
			PagesList = ASTExec.pages_list;
			if (($('#tabBrowser').hasClass('active') || ParseExec) && isParseFinish == 2)
			{
				isParseFinish = 3;
				IsScriptChanged = false;
				ParseExec = false;
				var page = PagesList.get();
				loadpage(false, page.url, page.type, page.params, page.encoding, page.index);
			}
			$('#output').val(ASTExec.output);
		}
	}
	catch(e) {
		closeLoadingProcess();
		showScriptTab = true;
		$('#tab-script').tab('show');
		if (e.name == 'SLSError')
		{
			$('#output').val(e.message+'. line: '+e.line+' column: '+e.column);
			setCursorPos(document.getElementById('script'), e.start, e.start+e.length);
		}
		else
			$('#output').val(e.toString());
	}
}

var ParseExec = false;
function parseexec()
{
	if ($('#script').val() != '')
	{
		ParseExec = true;
		showLoadingProcess();
		parsetest2();
	}
}

function getParamsFromUrl()
{
	var tmp = new Array();      // два вспомагательных    
	var tmp2 = new Array();     // массива    
	var param = {};    
	        
	var get = location.search;  // строка GET запроса    
	if(get != '')    
	{    
	    tmp = (get.substr(1)).split('&');   // разделяем переменные    
	    for(var i=0; i < tmp.length; i++)    
	    {    
	        tmp2 = tmp[i].split('=');       // массив param будет содержать    
	        param[tmp2[0]] = tmp2[1];       // пары ключ(имя переменной)->значение    
	    }    
	}
	return param;
}


function checkErrorFromUrl()
{
	var params = getParamsFromUrl();
	if (params['error_msg'] != undefined || params['error_msg2'] != undefined)
	{
		var msg = ''; 
		
		if (params['error_msg'])
		{
			msg = params['error_msg'].replace(/\+/g, '%20');
			$('#output').val($('#output').val()+'\n'+decodeURIComponent(msg)+'. line:'+params['error_line']+' column: '+params['error_column']);
		}
		else
		{
			msg = params['error_msg2'].replace(/\+/g, '%20');
			$('#output').val($('#output').val()+'\n'+decodeURIComponent(msg));
		}
		
		var start;
		if (!isNaN(params['error_start']))
			start = parseInt(params['error_start']);
		
		var length;
		if (!isNaN(params['error_length']))
			length = parseInt(params['error_length']);
		
		if (start)
			setCursorPos(document.getElementById('script'), start, start+length);
		return true;
	}
}


function disableBrowser(el)
{
	var $box = $(el).parent().parent().find('input[name="disablebrowser"]');
	var val = $box.prop('checked');
	$box.prop('checked', !val);
	disBrowser = !val;
	SetNotSaved();
}


function onScriptChange()
{
	SetNotSaved();
	IsScriptChanged = true;
}


function deleteLine()
{
	var script = document.getElementById('script');
	var pos = getCursorPos(script);
	var i = pos-1;
	while (i>=0 && script.value.charAt(i) != '\n')
		i--;
	var j = pos;
	while (j<script.value.length && script.value.charAt(j) != '\n')
		j++;
	
	var str = script.value;
	script.value = str.substring(0, i+1) + str.substring(j+1, str.length);
	
	var k = i+1;
	while (k<script.value.length && script.value.charAt(k) != '\n')
	{
		k++;
	}
	pos = (pos < k) ? pos : k;
	setCursorPos(script, pos, pos);
	decorator.update();
}

//Редактор. Страница "Скрипт", сканер, парсер и преобразователь скрипта в объекты браузер


