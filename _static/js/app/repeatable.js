/**
* 
* @license WTFPL (http://sam.zoy.org/wtfpl/)
* @purpose template-less population of repeatables (lists)

If you have this markup:

<ul>
   <li><a href="mailto:{{this.email}}">{{this.name}}</a> <b if="this.age > 18">adult!</b> </li> 
</ul>

And this initialization code:

  var rep = new _repeatable('ul');

And this data:

  var data = [
     { name: "Olga", age: 20, email: "aaa@example.com" },
     { name: "Peter", age: 30, email: "bbb@example.com" },
     { name: "Ivan", age: 15, email: "ccc@example.com" },
  ];
 
Then after assigning array value to the repeteable :

  rep.value = data;
  
You will get this markup populated in the list:

<ul>
   <li><a href="mailto:aaa@example.com">Olga</a> <b>adult!</b> </li> 
   <li><a href="mailto:bbb@example.com">Peter</a> <b>adult!</b> </li> 
   <li><a href="mailto:ccc@example.com">Ivan</a>  </li> 
</ul>

*/

/**
http://habrahabr.ru/post/211590/
**/
"use strict";
function _repeatable(el) {
    var _el = document.querySelector(el);
	var template = getChild(_el);
	var nrTemplate = template.length > 1 ? template[1] : null; // "no records" template
		template = template[0];

    var compiled = {}; // compiled expressions
    var vector = null; // data
    var index = 0;     // current index being processed
	
 	function getChild(el){
		var child = [];
		for(var i=0; i < el.childNodes.length; i++) {
			if (el.childNodes[i].nodeType == 1)
				child.push(el.childNodes[i]);
		}
		return child;
	}
	
    //function evalExpr(str) { return eval("(" + str + ")"); }
    function compiledExpr(str) { 
      var expr = compiled[str]; 
      if( !expr )
        compiled[str] = expr = new Function("$index","$first","$last","$total", "return (" + str + ")"); 
      return expr;
    }

    function replace(text, data) {
      function subst(a, b) { 
        var expr = compiledExpr(b);
        var s = expr.call(data, index, index==0,index==vector.length - 1, vector.length); return s === undefined ? "" : s; 
      }
      return text.replace(/{{(.*)}}/g, subst);
    }
    

    function instantiate(el, data) {
      var attributes = el.attributes;
      for (var i = 0; i < attributes.length; ++i) {
        var attribute = attributes[i];
        if (attribute.name == "if") {
          var str = attribute.value;
          var expr = compiledExpr(str);
          var tokeep = expr.call(data, index, index == 0, index == vector.length - 1, vector.length);
          if (!tokeep) { el.parentElement.removeChild(el); return; }
        }
        else if (attribute.value.indexOf("{{") >= 0)
          attribute.value = replace(attribute.value, data);
      }
      for (var nn, n = el.firstChild; n; n = nn) {
        var nn = n.nextSibling;
        if (n.nodeType == 1)  // element
          instantiate(n, data);
        else if (n.nodeType == 3) // text
        {
          var t = n.textContent;
          if (t.indexOf("{{") >= 0)
            n.textContent = replace(t, data);
        }
      }
    }
	
	function getValue() { return vector; }
	
    function setValue(newValue) {
      vector = newValue;
      var t = template;
      if( !vector || vector.length == 0 ) {
		_el.innerHTML = "";
        if(nrTemplate)
          _el.appendChild(nrTemplate); // no records
      }
      else {
        var fragment = document.createDocumentFragment();
        for (index = 0; index < vector.length; ++index) {
          var nel = t.cloneNode(true);
          instantiate(nel, vector[index]);
          fragment.appendChild(nel);
        }
		_el.innerHTML = "";
		_el.appendChild(fragment);
		console.log(fragment);
      }
    }
	
    // redefine its 'value' property, setting value to some array will cause popupaltion of the repeatable by that data.
    try { Object.defineProperty(this, "value", { get: getValue, set: setValue, enumerable: true, configurable: true }); } catch(e) {}
	
}

