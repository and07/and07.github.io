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

function dellocalStorageParser (key){
	var parser = getParserData();
	if(parser){
		delete parser[key];
	}
	setlocalStorageParser(parser);
}

function addParseList(){
	var parser = getParserData();
	for(var k in parser){
		parseList.add(parser[k]);
	}
}
function is_null( mixed_var ){	// Finds whether a variable is NULL
	// 
	// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)

	return ( mixed_var === null );
}
function bindModelInput(obj, property, domElem) { 
	if(is_null(domElem)){
			Object.defineProperty(obj, property, { 
				get: function() {
					/*return text;*/ 
					return this['_'+property]; 
				}, 
				set: function(newValue) { 
					this['_'+property] = newValue; 
				},
				enumerable: false,
				configurable: true 
			});	
	}else{
		function setValDomElem(domElem,newValue){
			if(domElem.length){
				for(var i in domElem){
						var tag = domElem[i].tagName|| null;
						if(is_null(tag))
							continue;
						tag = tag.toLowerCase();
						if(tag == 'input' || tag == 'textarea'){
							domElem[i].value = newValue;
						}else{
							domElem[i].innerHTML = newValue;
						}
				}
			}else{
				var tag = domElem.tagName.toLowerCase() || null;
				if(tag == 'input' || tag == 'textarea'){
					domElem.value = newValue;
				}else{
					domElem.innerHTML = newValue; 
				}
			}

		}
		Object.defineProperty(obj, property, { 
			get: function() {
				return this['_'+property]; 
			}, 
			set: function(newValue) { 
				this['_'+property] = newValue; 
				setValDomElem(domElem,newValue);
			},
			enumerable: false,
			configurable: true 
		});

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


function popup(el){
	var frame = getIframeContent('HTMLview');
	var popup2 = new PopupMenu(frame);
	popup2.add('red', function(target) {
	console.log(target);
		target.style.background = 'red';
	});
	popup2.add('link', function(target) {
	   // console.log(target.querySelector('a').getAttribute('href'));
		var url =null;
	   if(target.getAttribute){
		url = target.getAttribute('href');
	   }
	   if(url == null){
		if(target.querySelector('a'))
			url = target.querySelector('a').getAttribute('href');
	   }
	   if(url == null){
		url = target.parentNode.getAttribute('href');
	   }
	   
	   var input_url = $('#inputURL').val();
	   var domen = parseURL(input_url);
	   domen = domen.protocol + '://' + domen.host + '';      
	   url = url.replace(domen,'');
	   url= domen+url;
	   console.log(url);
	   PARSE.parse_html(url);
	});
	popup2.add('create', function(target) {
		
	});

	popup2.add('blue', function(target) {
		target.style.background = 'blue';
	});
	popup2.add('yellow', function(target) {
		target.style.background = 'yellow';
	});
	popup2.addSeparator();
	popup2.add('default', function(target) {
		target.style.background = '#EEE';
	})
	popup2.setSize(150, 0);
	popup2.bind(el); 

}

function hasClass(ele,cls) {
	return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

function addClass(ele,cls) {
	if (!hasClass(ele,cls)) ele.className += " "+cls;
}

function removeClass(ele,cls) {
	if (hasClass(ele,cls)) {
    	var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		ele.className=ele.className.replace(reg,' ');
	}
}

function fillSel(obj_name, data)
{
	//console.log(data);
	var _obj = document.querySelector(obj_name);
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



function setItem()
{
	var type = $('#itemname select[name="type"]').val();
	var name = $('#itemname input[name="name"]').val();
	var parent = $('#itemname .js_parent').val() || null;
	
	
	if (name != '' && name.search(/^[A-Za-z][A-Za-z0-9_]*$/) != -1) 
	{
		$('#itemname').fadeOut('slow');
		_PARSE.rule_type = type;
		_PARSE.rule_name = name;
		
		var scnt = _PARSE.add(parent);
		var parent_id = 'tree_'+scnt;
		var el = document.querySelector('#tree_item_' + scnt);
		
		var js_xpath = el.querySelector('.xpath');
		var v_xpath = _PARSE.rule_xpath;
		v_xpath = v_xpath.replace(' parse_sel_el','');
		v_xpath = v_xpath.replace('[@class=""]','');
		v_xpath = v_xpath.replace('[@class=""]','');
		js_xpath.value = v_xpath;
		
		//document.querySelector('[data-vtree-id = "'+parent_id+'"]');
		
		el.querySelector('.type').value = _PARSE.rule_type;
		el.querySelector('.name').value = _PARSE.rule_name;
		
		var rule = _PARSE.rule || [];
		_PARSE.rule.push(rule);
		fillSel('.js_parent', [{'text' : _PARSE.rule_name , 'value' : parent_id}]);
	}
	/*var cls_parse_sel = 'parse_sel_el';
	if (!hasClass(_target,cls_parse_sel)){
		addClass(_target,cls_parse_sel);
		popup(_target);
	}*/	

}
function addEventListener(element, name, observer, capture) {

	if (typeof element == 'string') {
        element = _PARSE.doc.querySelector(element);
    }
	if(element){
		if (element.addEventListener) {
			element.addEventListener(name, observer, capture);
		} else if (element.attachEvent) {
			element.attachEvent('on' + name, observer);
		}
	}
};
function setEvenHoveredAll(html){
   var hovered = document.getElementById('hovered-element-info');
   var allNodes = html.getElementsByTagName('*');
   var tag = ['meta','title','link','script','body'];
   var tagNode = [];
   for(var i=0; i< allNodes.length; i++ ){
		if(allNodes[i].tagName.toLowerCase() in tag){
			continue;
		}else{
			if(allNodes[i].tagName.toLowerCase() in tagNode){
				continue;
			}else{
				tagNode.push(allNodes[i].tagName.toLowerCase());
				addEventListener(allNodes[i], 'mouseover', function(e){
					e = e || event;
					e.stopPropagation();
					var target = e.target || e.srcElement;
					//target.style.border = "1px solid #000";
					target.style.background="#d3e2f0";//"#f2f2f2";
					// console.log( createXPathFromElement(target));
				   
					hovered.innerHTML = createXPathFromElement(target);
					//_EVENT.add(this,'click',setXpath);
					addEventListener(target, 'click', function(e){
						e = e || event;
						var _target = e.target || e.srcElement;
						
						if(_PARSE.golink){
							var url = $(_target).attr('href');
							request(url);
						}else{
						console.log();
							_PARSE.rule_xpath = createXPathFromElement(_target);
							selectBorder(_target, 'text', e, true);
						}
						
						 e.preventDefault();
						 return false;
					 })
				});                            
				addEventListener(allNodes[i], 'mouseout', function(e){
					e = e || event;
					
					var target = e.target || e.srcElement;                            
					this.style.border = "none";
					this.style.background="";
				});
			}                  
		} 
	}
}
/*******************Virtual DOM***********************//**USE
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
var voidElements = /AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TR??ACK|WBR/        
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
/***********************Virtual DOM*************************/
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
    
    if (/*PagesList.get() && PagesList.get().type == 'html' &&*/ segs[0] == 'html' && segs[1] == 'body')
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



/***TreeComponentClass***/
function TreeComponentClass(div, data) {
	this.div = div;
	this.active = null;
	this.activeInd = [];
	this.data = data;
	this.srcopened = 'images/icon-opened.gif';
	this.srcclosed = 'images/icon-closed.gif';
	this.srcempty = 'images/icon-empty.gif';
	this.isclosed = true;
	
	var tree = this;
	
	tree.onactive = function(tree, el) {};
	tree.onpreactive = function(tree, el) {};

	$(div).on('click', 'img', function(e) {
   		var $ul = $(this).parent().children('ul');
   		if ($ul.length > 0)
   		{
   			if (this.src.search(tree.srcopened) != -1)
   	    		this.src = tree.srcclosed;
   	    	else
   	    		this.src = tree.srcopened;
   			$ul.slideToggle();
   		}
    });
    
    $(div).on('click', 'span', function(e) {
    	tree.onpreactive(tree, this);
    	if (tree.active)
    		$(tree.active).removeClass('selected');
    	tree.active = this;
    	$(this).addClass('selected');
    	tree.onactive(tree, this);
    });
    
    tree.update();
}

TreeComponentClass.prototype = {
	update: function(data, activeInd)
	{
		if (data == undefined)
			data = this.data;
		else
			this.data = data;
		
		if (activeInd != undefined)
			this.activeInd = activeInd;
		
		if (!data) return;
		
		var ul = document.createElement('ul');		
		for (var i=0; i<data.length; i++)
			this.createnode(data[i], ul, i, 0);
		
		$(this.div).empty().append(ul);
		

		if (this.activeInd.length > 0)
		{
			var li = $(this.div).children('ul').children('li')[this.activeInd[0]];
			
			for (var i=1; i<this.activeInd.length; i++)
			{
				$(li).children('img').prop('src', this.srcopened); 
				$(li).children('ul').show();
				var index = this.activeInd[i];
				li = $(li).children('ul').children('li')[index];
			}
			var $span = $(li).children('span');
			$span.addClass('selected');
			this.active = $span[0];
		}
		else
			this.active = null;
	},
	createnode: function(nodedata, parent, nodeindex, deep) {
		var li = document.createElement('li');
		
		var img = document.createElement('img');
		img.className = 'plus';
		img.src = this.srcempty;
		$(li).append(img);
		
		var span = document.createElement('span');
		/*if (nodeindex == this.activeInd[deep] && deep == this.activeInd.length-1)
		{
			span.className = 'selected';
			this.active = span;
		}*/
		$(span).text(nodedata.text);
		$(span).attr('index', nodeindex);
		$(li).append(span);
		
		if (nodedata.children.length > 0)
		{
			img.src = (this.isclosed /*&& nodeindex != this.activeInd[deep]*/) ? this.srcclosed : this.srcopened;
			var ul = document.createElement('ul');		
			for (var i=0; i<nodedata.children.length; i++)
			{
				this.createnode(nodedata.children[i], ul, i, deep+1);
			}
			$(li).append(ul);
			if (this.isclosed /*&& nodeindex != this.activeInd[deep]*/)
				$(ul).hide();
		}
		
		$(parent).append(li);
	},
	getActiveByInd: function(ind)
	{
		var node = this.data[ind[0]];
		for (var i=1; i<ind.length; i++)
			node = node.children[ind[i]];
		return node;
	},
	setActiveInd: function(activeInd)
	{
		this.activeInd = activeInd;
		var node = this.getActiveByInd(activeInd);
		if (node)
		{
			if (tree.active)
				$(tree.active).removeClass('selected');
			tree.active = node;
			$(node).addClass('selected');
		}
	},
	getActiveInd: function()
	{
		var ind = [];
		if (this.active)
		{
			var $node = $(this.active).parent();
			do {
				ind.splice(0, 0, $node.children('span').attr('index'));
				$node = $node.parent().parent();
			} while ($node.attr('id') != $(this.div).attr('id'));
		}
		return ind;
	}
};

/***TreeComponentClass***/
/*****************************OBJ***********************************/
    var LoadTree = new TreeComponentClass(document.getElementById('loadtree-content'), null);
    LoadTree.onactive = function(tree, el)
    {
    	var activeInd = tree.getActiveInd();
    	var lp = PagesList.array2[activeInd[0]];
    	for (var i=1; i<activeInd.length; i++)
    	{
    		var name = lp.links.array2[activeInd[i]];
    		if (typeof name == 'string')
    			lp = lp.links.array[name];
    		else
    			lp = name;
    	}
    	if (PagesList.get() != lp)
    	{
    		PagesList.addObj(lp);
    		loadpage(false, lp.url, lp.type, lp.params, lp.encoding, lp.index);
    	}
    };
    
    var HtmlTree = new TreeComponentClass(document.getElementById('htmltree-content'), null);
	console.log(HtmlTree);
    HtmlTree.onactive = function(tree, el)
    {
    	var activeInd = tree.getActiveInd();
    	var obj = tree.getActiveByInd(activeInd);
    	if (obj)
    	{
    		$(obj.node).data('oldstyle3', $(obj.node).getStyleObject());
    		$(obj.node).data('selected2', 1);
    		$(obj.node).css('border', '3px dashed blue');
    		var xpath = createXPathFromElement(obj.node);
    		//$('#htmltree input[name="xpath"]').val(xpath);
    		$('#htmltree textarea[name="xpath"]').val(xpath);
    	}
    };
    HtmlTree.onpreactive = function(tree, el)
    {
    	var activeInd = tree.getActiveInd();
    	var obj = tree.getActiveByInd(activeInd);
    	if (obj && $(obj.node).data('selected2') == 1)
    	{
    		$(obj.node).css($(obj.node).data('oldstyle3'));
    		$(obj.node).data('selected2', 0);
    	}
    };
	
	
/*****************************OBJ***********************************/

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
	var name = elem.querySelector('.name').value;
	var rule = elem.querySelector('.xpath').value;

	_PARSE.rule_name = elem.querySelector('.name').value;
	_PARSE.rule_type = elem.querySelector('.type').value;
	_PARSE.rule_xpath = elem.querySelector('.xpath').value;
	
	//var node = PagesList.get().rules.getNodesByName(name)[0];
	var type = parseInt(getRadioVal('type'));
	if(type === 1){
		var doc =  document.getElementById('html').contentWindow.document;
	}else if(type === 2){
		var content = _PARSE.html ;
		var doc =  loadXMLString(content);
	}
	_PARSE.doc = doc;
	
	var node = evaluateXPath(rule, doc)[0];

	$win.find('textarea[name="xpath"]').val(rule);
	$win.find('input[name="xpath"]').val(rule);
	$win.find('input[name="name"]').val(name);
	$win.find('#rulename').html('<b>'+name+'</b>');
/*	
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
	

	
		

	var data = [];
	var root;
	if (/*PagesList.get() && PagesList.get().type == 'html'*/ false)
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
function trim(str)
{
    return str.replace(/^\s+|\s+$/g,"");
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
        	
        	//SetIntervalID = setInterval(updatestatus, 10000);
        	        	
        	$win.fadeIn('slow').css('left', ($(window).width()-$win[0].offsetWidth)/2);
        	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2);
	/*
        }, 
	});
	*/
}
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
        	
        	var files = data.files ? data.files : {};
        	//delmsg = data.delmsg;
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
	
	//loadtreeupdate();
	
	$win.fadeIn('slow').css('left', ($(window).width()-$win[0].offsetWidth)/2);
	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2);
	$win.find('.popup-btns').css('top', $win[0].offsetHeight-40);
}


/**ScriptFunctionsClass**/
function ScriptFunctionsClass()
{
}

ScriptFunctionsClass.prototype = {
	nodesOfGetFunc: function(param0, opt)
	{
		var doc;
		if (opt.html == undefined)
			doc = document.getElementById(HtmlFrames.activeFrame).contentWindow.document;
		else
		{
			doc = document.getElementById('html2').contentWindow.document;
			if (opt.html.search(/^\<tr/i) != -1)
				doc.documentElement.innerHTML = '<table>'+opt.html+'</table>';
			else
				doc.documentElement.innerHTML = opt.html;
		}
		
		var nodes = [];
		if (opt.group)
		{
			var len = opt.group.length;
			var xpath = param0.slice(len+1);
	    	var nodes0 = evaluateXPath(opt.group, doc);
	    	for (var i=0; i<nodes0.length; i++)
	    	{
	    		var nodes1 = evaluateXPath(xpath, doc, nodes0[i]);
	    		nodes.push(nodes1[0]);
	    	}
		}
		else
		{
			nodes = evaluateXPath(param0, doc);
		}
		return nodes;
	},
	getTextNodesValue: function(node)
	{
		var str = '';
		for (var i=0; i<node.childNodes.length; i++)
		{
		    if (node.childNodes[i].nodeType == 1)
                str += ' '+this.getTextNodesValue(node.childNodes[i]);
            else if (node.childNodes[i].nodeType == 3)
                str += ' '+node.childNodes[i].nodeValue;
		}
		return trim(str);
	},
	getFunc: function(param0, opt, ruletype)
	{
		var nodes = this.nodesOfGetFunc(param0, opt);
		
		var value = [];
		for (var i=0; i<nodes.length; i++)
			if (nodes && nodes[i])
			{
				var node;
				if (opt.next)
				{
					var nextnode = nodes[i].nextSibling;
					while (nextnode && nextnode.nodeType != 1)
						nextnode = nextnode.nextSibling;
					node = nextnode; 
				}
				else
					node = nodes[i];

				var val = '';
				if (ruletype == 'link')
				{
					val = href2url($(node).attr('href'));
				}
				else if (ruletype == 'image')
				{
					val = href2url($(node).attr('src'));
				}
				else if (ruletype == 'text')
				{
					var str;
					if (opt.nodeonly)
					{
						var value2 = '';
						for (var j=0; j<node.childNodes.length; j++)
							if (node.childNodes[j].nodeType == 3)
							{
								var str = trim(node.childNodes[j].nodeValue).replace(/\s+/g," ");
								if (str != '')
									value2 += ' '+str;
							}
						str = value2.substring(1);
					}
					else
						str = this.getTextNodesValue(node).replace(/\s+/g," ");
					
					if (opt.word > 0)
					{
						var strarr = str.replace(/\s+/, ' ').split(' ');
						var str = '';
						var endpos = (opt.wordend == 0) ? strarr.length : opt.wordend;  
						for (var j=opt.word; j<=endpos; j++)
							str += ' '+ (strarr[j-1] ? strarr[j-1] : '');
						str = str.substring(1);
					}
					
					val = str;
				}
				else if (ruletype == 'html')
				{
					val = (opt['content']) ? node.innerHTML : node.outerHTML;
				}
				
				if (opt.replace)
					val = val.replace(this.stringToRegExp(opt.replace[0]), opt.replace[1]);
					
				value.push(val);
			}
			else
				value.push('');
		
		if (ruletype == 'text' && opt.join)
			value = [trim(value.join(opt.join))];
		
		return value;
	},
	groupXPath: function(xpatharr)
	{
		var jdiffstart = 0;
		if (xpatharr.length > 0)
		{
			for (var j=0; j<xpatharr[0].length; j++)
			{
				var isequal = true;
				for (var i=1; i<xpatharr.length; i++)
					if (xpatharr[i][j] != xpatharr[i-1][j])
					{
						isequal = false;
						break;
					}
				if (!isequal)
				{
					jdiffstart = j;
					break;
				}
			}
		}
		
		if (jdiffstart > 0)
			var commonxpath = xpatharr[0].slice(0, jdiffstart).join('/');
		else
			commonxpath = null;
		
		return commonxpath;
	},
	stringToRegExp: function(pattern)
	{
		if (pattern == '')
			return null;
		var flags = '';
		var posend = pattern.length;
		for (var i=pattern.length-1; i>=0; i--)
		{
			if (pattern.charAt(i) == 'i' || pattern.charAt(i) == 'm')
				flags += pattern.charAt(i);
			else if (pattern.charAt(i) == '/')
			{
				posend = i;
				break;
			}
		}
		flags += 'g';
		var re = new RegExp(pattern.substring(1, posend), flags);
		return re;
	},
	preg_match_all: function(pattern, subject, indexarr)
	{
		var re = this.stringToRegExp(pattern);
		var arr = [];
		if (!re)
			return arr;
		while ((result = re.exec(subject)) != null)
		{
			if (indexarr != undefined)
				indexarr.push(result.index);
			for (var i=0; i<result.length; i++)
			{
				if (arr[i] == undefined || !(arr[i] instanceof Array))
					arr[i] = [];
				arr[i].push(result[i]);
			}
		}
		return arr;
	},
	filter_value: function(param0, type, param2)
	{
		var value;
		if (param0 instanceof Array)
		{
			value = [];
			var array = param0;
			for (var i=0; i<array.length; i++)
			{
				if (type == 'equal' && array[i] == param2)
					value[i] = array[i];
				if ((type == 'notequal' || type == 'remove') && array[i] != param2)
					value[i] = array[i];
				if (type == 'regexp')
				{
					var res = this.preg_match_all(param2, array[i]);
					if (res.length > 0)
						value[i] = array[i];
				}
				if (type == 'notregexp')
				{
					var res = this.preg_match_all(param2, array[i]);
					if (res.length == 0)
						value[i] = array[i];
				}
				if (type == 'condition')
				{
					var $value = array[i];
					var res = eval(param2);
					if (res)
						value[i] = array[i];
				}
			}
		}
		else if (param0 instanceof Object)
		{
			value = {};
			var dict = param0;
			for (var i in dict)
			{
				if (type == 'equal' && dict[i] == param2)
					value[i] = dict[i];
				if ((type == 'notequal' || type == 'remove') && dict[i] != param2)
					value[i] = dict[i];
				if (type == 'regexp')
				{
					var res = this.preg_match_all(param2, dict[i]);
					if (res.length > 0)
						value[i] = dict[i];
				}
				if (type == 'notregexp')
				{
					var res = this.preg_match_all(param2, dict[i]);
					if (res.length == 0)
						value[i] = dict[i];
				}
				if (type == 'condition')
				{
					var $value = dict[i];
					var res = eval(param2);
					if (res)
						value[i] = dict[i];
				}
			}
		}
		return value;
	},
	array_keys: function(arr)
	{
		var keys = [];
		if (arr instanceof Array)
		{
			for (var i=0; i<arr.length; i++)
				if (arr[i] != undefined)
					keys.push(i);
		}
		else if (arr instanceof Object)
		{
			for (var i in arr)
				keys.push(i);
		}
		return keys;
	},
	filtereqkeys: function(arr)
	{
		var num = arr.length;
		if (num > 1)
		{
			var keysequal = this.array_keys(arr[0]);
			for (var i=1; i<num; i++)
			{
				var keys1 = [];
				$.extend(keys1, keysequal);
				var keys2 = this.array_keys(arr[i]);
				keysequal = [];
				for (var k=0; k<keys1.length; k++)
					for (var m=0; m<keys2.length; m++)
						if (keys1[k] == keys2[m])
							keysequal.push(keys1[k]);
			}
			for (var i=0; i<num; i++)
			{
				keys1 = this.array_keys(arr[i]);
				for (var j=0; j<keys1.length; j++)
				{
					var isfind = false;
					for (m=0; m<keysequal.length; m++)
						if (keys1[j] == keysequal[m])
						{
							isfind = true;
							break;
						}
					if (!isfind)
						arr[i][keys1[j]] = undefined;
				}
			}
		}
	},
	removetags_one: function(html, tags)
	{
		var bodytype = 1;
		if (html.search(/<html(\s|>)/i) != -1)
			bodytype = 2;
		else if (html.search(/<head(\s|>)/i) != -1 && html.search(/<body(\s|>)/i) != -1)
			bodytype = 3;
		else if (html.search(/<head(\s|>)/i) != -1)
			bodytype = 4;
		else if (html.search(/<body(\s|>)/i) != -1)
			bodytype = 5;
		
		var doc = document.getElementById('html2').contentWindow.document;
		//doc.body.innerHTML = html;
		doc.documentElement.innerHTML = html;
		for (var i=0; i<tags.length; i++)
		{
			var nodes = evaluateXPath(tags[i], doc);
			for (var j=0; j<nodes.length; j++)
				nodes[j].parentNode.removeChild(nodes[j]);
		}
		var str = '';
		
		if (bodytype == 1)
			str = doc.body.innerHTML;
		else if (bodytype == 2)
			str = doc.documentElement.outerHTML;
		else if (bodytype == 3)
			str = doc.documentElement.innerHTML;
		else if (bodytype == 4)
			str = doc.getElementsByTagName('head')[0].outerHTML;
		else if (bodytype == 5)
			str = doc.body.outerHTML;
		
		return str;
	},
	removetags: function(html, tags)
	{
		var value = undefined;
		if (html instanceof Array)
		{
			var arr = html;
			value = [];
			for (var i=0; i<arr.length; i++)
				if (arr[i])
					value[i] = this.removetags_one(arr[i], tags);
				else
					value[i] = undefined;
		}
		else if (html)
			value = this.removetags_one(html, tags);
		
		return value;
	},
	getDataForGroup: function(name, page, forview)
	{
		var rules = page.rules.getByGroup(name);
		
		var commonxpath = null;
		if (name != '')
		{
			var xpatharr = [];
			for (var rulename in rules)
				if (rules[rulename].type != 'regexp')
					xpatharr.push(rules[rulename].path.split('/'));
			var commonxpath = ScriptFunctions.groupXPath(xpatharr);
		}
		
		var values2 = [];
		var keys = [];
		var isfilter = false;
		for (rulename in rules)
		{
			var rule = rules[rulename];
			
			var opt = {};
			$.extend(opt, rule.options);
			if (commonxpath)
				$.extend(opt, {group: commonxpath});
			if (rule.options.implode)
				$.extend(opt, {join: rule.options.implodestr});
			
			var val;
			if (rule.type == 'regexp')
			{
				var subject = document.getElementById(HtmlFrames.activeFrame).contentWindow.document.documentElement.outerHTML;
				val = this.preg_match_all(rule.path, subject);
				val = val[rule.options.resultind];
			}
			else
				val = this.getFunc(rule.path, opt, rule.type);
			
			if (rule.filter && rule.filter.str != '')
			{
				val = this.filter_value(val, rule.filter.type, rule.filter.str);
				isfilter = true;
				if (forview)
					rulename += '*';
			}
			values2.push(val);
			keys.push(rulename);
		}
		
		if (isfilter && name != '')
			this.filtereqkeys(values2);

		var values = {};
		for (var i=0; i<keys.length; i++)
		{
			var valobj = {};
			var val = values2[i];
			for (var j=0; j<val.length; j++)
				valobj[j] = val[j];
			values[keys[i]] = valobj;
		}
		
		return values;
	},
	maketable: function(param)
	{
		var keys = [];
		if (param instanceof Array)
		{
			for (var i=0; i<param.length; i++)
				keys.push(i);
		}
		else if (param instanceof Object)
		{
			for (var i in param)
				keys.push(i);
		}
		
		var count = function(a)
		{
			if (a instanceof Array)
				return a.length;
			else
				return 1;
		};
		
		var maxnum = count(param[keys[0]]);
		for (i=1; i<keys.length; i++)
		{
			var num1 = count(param[keys[i]]);
			if (num1 > maxnum) maxnum = num1;
			/*var num2 = count(param[keys[i-1]]);
			if (num1 != num2 && num1 > 1 && num2 > 1)
				throw this.execError(Lang.t('Массивы имеют разный размер в maketable'), 
	    				node.line, node.column, node.start, node.length);*/
		}
		
		var ret = [];
		for (var j=0; j<maxnum; j++)
		{
			var strarr = (param instanceof Array) ? [] : {};
			var nullrow = strarr;
			for (i=0; i<keys.length; i++)
			{
				var el;
				if (param[keys[i]] instanceof Array)
				{
					if (count(param[keys[i]]) == 0)
						el = '';
					else if (count(param[keys[i]]) == 1)
						el = param[keys[i]][0];
					else if (param[keys[i]][j])
						el = param[keys[i]][j];
					else
						el = null;
				}
				else
					el = param[keys[i]];
				
				nullrow[keys[i]] = el;
				if (el == null)
					el = '';
				
				strarr[keys[i]] = el;
			}
			
			var isnull = true;
			if (nullrow instanceof Array)
			{
				for (var i=0; i<nullrow.length; i++)
					if (nullrow[i])
					{
						isnull = false;
						break;
					}
			}
			else
			{
				for (var i in nullrow)
					if (nullrow[i])
					{
						isnull = false;
						break;
					}
			}
			if (!isnull) ret.push(strarr);
		}
		return ret;
	},
	evalOp: function(op1, op2, operand)
	{
		var res = 0;
		if (op1 instanceof Array && op2 instanceof Array)
		{
			var len = Math.min(op1.length, op2.length);
			res = [];
			for (var i=0; i<len; i++)
				if (operand == '+')
					res[i] = parseFloat(op1[i]) + parseFloat(op2[i]);
				else if (operand == '-')
					res[i] = parseFloat(op1[i]) - parseFloat(op2[i]);
				else if (operand == '*')
					res[i] = parseFloat(op1[i]) * parseFloat(op2[i]);
				else if (operand == '/')
					res[i] = parseFloat(op1[i]) / parseFloat(op2[i]);
				else if (operand == '%')
					res[i] = parseFloat(op1[i]) % parseFloat(op2[i]);
				else if (operand == '.')
					res[i] = ''+op1[i]+''+op2[i];
		}
		else if (op1 instanceof Array && (typeof op2 == 'number' || typeof op2 == 'string'))
		{
			res = [];
			for (var i=0; i<op1.length; i++)
				if (operand == '+')
					res[i] = parseFloat(op1[i]) + parseFloat(op2);
				else if (operand == '-')
					res[i] = parseFloat(op1[i]) - parseFloat(op2);
				else if (operand == '*')
					res[i] = parseFloat(op1[i]) * parseFloat(op2);
				else if (operand == '/')
					res[i] = parseFloat(op1[i]) / parseFloat(op2);
				else if (operand == '%')
					res[i] = parseFloat(op1[i]) % parseFloat(op2);
				else if (operand == '.')
					res[i] = ''+op1[i]+''+op2;
		}
		else if (op2 instanceof Array && (typeof op1 == 'number' || typeof op1 == 'string'))
		{
			res = [];
			for (var i=0; i<op2.length; i++)
				if (operand == '+')
					res[i] = parseFloat(op1) + parseFloat(op2[i]);
				else if (operand == '-')
					res[i] = parseFloat(op1) - parseFloat(op2[i]);
				else if (operand == '*')
					res[i] = parseFloat(op1) * parseFloat(op2[i]);
				else if (operand == '/')
					res[i] = parseFloat(op1) / parseFloat(op2[i]);
				else if (operand == '%')
					res[i] = parseFloat(op1) % parseFloat(op2[i]);
				else if (operand == '.')
					res[i] = ''+op1+''+op2[i];
		}
		else if ((typeof op1 == 'number' || typeof op1 == 'string')
					&& (typeof op2 == 'number' || typeof op2 == 'string'))
		{
			if (operand == '+')
				res = parseFloat(op1) + parseFloat(op2);
			else if (operand == '-')
				res = parseFloat(op1) - parseFloat(op2);
			else if (operand == '*')
				res = parseFloat(op1) * parseFloat(op2);
			else if (operand == '/')
				res = parseFloat(op1) / parseFloat(op2);
			else if (operand == '%')
				res = parseFloat(op1) % parseFloat(op2);
			else if (operand == '.')
				res = ''+op1+''+op2;
		}
		return res;
	},
	evalUnaryMinusOp: function(op1)
	{
		var res = 0;
		if (op1 instanceof Array)
		{
			res = [];
			for (var i=0; i<op1.length; i++)
				res[i] = -parseFloat(op1[i]);
		}
		else if (typeof op1 == 'number')
		{
			res = -parseFloat(op1);
		}
		return res;
	},
};
/**ScriptFunctionsClass**/
var ScriptFunctions = new ScriptFunctionsClass();
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

	var doc = document.getElementById('html').contentWindow.document;
	var source = (/*PagesList.get() && PagesList.get().type == 'html'*/ false) ? doc.body.innerHTML : doc.documentElement.outerHTML;
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

var getTreeData =  function(el){
	var getData = function(el){
		var _xpath = {};
		var _name = {};
		var _attr = {};
		var tmp = {};
		var xpath = el.querySelector('.xpath');
		var name = el.querySelector('.name');
		var attr = el.querySelector('.selattr');
		tmp[xpath.getAttribute("name")] = xpath.value;
		tmp[name.getAttribute("name")] = name.value;
		tmp[attr.getAttribute("name")] = attr.value;
		return tmp;
	}
	
	var sub_el = '.vtree-subtree';
	if(el.tagName){
		//obj[el.tagName] = [];
		var arr = [];
	if(el.childNodes){
		var cnt = el.children.length;
		if(cnt > 0){
			for(var i=0; i<cnt;i++){
				var child = el.children[i];
				if(child.querySelector(sub_el)){
					var tmp = getData(child);
					tmp['children'] = {};
				   
					//obj[el.tagName]['children']['parent'] = tmp;
								   
					tmp['children'] = getTreeData(child.querySelector(sub_el) );
					arr.push(tmp);
				}else{
					var tmp = getData(child);
					arr.push(tmp);
				}
			}
		}
	}
		return arr;
	}
}
function getRule(){

    var elements = document.querySelector('.vtree');
    var data = getTreeData(elements); 
    var url = _PARSE.url;
    var name = _PARSE.name;
    var host = parseURL(url);
    var domen = host.protocol + '://' + host.host;
    var type = _PARSE.type;
    
	return {'url':url, 'data':data,'host':host['host'], 'name':name, 'domen':domen}

}
function rulessave(successfunc)
{
	//if (!$('#tab-script').parent().hasClass('active'))
	//	tabScriptClick();
	console.log(getRule());
	var parser = getlocalStorageParser();
	parser[_PARSE.name]['rule'] = getRule();
	parser[_PARSE.name]['export'] = _PARSE.getSite()['export'] || [];
	setlocalStorageParser(parser);	

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
function selectBorder(elem, type, e, dialog)
{
	var ToSelect = 'first';
	if ($(elem).data('selected') == 1 && (dialog == undefined || dialog == true))
	{
		//var rule = PagesList.get().rules.getByName($(elem).data('itemname'));
		var rule = _PARSE.rule_xpath;
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
        
        //var ItemSelected = elem;
        if (dialog == undefined || dialog == true)
        {
        	rulelables($('#itemname'), type);
        	$('#itemname input[name="type"]').val(type);
        	$('#itemname input[name="name"]').val('');
            $('#itemname').css('left', e.clientX+50).css('top', e.clientY+10).fadeIn('slow');
            //ItemName = true;
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
function setHtmlTree()
{
	var $win = $('#htmltree');
	var name = $win.find('input[name="name"]').val();
	var _path = _PARSE.rule_xpath;
	var newpath = $win.find('textarea[name="xpath"]').val();
	
	HtmlTree.onpreactive(HtmlTree, HtmlTree.active);
	
	if (_path != newpath && newpath != '')
	{
		_PARSE.rule_xpath = newpath;
		/*
		var nodes = evaluateXPath(rule, PARSE_RULE.doc);
		for (var j=0; j<nodes.length; j++)
		{
			deselectBorder(nodes[j]);
		//	if (rule.options.next)
		//		deselectBorderNext(nodes[j]);
		}
		
		_path = newpath;
		
		nodes = evaluateXPath(rule, PARSE_RULE.doc)
		for (var j=0; j<nodes.length; j++)
		{
			selectBorder(nodes[j], PARSE_RULE.rule.type, false, false);
		//	if (rule.options.next)
		//		selectBorderNext(nodes[j], rule.type, false, false);
		}
		
		//$('#rulestbl tbody #rule_'+name+' td:nth-child(5)').text(rule.path);
		//$(elembyruleid(name)).find('td:nth-child(5)').text(PARSE_RULE.xpath);
		SetNotSaved();
		*/
	}	
	
	$win.fadeOut('slow');
}

function cancelHtmlTree()
{
	HtmlTree.onpreactive(HtmlTree, HtmlTree.active);
	$('#htmltree').fadeOut('slow');
}
function setGetRegExp()
{
	var $win = $('#getregexp');
	var rulename = $('#getregexp input[name="rulename"]').val();
	var pattern = $('#getregexp input[name="pattern"]').val();
	var resultind = $('#getregexp input[name="resultind"]').val();
	var isedit = $win.find('input[name="rulename"]').prop('disabled');
/*
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
*/
	$win.fadeOut('slow');
}
function pagedata()
{
	//refreshpagedata();
	
	var $win = $('#pagedata');
	$win.fadeIn('slow').css('left', ($(window).width()-$win[0].offsetWidth)/2);
	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2);
	$('#pagedata .popup-btns').css('top', $win[0].offsetHeight-40);
}
function pageexport()
{
	var curexp = [];
	//if (PagesList.get())
	//	curexp = PagesList.get().exp;
	
	$('#pageexport-list-table table tbody tr').remove();
	if (curexp.length > 0)
	{
		/*
		var exparr = [];
		for (var i=0; i<curexp.length; i++)
			exparr.push(curexp[i].objForAjax());
		
		var html = HTMLRenderer.render('exportlistformattable', {exp: exparr, Lang: Lang});
		$('#pageexport-list-table table tbody').append(html);
		*/
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
function pageExportListNew()
{
		pageExportProfile(-1, {});
}
function pageExportProfile(ind, curexp)
{
	$('#pageexport-profile input[name="pageexport-profile-ind"]').val(ind);
	$('#pageexport select[name="exportname"] option').remove();
	$('#pageexport-list').hide();
	$('#pageexport-profile').show();
}
function pageExportItemAdd()
{
	/*var vars = PagesList.get().vars.getSortedArray();
	var gvars = GlobalVars.getSortedArray();
	var num = $('#savearray-table table tr:last-child td:first-child').text();
	
	var html = exportpageformat('arrayrow', {num: num ? parseInt(num)+1 : 0, rules: vars, global: gvars, vartypes: 'var'});
	$('#savearray-table table').append(html);
	*/
	alert('aaa');
}
function loadpage_nourl(save, refresh)
{
	var url = document.getElementById('js_url').value;//_PARSE.url;
	request(url);
}

/**Translate**/
function Translate()
{
	this.mess = {};
}

Translate.prototype = {
	t: function(message, params) {
		var msg = this.mess[message] ? this.mess[message] : message;
		for (var name in params)
			msg = msg.replace(new RegExp('\\{'+name+'\\}', 'gi'), params[name]);
		return msg;
	}
};
var Lang = new Translate();
/**Translate**/


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

function escapeStr(str)
{
	if (typeof str == 'string')
		return str.replace(/([^\\])'/g, "$1\\'");
	return str;
}

String.space = function (len) {
	var t = [], i;
	for (i = 0; i < len; i++) {
		t.push(' ');
	}
	return t.join('');
};
var formatJSON = function (text) {
				text = text.replace(/\n/g, ' ').replace(/\r/g, ' ');
				var t = [];
				var tab = 0;
				var inString = false;
				for (var i = 0, len = text.length; i < len; i++) {
					var c = text.charAt(i);
					if (inString && c === inString) {
						// TODO: \\"
						if (text.charAt(i - 1) !== '\\') {
							inString = false;
						}
					} else if (!inString && (c === '"' || c === "'")) {
						inString = c;
					} else if (!inString && (c === ' ' || c === "\t")) {
						c = '';
					} else if (!inString && c === ':') {
						c += ' ';
					} else if (!inString && c === ',') {
						c += "\n" + String.space(tab * 2);
					} else if (!inString && (c === '[' || c === '{')) {
						tab++;
						c += "\n" + String.space(tab * 2);
					} else if (!inString && (c === ']' || c === '}')) {
						tab--;
						c = "\n" + String.space(tab * 2) + c;
					}
					t.push(c);
				}
				return t.join('');
			};
function tabScriptClick()
{
	var data = formatJSON(JSON.stringify(_PARSE.sites.rule));
	$('.js_rule_res').val(data);
}


/***TAB EXPORT***/

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
	
	var name = $(elem).parent().parent().find('.name').text();

	var exp = _PARSE.getExportRules(name);

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


function exportDelete(elem)
{
	$('#delexpModal #ok-del-exp').click(function() {
		var name = $(elem).parent().parent().find('.name').text();
		exportList.remove('name', name);
		//ExportRules.del(name);
		//$(elem).parent().parent().remove();

	});
	$('#delexpModal').modal('show');
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
	
	params.name = name;
	params.type = type;
	var obj_export = {};
	obj_export[name] = params;
	
	var _export = exportList.get('name', name)[0];
	if(_export){
		_export.values(params);
		var arr = [];
		for(var i in _PARSE.getSite()['export']){
			if(_PARSE.getSite()['export'][i][name]){
				continue;
			}else{
				arr.push(_PARSE.getSite()['export'][i]);
			}
		}
		arr.push(obj_export);
		_PARSE.getSite()['export'] = arr;
		
		
	}else{
		exportList.add(params);
		var _export = _PARSE.getSite()['export'] || [];
		_export.push(obj_export);
		_PARSE.getSite()['export'] = _export;
	}
/*
	ExportRules.add(name, type, params);
	
	if (PagesList.array.length>0 && newedit=='edit' && (type=='xml' || type=='sql'))
	{
		var varnames = params.body.match(/\$[A-Za-z][A-Za-z0-9_]/g);
		deleteExportParams(PagesList.array[0], name, varnames);
	}
/*		
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
	
*/
	$('#exportedit').hide();
	$('#exporttable').show();

}

function exportEditCancel()
{
	$('#exportedit').hide();
	$('#exporttable').show();
}
/***TAB EXPORT***/


/*******Loading*******/
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
/*******Loading********/


function parseexec()
{
	if ($('#script').val() != '')
	{
		showLoadingProcess();
		$('#output').val('');
		closeLoadingProcess();
		$('#output').val('test');
	}
}
function rulesclose(loc)
{
		if (loc)
		{
			$('#closeModal').find('#yes-close-btn').attr('data-url', loc);
			$('#closeModal').find('#no-close-btn').attr('data-url', loc);
		}
		$('#closeModal').modal('show');

}