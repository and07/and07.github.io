/*
*USE

function handler(event) {
    this.innerHTML = "event.pageX="+event.pageX
}
 
_EVENT.add(elem, 'click', handler)

_EVENT.remove(elem, 'click', handler)

*/
//http://javascript.ru/tutorial/events/crossbrowser

"use strict";
var _EVENT = (function() {

  var guid = 0
    
  function fixEvent(event) {
	event = event || window.event
  
    if ( event.isFixed ) {
      return event
    }
    event.isFixed = true 
  
    event.preventDefault = event.preventDefault || function(){this.returnValue = false}
    event.stopPropagation = event.stopPropagaton || function(){this.cancelBubble = true}
    
    if (!event.target) {
        event.target = event.srcElement
    }
  
    if (!event.relatedTarget && event.fromElement) {
        event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;
    }
  
    if ( event.pageX == null && event.clientX != null ) {
        var html = document.documentElement, body = document.body;
        event.pageX = event.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
        event.pageY = event.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
    }
  
    if ( !event.which && event.button ) {
        event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
    }
	
	return event
  }  
  
  /* Вызывается в контексте элемента всегда this = element */
  function commonHandle(event) {
    event = fixEvent(event)
    
    var handlers = this.events[event.type]

	for ( var g in handlers ) {
      var handler = handlers[g]

      var ret = handler.call(this, event)
      if ( ret === false ) {
          event.preventDefault()
          event.stopPropagation()
      }
    }
  }
  
  return {
    add: function(elem, type, handler) {
      if (elem.setInterval && ( elem != window && !elem.frameElement ) ) {
        elem = window;
      }
      
      if (!handler.guid) {
         handler.guid = ++guid;
      }
      
      if (!elem.events) {
        elem.events = {}
		elem.handle = function(event) {
		  if (typeof Event !== "undefined") {
			return commonHandle.call(elem, event)
		  }
        }
      }
	  
      if (!elem.events[type]) {
        elem.events[type] = {}        
      
        if (elem.addEventListener)
		  elem.addEventListener(type, elem.handle, false)
		else if (elem.attachEvent)
          elem.attachEvent("on" + type, elem.handle)
      }
      
      elem.events[type][handler.guid] = handler
    },
    
    remove: function(elem, type, handler) {
      var handlers = elem.events && elem.events[type]
      
      if (!handlers) return
      
      delete handlers[handler.guid]
      
      for(var any in handlers) return 
	  if (elem.removeEventListener)
		elem.removeEventListener(type, elem.handle, false)
	  else if (elem.detachEvent)
		elem.detachEvent("on" + type, elem.handle)
		
	  delete elem.events[type]
	 
	  for (var any in elem.events) return
	  try {
	    delete elem.handle
	    delete elem.events 
	  } catch(e) { // IE
	    elem.removeAttribute("handle")
	    elem.removeAttribute("events")
	  }
    } 
  }
}())

    /*
    * USE
    * executeFunctionByName("My.Namespace.functionName", window, arguments);
    * executeFunctionByName("Namespace.functionName", My, arguments);
    * http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
    */    
var executeFunctionByName = function(functionName, context /*, args */) {
      var args = Array.prototype.slice.call(arguments).splice(2);
      var namespaces = functionName.split(".");
      var func = namespaces.pop();
      for(var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
      }
      
      //return context[func].apply(this, args);
      return context[func];
}

var getAction = function(attributes){
         for (var i = 0; i < attributes.length; ++i) {
            var attribute = attributes[i];
            if(attribute.name == "action"){
                return attribute.value;
            }
         }
         return false;
}
    
var setEvent = function(obj) {
    //var obj = document.getElementsByTagName('button');
    for(var el in obj){
        var elem = obj[el];
        var attributes = elem.attributes;
        if(attributes !== undefined){
            for (var i = 0; i < attributes.length; ++i) {
                var attribute = attributes[i];
                if(attribute.name == "on"){
                    var event = attribute.value;
                    var action = getAction(attributes) ? getAction(attributes) : false;
                    
                    _EVENT.remove(elem, event, function(){});
                    var fn = executeFunctionByName(action,window);
                    //console.log(fn);
                    _EVENT.add(elem, event, fn);
                    //elem['on'+event] = action ?  function(){executeFunctionByName(action,window); } :  function(){};

                }
            }
        }
    }
}



/*
* USE
* fireEvent("node_id","click");
**
 * trigger a DOM event via script
 * @param {Object,String} element a DOM node/node id
 * @param {String} event a given event to be fired - click,dblclick,mousedown,etc.
 */
// http://darktalker.com/2010/manually-trigger-dom-event/ 
var fireEvent = function(element, event) {
    var evt;
    var isString = function(it) {
        return typeof it == "string" || it instanceof String;
    }
    element = (isString(element)) ? document.querySelector(element) : element;
    if (document.createEventObject) {
        // dispatch for IE
        evt = document.createEventObject();
        return element.fireEvent('on' + event, evt)
    }
    else {
        // dispatch for firefox + others
        evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true); // event type,bubbling,cancelable
        return !element.dispatchEvent(evt);
    }
}
  
