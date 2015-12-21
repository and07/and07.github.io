// ***********************Modal Win*****************************/
/*
* use
* 
*
*
//*/

// Модальное окно с поддержкой html, js. 
// show - Вывод окна с переданным содержимым.
// confirm - Вывод окна подтверждения. Отличие от js confirm в поддержке html и наличия собственных обработчиков кнопок.
var modalWindow = {

	_block:      undefined,
	_win:        undefined,
	_close:      undefined,
	_prev:       undefined,
	_prev_span:  undefined,
	_next:       undefined,
	_next_span:  undefined,
	products:    undefined,
	prod_id:     undefined,
	_instances:  [], // массив для поддержки любого кол-ва окон одновременно
	_blockCount: 0,
	params: {'prev_next':true,'doc':document},
	
	initClose: function(type) {
		var i = modalWindow._instances.length;
		var _close = modalWindow.params.doc.getElementById('modalwindow-close'+i)!==null?modalWindow.params.doc.getElementById('modalwindow-close'+i):null;
		//Если он не определен, то создадим его
		if (!_close) {
			var parent = modalWindow.params.doc.getElementById('modalwindow'+i); //Получим первый элемент тега body
			_close = modalWindow.params.doc.createElement('div'); //Создаем элемент div
			_close.id = 'modalwindow-close'+i; //Присваиваем ему наш ID
			_close.className = 'modalwindow-close';
			parent.appendChild(_close);//Вставляем в конец
			_close.onclick = function() { modalWindow.close(i); } //Добавим обработчик события по нажатию на блокирующий экран - закрыть модальное окно.
		}		
		modalWindow._close = _close;
	},
	
	initPrevNext: function() {
		if (modalWindow.products===null)
			return;
		var i = modalWindow._instances.length;
		var _prev = modalWindow.params.doc.getElementById('modalwindow-prev')!==null?modalWindow.params.doc.getElementById('modalwindow-prev'):null;
		var _next = modalWindow.params.doc.getElementById('modalwindow-next')!==null?modalWindow.params.doc.getElementById('modalwindow-next'):null;
		
		var parent = modalWindow.params.doc.getElementById('modalwindow'+i);
		var products = modalWindow.products;
		var prod_id = modalWindow.prod_id;

		for(var j = 0; j < products.length; j++)
		{
			if(products[j] == prod_id ){
				var next = products[j+1];
				var prev = products[j-1];
			}
		}

		//Если он не определен, то создадим его
		if (!_prev) {
			_prev = modalWindow.params.doc.createElement('a');
			var _prev_span = modalWindow.params.doc.createElement('span');
			//_prev.setAttribute("prod_id", prev); 
			_prev.id = 'modalwindow-prev'; //Присваиваем ему наш ID
			_prev.appendChild(_prev_span);
			parent.appendChild(_prev);//Вставляем в конец
			if(prev === undefined || prev === null){
				_prev.style.display="none";
			}			
			_prev.onclick = function() { 
				//alert('prev');
				if(prev !== undefined){
					_prev.style.display="block";
					var data = {prod_id:prev,products:modalWindow.products};
					quick_view.init_quick_view(data);
					modalWindow._instances.pop(); //не надо увеличивать счетчик
					modalWindow._blockCount--;
				}else{}
			} //Добавим обработчик события по нажатию на блокирующий экран - закрыть модальное окно.
		} 
		if (!_next) {
			_next = modalWindow.params.doc.createElement('a');
			var _next_span = modalWindow.params.doc.createElement('span');
			//_next.setAttribute("prod_id", next); 
			_next.id = 'modalwindow-next'; //Присваиваем ему наш ID
			_next.appendChild(_next_span);
			parent.appendChild(_next);//Вставляем в конец
			if(next === undefined || next === null){
				_next.style.display="none";
			}			
			_next.onclick = function() { 
				if(next !== undefined){
					_next.style.display="block";
					var data = {prod_id:next,products:modalWindow.products};
					quick_view.init_quick_view(data);
					modalWindow._instances.pop(); //не надо увеличивать счетчик
					modalWindow._blockCount--;
				}else{}
			} //Добавим обработчик события по нажатию на блокирующий экран - закрыть модальное окно.
		}
		modalWindow._prev = _prev;
		modalWindow._next = _next;
	},	
	
	initBlock: function() {	
		modalWindow._blockCount++;
		modalWindow._instances.push(modalWindow._instances.length+1);
		var i = modalWindow._instances.length;
		var _block = modalWindow.params.doc.getElementById('blockscreen')!==null?modalWindow.params.doc.getElementById('blockscreen'):null; //Получаем наш блокирующий фон по ID

		//Если он не определен, то создадим его
		if (!_block) {
			var parent = modalWindow.params.doc.getElementsByTagName('body')[0]; //Получим первый элемент тега body
			var obj = parent.firstChild; //Для того, чтобы вставить наш блокирующий фон в самое начало тега body
			_block = modalWindow.params.doc.createElement('div'); //Создаем элемент div
			_block.id = 'blockscreen'; //Присваиваем ему наш ID
			parent.insertBefore(_block, obj); //Вставляем в начало
		} 
		var win_count = modalWindow._instances.length;
		_block.onclick = function() { for(var j = 0; j < win_count; j++) { modalWindow.close(j+1); } }; //Добавим обработчик события по нажатию на блокирующий экран - закрыть все модальные окна.
		_block.style.opacity = '0.8';
		_block.style.display = 'block'; //Установим CSS-свойство
		_block.style.width   = '100%';  //Установим CSS-свойство  
        _block.style.height  = '100%';  //Установим CSS-свойство
		
		this._block = _block;
	},
	
	initWin: function(width, html, type) {
		var i = modalWindow._instances.length;
		var _win = modalWindow.params.doc.getElementById('modalwindow'+i)!==null?modalWindow.params.doc.getElementById('modalwindow'+i):null; //Получаем наше диалоговое окно по ID
		//Если оно не определено, то также создадим его по аналогии
		if (!_win) {
			var parent = modalWindow.params.doc.getElementsByTagName('body')[0];
			var obj = parent.firstChild;
			_win = modalWindow.params.doc.createElement('div');
			_win.id = 'modalwindow'+i;
			if (type=='modalWindow') _win.className = 'modalWindow'; 
			else if (type=='modalConfirmWindow') _win.className = 'modalConfirmWindow';
			parent.insertBefore(_win, obj);
		}
		_win.style.width = width + 'px'; //Установим ширину окна
		_win.style.display = 'inline'; //Зададим CSS-свойство
		_win.style.zIndex = 1000+i;
						
		_win.innerHTML = html; //Добавим нужный HTML-текст в наше диалоговое окно
		modalWindow.initScript(_win);
		
		//Установим позицию по центру экрана

		_win.style.left = '50%'; //Позиция по горизонтали
		_win.style.top = '50%'; //Позиция по вертикали
					//
		//Выравнивание по центру путем задания отрицательных отступов
		_win.style.marginTop = -(_win.offsetHeight / 2) + 'px'; 
		_win.style.marginLeft = -(width / 2) + 'px';
		modalWindow._win = _win;
	},

	close: function(i) {
		modalWindow._blockCount--;
		modalWindow._instances.shift();
		type = $('#modalwindow'+i).attr('class');	

		if (type=='modalWindow')
			setCookie('mini_quick_view_show',0,-1);
		else if (type=='modalConfirmWindow') {
			$('.confirm_btn .js-yes').die('click');
			$('.confirm_btn .js-no').die('click');
		}
		
		$('.range_box .rbinp').css('outline','1px solid #959595');	
		$('#modalwindow'+i).remove();
		if (modalWindow._blockCount==0) {
			$('[class*="tooltip"]').UnfreezeAllBubblePopups();
			$('#blockscreen').remove();
		}
		
	},

	show: function(width, html, params) {
		var params_all = {};
		for (var k in modalWindow.params) { params_all[k] = modalWindow.params[k]; }
		for (var k in params) { params_all[k] = params[k]; }

		modalWindow.initBlock();
		modalWindow.initWin(width, html, 'modalWindow');
		if (params_all.prev_next && modalWindow.products)
			modalWindow.initPrevNext();
		modalWindow.initClose('modalWindow');
	},
	
	eval_script: function(code) {
		if (window.execScript) return window.execScript(code, 'javascript');
		else return window.eval(code);
	},
	
	initScript: function(content){
		var script = content.getElementsByTagName("script");
		for (var i = 0; i < script.length; i++) {
			var script_text = script[i].innerHTML?script[i].innerHTML:null;
			if (script_text != null){
				modalWindow.eval_script(''+script_text);
			}
		}	
	},	
		
	initConfirmBtn: function(btn, fn_yes, fn_no){
		$('.confirm_btn .js-yes').live('click', function(){fn_yes();});
		$('.confirm_btn .js-no').live('click', function(){fn_no();});
		html = '<div class="confirm_btn"><span class="js-yes">'+btn[0]+'</span><span class="js-no">'+btn[1]+'</span></div>';
		return html;
	},
	
	// 
	// width - ширина окна
	// html - текст
	// btn - массив с названиями кнопок, ['Да','Нет']
	// fn_yes - функция для нажатия кнопки Yes
	// fn_no - функция для нажатия кнопки No
	confirm: function(width, html, btn, fn_yes, fn_no) {
		modalWindow.initBlock();
		btn_html = modalWindow.initConfirmBtn(btn, fn_yes, fn_no);
		modalWindow.initWin(width, html + btn_html, 'modalConfirmWindow');
		modalWindow.initClose('modalConfirmWindow');
	}
}/**********************end Modal Win*************************/
