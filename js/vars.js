"use strict";

var DEF_TPL = 
'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"   "http://www.w3.org/TR/html4/strict.dtd">'+
'<html>'+
' <head>'+
'  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">'+
'  <title>Моя первая веб-страница</title>'+
' </head>'+
' <body>'+
'  <h1>Заголовок страницы</h1>'+
'  <p>Основной текст.</p>'+
' </body>'+
'</html>';


var DEF_TPL = 
'<?xml version="1.0" encoding="utf-8"?>'+
'<!DOCTYPE recipe>'+
'<recipe name="хлеб" preptime="5min" cooktime="180min">'+
'   <title>'+
'      Простой хлеб'+
'   </title>'+
'   <composition>'+
'      <ingredient amount="3" unit="стакан">Мука</ingredient>'+
'      <ingredient amount="0.25" unit="грамм">Дрожжи</ingredient>'+
'      <ingredient amount="1.5" unit="стакан">Тёплая вода</ingredient>'+
'      <ingredient amount="1" unit="чайная ложка">Соль</ingredient>'+
'   </composition>'+
'   <instructions>'+
'     <step>'+
'        Смешать все ингредиенты и тщательно замесить. '+
'     </step>'+
'     <step>'+
'        Закрыть тканью и оставить на один час в тёплом помещении. '+
'     </step>'+
'     <!-- '+
'        <step>'+
'           Почитать вчерашнюю газету. '+
'        </step>'+
'         - это сомнительный шаг...'+
'      -->'+
'     <step>'+
'        Замесить ещё раз, положить на противень и поставить в духовку. '+
'     </step>'+
'  </instructions>'+
'</recipe>';
function is_null( mixed_var ){	// Finds whether a variable is NULL
	// 
	// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)

	return ( mixed_var === null );
}

var _PARSE = {
	_id : null,
	_url : null,
	_html : null,
	_name : null,
	_date_edit : null,
	rule : []
};

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
		var tag = domElem.tagName.toLowerCase() || null;
		if(tag == 'input' || tag == 'textarea'){
			Object.defineProperty(obj, property, { 
				get: function() { 
					return this['_'+property]; 
				}, 
				set: function(newValue) {
					this['_'+property] = newValue; 
					domElem.value = newValue; 
				}, 
				configurable: true 
			}); 
		}else{
			var text = domElem.innerHTML ;
			Object.defineProperty(obj, property, { 
				get: function() {
					return this['_'+property]; 
				}, 
				set: function(newValue) { 
					this['_'+property] = newValue; 
					domElem.innerHTML = text + ' ' + newValue; 
				}, 
				configurable: true 
			});	
		}
	}

}
 
/*
USE
// <input id="foo"> 
user = {} 
bindModelInput(user,'name',document.getElementById('foo'));// Вуаля, получаем двусторонний дата-биндинг

*/








var HelpUrl = '/ru/docs/';
var TranslateArray = {};
var RDBExportTypes = {'opencart':
{'Product': {
	'Language': true,
	'Product Name': true,
	'Product Price': true,
	'Product Description': true,
    'Product Category': {
        'Category Name': true,
    },
	'Product Sort Order': true,
	'Manufacturer Name': true,
	'Product Specification': {
		'Attribute Group Name': true,
		'Group Attributes': {
			'Attribute Name': true,
			'Attribute Value': true,
		},
	},
	'Main Image Path': true,
	'Product Images': {
		'Image Path': true,
	},
	'Product Quantity': true,
 },
 'Category': {
	 'Category Name': true,
	 'Category Description': true,
     'Language': true,
	 'Parent Category': true,
	 'Child Category': true,
 },
},
'prestashop':
{'Product': {
    'Language': true,
    'Shop Name': true,
	'Product Name': true,
	'Product Description': true,
	'Product Price': true,
	'Product SEO Link': true,
	'Manufacturer Name': true,
    'Supplier Name': true,
    'Tax Rules Name': true,
	'Category Name': true,
	'Product Category': {
        'Category Name': true,
    },
    'Product Images': {
        'Image Name': true,
    },
    'Product Features': {
        'Feature Name': true,
        'Feature Value': true,
    },
  },
},
'wordpress':
{'Post': {
	'User Login': true,
	'Post Content': true,
	'Post Title': true,
	'Post Status': true,
    'Post Type': true,
	'Post Terms': {
		'Term Type': true,
		'Term Name': true,
	},
    'Attachments': true,
 },
},
};
