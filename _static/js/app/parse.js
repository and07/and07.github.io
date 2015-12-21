/**************PARSE***************/
"use strict";


function addBaseTag(el,url){
    var newBase = el.createElement("base");
    newBase.setAttribute("href", url);
    el.getElementsByTagName("head")[0].appendChild(newBase);

//<base href="http://www.somedomain.com/directory/" />
}

/***************http://stackoverflow.com/questions/9252839/simplest-way-to-remove-all-the-styles-in-a-page**************************/
function delStyle(doc){
	var x = doc.getElementsByTagName("style");
	for (var i = x.length - 1; i >= 0; i--){
		x[i].parentElement.removeChild(x[i]);
	}
	return doc;
}
/*
*USE
*removeStyles(document.body);
*/
function removeStyles(el) {
    el.removeAttribute('style');

    if(el.childNodes.length > 0) {
        for(var child in el.childNodes) {
            /* filter element nodes only */
            if(el.childNodes[child].nodeType == 1)
                removeStyles(el.childNodes[child]);
        }
    }
}


function delLink(doc){
	var stylesheets = doc.getElementsByTagName('link'), i, sheet;

	for(i in stylesheets) {
		sheet = stylesheets[i];
        console.log(sheet);
		if(sheet['getAttribute']/* && sheet.getAttribute('type').toLowerCase() == 'text/css'*/){
			sheet.parentNode.removeChild(sheet);
		}
	}
    return doc;
}
function allDelStyle(doc){
doc = delLink(doc);
doc = delStyle(doc);
return doc;
}

/***********************************************/

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


var PARSE = {};
PARSE.DelStyle = false;
PARSE.BaseTag = false;
PARSE.addEventListener = function(element, name, observer, capture) {
    if (typeof element == 'string') {
        element = PARS.doc.querySelector(element);
    }
    if (element.addEventListener) {
        element.addEventListener(name, observer, capture);
    } else if (element.attachEvent) {
        element.attachEvent('on' + name, observer);
    }
};

PARSE.parse_html = function(url){
	var _url = $('#inputURL').val();
	
	$.post('/parse-preview/', {'url':url}, function(data){
	        var html = document.getElementById('HTMLview');
		   document.getElementById('preview-html').style.display="block"; 
		   html.style.display="block";
		   var body = data.body;
		   html = populateIframe('HTMLview',body);
		   if(PARSE.BaseTag){
				addBaseTag(html,_url);
		   }
		   if(PARSE.DelStyle){
				html = allDelStyle(html)
		   }
		   addLink(html, server+'/css/parse.css');
		   addLink(html, server+'/css/modalwin.css');
		   //html.contentWindow.document.body.innerHTML = data.body;
		   //html.innerHTML = body;
		   //var domen = parseURL(url);
		   //domen = domen.protocol + '://' + domen.host + '/';               
		   //replacelink(html,'link',domen);
		   setEvenHoveredAll(html);

		return false;
	});
	
	
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
				PARSE.addEventListener(allNodes[i], 'mouseover', function(e){
					e = e || event;
					e.stopPropagation();
					var target = e.target || e.srcElement;
					target.style.border = "1px solid #000";
					target.style.background="#d3e2f0";//"#f2f2f2";
					// console.log( createXPathFromElement(target));
				   
					hovered.innerHTML = createXPathFromElement(target);
					//_EVENT.add(this,'click',setXpath);
					 PARSE.addEventListener(target, 'click', function(e){
						 e = e || event;
						 var _target = e.target || e.srcElement;
						 var xpath = document.getElementById('selxpath');
						 var v_xpath = createXPathFromElement(_target);
						 v_xpath = v_xpath.replace(' parse_sel_el','');
						 v_xpath = v_xpath.replace('[@class=""]','');
						 v_xpath = v_xpath.replace('[@class=""]','');
						 xpath.value = v_xpath;
						 var cls_parse_sel = 'parse_sel_el';
						if (!hasClass(_target,cls_parse_sel)){
							addClass(_target,cls_parse_sel);
							popup(_target);
						}
						 e.preventDefault();
						 return false;
					 })
				});                            
				PARSE.addEventListener(allNodes[i], 'mouseout', function(e){
					e = e || event;
					
					var target = e.target || e.srcElement;                            
					this.style.border = "none";
					this.style.background="";
				});
			   /*
				_EVENT.add(allNodes[i], 'mouseover', function(e){
					e = e || event;
					var target = e.target || e.srcElement;
					target.style.border = "1px solid #000";
					target.style.background="#d3e2f0";//"#f2f2f2";
					// console.log( createXPathFromElement(target));
				   
					hovered.innerHTML = createXPathFromElement(target);
					
					_EVENT.add(this,'click',setXpath);
					
				});
				/*
				Event.add(allNodes[i], 'mouseover', function(e){
					var hovered = document.getElementById('hovered-element-info');
					hovered.innerHTML = createXPathFromElement(this);                            
				});*
				_EVENT.add(allNodes[i], 'mouseout', function(e){
					e = e || event;
					var target = e.target || e.srcElement;                            
					this.style.border = "none";
					this.style.background="";
				});
				
				*/
			}                  
		} 
	}
}


function addLink(el,url){
    var ss = el.createElement("link");
    ss.type = "text/css";
    ss.rel = "stylesheet";
    ss.href = url;
    el.getElementsByTagName("head")[0].appendChild(ss);
}


function replacelink(el,tag,domen){
    var nodeList = el.getElementsByTagName(tag);
    
    if(tag === 'link' || tag === 'a')
    {
        for (var i = 0; i < nodeList.length; i++)
        { 
            if(nodeList[i].href.indexOf(domen) === -1)
            {
                var _domen = parseURL(nodeList[i].href);
                console.log(_domen.path);       
                nodeList[i].href = domen + _domen.path;
            }
        }
    }
    
    return el;
}
function createXPathFromElement(elm) {
    var div = getIframeContent('HTMLview');
    var allNodes = div.getElementsByTagName('*');

    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode)
    {
        if (elm.hasAttribute('id')) {
                var uniqueIdCount = 0;
                for (var n=0;n < allNodes.length;n++) {
                    if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
                    if (uniqueIdCount > 1) break;
                };
                if ( uniqueIdCount == 1) {
                    segs.unshift('id("' + elm.getAttribute('id') + '")');
                    return segs.join('/');
                } else {
                    segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
                }
        } else if (elm.hasAttribute('class')) {
            segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]');
        } else {
            for (var i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
                if (sib.localName == elm.localName)  i++; };
                segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
        };
    };
    return segs.length ? '/' + segs.join('/') : null;
}; 

function lookupElementByXPath(path) {
    var evaluator = new XPathEvaluator();
    var result = evaluator.evaluate(path, document.documentElement, null,XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return  result.singleNodeValue;
}

var getElementXPath = function(element) {
  if (element && element.id)
      return '//*[@id="' + element.id + '"]';
  else
      return getElementTreeXPath(element);
};

var getElementTreeXPath = function(element) {
      var paths = [];

      // Use nodeName (instead of localName) so namespace prefix is included (if any).
      for (; element && element.nodeType == 1; element = element.parentNode)  {
          var index = 0;
          // EXTRA TEST FOR ELEMENT.ID
          if (element && element.id) {
              paths.splice(0, 0, '/*[@id="' + element.id + '"]');
              break;
          }

          for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
              // Ignore document type declaration.
              if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
                continue;

              if (sibling.nodeName == element.nodeName)
                  ++index;
          }

          var tagName = element.nodeName.toLowerCase();
          var pathIndex = (index ? "[" + (index+1) + "]" : "");
          paths.splice(0, 0, tagName + pathIndex);
      }

      return paths.length ? "/" + paths.join("/") : null;
};  
  


var cnt = 0;
function createObject(el) {
	//var id = 'swf';
	var div = document.createElement('div');
	//div.id=id;
	//div.className = '';
	//div.style.height = '340px';
	//div.style.width = '400px';
    cnt++;
	div.innerHTML = '<input type="text"  name="Name_'+cnt+'" class="form-control name" id="" placeholder="Name">'+
                    '<input type="text"  name="Xpath_'+cnt+'" class="form-control xpath" id="" placeholder="Xpath">'+
                    '<button type="button" class="close" aria-hidden="true">&times;</button>';
	el.appendChild(div);
	return 
}

 
 

 
 
  
$(document).on('click','.xpath',function(){ 
    $('#selxpath').css('background','#fff');
    $('#selxpath').attr('id','');        
    $(this).attr('id','selxpath');
    $(this).css('background','rgb(253, 0, 0) !important');
}); 
$(document).on('click','.name',function(){ 
    $('#selname').css('background','#fff');
    $('#selname').attr('id','');        
    $(this).attr('id','selname');
    $(this).css('background','rgb(253, 0, 0) !important');
});  

function arrayCombine(type,key,val){
    var counter = 0;
    for (var k in type) counter++;
    var obj = {};
    for( var i=0;i < counter;i++){
        obj[type['Type_'+i]] = {};
    }
    for( var k=0;k < counter;k++){
        obj[type['Type_'+k]][key['Name_'+k]] = val['Xpath_'+k];
    }    

    return obj;
} 

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
    //var tmp ={_attr,_name,_xpath};

    // tmp[attr.getAttribute("name")][name.getAttribute("name")]=xpath.value;
    
    //tmp[el.tagName] = el.innerText; 
    return tmp;
}
var sub_el = '.vtree-subtree';   
var getTreeData =  function(el){
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




function _parse(){
/*    var _xpath = {};
    var _name = {};
    var _attr = {};
    $('.xpath').each(function(indx, element){
        _xpath[$(element).attr('name')] = $(element).val();    
    });
    $('.name').each(function(indx, element){
        _name[$(element).attr('name')] = $(element).val();    
    });
     $('.selattr').each(function(indx, element){
        _attr[$(element).attr('name')] = $(element).val();    
    });   
/*
    console.log(_xpath);
    console.log(_name);
    console.log(_attr);
 *
    var data = arrayCombine(_attr,_name,_xpath);
    console.log(data);
   */ 
    var elements = document.querySelector('.vtree');
    var data = getTreeData(elements); 

    var url = $('#inputURL').val();
    var name = $('#name').val();
    var host = parseURL(url);
    var domen = host.protocol + '://' + host.host;
    var type = $('#type').val();
    
    if(type === 'xml')
    {
        if (data){
            $.post('/parse-xml/',{'url':url, 'data':data, 'name':name}, function(data){
                console.log(data);
            })
        }
    }else if(type === 'html'){    
        if (data){
            console.log(data);
            $.post('/parse-html/',{'url':url, 'data':data,'host':host['host'], 'name':name, 'domen':domen}, function(data){
                console.log(data);
            })
        }
    }
//*/
}

function setXpath(){
    var xpath = document.getElementById('selxpath');
    xpath.value = createXPathFromElement(this);
    var cls_parse_sel = 'parse_sel_el';
    //console.log(hasClass(this,cls_parse_sel));
    if (!hasClass(this,cls_parse_sel)){
        addClass(this,cls_parse_sel);
        popup('.parse_sel_el');
        //_EVENT.add(this,'contextmenu',function(){popup('.parse_sel_el');});
    }
    //this.style.background="#d3e2f0";
    //console.log( createXPathFromElement(this));
    return false;
}

function delEvenHoveredAll(html){

}



function doSomething(e) {
    var rightclick;
    if (!e) var e = window.event;
    if (e.which) rightclick = (e.which == 3);
    else if (e.button) rightclick = (e.button == 2);
    return rightclick; // true or false
}

function setBaseTag(){
    
}
function setStyle(){
    
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


function getContext(){
var menu = [{
        name: 'create',
        img: '/images/context/create.png',
        title: 'create button',
        fun: function () {
            alert('i am add button')
        }
    }, {
        name: 'update',
        img: '/images/context/update.png',
        title: 'update button',
        fun: function () {
            alert('i am update button')
        }
    }, {
        name: 'delete',
        img: '/images/context/delete.png',
        title: 'create button',
        fun: function () {
            alert('i am add button')
        }
    }];
  return  m('ul.parse_context',{},[
        menu.map(function(data, index) {
               return m("li", {class:data.title,onclick:data.fn},/*[m('img.mIcon',{src:server+data.img,align:"absmiddle"})], */data.name);
        })  
    ]);
}


function showContext(e){
var frame = getIframeContent('HTMLview');
 m.render(frame.body,getContext());
return false;

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

/**
//call the functions
*
**
addClass(document.getElementById("test"), "test");
removeClass(document.getElementById("test"), "test")
if(hasClass(document.getElementById("test"), "test")){//do something};
**/
  
