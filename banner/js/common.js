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



var scnt = 0;
function createItem() {
	scnt++;
	var id = '#item_'+scnt+'';
	return v(id+'.custom-block-item ', {}, [
			v('hr'),
			v('div',{},[
				v('label',{'for': 'block_title_'+scnt},'Название'),
				v('input',{'id': 'block_title_'+scnt }),
			]),
			v('div',{},[
				v('label',{'for': 'block_code_'+scnt},'Код'),
				v('textarea',{'id':'block_code_'+scnt,'rows':"7", 'cols':"250", 'spellcheck':"false"})
			]),
	]);
};
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
			configurable: true 
		});

	}

}

function siteclose(loc)
{

	$('#closeModal').modal('show');
	$("#closeModal").css("z-index", "1051");
	//$("#editModal").modal('hide');

}
function sitesave(successfunc)
{
	alert('sdfsf');
	//var parser = getlocalStorageParser();
	//parser[_PARSE.name]['rule'] =  getRule();
	//setlocalStorageParser(parser);	

}

/*******************Virtual DOM***********************/
/**USE*********************************************    
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