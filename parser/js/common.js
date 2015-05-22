"use strict";
Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   var _hh = this.getHours().toString(); 
   var _mm = this.getMinutes().toString();  
   var _ss = this.getSeconds().toString();  
   return yyyy + '-' + ( mm[1]?mm:"0"+ mm[0] ) +'-' + (dd[1]?dd:"0"+dd[0]) + ' '+ _hh+':'+_mm+':'+_ss; // padding
};
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
	head.insertBefore(newBase, theFirstChild);	
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
function createXPathFromElement(elm) { 
    //var allNodes = document.getElementsByTagName('*'); 
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) 
    {
    	if (elm.nodeName.toLowerCase() == 'html' || elm.nodeName.toLowerCase() == 'body')
    	{
    		segs.unshift(elm.nodeName.toLowerCase());
    	}
    	else if (elm.hasAttribute('id')) { 
            segs.unshift(elm.nodeName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'); 
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

function setItem()
{
	var type = $('#itemNameParseModal select[name="type"]').val();
	var name = $('#itemNameParseModal input[name="name"]').val();
	var parent = $('#itemNameParseModal .js_parent').val() || null;
	
	
	if (name != '' && name.search(/^[A-Za-z][A-Za-z0-9_]*$/) != -1) 
	{
		$('#itemNameParseModal').fadeOut('slow');
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


}
function addEventListener(element, name, observer, capture) {

	if (typeof element == 'string') {
		var doc = getIframeContent('html');
        element = doc.querySelector(element);
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
						
						if(_PARSE && _PARSE.golink){
							var url = $(_target).attr('href');
							request(url);
						}else{
							//_PARSE.rule_xpath = createXPathFromElement(_target);
							selectBorder(_target, 'text', e, true);
						}
						
						 e.preventDefault();
						 return false;
					 })
				});                            
				addEventListener(allNodes[i], 'mouseout', function(e){
					e = e || event;
					
					var target = e.target || e.srcElement;                            
					//this.style.border = "none";
					this.style.background="";
				});
			}                  
		} 
	}
}

function selectBorder(elem, type, e, dialog)
{
	if (dialog == undefined || dialog == true)
	{
		$('#itemNameParseModal').modal('show');
		//$('#itemNameParseModal').css('left', e.clientX+50).css('top', e.clientY+10).fadeIn('slow');
		$('#itemNameParseModal').css('top', e.clientY+10).fadeIn('slow');
	}
	
	$(elem).data('oldstyle2', $(elem).css('border'));
	$(elem).data('selected', 1);
	$(elem).css('border', '3px dashed red');

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

/*******Loading*******/
var Loading = (function(){
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
	};

	function closeLoadingProcess()
	{
		LoadingProcessCount--;
		if (LoadingProcessCount <= 0)
		{
			$('#loader').hide();
			$('#layer1').remove();
			LoadingProcessCount = 0;
		}
	};
	
	
	return {
		show : showLoadingProcess,
		close : closeLoadingProcess
	}

})();

/*******Loading********/
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
var formatState = function(state) {
		var icon = {
			'text' : '<i class="icon-align-left"></i>',
			'link' : '<i class="icon-font"></i>',
			'img' : '<i class="icon-picture"></i>',
			'html' : '<i class="icon-chevron-left"></i><i class="icon-chevron-right"></i>',
			'table' : '',
		};
		if (!state.id) { return state.text; }
		var $state = $(
		'<span id="sel'+state.element.value.toLowerCase()+'">' + icon[state.element.value.toLowerCase()] + ' ' + state.text + '</span>'
		);
		return $state;
};