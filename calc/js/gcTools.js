/**
	1.02
*/
(
	function (toolboxName) {
		var toolsObj, x;
		
		window[toolboxName] = function (query, all) {
			return all ? document.querySelectorAll(query)
				: document.querySelector(query)
			;
		};
		
 		toolsObj = {
 			
 			val: (
 				function() {
 					function grab(el, onlyText) {
 					 return el instanceof Object 
 					 		? "value" in el 
 								? el.value
 								: onlyText
 									? el.innerText
 									: el.innerHTML
 							: void(0)
 						; 
 					};
 					
					return function(txt, all, onlyText) {
 						var x, el = window[toolboxName](txt, all), result;
					
						if(all) {
						 result = [];
							for(x = 0; x < el.length; x++) {
								result.push(grab(el[x], onlyText));
							}
						} else {
							result = grab(el, onlyText);
						}
 					
 						return result;
 					}
 				}
 			)(),
 			
 			/**
						Функция eventForEach устанавливает обработчик для каждого элемента
			 		в переданном ей массиве. Принимает: массив элементов, тип события (c "on"),
					функцию-обработчик, аргументы для обработчика.
			*/
			eventForEach: function(elements, onevent, handler){
				var x, args = Array.prototype.slice.call(arguments, 3);
				
				for (x = 0; x < elements.length; x++) {
					
					elements[x][onevent] = (
						function(args){
							return function() {
								handler.apply(this, args);
							}
						}
					)(args);
				
				}
				
			},

			getCheckedValues: function(name) {
				var elements = document.getElementsByName(name), result = [ ];
				for(x = 0; x < elements.length; x++) {
					if(elements[x].checked) result.push(elements[x].value);
				}
				return result;
			},
			
			toBorn: function(nodeName, values, parentNode){
				var x, element = document.createElement(nodeName);
				values = values || {};
				for(x in values){
					element[x] = values[x];
				}
				if(parentNode) {
					parentNode.appendChild(element);
				}
				return element;
			},
			
		}//tools object
		
		for(x in toolsObj) {
			window[toolboxName][x] = toolsObj[x];
		}
	}// анонимная функция
	
)("gc")