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
   		$ul = $(this).parent().children('ul');
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




/***CodeCompletionClass***/
function CodeCompletionClass(editor, funcsdef)
{
	this.decorator = new TextareaDecorator(editor, ldtparser);
	
	this.editor = editor;
	this.funcsdef = funcsdef;
	
	this.popup_tmpl = '<div class="completion"></div>';
	this.popup = $(this.popup_tmpl).appendTo('body')[0];
	this.ispopupshow = false;
	this.popupsel = -1;
	this.popupcount = 0;
	
	this.popup2_tmpl = '<div class="completion-params"></div>';
	this.popup2 = $(this.popup2_tmpl).appendTo('body')[0];
	this.ispopup2show = false;
	
	this.funcsdefarr = [];
	for (var name in funcsdef)
		this.funcsdefarr.push(funcsdef[name]);
	
	var cmp = function(a, b)
	{
		if (a.name > b.name) return 1;
		if (a.name < b.name) return -1;
		if (a.name == b.name) return 0;
	};
	this.funcsdefarr.sort(cmp);
	
	_class = this;
	
	$(editor).keyup(function(event) {
		if (event.which >= 48 || event.which == 8 || event.which == 46   
				|| (_class.ispopupshow  && (event.which == 40 || event.which == 38	|| event.which == 37 || event.which == 39))
				|| (_class.ispopup2show && (event.which == 40 || event.which == 38	|| event.which == 37 || event.which == 39 || event.which == 13))
			)
			_class.showHint(event.which);
	});
	
	$(editor).mouseup(function(event) {
		_class.hideHint();
		_class.hideParamsHint();
	});
	
	$(editor).keydown(function(event) {
		if (_class.ispopupshow)  
		{
			if (event.which == 40)       //Down Key
			{
				_class.popupsel++;
				if (_class.popupsel >= _class.popupcount)
					_class.popupsel = 0;
				event.preventDefault();
			}
			else if (event.which == 38)  //Up Key
			{
				_class.popupsel--;
				if (_class.popupsel < 0)
					_class.popupsel = _class.popupcount-1;
				event.preventDefault();
			}
			else if (event.which == 13)  //Enter
			{
				event.preventDefault();
				var func = _class.popupfuncs[_class.popupsel];
				var id = func.value ? func.value : func.name;
				var start = _class.node.start;
				var end = start + _class.node.length;
				_class.insertCode(id, start, end);
				var pos = start + id.length;
				setCursorPos(_class.editor, pos, pos);
				_class.hideHint();
				_class.decorator.update();
			}
			else if (event.which == 27)  //Esc
			{
				event.preventDefault();
				_class.hideHint();
			}
		}
		/*if (_class.ispopup2show)
		{
			if (event.which == 112 && _class.funcname
					&& _class.funcsdef[_class.funcname].helpurl)     // F1
			{
				window.open(_class.funcsdef[_class.funcname].helpurl, '_blank');
			}
		}*/
	});
}


CodeCompletionClass.prototype = {
	showHint: function(key)
	{
		this.nodes = this.getNodes(this.editor.value);
		var cursor = getCursorPos(this.editor);
		this.node = this.findNodeAtCursor(this.nodes, cursor);
		
		var hidepopup = true;
		var hidepopup2 = true;
		var isshowfuncs = true;
		var func = {};
		var param = {};
		
		if (key == 112)       // F1
		{	
			var stmtname = '';
			if (this.node.type == 'func' || this.node.type == 'loadpage' || this.node.type == 'submitform')
			{
				stmtname = this.node.value;
				if (this.funcsdef[stmtname].helpurl)
					window.open(this.funcsdef[stmtname].helpurl, '_blank');
			}
			else if (this.node.type == 'group' || this.node.type == 'foreach' || this.node.type == 'if')
			{
				window.open(HelpUrl+'func/'+this.node.type, '_blank');
			}
		}
		
		if (this.node && this.getFunc(this.node, func, param))
		{
			this.funcname = func.node.value;
			
			//показываем hint с параметрами
			offset = this.getCursorXY(func.node.start);
			hidepopup2 = !this.showParamsHint(this.funcname, func.paramnum, offset);
			
			//показываем возможные значения параметра
			if ((key != 37 && key != 39 && key != 112) && this.funcsdef[this.funcname] && this.node == param.node 
				&& (((this.node.type == 'id' || this.node.type == 'int') && this.node.value.toString().length <= 2 && this.node.value != '')
					|| (this.node.type == 'string' && this.node.value.length == 0))
				)
			{
				var offset = this.getCursorXY(cursor);
				this.popupfuncs = [];
				if (this.funcname == 'store')
				{
					if (func.paramnum == 0)
					{
						for (var name in ExportRules.array)
							this.popupfuncs.push({name: name, value: value2output(name)});
					}
					else if (func.paramnum == 2)
					{
						var firstparam = func.node.params[0];
						if (firstparam.type == 'string' && ExportRules.get(firstparam.value).paramstype == 'dict')
						{
							var params = ExportRules.getParams(firstparam.value);
							var exp = ExportRules.get(firstparam.value);
							var params2 = {};
							if (exp.type == 'rdb')
								for (var i in params)
									params2[i] = '';
							else
								for (var i=0; i<params.length; i++)
									params2[params[i]] = '';
							this.popupfuncs.push({str: Lang.t('параметры'), value: value2output(params2)});
						}
						else if (firstparam.type == 'string' && ExportRules.get(firstparam.value).paramstype == 'array')
						{
							this.popupfuncs.push({name: value2output([])});
						}
					}
				}
				else
				{
					var params = this.funcsdef[this.funcname].params;
					if (func.paramnum < params.length && params[func.paramnum].types)
					{
						var types = params[func.paramnum].types;
						for (var i=0; i<types.length; i++)
						{
							if (types[i] == 'string')
								this.popupfuncs.push({str: 'string', value: value2output('')});
							else if (types[i] == 'number')
								this.popupfuncs.push({str: 'number', value: '0'});
							else
								this.popupfuncs.push({name: value2output(types[i])});
						}
					}
				}

				if (this.popupfuncs.length > 0)
				{
					this.showDialog(this.popupfuncs, offset);
					hidepopup = false;
					isshowfuncs = false;
				}
			}
		}
		else
		{
			func = {};
			if (this.getFuncAtCursor(cursor, this.nodes, func))
			{
				if (func.node.starttotal+1 == cursor)
				{
					offset = this.getCursorXY(func.node.start);
					this.showParamsHint(func.node.value, 0, offset);
				}
				hidepopup2 = false;
			}
		}
		
		if (hidepopup2)
			this.hideParamsHint();
		
		if (key == 8 || key == 46 || key == 13) isshowfunc = false;
		
		if (isshowfuncs && this.node && this.node.type == 'id' && this.node.value.length > 1 && key != 112)
		{
			//показываем список функций
			var offset = this.getCursorXY(cursor);
			var id = this.node.value;
			this.popupfuncs = [];
			for (var i=0; i<this.funcsdefarr.length; i++)
				if (this.funcsdefarr[i].name.indexOf(id) == 0)
					this.popupfuncs.push(this.funcsdefarr[i]);
			
			var localvars = this.getLocalVars(this.node);
			var globalvars = this.getGlobalVars(this.nodes);
			
			for (var i=0; i<globalvars.length; i++)
			{
				var ind = -1;
				for (var j=0; j<localvars.length; j++)
					if (localvars[j] == globalvars[i])
					{
						ind = j;
						break;
					}
				
				if (ind >= 0)
					localvars.splice(ind, 1);
			}
			
			for (var i=0; i<localvars.length; i++)
				if (localvars[i].indexOf(id) == 0)
					this.popupfuncs.push({name: localvars[i]});
			
			for (var i=0; i<globalvars.length; i++)
				if (globalvars[i].indexOf(id) == 0)
					this.popupfuncs.push({name: '@global '+globalvars[i], value: globalvars[i]});
			
			if (this.popupfuncs.length > 0)
			{
				this.showDialog(this.popupfuncs, offset);
				hidepopup = false;
			}
		}
				
		if (hidepopup)
			this.hideHint();
	},
	showDialog: function(funcsdef, offset)
	{
		var html = '<ul>';
		for (var i=0; i<funcsdef.length; i++)
		{	
			var sel = (i == this.popupsel) ? ' class="selected" ' : '';
			html += '<li'+sel+'>'+(funcsdef[i].str ? funcsdef[i].str : funcsdef[i].name)+'</li>';
		}
		html += '</ul>';
		
		if (funcsdef.length != this.popupcount)
			this.popupsel = 0;
		this.popupcount = funcsdef.length;
		
		this.popup.innerHTML = html;
		$(this.popup).css('left', (offset.left > 0 ? offset.left : 0));
		$(this.popup).css('top', offset.top+20);
		this.ispopupshow = true;
		$(this.popup).fadeIn();
	},
	showParamsHint: function(funcname, paramnum, offset)
	{
		if (this.funcsdef[this.funcname])
		{
			$(this.popup2).html(this.funcstr(this.funcsdef[funcname], paramnum));
			$(this.popup2).css('left', (offset.left > 0 ? offset.left : 0)+30);
			$(this.popup2).css('top', offset.top-30);
			this.ispopup2show = true;
			$(this.popup2).show();
			return true;
		}
		return false;
	},
	hideHint: function()
	{
		this.ispopupshow = false;
		$(this.popup).hide();
		this.popupsel = 0;
	},
	hideParamsHint: function()
	{
		$(this.popup2).hide();
		this.ispopup2show = false;
	},
	getNodes: function(script)
	{
		var parser = new ScriptParserClass(script);
		try {
			parser.parse();
		}
		catch (e) {
			
		}
		finally {
			var nodes = parser.ast;
			TreeUtils.prepareTree(nodes);
		}
		return nodes;
	},
	findNodeAtCursor: function(tree, pos)
	{
		var nodes = TreeUtils.preorderEnum(tree);
		for (var i=0; i<nodes.length; i++)
			if (pos >= nodes[i].start && pos <= nodes[i].start+nodes[i].length)
				return nodes[i];
		return false;
	},
	getFunc: function(paramnode, ret, param)
	{
		/*if (paramnode.type == 'func' || paramnode.type == 'loadpage' || paramnode.type == 'submitform')
		{
			ret.node = paramnode;
			ret.paramnum = 0;
			return true;
		}
		else
		{*/
			var parentnode = paramnode.parent.node;
			var chkey = paramnode.parent.chkey;
			var chind = paramnode.parent.chind;
			while (parentnode)
			{
				if (chkey == 'params' && (parentnode.type == 'func' || parentnode.type == 'loadpage' || parentnode.type == 'submitform'))
				{
					ret.node = parentnode;
					ret.paramnum = chind;
					param.node = parentnode.params[chind];
					return true;
				}
				
				chkey = parentnode.parent ? parentnode.parent.chkey : null;
				chind = parentnode.parent ? parentnode.parent.chind : null;
				parentnode = parentnode.parent ? parentnode.parent.node : null;
			}
		//}
		return false;
	},
	getFuncAtCursor: function(cursor, tree, ret)
	{
		var nodes = TreeUtils.postorderEnum(tree);
		for (var i=0; i<nodes.length; i++)
			if (nodes[i].type == 'func' || nodes[i].type == 'loadpage' || nodes[i].type == 'submitform')
			{
				var func = nodes[i];
				var last = func.params.length-1;
				if (cursor >= func.starttotal &&((func.endtotal && cursor < func.endtotal) || (last<0 || cursor < func.params[last].endtotal)))
				{
					ret.node = func;
					return true;
				}
			}
		
		return false;
	},
	getCursorXY: function(pos)
	{
		var pre = $(this.editor).parent().parent().children('pre')[0];
		var len = 0;
		var xy = undefined;
		$(pre).children('span').each(function(i, el) {
			$el = $(el);
			len += $el.text().length;
			if (pos <= len)
			{
				xy = $el.offset();
				return false;
			}
		});
		return xy;
	},
	insertCode: function(textValue, startPos, endPos)
	{
		var txt = this.editor;
        txt.value = txt.value.substring(0, startPos) + textValue + txt.value.substring(endPos, txt.value.length);
 	},
 	funcstr: function(funcdef, paramnum)
 	{
 		var str = funcdef.name + '(';
 		var paramstr = '';
 		for (var i=0; i<funcdef.params.length; i++)
 		{
 			var defstr = '';
 			if (funcdef.params[i].def != undefined)
 				defstr = ' = '+value2output(funcdef.params[i].def);
 			paramstr += ', '+(paramnum == i ? '<strong>'+funcdef.params[i].name+defstr+'</strong>' : funcdef.params[i].name+defstr);
 		}
 		paramstr = paramstr.substring(2);
 		str += paramstr+')';
 		return str;
 	},
 	getLocalVars: function(node)
 	{
 		var vars = [];
 		var parent = node.parent.node;
 		var chkey = node.parent.chkey;
 		var node2 = node;
 		while (parent && !((parent.type == 'loadpage' || parent.type == 'submitform' 
 				|| parent.type == 'program') && chkey == 'body'))
 		{
 			node2 = parent;
 			chkey = node2.parent.chkey;
 			parent = node2.parent.node;
 		}
 		
 		var stmt = node2;
 		var parent = stmt.parent.node;
 		var varsobj = {};
 		for (var i=0; i<=stmt.parent.chind-1; i++)
 			this.getLocalVarsAtBody(parent.body[i], varsobj);
 		
 		for (var name in varsobj)
 			vars.push(name);
 		vars.sort();
 		return vars;
 	},
 	getLocalVarsAtBody: function(node, varsobj)
 	{
 		if (node.type == 'assign')
		{
			var varname = node.left.value;
			varsobj[varname] = varname;
		}
 		else if (node.body)
 		{
 			for (var i=0; i<node.body.length; i++)
 				this.getLocalVarsAtBody(node.body[i], varsobj);
 		}
 	},
 	getGlobalVars: function(tree)
 	{
 		var varsobj = {};
 		this.getGlobalVarAtBody(tree, varsobj);
 		
 		var vars = [];
 		for (var name in varsobj)
 			vars.push(name);
 		
 		vars.sort();
 		return vars;
 	},
 	getGlobalVarAtBody: function(node, vars)
 	{
 		if (node.type == 'assign' && node.directiv['@global'])
 			vars[node.left.value] = node.left.value;
 		if (node.body)
 		{
 			for (var i=0; i<node.body.length; i++)
 				this.getGlobalVarAtBody(node.body[i], vars);
 		}
 	}
};
/***CodeCompletionClass***/





/***TreeUtilsClass***/
//Функции для работы с AST

function TreeUtilsClass()
{
	this.idnumber = 0;
	this.UP = 1;
	this.LEFT = 2;
	this.DIAG = 3;
	this.indent = 0;
}

TreeUtilsClass.prototype = {
	isLeaf: function(node)
	{
		if (node.childrenkeys.length == 0)
			return true;
		else
		{
			for (var i=0; i<node.childrenkeys.length; i++)
			{
				var child = node.children[node.childrenkeys[i]];
				if (child instanceof Array)
				{	
					if (child.length > 0) return false;
				}
				else
					return false;
			}
			return true;
		}
	},
	isRoot: function(node)
	{
		return (!node.parent) ? true : false;
	},
	isNodeDescendant: function(node, child)
	{
		var p = child;
		do {
			p = (p.parent) ? p.parent.node : null;
			if (node == p) 	return true;
		} while (p);
		return false;
	},
	countLeaves: function(node)
	{
		var count = 0;
		for (var i=0; i<node.childrenkeys.length; i++)
		{
			var child = node.children[node.childrenkeys[i]];
			if (child instanceof Array)
				for (var j=0; j<child.length; j++)
				{
					if (TreeUtils.isLeaf(child[j]))
						count++;
				}
			else
				if (TreeUtils.isLeaf(child))
					count++;
		}
		return count;
	},
	countLeavesDescendantsNode: function(node, count)
	{
		count.count += this.countLeaves(node);
		for (var i=0; i<node.childrenkeys.length; i++)
		{
			var child = node.children[node.childrenkeys[i]];
			if (child instanceof Array)
				for (var j=0; j<child.length; j++)
					this.countLeavesDescendantsNode(child[j], count);
			else
				this.countLeavesDescendantsNode(child, count);
		}
	},
	countLeavesDescendants: function(node)
	{
		var count = {count: 0};
		this.countLeavesDescendantsNode(node, count);		
		return count.count;
	},
	getParent: function(node)
	{
		return (node.parent) ? node.parent.node : null; 
	},
	getPreviousSibling: function(node)
	{
		var ind = (node.parent) ? node.parent.chind-1 : -1;
		if (ind >= 0)
		{
			var key = node.parent.chkey;
			return node.parent.node.children[key][ind];
		}
		return null;
	},
	getNodeSignature: function(node)
	{
		var p = this.getParent(node);
		var sig = '';
		while (p)
		{
			sig = '/'+p.type+'('+p.value+')'+ sig;
			p = this.getParent(p);
		}
		return sig;
	},
	isAutoDirectiv: function(node)
	{
		var p = node;
		while (p)
		{
			if (p.directiv)
			{
				if (p.directiv['@auto'])
					return true;
				else
					return false;
			}
			p = this.getParent(p);				
		}
		return false;
	},
	getParentStatement: function(node)
	{
		var p = node;
		while (p)
		{
			if (p.directiv)
				return p;
			p = this.getParent(p);				
		}
		return null;
	},
	deleteChildren: function(node)
	{
		for (var i=0; i<node.childrenkeys.length; i++)
		{
			var child = node.children[node.childrenkeys[i]];
			if (child instanceof Array)
				node.children[node.childrenkeys[i]] = [];
			else
				node.children[node.childrenkeys[i]] = null;
		}
	},
	prepareNode: function(node, parentinfo)
	{
		node.idnumber = this.idnumber++;
		node.parent = parentinfo;
		node.isMatched = false;
		node.children = {};
		node.childrenkeys = [];
		var i;
		switch (node.type)
		{
			case 'program':
				node.children['body'] = node.body;
				node.childrenkeys = ['body'];				
				for (i=0; i<node.body.length; i++)
					this.prepareNode(node.body[i], {node: node, chkey: 'body', chind: i, chtype: 'arr'});
				break;
			case 'string':
			case 'int':
			case 'float':
				break;
			case 'id':
				if (node.hooks)
				{
					node.children['hooks'] = node.hooks;
					node.childrenkeys = ['hooks'];
					for (i=0; i<node.hooks.length; i++)
						this.prepareNode(node.hooks[i], {node: node, chkey: 'hooks', chind: i, chtype: 'arr'});
				}
				break;
			case 'assign':
			case 'logicand':
            case 'logicor':
            case 'logic==':
            case 'logic!=':
            case 'logic>':
            case 'logic<':
            case 'logic>=':
            case 'logic<=':
            case 'plus':
            case 'minus':
            case 'mult':
            case 'div':
            case 'mod':
            case 'concat':
            	node.children['left'] = node.left;
            	node.children['right'] = node.right;
            	node.childrenkeys = ['left', 'right'];
				this.prepareNode(node.left, {node: node, chkey: 'left', chind: 0, chtype: 'obj'});
				this.prepareNode(node.right, {node: node, chkey: 'right', chind: 0, chtype: 'obj'});
				break;
            case 'logic!':
            case 'unaryminus':
            	node.children['left'] = node.left;
            	node.childrenkeys = ['left'];
            	this.prepareNode(node.left, {node: node, chkey: 'left', chind: 0, chtype: 'obj'});
            	break;
			case 'func':
				node.children['params'] = node.params;
				node.children['hooks'] = node.hooks;
				node.childrenkeys = ['params'];
				for (i=0; i<node.params.length; i++)
					this.prepareNode(node.params[i], {node: node, chkey: 'params', chind: i, chtype: 'arr'});
				break;
			case 'loadpage':
			case 'submitform':
				node.children['params'] = node.params;
				node.children['body'] = node.body;
				node.childrenkeys = ['params', 'body'];
				for (i=0; i<node.params.length; i++)
					this.prepareNode(node.params[i], {node: node, chkey: 'params', chind: i, chtype: 'arr'});
				for (i=0; i<node.body.length; i++)
					this.prepareNode(node.body[i], {node: node, chkey: 'body', chind: i, chtype: 'arr'});
				
				if (node.passparams)
				{
					node.children['passparams'] = node.passparams;
					this.prepareNode(node.passparams, {node: node, chkey: 'passparams', chind: 0, chtype: 'obj'});
				}
				break;
			case 'foreach':
				node.children['array'] = node.array;
				node.childrenkeys.push('array');
				this.prepareNode(node.array, {node: node, chkey: 'array', chind: 0, chtype: 'obj'});
				if (node.key)
				{
					node.children['key'] = node.key;
					node.childrenkeys.push('key');
					this.prepareNode(node.key, {node: node, chkey: 'key', chind: 0, chtype: 'obj'});
				}
				node.children['id'] = node.id;
				node.childrenkeys.push('id');
				this.prepareNode(node.id, {node: node, chkey: 'id', chind: 0, chtype: 'obj'});
				node.children['body'] = node.body;
				node.childrenkeys.push('body');
				for (i=0; i<node.body.length; i++)
					this.prepareNode(node.body[i], {node: node, chkey: 'body', chind: i, chtype: 'arr'});
				break;
			case 'if':
				node.children['expr'] = node.expr;
				node.childrenkeys.push('expr');
				this.prepareNode(node.expr, {node: node, chkey: 'expr', chind: 0, chtype: 'obj'});
				
				node.children['ifbody'] = node.ifbody;
				node.childrenkeys.push('ifbody');
				for (i=0; i<node.ifbody.length; i++)
					this.prepareNode(node.ifbody[i], {node: node, chkey: 'ifbody', chind: i, chtype: 'arr'});
				
				if (node.elsebody)
				{
					node.children['elsebody'] = node.elsebody;
					node.childrenkeys.push('elsebody');
					for (i=0; i<node.elsebody.length; i++)
						this.prepareNode(node.elsebody[i], {node: node, chkey: 'elsebody', chind: i, chtype: 'arr'});
				}
				break;
			case 'group':
				node.children['body'] = node.body;
				node.childrenkeys.push('body');
				for (i=0; i<node.body.length; i++)
					this.prepareNode(node.body[i], {node: node, chkey: 'body', chind: i, chtype: 'arr'});
				break;
			case 'dict':
			case 'array':
				node.children['params'] = node.params;
				node.childrenkeys.push('params');
				for (i=0; i<node.params.length; i++)
					this.prepareNode(node.params[i], {node: node, chkey: 'params', chind: i, chtype: 'arr'});
				break;
			case 'nameval':
				node.children['key'] = node.key;
				node.children['val'] = node.val;
				node.childrenkeys = ['key', 'val'];
				this.prepareNode(node.key, {node: node, chkey: 'key', chind: 0, chtype: 'obj'});
				this.prepareNode(node.val, {node: node, chkey: 'val', chind: 0, chtype: 'obj'});
				break;
			case 'funcdecl':
				node.children['params'] = node.params;
				node.children['body'] = node.body;
				node.childrenkeys = ['params', 'body'];
				for (i=0; i<node.params.length; i++)
					this.prepareNode(node.params[i], {node: node, chkey: 'params', chind: i, chtype: 'arr'});
				for (i=0; i<node.body.length; i++)
					this.prepareNode(node.body[i], {node: node, chkey: 'body', chind: i, chtype: 'arr'});
				break;
			case 'return':
				node.children['expr'] = node.expr;
				node.childrenkeys = ['expr'];
				this.prepareNode(node.expr, {node: node, chkey: 'expr', chind: 0, chtype: 'obj'});
				break;
		}
	},
	prepareTree: function(ast)
	{
		this.idnumber = 0;
		this.prepareNode(ast, null);
	},
	tree2script: function(tree)
	{
		this.indent = 0;
		var str = this.node2text(tree);
		return str;
	},
	insindent: function() {
		var str = '';
		for (var i=0; i<this.indent; i++)
			str += '    ';
		return str;
	},
	insdirectiv: function(node)
	{
		var arr = [];
		for (var dirname in node.directiv)
		{
			var str = dirname;
			if (node.directiv[dirname].val)
				str += ' \'' + node.directiv[dirname].val.value+'\'';
			if (dirname != '@form')
				arr.push({str: str, newline: false});
			else
				arr.splice(0, 0, {str: str, newline: true});
		}
		str = '';
		for (i=0; i<arr.length; i++)
		{
			str += arr[i].str + ' ';
			if (arr[i].newline)
				str += '\n'+this.insindent();
		}
		return str;
	},
	inscomm: function(comments)
	{
		var str = '';
		var newline = true;
		if (comments)
		{
			if (comments[0] == '\n')
				comments.splice(0, 1);
			for (var i=0; i<comments.length; i++)
			{
				if (newline)
					str += this.insindent();
				str += comments[i];
				newline = comments[i].search(/\n/m) != -1;
			}
		}
		return str;
	},
	inscomments: function(node)
	{
		return this.inscomm(node.comments);
	},
	node2text: function(node, par)
	{
		var i;
		var output = '';
		var p = {};
		if (!par) par = {};
		par.newline = false;
		switch (node.type)
		{
			case 'program':
				for (i=0; i<node.children['body'].length; i++)
				{
					output += this.inscomments(node.children['body'][i]);
					output += this.insindent()+this.node2text(node.children['body'][i], p);
					if (p.newline) output += ';\n';
				}
				if (node.children['body'].length > 0)
					output += this.inscomm(node.children['body'][node.children['body'].length-1].commentsafter);
				break;
			case 'string':
				output += '\''+escapeStr(node.value)+'\'';
				break;
			case 'float':
				output += node.value;
				break;
			case 'id':
				output += (node.islink ? '&':'')+node.value;
				if (node.children['hooks'])
				{
					for (i=0; i<node.children['hooks'].length; i++)
						output += '['+this.node2text(node.children['hooks'][i], p)+']';
				}
				if (node.addop)
					output += '[]';
				break;
			case 'assign':
				output += this.insdirectiv(node)+this.node2text(node.children['left'], p)+' = '+this.node2text(node.children['right'], p);
				par.newline = true;
				break;
			case 'logicand':
				output += this.node2text(node.children['left'], p)+' && '+this.node2text(node.children['right'], p);
				break;
			case 'logicor':
				output += this.node2text(node.children['left'], p)+' || '+this.node2text(node.children['right'], p);
				break;
			case 'logic==':
				output += this.node2text(node.children['left'], p)+'=='+this.node2text(node.children['right'], p);
				break;
			case 'logic!=':
				output += this.node2text(node.children['left'], p)+'!='+this.node2text(node.children['right'], p);
				break;
			case 'logic>':
				output += this.node2text(node.children['left'], p)+'>'+this.node2text(node.children['right'], p);
				break;
			case 'logic<':
				output += this.node2text(node.children['left'], p)+'<'+this.node2text(node.children['right'], p);
				break;
			case 'logic>=':
				output += this.node2text(node.children['left'], p)+'>='+this.node2text(node.children['right'], p);
				break;
			case 'logic<=':
				output += this.node2text(node.children['left'], p)+'<='+this.node2text(node.children['right'], p);
				break;
			case 'logic!':
				output += '!'+this.node2text(node.children['left'], p);
				break;
			case 'plus':
				output += this.node2text(node.children['left'], p)+' + '+this.node2text(node.children['right'], p);
				break;
			case 'minus':
				output += this.node2text(node.children['left'], p)+' - '+this.node2text(node.children['right'], p);
				break;
			case 'mult':
				output += this.node2text(node.children['left'], p)+' * '+this.node2text(node.children['right'], p);
				break;
			case 'div':
				output += this.node2text(node.children['left'], p)+' / '+this.node2text(node.children['right'], p);
				break;
			case 'mod':
				output += this.node2text(node.children['left'], p)+' % '+this.node2text(node.children['right'], p);
				break;
			case 'concat':
				output += this.node2text(node.children['left'], p)+'.'+this.node2text(node.children['right'], p);
				break;
			case 'unaryminus':
				output += '-'+this.node2text(node.children['left'], p);
				break;
			case 'func':
				output += this.insdirectiv(node) + node.value + '(';
				var str = '';
				for (i=0; i<node.children['params'].length; i++)
					str += ', '+this.node2text(node.children['params'][i], p);
				str = str.substring(2);
				output += str + ')';
				for (i=0; i<node.children['hooks'].length; i++)
					output += '['+this.node2text(node.children['hooks'][i], p)+']';
				par.newline = true;
				break;
			case 'loadpage':
			case 'submitform':
				output += this.insdirectiv(node) + node.type +'(';
				var str = '';
				for (i=0; i<node.children['params'].length; i++)
					str += ', '+this.node2text(node.children['params'][i], p);
				str = str.substring(2);
				output += str + ')';
				
				if (node.children['passparams'])
					output += '['+this.node2text(node.children['passparams'])+']';
				
				output += ' {\n';
				//output += this.insindent()+'{\n'; 
				this.indent++;

				for (i=0; i<node.children['body'].length; i++)
				{
					output += this.inscomments(node.children['body'][i]);
					output += this.insindent()+this.node2text(node.children['body'][i], p);
					if (p.newline) output += ';\n';
				}
				if (node.children['body'].length > 0)
					output += this.inscomm(node.children['body'][node.children['body'].length-1].commentsafter);

				this.indent--;
				output += this.insindent()+'}\n';
				break;
			case 'foreach':
				output += this.insdirectiv(node) + 'foreach (';
				output += this.node2text(node.children['array'], p);
				output += ' as ';
				
				if (node.children['key'])
				{
					output += this.node2text(node.children['key'], p) + ' => ';
				}
				output += this.node2text(node.children['id'], p) + ') {\n';
				//output += this.insindent()+'{\n'; 
				this.indent++;

				for (i=0; i<node.children['body'].length; i++)
				{
					output += this.inscomments(node.children['body'][i]);
					output += this.insindent()+this.node2text(node.children['body'][i], p);
					if (p.newline) output += ';\n';
				}
				if (node.children['body'].length > 0)
					output += this.inscomm(node.children['body'][node.children['body'].length-1].commentsafter);

				this.indent--;
				output += this.insindent()+'}\n';
				break;
			case 'break':
				output += 'break;\n';
				break;
			case 'if':
				output += this.insdirectiv(node) + 'if (';
				output += this.node2text(node.children['expr'], p) + ') {\n';
				//output += this.insindent()+'{\n'; 
				this.indent++;

				for (i=0; i<node.children['ifbody'].length; i++)
				{
					output += this.inscomments(node.children['ifbody'][i]);
					output += this.insindent()+this.node2text(node.children['ifbody'][i], p);
					if (p.newline) output += ';\n';
				}
				if (node.children['ifbody'].length > 0)
					output += this.inscomm(node.children['ifbody'][node.children['ifbody'].length-1].commentsafter);

				this.indent--;
				output += this.insindent()+'}\n';
				
				if (node.children['elsebody'])
				{
					output += this.insindent() + 'else {\n';
					//output += this.insindent()+'{\n'; 
					this.indent++;

					for (i=0; i<node.children['elsebody'].length; i++)
					{
						output += this.inscomments(node.children['elsebody'][i]);
						output += this.insindent()+this.node2text(node.children['elsebody'][i], p);
						if (p.newline) output += ';\n';
					}
					if (node.children['elsebody'].length > 0)
						output += this.inscomm(node.children['elsebody'][node.children['elsebody'].length-1].commentsafter);

					this.indent--;
					output += this.insindent()+'}\n';
				}
				break;
			case 'group':
				output += this.insdirectiv(node) + 'group \''+escapeStr(node.value)+'\' {\n';
				this.indent++;
				
				for (i=0; i<node.children['body'].length; i++)
				{
					output += this.inscomments(node.children['body'][i]);
					output += this.insindent()+this.node2text(node.children['body'][i], p);
					if (p.newline) output += ';\n';
				}
				if (node.children['body'].length > 0)
					output += this.inscomm(node.children['body'][node.children['body'].length-1].commentsafter);
				
				this.indent--;
				output += this.insindent()+'}\n';
				break;
			case 'dict':
			case 'array':
				output += node.type + '(';
				var str = '';
				for (i=0; i<node.children['params'].length; i++)
					if (!node.children['params'][i].isartificial)
						str += ', '+this.node2text(node.children['params'][i], p);
				str = str.substring(2);
				output += str + ')';
				break;
			case 'nameval':
				output += this.node2text(node.children['key'], p)+'=>'+this.node2text(node.children['val'], p);
				break;
			case 'funcdecl':
				output += this.insdirectiv(node) + 'function ' + node.value + '(';
				var str = '';
				for (i=0; i<node.children['params'].length; i++)
					str += ', '+this.node2text(node.children['params'][i], p);
				str = str.substring(2);
				output += str + ')';
				
				output += ' {\n';
				this.indent++;

				for (i=0; i<node.children['body'].length; i++)
				{
					output += this.inscomments(node.children['body'][i]);
					output += this.insindent()+this.node2text(node.children['body'][i], p);
					if (p.newline) output += ';\n';
				}
				if (node.children['body'].length > 0)
					output += this.inscomm(node.children['body'][node.children['body'].length-1].commentsafter);

				this.indent--;
				output += this.insindent()+'}\n';
				break;
			case 'return':
				output += this.insdirectiv(node) + 'return ';
				output += this.node2text(node.children['expr'], p) + ';\n';
				break;
		}
		return output;
	},
	replaceNode: function(oldnode, newnode)
	{
		var parent = oldnode.parent;
		if (parent.chtype == 'arr')
			parent.node.children[parent.chkey][parent.chind] = newnode;
		else if (parent.chtype == 'obj')
			parent.node.children[parent.chkey] = newnode;
		newnode.parent = parent;
	},
	deleteNode: function(node)
	{
		var p = node.parent;
		var ret;
		if (p.chtype == 'arr')
		{
			ret = p.node.children[p.chkey][p.chind];
			p.node.children[p.chkey].splice(p.chind, 1);
    		for (var i=p.chind; i<p.node.children[p.chkey].length; i++)
    			p.node.children[p.chkey][i].parent.chind = i;
		}
		else if (parent.chtype == 'obj')
		{
			ret = parent.node.children[parent.chkey];
			parent.node.children[parent.chkey] = null;
		}
		return ret;
	},
	insertNode: function(parent, newnode, pos)
	{
		if (parent.children[pos.key] instanceof Array)
		{
			var ind;
			if (pos.ind < parent.children[pos.key].length)
			{
				parent.children[pos.key].splice(pos.ind, 0, newnode);
				ind = pos.ind;
			}
			else
			{
				parent.children[pos.key].push(newnode);
				ind = parent.children[pos.key].length-1;
			}
			for (var i=ind; i<parent.children[pos.key].length; i++)
				parent.children[pos.key][i].parent.chind = i;
			newnode.parent = {node: parent, chkey: pos.key, chind: pos.ind, chtype: 'arr'};
			return true;
		}
		return false;
	},
	insertAfter: function(node, newnode)
	{
		var parent = node.parent.node;
		var pos = {key: node.parent.chkey, ind: node.parent.chind+1};
		this.insertNode(parent, newnode, pos);
	},
	insertBefore: function(node, newnode)
	{
		var parent = node.parent.node;
		var pos = {key: node.parent.chkey, ind: node.parent.chind};
		this.insertNode(parent, newnode, pos);
	},
	appendChild: function(parent, newnode, key)
	{
		if (parent.children[key] instanceof Array)
		{
			parent.children[key].push(newnode);
			newnode.parent = {node: parent, chkey: key, chind: parent.children[key].length-1,
								chtype: 'arr'};
			return true;
		}
		return false;
	},
	preorderEnum: function(tree)
	{
		var arr = [];
		this.preorderNode(tree, arr);
		return arr;
	},
	preorderNode: function(node, arr)
	{
		arr.push(node);
		var i;
		for (i=0; i<node.childrenkeys.length; i++)
		{
			var child = node.children[node.childrenkeys[i]];
			if (child instanceof Array)
				for (var j=0; j<child.length; j++)
					this.preorderNode(child[j], arr);
			else
				this.preorderNode(child, arr);
		}
	},
	postorderEnum: function(tree)
	{
		var arr = [];
		this.postorderNode(tree, arr);
		return arr;
	},
	postorderNode: function(node, arr)
	{
		var i;
		for (i=0; i<node.childrenkeys.length; i++)
		{
			var child = node.children[node.childrenkeys[i]];
			if (child instanceof Array)
				for (var j=0; j<child.length; j++)
					this.postorderNode(child[j], arr);
			else
				this.postorderNode(child, arr);
		}
		arr.push(node);
	},
	breadthfirstEnum: function(tree)
	{
		var arr = [tree];
		var Q = [tree]; 
		while (Q.length > 0)
		{
			var node = Q.shift();
			for (var i=0; i<node.childrenkeys.length; i++)
			{
				var child = node.children[node.childrenkeys[i]];
				if (child instanceof Array)
					for (var j=0; j<child.length; j++)
					{
						arr.push(child[j]);
						Q.push(child[j]);
					}
				else
				{
					arr.push(child);
					Q.push(child);
				}
			}
		}
		return arr;
	},
	copyNode: function(node)
	{
		var copynode = $.extend({}, node);
		delete copynode.parent;
		var i;
		switch (node.type)
		{
			case 'program':
				copynode.body = [];
				for (i=0; i<node.body.length; i++)
					copynode.body.push(this.copyNode(node.body[i]));
				break;
			case 'string':
			case 'int':
			case 'float':
				copynode = $.extend({}, node);
				break;
			case 'id':
				if (node.hooks)
				{
					copynode.hooks = [];
					for (i=0; i<node.hooks.length; i++)
						copynode.hooks.push(this.copyNode(node.hooks[i]));
				}
				break;
			case 'assign':
			case 'logicand':
            case 'logicor':
            case 'logic==':
            case 'logic!=':
            case 'logic>':
            case 'logic<':
            case 'logic>=':
            case 'logic<=':
            case 'plus':
            case 'minus':
            case 'mult':
            case 'div':
            case 'mod':
            case 'concat':
            	copynode.left = this.copyNode(node.left);
            	copynode.right = this.copyNode(node.right);
				break;
            case 'logic!':
            case 'unaryminus':
            	node.children['left'] = node.left;
            	copynode.left = this.copyNode(node.left);
            	break;
			case 'func':
				if (node.hooks)
				{
					copynode.hooks = [];
					for (i=0; i<node.hooks.length; i++)
						copynode.hooks.push(this.copyNode(node.hooks[i]));
				}
				copynode.params = [];
				for (i=0; i<node.params.length; i++)
					copynode.params.push(this.copyNode(node.params[i]));
				break;
			case 'loadpage':
			case 'submitform':
				copynode.params = [];
				for (i=0; i<node.params.length; i++)
					copynode.params.push(this.copyNode(node.params[i]));
				
				copynode.body = [];
				for (i=0; i<node.body.length; i++)
					copynode.body.push(this.copyNode(node.body[i]));
									
				if (node.passparams)
				{
					copynode.passparams = this.copyNode(node.passparams);
				}
				break;
			case 'foreach':
				copynode.array = this.copyNode(node.array);
				if (node.key)
					copynode.key = this.copyNode(node.key);

				copynode.id = this.copyNode(node.id);
				copynode.body = [];
				for (i=0; i<node.body.length; i++)
					copynode.body.push(this.copyNode(node.body[i]));
				break;
			case 'if':
				copynode.expr = this.copyNode(node.expr);
				copynode.ifbody = [];
				for (i=0; i<node.ifbody.length; i++)
					copynode.ifbody.push(this.copyNode(node.ifbody[i]));
				
				if (node.elsebody)
				{
					copynode.elsebody = [];
					for (i=0; i<node.elsebody.length; i++)
						copynode.elsebody.push(this.copyNode(node.elsebody[i]));
				}
				break;
			case 'group':
				copynode.body = [];
				for (i=0; i<node.body.length; i++)
					copynode.body.push(this.copyNode(node.body[i]));
				break;
			case 'dict':
			case 'array':
				copynode.params = [];
				for (i=0; i<node.params.length; i++)
					copynode.params.push(this.copyNode(node.params[i]));
				break;
			case 'nameval':
				copynode.key = this.copyNode(node.key);
				copynode.val = this.copyNode(node.val);
				break;
			case 'return':
				copynode.expr = this.copyNode(node.expr);
				break;
			case 'funcdecl':
				copynode.params = [];
				for (i=0; i<node.params.length; i++)
					copynode.params.push(this.copyNode(node.params[i]));
				
				copynode.body = [];
				for (i=0; i<node.body.length; i++)
					copynode.body.push(this.copyNode(node.body[i]));
				break;
		}
		return copynode;
	},
};
/***TreeUtilsClass***/





/***ExportRulesClass***/
//Редактор. Страница "Экспорт"

function ExportRulesClass()
{
	this.array = {};
}

ExportRulesClass.prototype = {
	load: function() {
		var _this = this;
		var data = {"success":true,"rules":[{"id":"1108","ruleid":"955","name":"csv","type":"csv","extension":"csv","template_head":"","template_body":"","template_tail":"","delimiter":",","issave":"1"}]};
            		for (var i=0; i<data.rules.length; i++)
            		{
            			var rule = data.rules[i];
            			var params = {};
            			if (rule.type == 'csv')
            			{
            				params['extension'] = rule.extension;
            				params['delimiter'] = rule.delimiter;
            				params['issave'] = (rule.issave == '0') ? false : true;
            			}
            			else if (rule.type == 'xml')
            			{
            				params['extension'] = rule.extension;
            				params['head'] = rule.template_head;
            				params['body'] = rule.template_body;
            				params['tail'] = rule.template_tail;
            				params['issave'] = (rule.issave == '0') ? false : true;
            			}
            			else if (rule.type == 'sql')
            			{
            				params['extension'] = rule.extension;
            				params['head'] = rule.template_head;
            				params['body'] = rule.template_body;
            				params['tail'] = rule.template_tail;
            				params['issave'] = (rule.issave == '0') ? false : true;
            			}
            			else if (rule.type == 'excel')
            			{
            				params['extension'] = rule.extension;
            				params['head'] = rule.template_head;
            				params['tail'] = rule.template_tail;
            				params['issave'] = true;
            			}
            			else if (rule.type == 'rdb')
            			{
            				params['extension'] = rule.extension;
            				params['head'] = rule.template_head;
            				params['body'] = eval('('+rule.template_body+')');
            				params['tail'] = rule.template_tail != '' ? eval('('+rule.template_tail+')') : {};
            				params['issave'] = (rule.issave == '0') ? false : true;
            			}
            			_this.add(rule.name, rule.type, params);
            		}

		/*$.ajax({url: '/main/exportruleget',
            type: 'POST',
            dataType: 'json',
            data: {scraperid: $('#tabScript input[name="scraperid"]').val()},
            success: function(data) {
            	if (data.success)
            	{
            		for (var i=0; i<data.rules.length; i++)
            		{
            			var rule = data.rules[i];
            			var params = {};
            			if (rule.type == 'csv')
            			{
            				params['extension'] = rule.extension;
            				params['delimiter'] = rule.delimiter;
            				params['issave'] = (rule.issave == '0') ? false : true;
            			}
            			else if (rule.type == 'xml')
            			{
            				params['extension'] = rule.extension;
            				params['head'] = rule.template_head;
            				params['body'] = rule.template_body;
            				params['tail'] = rule.template_tail;
            				params['issave'] = (rule.issave == '0') ? false : true;
            			}
            			else if (rule.type == 'sql')
            			{
            				params['extension'] = rule.extension;
            				params['head'] = rule.template_head;
            				params['body'] = rule.template_body;
            				params['tail'] = rule.template_tail;
            				params['issave'] = (rule.issave == '0') ? false : true;
            			}
            			else if (rule.type == 'excel')
            			{
            				params['extension'] = rule.extension;
            				params['head'] = rule.template_head;
            				params['tail'] = rule.template_tail;
            				params['issave'] = true;
            			}
            			else if (rule.type == 'rdb')
            			{
            				params['extension'] = rule.extension;
            				params['head'] = rule.template_head;
            				params['body'] = eval('('+rule.template_body+')');
            				params['tail'] = rule.template_tail != '' ? eval('('+rule.template_tail+')') : {};
            				params['issave'] = (rule.issave == '0') ? false : true;
            			}
            			_this.add(rule.name, rule.type, params);
            		}
            	}
            }
		});
		//*/
	},
	add: function(name, type, params) {
		var obj = {name: name, type: type};
		if (type == 'csv')
		{
			obj.extension = params.extension;
			obj.delimiter = params.delimiter;
			obj.issave = params.issave;
			obj.paramstype = 'array';
		}
		else if (type == 'xml')
		{
			obj.extension = params.extension;
			obj.head = params.head;
			obj.body = params.body;
			obj.tail = params.tail;
			obj.issave = params.issave;
			obj.paramstype = 'dict';
		}
		else if (type == 'sql')
		{
			obj.extension = params.extension;
			obj.head = params.head;
			obj.body = params.body;
			obj.tail = params.tail;
			obj.issave = params.issave;
			obj.paramstype = 'dict';
		}
		else if (type == 'excel')
		{
			obj.extension = params.extension;
			obj.issave = params.issave;
			obj.head = params.head;
			obj.tail = params.tail;
			obj.paramstype = 'array';
		}
		else if (type == 'rdb')
		{
			obj.extension = params.extension;
			obj.head = params.head;
			obj.body = params.body;
			obj.tail = params.tail;
			obj.issave = params.issave;
			obj.paramstype = 'dict';
		}
		this.array[name] = obj;
	},
	get: function(name) {
		return this.array[name];
	},
	del: function(name) {
		delete this.array[name];
	},
	getParams: function(name) {
		var params = [];
		var exp = this.get(name);
		if (exp.type == 'xml' || exp.type == 'sql')
		{
			var m = exp.body.match(/\$[A-Za-z][A-Za-z0-9_]*/g);
			params = m;
		}
		else if (exp.type == 'rdb')
		{
			//params = exp.body[exp.head];
			params = RDBFlat[exp.extension][exp.head];
		}
		return params;
	},
	rdbfind: function(array, lname, label)
	{
		for (var name in array)
		{
			if (name == lname)
				return {label: label, array: array};
				
			if (array[name] instanceof Object)
			{
				var ret = this.rdbfind(array[name], lname, name);
				if (ret !== false) return ret;
			}
		}
		return false;
	},
};
/***ExportRulesClass***/


/**Translate**/
function Translate()
{
	this.mess = TranslateArray;
}

Translate.prototype = {
	t: function(message, params) {
		var msg = this.mess[message] ? this.mess[message] : message;
		for (var name in params)
			msg = msg.replace(new RegExp('\\{'+name+'\\}', 'gi'), params[name]);
		return msg;
	}
};
/**Translate**/




/**SLScriptClass**/
function SLScriptClass()
{
	this.script = '';
	this.indent = 0;
	this.pages_list = null;
}

SLScriptClass.prototype = {
	createFromPages: function(PagesList) {
		this.script = '';
		this.indent = 0;
		this.pages_list = PagesList;
		var pages = PagesList.array2;
		for (var i=0; i<pages.length; i++)
		{
			var page = pages[i];
			this.script += this.convertPage(page, PagesList, i, true, undefined, undefined, 0);
		}
	},
	convertPage: function(page, pages, ind, isupdate, name, formrule, nesting)
	{
		var cmdall = '';
		//if (page.rules.length() > 0)
		//{
			var url;
			var cmdlp = '';
			if (formrule == undefined)
			{
				if (name == undefined)
					cmdlp = this.command('loadpage', {url: page.url, type: page.type,
						params: page.params, encoding: page.encoding, headers: page.headers,
						addit: page.additparams});
				else if (page.type == 'html')
					cmdlp = this.command('foreach', {idname: page.additparams.idname,
													defvals: page.additparams.defvals});
				else
					cmdlp = this.command('loadpage', {name: name, type: page.type,
						params: page.params, encoding: page.encoding, headers: page.headers,
						addit: page.additparams});
			}
			else
			{
				var postparams = (formrule.paramsnew) ? formrule.paramsnew : page.params;
				cmdlp = this.command('submitform', {name: name, params: postparams,
												encoding: page.encoding, headers: page.headers,
												addit: page.additparams});
			}
			
			cmdall += cmdlp;
			cmdall += this.command('{');

			//проверяем, надо ли создавать loadpage в AST
			var oldlp = page.additparams.astnode;
			//var isupdate2 = (isupdate && !oldlp) ? false : true;
			var isupdate2 = true;
			
			if (isupdate)
			{
				if (oldlp)  //обновляем loadpage или submitform
				{
					var newlp = this.createASTNode(cmdlp+' { }');
					TreeUtils.replaceNode(oldlp, newlp);
					newlp.children['body'] = oldlp.children['body'];
					newlp.body = oldlp.body;
					for (var i=0; i<newlp.children['body'].length; i++)
						newlp.children['body'][i].parent.node = newlp;
					newlp.directiv = {};
					$.extend(newlp.directiv, oldlp.directiv);
					$.extend(newlp.comments, oldlp.comments);
					page.additparams.astnode = newlp;
				}
				else  //создаем loadpage или submitform
				{
					var newlp = this.createASTNode(cmdlp+'{ }\n');
					if (!formrule)  // если не submitform
						newlp.comments.splice(0, 0, ' \n');
					var findprev = false;
					for (var i=ind-1; i>=0; i--)
					{
						var p = pages.array2[i];
						if (typeof p == 'string')
							p = pages.array[p];

						if (p.additparams.astnode)
						{
							var prevnode = p.additparams.astnode;
							TreeUtils.insertAfter(prevnode, newlp);
							page.additparams.astnode = newlp;
							findprev = true;
							break;
						}
					}

					if (!findprev)
					{
						var findInd = [];
						for (var i=0; i<this.pages_list.array2.length; i++)
							if (this.pages_list.findActivePage(page, this.pages_list.array2[i], findInd))
								findInd.splice(0, 0, i);

						if (findInd.length > 0)
						{
							findInd.splice(findInd.length-1, 1);
							var p = this.pages_list.getByInd(findInd);
							var parentnode = p.additparams.astnode;
						}
						else  //добавляем в AST.body
						{
							if (!AST)
								AST = this.createASTNode('', '/');
							var parentnode = AST;
						}

						var beforenode = undefined;
						for (var i=parentnode.children['body'].length-1; i>=0; i--)
						{
							var stmt = parentnode.children['body'][i]; 
							if ((stmt.type == 'assign' && stmt.children['right'].type == 'func' 
									&& (stmt.children['right'].value == 'filter_value' || stmt.children['right'].value.search(/get/)!=-1))
								|| (stmt.type == 'func' && stmt.value == 'filter_eqkeys')
								|| stmt.type == 'group')
							{
								beforenode = stmt;
								break;
							}
						}
						
						if (beforenode)
							TreeUtils.insertAfter(beforenode, newlp);
						else
							TreeUtils.appendChild(parentnode, newlp, 'body');
						
						page.additparams.astnode = newlp;
					}
				}
				oldlp = page.additparams.astnode;
			}

			//вставляем новые группы
			if (isupdate2)
			{
				var groupsarr = page.groups.getSortedArray();
				var groups = page.rules.getGroupsObj();
				for (var i=0; i<groupsarr.length; i++)
				{
					var grp = groupsarr[i];
					if (!grp.astnode && grp.name != '' && groups[grp.name])
					{
						var str = 'group '+value2output(grp.name)+'{}';
						var newnode = this.createASTNode(str);
						var findprev = false;
						for (var j=i-1; j>=0; j--)
						{
							if (groupsarr[j].astnode)
							{
								var prevnode = groupsarr[j].astnode;
								var parent = prevnode.parent.node;
								var pos = {key: prevnode.parent.chkey, ind: prevnode.parent.chind+1};
								findprev = true;
								break;
							}
						}

						if (!findprev)
						{
							var parent = page.additparams.astnode;
							var pos = {key: 'body', ind: 0};
						}
						
						TreeUtils.insertNode(parent, newnode, pos);
						grp.astnode = newnode;
						newnode.groupref = grp;
					}
				}
			}
			
			//генерируем и обновляем rules
			var rulesarr = page.rules.getSortedArray();
			var defered = '';
			var groups = {};
			for (var i=0; i<rulesarr.length; i++)
			{
				var rule = rulesarr[i];
				var name = rulesarr[i].name;
				
				if (groups[rule.group] == undefined)
					groups[rule.group] = {str: '', name: rule.group};
				
				if (rule.group != '') this.command('{');
				
				var cmdname = undefined;
				if (rule.type == 'text') cmdname = 'gettext';
				else if (rule.type == 'link') cmdname = 'getlink';
				else if (rule.type == 'image') cmdname = 'getimglink';
				else if (rule.type == 'regexp') cmdname = 'getregexp';
				else if (rule.type == 'form') cmdname = 'getform';
				else if (rule.type == 'html') cmdname = 'gethtml';
				
				if (cmdname)
				{
					if (page.type == 'html' && rule.defvals.opt)
						rule.options.html = rule.defvals.opt.html;
					
					var cmd = this.command(cmdname, {name: name, path: rule.path,
							options: rule.options, idname: rule.idname, defvals: rule.defvals});
					groups[rule.group].str += cmd;

					if (isupdate2)
					{
						var newnode = this.createASTNode(cmd);
						if (rule.astnode)    //replace node
						{
							TreeUtils.replaceNode(rule.astnode, newnode);
							newnode.directiv = {};
							$.extend(newnode.directiv, rule.astnode.directiv);
							$.extend(newnode.comments, rule.astnode.comments);
							rule.astnode = newnode;
							newnode.ruleref = rule;
						}
						else     //insert new node
						{
							if (rule.group != '')
							{
								var parentnode = page.groups.getByName(rule.group).astnode;
								TreeUtils.appendChild(parentnode, newnode, 'body');
								rule.astnode = newnode;
								newnode.ruleref = rule;
							}
							else   // rule без группы
							{
								var findprev = false;
								for (var j=i-1; j>=0; j--) //ищем предыдущее правило
									if (rulesarr[j].group == '')
									{
										var parent = rulesarr[j].astnode.parent;
										var parentnode = parent.node;
										var pos = {key: parent.chkey, ind: parent.chind+1};
										TreeUtils.insertNode(parentnode, newnode, pos);
										findprev = true;
										break;
									}

								if (!findprev) 
								{
									//ищем предыдущую группу
									for (var j=groupsarr.length-1; j>=0; j--)
										if (groupsarr[j].astnode)
										{
											TreeUtils.insertAfter(groupsarr[j].astnode, newnode);
											findprev = true;
											break;
										}
								}
								
								if (!findprev)
								{
									//вставляем в начало
									TreeUtils.insertNode(page.additparams.astnode, newnode, {key: 'body', ind: 0});
								}
																
								rule.astnode = newnode;
								newnode.ruleref = rule;
							}
						}
					}
				}
				
				if (rule.group != '') this.command('}');
				
				if (rule.type == 'link' || rule.type == 'image')
				{
					if (rule.type == 'link' && rule.options.cont)
					{
						cmd = this.command('continue', {name: name, params: rule.contparams});
						defered += cmd;
						if (!rule.cont_astnode && isupdate2)  //создать node
						{
							var newnode = this.createASTNode("loadpage('123') { "+cmd+' }', '/body[0]/body[0]');
							newnode.comments.splice(0, 0, ' \n');
							
							var isfind = false;
							var stmt = page.additparams.astnode.children['body'];
							for (var j=0; j<stmt.length; j++)
								if ((stmt[j].type == 'func' && (stmt[j].value == 'storefile'
									|| stmt[j].value == 'store')) || (stmt[j].type == 'assign' && stmt[j].children['right'].value == 'store'))
								{
									TreeUtils.insertNode(stmt[j].parent.node, newnode, {key: 'body', ind: j});
									isfind = true;
									break;
								}
					
							if (!isfind)
								TreeUtils.appendChild(page.additparams.astnode, newnode, 'body');
							
							rule.cont_astnode = newnode;
						}
					}
					
					if (rule.type == 'link' && !rule.options.cont && rule.cont_astnode && isupdate2)
						TreeUtils.deleteNode(rule.cont_astnode);
					
					if (rule.options.storefile)
					{
						cmd = this.command('storefile', {name: name, value2: rule.storefileparam2, idname2: rule.storefileidname2});
						defered += cmd;
						if (!rule.storefile_astnode && isupdate2)  //создать node
						{
							var newnode = this.createASTNode(cmd);
							TreeUtils.appendChild(page.additparams.astnode, newnode, 'body');
							rule.storefile_astnode = newnode;
						}
					}
					
					if (!rule.options.storefile && rule.storefile_astnode && isupdate2)
						TreeUtils.deleteNode(rule.storefile_astnode);
				}
			}				
			
			//генерирование групп
			var groupsarr = page.groups.getSortedArray();
			for (var i=0; i<groupsarr.length; i++)
			{
				var name = groupsarr[i].name;
				var astnode = groupsarr[i].astnode;
				if (groups[name] == undefined && astnode && isupdate2)  //delete unused group node
				{
					TreeUtils.deleteNode(astnode);
				}
				if (groups[name] && groups[name].str != '')
				{
					var cmd = '';
					if (name != '')
						cmd += this.insindent()+'group '+value2output(name)+' {\n';
					cmd += groups[name].str;
					if (name != '')
						cmd += this.insindent()+'}\n';
					cmdall += cmd;
				}
			}
			
			//обновление filter_value
			var filtergroups = {};
			var isfilter = false;
			for (var i=0; i<rulesarr.length; i++)
			{
				var rule = rulesarr[i];
				var name = rulesarr[i].name;
				
				if (rule.filter && rule.filter.str != '')
				{
					var n = (!isfilter) ? ' \n' : '';
					isfilter = true;
					var filter = this.command('filter_value', {name: name, type: rule.filter.type, str: rule.filter.str,
												idname: rule.filter.idname, defvals: rule.filter.defvals});
					cmdall += n+filter;
					if (rule.group != '')
						filtergroups[rule.group] = true;
					if (isupdate2)
					{
						var newnode = this.createASTNode(filter);
						if (rule.filter.astnode)  //обновляем node
						{
							TreeUtils.replaceNode(rule.filter.astnode, newnode);
							newnode.directiv = {};
							$.extend(newnode.directiv, rule.filter.astnode.directiv);
							$.extend(newnode.comments, rule.filter.astnode.comments);
							rule.filter.astnode = newnode;
							newnode.ruleref = rule;
						}
						else
						{
							newnode.comments.splice(0, 0, n);
							for (var i=page.additparams.astnode.children['body'].length-1; i>=0; i--)
							{
								var stmt = page.additparams.astnode.children['body'][i]; 
								if (stmt.type == 'group' || (stmt.type == 'assign'
											&& stmt.children['right'].type == 'func'
											&& stmt.children['right'].value.search(/get/) != -1))
								{
									TreeUtils.insertAfter(stmt, newnode);
									break;
								}
							}
						}
					}
				}
				else if (rule.filter && rule.filter.str == '')  //удаляем пустой фильтр
				{
					if (rule.filter.astnode && isupdate2)
						TreeUtils.deleteNode(rule.filter.astnode);
					rule.filter = undefined;
				}
			}
			
			//удаление ненужных filter_eqkeys
			if (isupdate2)
			{
				var groupsarr = page.groups.getSortedArray();
				for (var i=0; i<groupsarr.length; i++)
				{
					var grp = groupsarr[i];
					if (grp.name != '')
					{
						var grprules = page.rules.getByGroup(grp.name);
						var nofilter = true;
						for (var name in grprules)
							if (grprules[name].filter && grprules[name].filter.str != '')
							{	
								nofilter = false;
								break;
							}

						if (nofilter && grp.eqkeys_astnode)
						{
							TreeUtils.deleteNode(grp.eqkeys_astnode);
							grp.eqkeys_astnode = undefined;
						}
					}
				}
			}
			
			//обновление filter_eqkeys
			if (isfilter)
			{
				for (var name in filtergroups)
				{
					var rules = page.rules.getByGroup(name);
					var eqparams = [];
					for (var name2 in rules)
						eqparams.push(name2);
					if (eqparams.length > 1)
					{
						cmd = this.command('filter_eqkeys', {params: eqparams});
						cmdall += cmd;
						
						if (isupdate2)
						{
							var newnode = this.createASTNode(cmd);
							var grp = page.groups.getByName(name);
							var oldnode = grp.eqkeys_astnode; 
							if (oldnode)   //обновляем node
							{
								TreeUtils.replaceNode(oldnode, newnode);
								newnode.directiv = {};
								$.extend(newnode.directiv, oldnode.directiv);
								$.extend(newnode.comments, oldnode.comments);
							}
							else  //вставляем node
							{
								var body = page.additparams.astnode.children['body'];
								for (var i=body.length-1; i>=0; i--)
								{
									if ((body[i].type == 'func' && body[i].value == 'filter_eqkeys')
										 || (body[i].type == 'assign' && body[i].children['right'].type=='func'
											 && body[i].children['right'].value=='filter_value'))
									{
										TreeUtils.insertAfter(body[i], newnode);
									}
								}
							}
							grp.eqkeys_astnode = newnode;
							newnode.groupref = grp;
						}
					}
				}
				cmdall += '\n';
			}
			
			for (var i=0; i<page.links.array2.length; i++)
			{
				var obj = page.links.array2[i];
				if (typeof obj == 'string')
				{
					var name = obj;
					if (page.rules.array[name].type == 'form')
					{
						var r = page.rules.array[name];
						var inserted = [];
						for (var param in r.newparams)
						{
							if (r.formsetparam && r.formsetparam[param])  //обновляем или добавляем formsetparam
							{
								var fsp = r.formsetparam[param];
								cmd = this.command('formsetparam', {form: r.name, name: param, value: r.newparams[param],
														idname: fsp.idname, defvals: fsp.defvals});
								cmdall += cmd;
								if (isupdate2)
								{
									var newnode = this.createASTNode(cmd);
									if (fsp.astnode)
									{
										TreeUtils.replaceNode(fsp.astnode, newnode);
										newnode.directiv = {};
										$.extend(newnode.directiv, fsp.astnode.directiv);
										//$.extend(newnode.comments, fsp.astnode.comments);
									}
									else
										inserted.push(newnode);
									fsp.astnode = newnode;
								}
							}
						}
						
						cmdall += this.convertPage(page.links.array[name], page.links, i, isupdate2, name, r, nesting+1);
						
						if (inserted.length > 0) 
						{
							var stmt = page.additparams.astnode.children['body'];
							for (var j=0; j<stmt.length; j++)
								if (stmt[j].type == 'submitform' && stmt[j].children['params'][0].value == r.name)
								{
									var parent = stmt[j].parent.node;
									var pos = {key: 'body', ind: j};
									for (var k=inserted.length-1; k>=0; k--)
									{
										if (k == 0)
											inserted[k].comments.splice(0, 0, ' \n');
										TreeUtils.insertNode(parent, inserted[k], pos);
									}
									break;
								}
						}
					}
					else
						cmdall += this.convertPage(page.links.array[name], page.links, i, isupdate2, name, undefined, nesting+1);
				}
				else
					cmdall += this.convertPage(obj, page.links, i, isupdate2, undefined, undefined, nesting+1);
			}
			cmdall += defered;
			
			for (var i=0; i<page.exp.length; i++) 
			{
				var pageexp = page.exp[i];
				if (pageexp.length() > 0)
				{
					cmd = this.command('store', {name: pageexp.name, type: pageexp.type, filename: pageexp.filename,
						params: pageexp.array, retvarname: pageexp.retvarname,
						idname: pageexp.idname, defvals: pageexp.defvals});
					cmdall += cmd;
					if (isupdate2)
					{
						var newnode = this.createASTNode(cmd);
						var oldnode = pageexp.astnode;
						if (oldnode)
						{
							TreeUtils.replaceNode(oldnode, newnode);
							oldnode.directiv['@global'] = newnode.directiv['@global'];
							newnode.directiv = {};
							$.extend(newnode.directiv, oldnode.directiv);
							$.extend(newnode.comments, oldnode.comments);
						}
						else
						{
							var prevnode = undefined;
							for (var j=i-1; j>=0; j--)
								if (page.exp[j].length() > 0)
								{
									prevnode = page.exp[j].astnode;
									break;
								}	
							
							if (prevnode)
								TreeUtils.insertAfter(prevnode, newnode);
							else
							{
								var nextnode = undefined;
								for (var j=i+1; j<page.exp.length; j++)
									if (page.exp[j].length() > 0)
									{
										nextnode = page.exp[j].astnode;
										break;
									}
								
								if (nextnode)
									TreeUtils.insertBefore(nextnode, newnode);
								else
									TreeUtils.appendChild(page.additparams.astnode, newnode, 'body');
							}
						}
						pageexp.astnode = newnode;
					}
				}
				else
				{
					if (pageexp.astnode)
						TreeUtils.deleteNode(pageexp.astnode);
					if (pageexp.retvarname_node)
						TreeUtils.deleteNode(pageexp.retvarname_node);
				}
			}
			
			cmdall += this.command('}');
			cmdall += '\n';
			
			var cmdinit = '';
			var lastinsert = null;
			for (var i=0; i<page.exp.length; i++) 
			{
				var pageexp = page.exp[i];
				if (pageexp.length() > 0 && pageexp.retvarname)
				{
					var result = pageexp.retvarname.match(/^(@global.+?)(\[.*?\])*$/);
					if (result != null)
					{
						var typestr = (pageexp.type == 'rdb') ? 'array()' : '\'\'';
						var cmd = this.insindent() + result[1] + ' = '+ typestr + ';\n';
						cmdinit += cmd; 
						if (isupdate)
						{
							var newnode = this.createASTNode(cmd);
							if (pageexp.retvarname_node)
							{
								TreeUtils.replaceNode(pageexp.retvarname_node, newnode);
							}
							else
							{
								if (lastinsert)
									TreeUtils.insertAfter(lastinsert, newnode);
								else
									TreeUtils.insertBefore(page.additparams.astnode, newnode);
								lastinsert = newnode;
							}
							pageexp.retvarname_node = newnode;
						}
					}
				}
			}
		//}
		if (page.rules.length() == 0 && nesting > 0)
			cmdall = '';
		if (isupdate && page.additparams.astnode && nesting > 0
				&& page.additparams.astnode.children['body'].length == 0)  //удаляем page node
		{
			TreeUtils.deleteNode(page.additparams.astnode);
		}
		return cmdinit+cmdall;
	},
	insindent: function() {
		var str = '';
		for (var i=0; i<this.indent; i++)
			str += '    ';
		return str;
	},
	command: function(cmd, args) {
		var str = '';
		if (cmd == 'loadpage')
		{
			var url = '';
			if (args.url != undefined)
				url = (valequal(args.url, args.addit.defvals.url) ? this.idname2str(args.addit.idname.url, args.url) : value2output(args.url));
			else if (args.name != undefined)
				url = args.name;
			
			var num = 0;
			for (var name in args.params)
				num++;
			
			if (args.type == 'get' && num == 0 && args.encoding == 'UTF-8' && args.headers.length == 0)
			{
				str += this.insindent() + 'loadpage('+url+')';
			}
			else
			{
				var idnamenum = 0;
				for (var name in args.addit.idname)
					idnamenum++;
				
				if (idnamenum == 0) 
				{
					str += this.insindent() + 'params = '+value2output(args.params)+';\n';
					var paramsidname = 'params';
				}
				else
					var paramsidname = this.idname2str(args.addit.idname.params, args.params);
				
				var enc = '';
				if (args.encoding != 'UTF-8' || args.headers.length > 0)
					enc = ', '+this.idname2str(args.addit.idname.encoding, args.encoding);
				
				var h = '';
				if (args.headers.length > 0)
					h = ', '+this.idname2str(args.addit.idname.headers, args.headers);
				
				var methodidname = this.idname2str(args.addit.idname.method, args.type);
				str += this.insindent() + 'loadpage('+url+', '+methodidname+', '+paramsidname+enc+h+')';
			}
			
			if (args.addit.passparams)
				str += '['+this.idname2str(args.addit.passparams.idname, args.addit.passparams.value)+']';

			str += ' ';
		}
		else if (cmd == 'submitform')
		{
			var enc = '';
			if (args.encoding != 'UTF-8' || args.headers.length > 0)
				enc = ', '+this.idname2str(args.addit.idname.encoding, args.encoding);
			
			var h = '';
			if (args.headers.length > 0)
				h = ', '+this.idname2str(args.addit.idname.headers, args.headers);
			
			str += this.insindent()+'submitform('+args.name+enc+h+')';
			
			if (args.addit.passparams)
				str += '['+this.idname2str(args.addit.passparams.idname, args.addit.passparams.value)+']';

			str += ' ';
		}
		else if (cmd == 'formsetparam')
		{
			var name = (valequal(args.name, args.defvals.name) ? this.idname2str(args.idname.name, args.name) : value2output(args.name)); 
			var value = (valequal(args.value, args.defvals.value) ? this.idname2str(args.idname.value, args.value) : value2output(args.value));
			str += this.insindent()+'formsetparam('+args.form+', '+name+', '+value+');\n';
		}
		else if (cmd == '{')
		{
			//str += this.insindent() + '{\n';
			str += ' {\n';
			this.indent++;
		}
		else if (cmd == '}')
		{
			this.indent--;
			str += this.insindent() + '}\n';
		}
		else if (cmd == 'getform')
		{
			var path = (valequal(args.path, args.defvals.path) ? this.idname2str(args.idname.path, args.path) : value2output(args.path)); 
			var opt = this.opt2str(args.options, args.idname.opt, args.defvals.opt);
			str += this.insindent() + args.name+' = getform('+path+opt+');\n';
		}
		else if (cmd == 'gettext')
		{
			var opt = this.opt2str(args.options, args.idname.opt, args.defvals.opt);
			var path = valequal(args.path, args.defvals.path) ? this.idname2str(args.idname.path, args.path) : value2output(args.path);
			
			str += this.insindent() + args.name+' = '+'gettext('+path+opt+');\n';
		}
		else if (cmd == 'getlink')
		{
			var opt = this.opt2str(args.options, args.idname.opt, args.defvals.opt);
			var path = valequal(args.path, args.defvals.path) ? this.idname2str(args.idname.path, args.path) : value2output(args.path);
			
			str += this.insindent() + args.name+' = '+'getlink('+path+opt+');\n';
		}
		else if (cmd == 'getimglink')
		{
			var opt = this.opt2str(args.options, args.idname.opt, args.defvals.opt);
			var path = valequal(args.path, args.defvals.path) ? this.idname2str(args.idname.path, args.path) : value2output(args.path);
			
			str += this.insindent() + args.name+' = '+'getimglink('+path+opt+');\n';
		}
		else if (cmd == 'getregexp')
		{
			var opt = this.opt2str(args.options, args.idname.opt, args.defvals.opt);
			var path = valequal(args.path, args.defvals.path) ? this.idname2str(args.idname.path, args.path) : value2output(args.path);
			
			str += this.insindent() + args.name+' = '+'getregexp('+path+opt+');\n';
		}
		else if (cmd == 'gethtml')
		{
			var opt = this.opt2str(args.options, args.idname.opt, args.defvals.opt);
			var path = valequal(args.path, args.defvals.path) ? this.idname2str(args.idname.path, args.path) : value2output(args.path);
			
			str += this.insindent() + args.name+' = '+'gethtml('+path+opt+');\n';
		}
		else if (cmd == 'storefile')
		{
			var param2 = '';
			if (args.param2)
				param2 += ', '+this.idname2str(args.idname2, args.value2);
			str += this.insindent() + 'storefile('+args.name+param2+');\n';
		}
		else if (cmd == 'store')
		{
			var param2 = '';
			if (args.type == 'csv' || args.type == 'excel')
			{
				param2 += 'array(';
				for (var i=0; i<args.params.length; i++)
					param2 += args.params[i] + ', ';
				param2 = param2.substring(0, param2.length-2);
				param2 += ')';
			}
			else if (args.type == 'xml' || args.type == 'sql')
			{
				param2 += 'dict(';
				for (var varname in args.params)
					if (args.params[varname])
						param2 += '\''+varname+'\' => '+args.params[varname]+', ';
				param2 = param2.substring(0, param2.length-2);
				param2 += ')';
			}
			else if (args.type == 'rdb')
			{
				var varnames = ExportRules.getParams(args.name);
				param2 += 'dict(';
				for (var varname in args.params)
					if (args.params[varname])
					{
						var value = '';
						if (varnames[varname] instanceof Object)
							value = 'array('+args.params[varname]+')';
						else
							value = args.params[varname];
						param2 += '\''+varname+'\' => '+value+', ';
					}
				param2 = param2.substring(0, param2.length-2);
				param2 += ')';
			}
			
			var name = valequal(args.name, args.defvals.name) ? this.idname2str(args.idname.name, args.name) : value2output(args.name);
			var filename = valequal(args.filename, args.defvals.filename) ? this.idname2str(args.idname.filename, args.filename) : value2output(args.filename);

			var retstr = '';
			if (args.retvarname)
				retstr = args.retvarname+' = ';
			str += this.insindent() + retstr+'store('+name+', '+filename+', '+param2+');\n';
		}
		else if (cmd == 'continue')
		{
			var params = '';
			if (args.params)
				params = ', '+this.idname2str(args.params.idname, args.params.value);
			str += this.insindent() + 'continue('+args.name+params+');\n';
		}
		else if (cmd == 'filter_value')
		{
			var type = (args.type == args.defvals.type) ? this.idname2str(args.idname.type, args.type) : value2output(args.type);
			var strp = (args.str == args.defvals.str) ? this.idname2str(args.idname.str, args.str) : value2output(args.str);
			str += this.insindent() + args.name+' = filter_value('+args.name+', '+type+', '+strp+');\n';
		}
		else if (cmd == 'filter_eqkeys')
		{
			var params = '';
			for (var i=0; i<args.params.length; i++)
				params += ', '+args.params[i];
			params = params.substring(2);
			str += this.insindent() + 'filter_eqkeys('+params+');\n';
		}
		else if (cmd == 'foreach')
		{
			var array = this.idname2str(args.idname.array, args.defvals.array);
			var idstr = '';
			if (args.idname.key)
				idstr += args.idname.key + ' => ';
			idstr += args.idname.id;
			str += this.insindent() + 'foreach ('+array+' as '+idstr+')';
		}
		return str;
	},
	opt2str: function(opt, idname, defval)
	{
		var optarr = {};

		if (opt.next)
		{
			optarr['next'] = 'true';
			optarr['nextoriginaltype'] = opt.origtype;
		}
		
		if (opt.nodeonly)
			optarr['nodeonly'] = 'true';
		
		if (opt.word > 0)
		{
			optarr['word'] = opt.word;
			if (opt.wordend > 0)
				optarr['wordend'] = opt.wordend;
		}
		
		if (opt.html)
			optarr['html'] = opt.html;
		
		if (opt.attr)
			optarr['attr'] = opt.attr;
		
		if (opt.content)
			optarr['content'] = opt.content;
				
		if (opt.resultind && opt.resultind > 0)
			optarr['resultind'] = opt.resultind;
		
		if (opt.replace)
			optarr['replace'] = opt.replace;
		
		if (opt.implode)
			optarr['join'] = opt.implodestr;
		
		var num = 0;
		for (var name in optarr)
			num++;
		
		var str = '';
		if (num > 0)
			str = ', '+(valequal(optarr, defval) ? this.idname2str(idname, optarr) : value2output(optarr));
		return str;
	},
	idname2str: function(idname, value)
	{
		if (idname == undefined)
			return value2output(value);
		
		if (typeof idname == 'string')
			return idname;
		
		if (idname instanceof Array)
		{
			var str = '';
			for (var i=0; i<idname.length; i++)
				str += ', '+this.idname2str(idname[i], value[i]);
			return 'array('+str.substring(2)+')';
		}
		
		if (idname instanceof Object)
		{
			var str = '';
			for (var i in idname)
				str += ', \''+i+'\'=>'+this.idname2str(idname[i], value[i]);
			return 'dict('+str.substring(2)+')';
		}
	},
	createASTNode: function(cmdstr, path)
	{
		var parser = new ScriptParserClass(cmdstr);
		parser.parse();
		TreeUtils.prepareTree(parser.ast);
		var ret;
		if (path)
		{
			var current = parser.ast;
			if (path.length > 1 && path != '/')
			{
				var patharr = path.split('/');
				for (var i=1; i<patharr.length; i++)
				{
					var m = patharr[i].match(/(\w+)(\[(\d+)\])?/);
					var key = m[1];
					var ind = m[3];
					current = current.children[key];
					if (ind)
						current = current[ind];
				}
			}
			ret = current;
		}
		else
			ret = parser.ast.body[0]; 
		return ret;
	},	
};
/**SLScriptClass**/



/**ScriptScannerClass**/
function ScriptScannerClass(script)
{
	this.script = (script != undefined) ? script : '';
	this.pos = 0;
	this.token_start = 0;
	this.token_len = 0;
	this.line = 0;
	this.column = 0;
	this.token = '';
	this.value = '';
	this.type = '';
}

ScriptScannerClass.prototype = {
	oneCharToken: function(ch) {
		if (ch == '(') return 'SMB_LPARENT';
		if (ch == ')') return 'SMB_RPARENT';
		if (ch == '=') return 'SMB_ASSIGN';
		if (ch == ';') return 'SMB_SEMI';
		if (ch == ',') return 'SMB_COMMA';
		if (ch == '{') return 'SMB_LBRACE';
		if (ch == '}') return 'SMB_RBRACE';
		if (ch == '[') return 'SMB_LHOOK';
		if (ch == ']') return 'SMB_RHOOK';
		if (ch == '>') return 'SMB_BIGGER';
		if (ch == '<') return 'SMB_SMALLER';
		if (ch == '!') return 'SMB_NOT';
		if (ch == '-') return 'SMB_MINUS';
		if (ch == '+') return 'SMB_PLUS';
		if (ch == '*') return 'SMB_MULT';
		if (ch == '/') return 'SMB_DIV';
		if (ch == '%') return 'SMB_MOD';
		if (ch == '.') return 'SMB_POINT';
		if (ch == '&') return 'SMB_AMPERSAND';
		
		return 'SMB_NULL';
	},
	twoCharToken: function(ch1, ch2) {
		if (ch1 == '=' && ch2 == '>') return 'SMB_NAMEVAL';
		if (ch1 == '=' && ch2 == '=') return 'SMB_EQUAL';
		if (ch1 == '!' && ch2 == '=') return 'SMB_NOTEQUAL';
		if (ch1 == '>' && ch2 == '=') return 'SMB_BIGGEREQUAL';
		if (ch1 == '<' && ch2 == '=') return 'SMB_SMALLEREQUAL';
		if (ch1 == '&' && ch2 == '&') return 'SMB_AND';
		if (ch1 == '|' && ch2 == '|') return 'SMB_OR';
		return 'SMB_NULL';
	},
	calclinecolumn: function(token) {
		var flag = false;
		for (var i=0; i<token.length; i++)
			if (token[i] == '\n')
			{
				this.line++;
				this.column = 0;
				flag = true;
			}
			else
				this.column++;
	},
	getNextToken: function() {
		var ix = this.pos;
		if (ix >= this.script.length)
			return {type: 'SMB_END'};
		var char = this.script[ix];
		var token = '';
		var value = '';
		var type = 'SMB_NULL';
		
		this.calclinecolumn(this.token);
		
		//пропускаем разделители
		/*while (char.search(/^\s$/i) != -1)
		{
			if (char == '\n')
			{
				this.line++;
				this.column = 0;
			}
			else this.column++;
			
			if (ix < this.script.length-1) ix++;
			else return {type: 'SMB_END'};
			
			char = this.script[ix];
		}
		*/
		this.token_start = ix;
		
		if (char == '\n')
		{
			ix++;
			token = char;
			type = 'SMB_NEWLINE';
			value = token;
		}
		else if (char == ' ' || char == '\t')
		{
			ix++;
			token = char;
			while (ix<this.script.length && (this.script[ix] == ' ' || this.script[ix] == '\t'))
			{
				token += this.script[ix];
				ix++;
			}
			type = 'SMB_SPACE';
			value = token;
		}
		//определяем идентификатор или зарезервированное слово
		else if (char.search(/^[a-zA-Z]$/i) != -1)
		{
			ix++;
			token = char;
			while (ix<this.script.length && this.script[ix].search(/^[a-zA-Z0-9_]$/i)!=-1)
			{
				token += this.script[ix];
				ix++;
			}
			
			type = 'SMB_ID';
			value = token;
			if (token.toLowerCase() == 'array') type = 'SMB_ARRAY';
			else if (token.toLowerCase() == 'loadpage') type = 'SMB_LOADPAGE';
			else if (token.toLowerCase() == 'dict') type = 'SMB_DICT';
			else if (token.toLowerCase() == 'foreach') type = 'SMB_FOREACH';
			else if (token.toLowerCase() == 'break') type = 'SMB_BREAK';
			else if (token.toLowerCase() == 'as') type = 'SMB_AS';
			else if (token.toLowerCase() == 'if') type = 'SMB_IF';
			else if (token.toLowerCase() == 'else') type = 'SMB_ELSE';
			else if (token.toLowerCase() == 'group') type = 'SMB_GROUP';
			else if (token.toLowerCase() == 'submitform') type = 'SMB_SUBMITFORM';
			else if (token.toLowerCase() == 'function') type = 'SMB_FUNCTION';
			else if (token.toLowerCase() == 'return') type = 'SMB_RETURN';
		}
		//определяем директиву
		else if (char == '@' && ix+1<this.script.length && this.script[ix+1].search(/^[a-zA-Z_]$/i)!=-1)
		{
			ix++;
			token = char;
			while (ix<this.script.length && this.script[ix].search(/^[a-zA-Z_]$/i)!=-1)
			{
				token += this.script[ix];
				ix++;
			}
			type = 'SMB_DIRECTIV';
			value = token;
		}
		//определяем строку
		else if (char == '\'')
		{
			ix++;
			token = char;
			while (ix<this.script.length && (this.script[ix-1]=='\\' || this.script[ix]!='\''))
			{
				token += this.script[ix];
				
				if (this.script[ix]=='\\' && this.script[ix+1]=='\\')
				{
					value += '\\';
					ix+=2;
					continue;
				}
								
				/*if (this.script[ix] != '\\' && this.script[ix-1] != '\\')
					value += this.script[ix];*/
				if (this.script[ix-1] == '\\')
				{
					if (this.script[ix] == '\\')  value += '\\';
					//else if (this.script[ix] == 'n')  value += '\n';
					//else if (this.script[ix] == 't')  value += '\t';
					else if (this.script[ix] == '\'')  value += '\'';
					else value += this.script[ix];
				}
				else
					value += this.script[ix];
				ix++;
			}
			token += '\'';
			ix++;
			type = 'SMB_STRING';
		}
		else if (char == '/' && (ix+1)<this.script.length && this.script[ix+1] == '*')
		{
			ix += 2;
			token = '/*';
			while (ix+1<this.script.length && !(this.script[ix]=='*' && this.script[ix+1]=='/'))
			{
				token += this.script[ix];
				value += this.script[ix];
				ix++;
			}
			token += '*/';
			ix += 2;
			type = 'SMB_COMMENT';
		}
		else if (char == '/' && (ix+1)<this.script.length && this.script[ix+1] == '/')
		{
			ix += 2;
			token = '//';
			while (ix<this.script.length && this.script[ix]!='\n')
			{
				token += this.script[ix];
				value += this.script[ix];
				ix++;
			}
			type = 'SMB_COMMENTLINE';
		}
		//определяем числа
		else if (char.search(/^\d$/i) != -1 || (char == '-' && ix+1<this.script.length && this.script[ix+1].search(/\d/i)!=-1))
		{
			ix++;
			token = char;
			var isfloat = false;
			while (ix<this.script.length && (this.script[ix].search(/\d/i)!=-1 
					|| this.script[ix]=='.' && ix+1<this.script.length && this.script[ix+1].search(/\d/i)!=-1))
			{
				//if (!isfloat && this.script[ix] == '.' && ix+1<this.script.length && this.script[ix+1].search(/\d/i)!=-1)
				//	isfloat = true;
				token += this.script[ix++];
			}
			value = parseFloat(token);
			type = 'SMB_FLOAT';
		}
		//определяем двухсимвольные лексемы
		else if (ix+1<this.script.length && this.twoCharToken(char, this.script[ix+1])!='SMB_NULL')
		{
			var char2 = this.script[ix+1];
			type = this.twoCharToken(char, char2);
			token = char+char2;
			value = token;
			ix += 2;
		}
		//определяем односимвольные лексемы
		else if (this.oneCharToken(char) != 'SMB_NULL')
		{
			ix++;
			token = char;
			value = token;
			type = this.oneCharToken(char);
		}
		else
		{
			ix++;
			token = char;
			value = token;
			type = 'SMB_NULL';
		}
		
		this.token_len = ix-this.token_start;
		this.token = token;
		this.value = value;
		this.pos = ix;
		this.type = type;
		return {type: this.type, token: this.token, value: this.value, start: this.token_start,
			    length: this.token_len, line: this.line, column: this.column};
	}
};
/**ScriptScannerClass**/



/**ScriptParserClass**/
function ScriptParserClass(script)
{
	this.script = script;
	this.lexems = [];
	this.lex = 0;
	this.error_line = 0;
	this.error_column = 0;
	this.error_start = 0;
	this.error_length = 0;
	this.error_message = '';
	this.ast = {};
}

ScriptParserClass.prototype = {
	parse: function(syntaxcheckonly) {
		this.lexems = [];
		this.lex = 0;
		
		var scanner = new ScriptScannerClass(this.script);
		var lex;
		var capspace = true;
		do {
			lex = scanner.getNextToken();
			if (lex.type == 'SMB_NULL')
				throw this.parseError(Lang.t('Неизвестный символ'),
						lex.line, lex.column, lex.start, lex.length);
			
			if (capspace)
			{
				if (lex.type != 'SMB_SPACE') this.lexems.push(lex);
			}
			else if (lex.type != 'SMB_COMMENT' && lex.type != 'SMB_COMMENTLINE' 
					&& lex.type != 'SMB_NEWLINE' && lex.type != 'SMB_SPACE')
				this.lexems.push(lex);
			
			if (capspace && lex.type != 'SMB_COMMENT' && lex.type != 'SMB_COMMENTLINE' 
				&& lex.type != 'SMB_NEWLINE' && lex.type != 'SMB_SPACE')
				capspace = false;
						
			if (lex.type == 'SMB_SEMI' || lex.type == 'SMB_RBRACE' || lex.type == 'SMB_LBRACE')
				capspace = true;
		} while (lex.type != 'SMB_END');
		
		this.main();
	},
	parseError: function(message, line, column, start, len) {
		if (line == undefined) line = this.lexems[this.lex].line;
		if (column == undefined) column = this.lexems[this.lex].column;
		if (start == undefined) start = this.lexems[this.lex].start;
		if (len == undefined) len = this.lexems[this.lex].length;
		
		this.name = 'SLSError';
		this.error_line = line;
		this.error_column = column;
		this.error_start = start;
		this.error_length = len;
		this.error_message = message;
		
		return {message: message, line: line, column: column, start: start, length: len, name: this.name};
	},
	main: function() {
		this.ast = {type: 'program', body: []};
		this.statements('first', this.ast.body);
	},
	comments: function() {
		var arr = [];
		while (this.lexems[this.lex].type == 'SMB_COMMENT'
				|| this.lexems[this.lex].type == 'SMB_COMMENTLINE'
				|| this.lexems[this.lex].type == 'SMB_NEWLINE')
		{
			arr.push(this.lexems[this.lex].token);
			this.lex++;
		}
		return arr;
	},
	statements: function(first, statarr) {
		var directiv = {}, ret, comments;
		comments = this.comments();
		while (this.lexems[this.lex].type == 'SMB_DIRECTIV')
		{
			var dirname = this.lexems[this.lex].value;
			var dir = {type: 'directiv',
						value: dirname,
						column: this.lexems[this.lex].column,
						line: this.lexems[this.lex].line,
						start: this.lexems[this.lex].start,
						length: this.lexems[this.lex].length,
			};
			this.lex++;
			
			if (this.lexems[this.lex].type == 'SMB_STRING')
			{
				var dirval = { type: 'string',
						value: this.lexems[this.lex].value,
						column: this.lexems[this.lex].column,
						line: this.lexems[this.lex].line,
						start: this.lexems[this.lex].start,
						length: this.lexems[this.lex].length,
				};
				dir.val = dirval;
				this.lex++;
			}
			
			directiv[dirname] = dir;
		}
				
		if (this.lexems[this.lex].type == 'SMB_ID')
		{
			var idname = this.lexems[this.lex].value;
			var id = {type: 'id',
					value: idname,
					hooks: [],
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
			};
			this.lex++;
			
			var hooks = [];
			var isaddop = false;
			var addopparams = {};
			while (this.lexems[this.lex].type == 'SMB_LHOOK')
			{
				this.lex++;
				
				if (isaddop)
					throw this.parseError(Lang.t('Ожидается выражение'), addopparams.line, addopparams.column,
							addopparams.start, addopparams.length);
				
				if (this.lexems[this.lex].type == 'SMB_RHOOK')
				{
					isaddop = true;
					addopparams.column = this.lexems[this.lex].column;
					addopparams.line = this.lexems[this.lex].line;
					addopparams.start = this.lexems[this.lex].start;
					addopparams.length = this.lexems[this.lex].length;
					id.addop = true;	
				}
				else
				{
					var val = this.arithexpr('', true);
					hooks.push(val);
					if (this.lexems[this.lex].type != 'SMB_RHOOK')
						throw this.parseError(Lang.t('Ожидается ]'));
				}
				
				this.lex++;
			}
			id.hooks = hooks;
			
			if (this.lexems[this.lex].type == 'SMB_ASSIGN')
			{
				ret = {type: 'assign',
						value: '',
						column: this.lexems[this.lex].column,
						line: this.lexems[this.lex].line,
						start: this.lexems[this.lex].start,
						length: this.lexems[this.lex].length,
				};
				this.lex++;
				ret.directiv = directiv;
				ret.comments = comments;
				statarr.push(ret);
				
				ret.left = id;
				ret.right = this.arithexpr(idname, true);
				
				if (this.lexems[this.lex].type != 'SMB_SEMI')
					throw this.parseError(Lang.t('Ожидается ;'));
				this.lex++;
				
				this.statements(first, statarr);
			}
			else if (this.lexems[this.lex].type == 'SMB_LPARENT')
			{
				ret = {type: 'func',
						value: idname,
						params: [],
						hooks: [],
						column: this.lexems[this.lex-1].column,
						line: this.lexems[this.lex-1].line,
						start: this.lexems[this.lex-1].start,
						length: this.lexems[this.lex-1].length,
				};
				statarr.push(ret);
				ret.starttotal = this.lexems[this.lex].start;
				ret.directiv = directiv;
				ret.comments = comments;
				this.formalparameters(ret.params);
				ret.endtotal = this.lexems[this.lex-1].start+1;
				
				if (this.lexems[this.lex].type != 'SMB_SEMI')
					throw this.parseError(Lang.t('Ожидается ;'));
				this.lex++;
				
				this.statements(first, statarr);
			}
			else
			{
				statarr.push(id);
				throw this.parseError(Lang.t('Ожидается ='));
			}
		}
		else if (this.lexems[this.lex].type == 'SMB_FOREACH')
		{
			ret = {type: 'foreach',
					value: '',
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
			};
			this.lex++;
			
			ret.directiv = directiv;
			ret.comments = comments;
			statarr.push(ret);
			
			if (this.lexems[this.lex].type != 'SMB_LPARENT')
				throw this.parseError(Lang.t('Ожидается ('));
			this.lex++;
			
			ret.array = this.arithexpr('', true);
			
			if (this.lexems[this.lex].type != 'SMB_AS')
				throw this.parseError(Lang.t('Ожидается as'));
			this.lex++;
			
			if (this.lexems[this.lex].type != 'SMB_ID')
				throw this.parseError(Lang.t('Ожидается идентификатор'));
						
			var id = {type: 'id',
					value: this.lexems[this.lex].value,
					hooks: [],
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
			};
			this.lex++;
			
			if (this.lexems[this.lex].type == 'SMB_NAMEVAL')
			{
				this.lex++;
				ret.key = id;
				if (this.lexems[this.lex].type != 'SMB_ID')
					throw this.parseError(Lang.t('Ожидается идентификатор'));
				
				ret.id = {type: 'id',
						value: this.lexems[this.lex].value,
						hooks: [],
						column: this.lexems[this.lex].column,
						line: this.lexems[this.lex].line,
						start: this.lexems[this.lex].start,
						length: this.lexems[this.lex].length,
				};
				this.lex++;
			}
			else
				ret.id = id;
			
			if (this.lexems[this.lex].type != 'SMB_RPARENT')
				throw this.parseError(Lang.t('Ожидается )'));
			this.lex++;
			
			if (this.lexems[this.lex].type != 'SMB_LBRACE')
				throw this.parseError(Lang.t('Ожидается {'));
			this.lex++;
			
			ret.body = [];
			
			this.statements(first, ret.body);
			
			if (this.lexems[this.lex].type != 'SMB_RBRACE')
				throw this.parseError(Lang.t('Ожидается }'));
			this.lex++;
			
			this.statements(first, statarr);
		}
		else if (this.lexems[this.lex].type == 'SMB_BREAK')
		{
			ret = {type: 'break',
					value: '',
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
			};
			this.lex++;
			
			ret.comments = comments;
			statarr.push(ret);
			
			if (this.lexems[this.lex].type != 'SMB_SEMI')
				throw this.parseError(Lang.t('Ожидается ;'));
			this.lex++;
						
			this.statements(first, statarr);
		}
		else if (this.lexems[this.lex].type == 'SMB_IF')
		{
			ret = {type: 'if',
					value: '',
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
			};
			this.lex++;
			
			if (this.lexems[this.lex].type != 'SMB_LPARENT')
				throw this.parseError(Lang.t('Ожидается ('));
			this.lex++;
			
			statarr.push(ret);
			
			ret.expr = this.logicexpr();
			ret.directiv = directiv;
			ret.comments = comments;
			
			if (this.lexems[this.lex].type != 'SMB_RPARENT')
				throw this.parseError(Lang.t('Ожидается )'));
			this.lex++;
			
			if (this.lexems[this.lex].type != 'SMB_LBRACE')
				throw this.parseError(Lang.t('Ожидается {'));
			this.lex++;
			
			ret.ifbody = [];
			this.statements(first, ret.ifbody);
			
			if (this.lexems[this.lex].type != 'SMB_RBRACE')
				throw this.parseError(Lang.t('Ожидается }'));
			this.lex++;
			
			comments2 = this.comments();
			
			if (this.lexems[this.lex].type == 'SMB_ELSE')
			{
				this.lex++;
				
				if (this.lexems[this.lex].type != 'SMB_LBRACE')
					throw this.parseError(Lang.t('Ожидается {'));
				this.lex++;
				
				ret.elsebody = [];
				this.statements(first, ret.elsebody);
				
				if (this.lexems[this.lex].type != 'SMB_RBRACE')
					throw this.parseError(Lang.t('Ожидается }'));
				this.lex++;
			}
			
			this.statements(first, statarr);			
		}
		else if (this.lexems[this.lex].type == 'SMB_GROUP')
		{
			ret = {type: 'group',
					value: '',
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
			};
			this.lex++;
			
			if (this.lexems[this.lex].type != 'SMB_STRING')
				throw this.parseError(Lang.t('Ожидается строка'));
			ret.value = this.lexems[this.lex].value;
			this.lex++;
			
			if (this.lexems[this.lex].type != 'SMB_LBRACE')
				throw this.parseError(Lang.t('Ожидается {'));
			this.lex++;
			
			statarr.push(ret);
			ret.comments = comments;
			ret.directiv = directiv;
			ret.body = [];
			this.statements(first, ret.body);
			
			for (var i=0; i<ret.body.length; i++)
			{
				if (ret.body[i].type != 'assign')
					throw this.parseError(Lang.t('Внутри group допускается только присваивание'));
				var funcname = ret.body[i].right.value;
				if (!(ret.body[i].right.type == 'func' && (funcname == 'gettext' || funcname == 'getlink'
						|| funcname == 'getimglink' || funcname == 'getattr' || funcname == 'getregexp'
						|| funcname == 'getform' || funcname == 'gethtml')))
					throw this.parseError(Lang.t('Внутри group допускаются только get-функции с xpath'));
			}
			
			if (this.lexems[this.lex].type != 'SMB_RBRACE')
				throw this.parseError(Lang.t('Ожидается }'));
			this.lex++;
						
			this.statements(first, statarr);
		}
		else if (this.lexems[this.lex].type == 'SMB_FUNCTION')
		{
			ret = {type: 'funcdecl',
					value: '',
					params: [],
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
			};
			this.lex++;
			
			if (this.lexems[this.lex].type != 'SMB_ID')
				throw this.parseError(Lang.t('Ожидается идентификатор'));
			ret.value = this.lexems[this.lex].value;
			this.lex++;
			
			if (this.lexems[this.lex].type != 'SMB_LPARENT')
				throw this.parseError(Lang.t('Ожидается ('));
			this.lex++;
			
			while (true)
			{
				var islink = false;
				if (this.lexems[this.lex].type == 'SMB_AMPERSAND')
				{
					islink = true;
					this.lex++;
				}
				
				if (this.lexems[this.lex].type == 'SMB_ID')
				{
					var param = {
						type : 'id',
						value : this.lexems[this.lex].value,
						islink : islink,
						column : this.lexems[this.lex].column,
						line : this.lexems[this.lex].line,
						start : this.lexems[this.lex].start,
						length : this.lexems[this.lex].length,
					};
				
					ret.params.push(param); 
					this.lex++;
				}
				
				if (this.lexems[this.lex].type == 'SMB_COMMA')
				{
					this.lex++;
					if (!(this.lexems[this.lex].type == 'SMB_ID' || this.lexems[this.lex].type == 'SMB_AMPERSAND'))
						throw this.parseError(Lang.t('Ожидается параметр'));
				}
				else break;
			}
			
			if (this.lexems[this.lex].type != 'SMB_RPARENT')
				throw this.parseError(Lang.t('Ожидается )'));
			this.lex++;
			
			if (this.lexems[this.lex].type != 'SMB_LBRACE')
				throw this.parseError(Lang.t('Ожидается {'));
			this.lex++;
			
			statarr.push(ret);
			ret.comments = comments;
			ret.directiv = directiv;
			ret.body = [];
			this.statements(first, ret.body);
			
			if (this.lexems[this.lex].type != 'SMB_RBRACE')
				throw this.parseError(Lang.t('Ожидается }'));
			this.lex++;
						
			this.statements(first, statarr);
		}
		else if (this.lexems[this.lex].type == 'SMB_RETURN')
		{
			ret = {type: 'return',
					value: '',
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
			};
			this.lex++;
			
			ret.expr = this.logicexpr();
			ret.directiv = directiv;
			ret.comments = comments;
			statarr.push(ret);
			
			if (this.lexems[this.lex].type != 'SMB_SEMI')
				throw this.parseError(Lang.t('Ожидается ;'));
			this.lex++;
						
			this.statements(first, statarr);
		}
		else if (this.loadpage(first, statarr, directiv, comments))
		{
		}
		else
		{
			if (comments.length > 0 && statarr.length > 0)
				statarr[statarr.length-1].commentsafter = comments;
		}
	},
	expr: function(ret, idleft, allowfunc)
	{
		var result = false;
		var value, type;
		if (this.lexems[this.lex].type == 'SMB_ID')
		{
			var idname = this.lexems[this.lex].value;
			ret.value = idname;
			ret.type = 'id';
			ret.hooks = [];
			ret.column = this.lexems[this.lex].column;
			ret.line = this.lexems[this.lex].line;
			ret.start = this.lexems[this.lex].start;
			ret.length = this.lexems[this.lex].length;
			this.lex++;
			
			if (this.lexems[this.lex].type == 'SMB_LPARENT' && allowfunc)  //если вызов функции
			{
				ret.type = 'func';
				ret.starttotal = this.lexems[this.lex].start;
				ret.idleft = idleft;
				ret.params = []; 
				this.formalparameters(ret.params);
				ret.endtotal = this.lexems[this.lex-1].start+1; 
			}
					
			if (this.lexems[this.lex].type == 'SMB_LHOOK')  // [ ]
			{
				ret.hooks = [];
				while (this.lexems[this.lex].type == 'SMB_LHOOK')
				{
					this.lex++;
					var val = this.arithexpr('', true);
					ret.hooks.push(val);
					if (this.lexems[this.lex].type != 'SMB_RHOOK')
						throw this.parseError(Lang.t('Ожидается ]'));
					this.lex++;
				}
			}
			
			result = true;
		}
		else if (this.lexems[this.lex].type == 'SMB_DICT')
		{
			ret.value = '';
			ret.type = 'dict';
			ret.column = this.lexems[this.lex].column;
			ret.line = this.lexems[this.lex].line;
			ret.start = this.lexems[this.lex].start;
			ret.length = this.lexems[this.lex].length;
			this.lex++;
			if (this.lexems[this.lex].type != 'SMB_LPARENT')
				throw this.parseError(Lang.t('Ожидается ('));
			this.lex++;
			
			ret.params = [];
			
			if (this.lexems[this.lex].type != 'SMB_RPARENT')
				while (true)
				{
					var key = this.arithexpr('', false);
	
					if (this.lexems[this.lex].type == 'SMB_NAMEVAL')   //  =>
					{
						var nv = {value: '',
								type: 'nameval',
								column: this.lexems[this.lex].column,
								line: this.lexems[this.lex].line,
								start: this.lexems[this.lex].start,
								length: this.lexems[this.lex].length,
						};
						this.lex++;
						nv.key = key;
						nv.val = this.arithexpr('', false);
						ret.params.push(nv);
					}
	
					if (this.lexems[this.lex].type == 'SMB_COMMA')
					{
						this.lex++;
						if (this.lexems[this.lex].type == 'SMB_RPARENT')
							break;
					}
					else
						break;
				}
			
			if (this.lexems[this.lex].type != 'SMB_RPARENT')
				throw this.parseError(Lang.t('Ожидается )'));
			this.lex++;
			result = true;
		}
		else if (this.lexems[this.lex].type == 'SMB_STRING')
		{
			value = this.lexems[this.lex].value;
			type = 'string';
			name = undefined;
			ret.value = value;
			ret.type = type;
			ret.column = this.lexems[this.lex].column;
			ret.line = this.lexems[this.lex].line;
			ret.start = this.lexems[this.lex].start;
			ret.length = this.lexems[this.lex].length;
			this.lex++;
			result = true;
		}
		else if (this.lexems[this.lex].type == 'SMB_FLOAT')
		{
			value = this.lexems[this.lex].value;
			type = 'float';
			name = undefined;
			ret.value = value;
			ret.type = type;
			ret.column = this.lexems[this.lex].column;
			ret.line = this.lexems[this.lex].line;
			ret.start = this.lexems[this.lex].start;
			ret.length = this.lexems[this.lex].length;
			this.lex++;
			result = true;
		}
		else if (this.lexems[this.lex].type == 'SMB_ARRAY')
		{
			ret.value = '',
			ret.type = 'array';
			ret.column = this.lexems[this.lex].column;
			ret.line = this.lexems[this.lex].line;
			ret.start = this.lexems[this.lex].start;
			ret.length = this.lexems[this.lex].length;
			this.lex++;
			if (this.lexems[this.lex].type != 'SMB_LPARENT')
				throw this.parseError(Lang.t('Ожидается ('));
			this.lex++;
			
			ret.params = [];
			
			if (this.lexems[this.lex].type != 'SMB_RPARENT')
				while (true)
				{
					var key = this.arithexpr('', false);
					ret.params.push(key);
	
					if (this.lexems[this.lex].type == 'SMB_COMMA')
					{
						this.lex++;
						if (this.lexems[this.lex].type == 'SMB_RPARENT')
							break;
					}
					else
						break;
				}
			
			if (this.lexems[this.lex].type != 'SMB_RPARENT')
				throw this.parseError(Lang.t('Ожидается )'));
			this.lex++;
			result = true;
		}
		return result;
	},
	arithexpr: function(idleft, allowfunc)
	{
		var left = this.term(idleft, allowfunc);
		var expr = this.moreterms(left, idleft, allowfunc);
		return expr;
	},
	moreterms: function(left, idleft, allowfunc)
	{
		var ret;
		if (this.lexems[this.lex].type == 'SMB_PLUS')
		{
			var ret2 = {value: '',
					type: 'plus',
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
				};
			this.lex++;
			ret2.left = left;
			ret2.right = this.term(idleft, allowfunc);
			ret = this.moreterms(ret2, idleft, allowfunc);
		}
		else if (this.lexems[this.lex].type == 'SMB_MINUS')
		{
			var ret2 = {value: '',
					type: 'minus',
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
				};
			this.lex++;
			ret2.left = left;
			ret2.right = this.term(idleft, allowfunc);
			ret = this.moreterms(ret2, idleft, allowfunc);
		}
		else if (this.lexems[this.lex].type == 'SMB_POINT')
		{
			var ret2 = {value: '',
					type: 'concat',
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
				};
			this.lex++;
			ret2.left = left;
			ret2.right = this.term(idleft, allowfunc);
			ret = this.moreterms(ret2, idleft, allowfunc);
		}
		else
			ret = left;
		return ret;
	},
	term: function(idleft, allowfunc)
	{
		var left = this.factor(idleft, allowfunc);
		var expr = this.morefactor(left, idleft, allowfunc);
		return expr;
	},
	morefactor: function(left, idleft, allowfunc)
	{
		var ret;
		var isfactor = true;
		var type;
		if (this.lexems[this.lex].type == 'SMB_MULT')
			type = 'mult';
		else if (this.lexems[this.lex].type == 'SMB_DIV')
			type = 'div';
		else if (this.lexems[this.lex].type == 'SMB_MOD')
			type = 'mod';
		else
		{
			ret = left;
			isfactor = false;
		}
		
		if (isfactor)
		{
			var ret2 = {value: '',
					type: type,
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
				};
			this.lex++;
			ret2.left = left;
			ret2.right = this.factor(idleft, allowfunc);
			ret = this.morefactor(ret2, idleft, allowfunc);
		}
		return ret;
	},
	factor: function(idleft, allowfunc)
	{
		var ret;
		if (this.lexems[this.lex].type == 'SMB_LPARENT')
		{
			this.lex++;
			ret = this.arithexpr(idleft, allowfunc);
			
			if (this.lexems[this.lex].type != 'SMB_RPARENT')
				throw this.parseError(Lang.t('Ожидается )'));
			this.lex++;
		}
		else
		{
			var unaryminus = false;
			if (this.lexems[this.lex].type == 'SMB_MINUS')
			{
				ret = {value: '',
						type: 'unaryminus',
						column: this.lexems[this.lex].column,
						line: this.lexems[this.lex].line,
						start: this.lexems[this.lex].start,
						length: this.lexems[this.lex].length,
					};
				this.lex++;
				unaryminus = true;
			}
			
			var ret2 = {};
			if (!this.expr(ret2, idleft, allowfunc))
				throw this.parseError(Lang.t('Ожидается выражение'));
			
			if (unaryminus)
				ret.left = ret2;
			else
				ret = ret2;
		}
		
		return ret;
	},
	loadpage: function(first, statarr, directiv, comments) {
		var res = false;
		if (this.lexems[this.lex].type == 'SMB_LOADPAGE' 
				|| this.lexems[this.lex].type == 'SMB_SUBMITFORM')
		{
			res = true;
			var idname = (this.lexems[this.lex].type == 'SMB_LOADPAGE') ? 'loadpage' : 'submitform';
			var ret = {value: idname,
					type: idname,
					first: first,
					directiv: directiv,
					comments: comments,
					body: [],
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
			};
			this.lex++;
			ret.starttotal = this.lexems[this.lex].start;
			statarr.push(ret);
			ret.params = [];
			this.formalparameters(ret.params);
			ret.endtotal = this.lexems[this.lex].start-1;
			
			if (ret.params[0] == undefined)
				throw this.parseError(Lang.t('{name} требует минимум один параметр', {name: idname}),
						this.lexems[this.lex-1].line, this.lexems[this.lex-1].column,
						this.lexems[this.lex-1].start, this.lexems[this.lex-1].length);
			
			if (this.lexems[this.lex].type == 'SMB_LHOOK')
			{
				this.lex++;
				ret.passparams = this.arithexpr('', false);
				
				if (this.lexems[this.lex].type != 'SMB_RHOOK')
					throw this.parseError(Lang.t('Ожидается ]'));
				this.lex++;
			}
			
			if (this.lexems[this.lex].type != 'SMB_LBRACE')
				throw this.parseError(Lang.t('Ожидается {'));
			this.lex++;
			
			this.statements('nonfirst', ret.body);
			
			if (this.lexems[this.lex].type != 'SMB_RBRACE')
				throw this.parseError(Lang.t('Ожидается }'));
			this.lex++;
			
			this.statements(first, statarr);
		}
		return res;
	},
	formalparameters: function(params) {
		if (this.lexems[this.lex].type != 'SMB_LPARENT')
			throw this.parseError(Lang.t('Ожидается ('));
		this.lex++;
		
		while (true)
		{
			var p = {};
			if (!this.expr(p, '', false)) break;
			params.push(p);
			
			if (this.lexems[this.lex].type == 'SMB_COMMA')
			{
				this.lex++;
				if (!(this.lexems[this.lex].type == 'SMB_ID' || this.lexems[this.lex].type == 'SMB_STRING' ||
						this.lexems[this.lex].type == 'SMB_ARRAY' || this.lexems[this.lex].type == 'SMB_DICT'))
				{
					//вставляем фиктивный узел для code completion
					var p2 = {};
					p2.value = '';
					p2.type = 'id';
					p2.hooks = [];
					p2.start = this.lexems[this.lex-1].start;
					p2.length = this.lexems[this.lex].start-p2.start;
					params.push(p2);
					throw this.parseError(Lang.t('Ожидается параметр'));
				}
			}
			else break;
		}
		
		//позиция начала и конца параметров, для code completion
		if (params.length > 0)
			params[params.length-1].endtotal = this.lexems[this.lex].start-1;  
		
		if (this.lexems[this.lex].type != 'SMB_RPARENT')
			throw this.parseError(Lang.t('Ожидается )'));
		this.lex++;
	},
	logicexpr: function()
	{
		var left = this.logicterm();
		var expr = this.morelogicterms(left);
		return expr;
	},
	morelogicterms: function(left)
	{
		var ret;
		if (this.lexems[this.lex].type == 'SMB_AND')
		{
			var ret2 = {value: '',
					type: 'logicand',
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
				};
			this.lex++;
			ret2.left = left;
			ret2.right = this.logicterm();
			ret = this.morelogicterms(ret2);
		}
		else if (this.lexems[this.lex].type == 'SMB_OR')
		{
			var ret2 = {value: '',
					type: 'logicor',
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
				};
			this.lex++;
			ret2.left = left;
			ret2.right = this.logicterm();
			ret = this.morelogicterms(ret2);
		}
		else
			ret = left;
		return ret;
	},
	logicterm: function()
	{
		var left = this.logicfactor();
		var expr = this.morelogicfactor(left);
		return expr;
	},
	morelogicfactor: function(left)
	{
		var ret;
		var isfactor = true;
		var type;
		if (this.lexems[this.lex].type == 'SMB_EQUAL')
		{
			type = 'logic==';
		}
		else if (this.lexems[this.lex].type == 'SMB_NOTEQUAL')
		{
			type = 'logic!=';
		}
		else if (this.lexems[this.lex].type == 'SMB_BIGGER')
		{
			type = 'logic>';
		}
		else if (this.lexems[this.lex].type == 'SMB_SMALLER')
		{
			type = 'logic<';
		}
		else if (this.lexems[this.lex].type == 'SMB_BIGGEREQUAL')
		{
			type = 'logic>=';
		}
		else if (this.lexems[this.lex].type == 'SMB_SMALLEREQUAL')
		{
			type = 'logic<=';
		}
		else
		{
			ret = left;
			isfactor = false;
		}
		
		if (isfactor)
		{
			var ret2 = {value: '',
					type: type,
					column: this.lexems[this.lex].column,
					line: this.lexems[this.lex].line,
					start: this.lexems[this.lex].start,
					length: this.lexems[this.lex].length,
				};
			this.lex++;
			ret2.left = left;
			ret2.right = this.logicfactor();
			ret = this.morelogicfactor(ret2);
		}
		return ret;
	},
	logicfactor: function()
	{
		var ret;
		if (this.lexems[this.lex].type == 'SMB_NOT')
		{
			ret = {value: '',
				type: 'logic!',
				column: this.lexems[this.lex].column,
				line: this.lexems[this.lex].line,
				start: this.lexems[this.lex].start,
				length: this.lexems[this.lex].length,
			};
			this.lex++;
			ret.left = this.logicoperands();
		}
		else
		{
			ret = this.logicoperands();
		}
		return ret;
	},
	logicoperands: function()
	{
		var ret;
		if (this.lexems[this.lex].type == 'SMB_LPARENT')
		{
			this.lex++;
			ret = this.logicexpr();
			
			if (this.lexems[this.lex].type != 'SMB_RPARENT')
				throw this.parseError(Lang.t('Ожидается )'));
			this.lex++;
		}
		else
			ret = this.arithexpr('', true);
		
		return ret;
	}
};
/**ScriptParserClass**/




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




/**ScriptFuncDecl**/
function ScriptFuncDecl()
{
	this.table = {};
}

ScriptFuncDecl.prototype = {
	add: function(name, Node, FrameNum)
	{
		this.table[name] = {node: Node, frame: FrameNum};
	},
};
/**ScriptFuncDecl**/



/**ScriptASTExecClass**/
function ScriptASTExecClass(ast)
{
	this.funcs = new ScriptFunctionsClass(); 
	
	this.ast = ast;
	this.state1 = 'listnext';
    this.ret = {};
    this.stack = [];
    this.pause = false;
    
    this.globalids = {};
    this.ids = [];
    this.sysparams = [];
    this.current_ids = -1;
    this.pages_list = null;
    this.cur_page = null;
    this.output = '';
    this.group = '';
    this.funcdecl = new ScriptFuncDecl();
    
    this.ast.visit = 0;
    this.stack.push({type: 'obj', nodes: this.ast});
}

ScriptASTExecClass.prototype = {
	execError: function(message, line, column, start, len) {
		return {message: message, line: line, column: column, start: start, length: len, name: 'SLSError'};
	},
	runStart: function() {
		this.state1 = 'listnext';
	    this.ret = {};
	    this.stack = [];
	    this.pause = false;
	    
	    this.globalids = {};
	    this.ids = [];
	    this.sysparams = [];
	    this.current_ids = -1;
	    this.pages_list = null;
	    this.cur_page = null;
	    this.group = '';
	    this.output = '';
	    
	    this.ast.visit = 0;
	    this.stack.push({type: 'obj', nodes: this.ast});
	    this.run();
	},
	run: function() 
	{
		var cycle = true;
	    while (cycle)
	    {
	        if (this.stack[this.stack.length-1].type == 'arr')
	            switch (this.state1)
	            {
	                case 'listnext':
	                    var el = this.stack[this.stack.length-1];
	                    if (el.listi < el.nodes.length-1)  //переход к следующему элементу в списке
	                    {
	                        el.listi++;
	                        el.nodes[el.listi].visit = 0;
	                        el.nodes[el.listi].listvals = [];
	                        this.stack.push({type: 'obj', nodes: el.nodes[el.listi]});
	                    }
	                    else if (this.stack.length > 0)  //если в стеке есть элементы
	                    {
	                    	this.stack.pop();
	                    }
	                    else  // выходим
	                    {
	                        cycle = false;
	                    }
	                    this.state1 = 'none';
	                    break;
	                case 'listsave':
	                    this.stack[this.stack.length-2].nodes.listvals.push(this.ret);
	                    this.state1 = 'listnext';
	                    break;
	            }

	        if (!cycle) break;

	        if (this.stack[this.stack.length-1].type == 'obj')
	        {
	            var node = this.stack[this.stack.length-1].nodes;
	            switch (node.type)
	            {
	                case 'string':
	                	this.ret = {};
	                	this.ret.type = 'string';
	                	this.ret.value = node.value;
	                	this.stack.pop();
	                	this.state1 = 'listsave';
	                    break;
	                case 'float':
	                	this.ret = {};
	                	this.ret.type = 'float';
	                	this.ret.value = node.value;
	                	this.stack.pop();
	                	this.state1 = 'listsave';
	                    break;
	                case 'id':
	                	if (node.visit == 0)
	                	{
	                		node.listvals = [];
	                		this.stack.push({type: 'arr', nodes: node.hooks, listi: -1});
	                		this.state1 = 'listnext';
	                		node.visit = 1;
	                	}
	                	else
	                	{
	                		if (this.ids[this.current_ids][node.value] == undefined && this.globalids[node.value] == undefined)
	                			throw this.execError(Lang.t('Значение переменной не задано'), 
	                					node.line, node.column, node.start, node.length);

	                		if (this.ids[this.current_ids][node.value])
	                		{
	                			var type = this.ids[this.current_ids][node.value].type;
	                			var value = this.ids[this.current_ids][node.value].value;
	                		}
	                		else if (this.globalids[node.value])
	                		{
	                			var type = this.globalids[node.value].type;
	                			var value = this.globalids[node.value].value;
	                		}

	                		this.ret = this.execHooks(node, type, value);
	                		this.stack.pop();
	                		this.state1 = 'listsave';
	                	}
	                    break;
	                case 'assign':
	                    if (node.visit == 0)
	                    {
	                    	node.listvals = [];
	                        this.stack.push({type: 'arr', nodes: node.left.hooks, listi: -1});
	                        this.state1 = 'listnext';
	                        node.visit = 1;
	                    }
	                    else if (node.visit == 1)
	                    {
	                    	var hooksstr = '';
	                    	for (var i=0; i<node.listvals.length; i++)
	                    		hooksstr += '['+value2output(node.listvals[i].value)+']';
	                    	node.right.idleft += hooksstr;
	                    	if (node.left.addop)
		                    	node.right.idleft += '[]';
	                    	
	                    	node.right.visit = 0;
	                    	node.right.listvals = [];
	                    	this.stack.push({type: 'obj', nodes: node.right});
	                        node.visit = 2;
	                    }
	                    else
	                    {
	                    	var idname = node.left.value;
	                    	var isglobal = false;
	                    	
	                    	if (idname == 'pageparams')
	                    		throw this.execError(Lang.t('Зарезервированная переменная pageparams только для чтения. Ей нельзя присвоить значение'), 
	                					node.line, node.column, node.start, node.length);
	                    	
	                    	if (node.left.hooks.length == 0 && !node.left.addop)    // если нет [ ]
	                    	{
	                    		if (node.directiv['@global'] || this.globalids[idname])
	                    		{
	                    			this.globalids[idname] = {name: idname, value: this.ret.value, type: this.ret.type};
	                    			isglobal = true;
	                    		}
	                    		else
	                    			this.ids[this.current_ids][idname] = {name: idname, value: this.ret.value, type: this.ret.type};
	                    	}
	                    	else if (node.left.hooks.length == 0 && node.left.addop)
	                    	{
	                    		if (node.directiv['@global'] || this.globalids[idname])
	                    		{
	                    			if (this.globalids[idname] == undefined)
	                    			{
	                    				this.globalids[idname] = {name: idname, value: [], type: 'array'};
	                    			}
	                    			if (this.globalids[idname].type != 'array')
	                    				throw this.execError(Lang.t('Переменная не является массивом'), 
	    	                					node.left.line, node.left.column, node.left.start, node.left.length);
	                    				
	                    			value = this.globalids[idname].value;
	                    			isglobal = true;
	                    		}
	                    		else
	                    		{
	                    			if (this.ids[this.current_ids][idname] == undefined)
	                    			{
	                    				this.ids[this.current_ids][idname] = {name: idname, value: [], type: 'array'};
	                    			}
	                    			if (this.ids[this.current_ids][idname].type != 'array')
	                    				throw this.execError(Lang.t('Переменная не является массивом'), 
	    	                					node.left.line, node.left.column, node.left.start, node.left.length);
	                    			value = this.ids[this.current_ids][idname].value;
	                    		}
	                    		
	                    		if (this.ret.type == 'array')
	                    			for (var i=0; i<this.ret.value.length; i++)
	                    				value.push(this.ret.value[i]);
	                    		else
	                    			value.push(this.ret.value);
	                    	}
	                    	else
	                    	{
	                    		var value, newvalue, newtype;
	                    		if (node.listvals[0].type == 'float')
	                    		{
	                    			newvalue = [];
	                    			newtype = 'array';
	                    		}
	                    		else if (node.listvals[0].type == 'string')
	                    		{
	                    			newvalue = {};
	                    			newtype = 'dict';
	                    		}
	                    		
	                    		if (node.directiv['@global'] || this.globalids[idname])
	                    		{
	                    			if (this.globalids[idname] == undefined 
	                    					|| (this.globalids[idname].type != 'dict'
	                    						&& this.globalids[idname].type != 'array'))
	                    			{
	                    				this.globalids[idname] = {name: idname, value: newvalue, type: newtype};
	                    			}
	                    			value = this.globalids[idname].value;
	                    			isglobal = true;
	                    		}
	                    		else
	                    		{
	                    			if (this.ids[this.current_ids][idname] == undefined 
	                    					|| (this.ids[this.current_ids][idname].type != 'dict'
	                    						&& this.ids[this.current_ids][idname].type != 'array'))
	                    			{
	                    				this.ids[this.current_ids][idname] = {name: idname, value: newvalue, type: newtype};
	                    			}
	                    			value = this.ids[this.current_ids][idname].value;
	                    		}
	                    		
	                    		for (var i=0; i<node.listvals.length-1; i++)
	                    		{
	                    			if (value[node.listvals[i].value] == undefined)
	                    			{
	                    				if (node.listvals[i+1].type == 'string')
                    						value[node.listvals[i].value] = {};
	                    				else if (node.listvals[i+1].type == 'float')
	                    					value[node.listvals[i].value] = [];
	                    			}
	                    			value = value[node.listvals[i].value];
	                    		}
	                    		if (node.left.addop)
	                    		{
	                    			i = node.listvals.length-1;
	                    			if (value[node.listvals[i].value] == undefined)
                    					value[node.listvals[i].value] = [];
	                    			
	                    			value = value[node.listvals[i].value];
	                    			if (value instanceof Array)
	                    			{
	                    				if (this.ret.type == 'array')
	    	                    			for (var i=0; i<this.ret.value.length; i++)
	    	                    				value.push(this.ret.value[i]);
	    	                    		else
	    	                    			value.push(this.ret.value);
	                    			}
	                    			else
	                    				throw this.execError(Lang.t('[] не может быть применена не к массиву'), 
	    	                					node.left.line, node.left.column, node.left.start, node.left.length);
	                    		}
	                    		else
	                    			value[node.listvals[node.listvals.length-1].value] = this.ret.value;
	                    	}
	                    	
	                    	var v;
	                    	if (this.globalids[idname])
	                    	{
	                    		v = this.globalids[idname];
	                    		GlobalVars.add(idname, v.type, v.value);
	                    	}
	                    	else if (this.current_ids > 0)
	                    	{
	                    		v = this.ids[this.current_ids][idname];
	                    		this.cur_page.vars.add(idname, v.type, v.value);
	                    	}
	                    	this.stack.pop();
	                    	this.state1 = 'listnext';
	                    }
	                    break;
	                case 'func':
	                    if (node.visit == 0)   //собираем параметры
	                    {
	                        node.listvals = [];
	                        this.stack.push({type: 'arr', nodes: node.params, listi: -1});
	                        this.state1 = 'listnext';
	                        node.visit = 1;
	                    }
	                    else if (node.visit == 1)   // параметры собраны, выполняем функцию
	                    {
	                    	var callfunc = false;
	                        if (node.value.toLowerCase()=='getlink' 
	                        	|| node.value.toLowerCase()=='gettext'
	                        	|| node.value.toLowerCase()=='getimglink' 
	                        	|| node.value.toLowerCase() == 'gethtml')
	                        {
	                        	this.ret = this.execGetFuncs(node);
	                        }
	                        else if (node.value.toLowerCase() == 'getregexp')
	                        {
	                        	this.ret = this.execGetRegexpFunc(node);
	                        }
	                        else if (node.value.toLowerCase() == 'getattr')
	                        {
	                        	this.ret = this.execGetAttrFunc(node);
	                        }
	                        else if (node.value.toLowerCase() == 'getform')
	                        {
	                        	this.ret = this.execGetFormFunc(node);
	                        }
	                        else if (node.value.toLowerCase() == 'formgetselectkey'
	                        		|| node.value.toLowerCase() == 'formgetparam'
	                        		|| node.value.toLowerCase() == 'formsetparam'
	                        		|| node.value.toLowerCase() == 'formgetselectvalue')
	                        {
	                        	this.ret = this.execFormFuncs(node);
	                        }
	                        else if (node.value.toLowerCase() == 'dump')
	                        {
	                        	var value = node.listvals[0].value;
	                        	var type = node.listvals[0].type;
	                        	var dumpstr = ((node.listvals[0].idname) ? node.listvals[0].idname : 'const')+' ('+type+') = ';
	                        	if (type == 'dict')
	                        	{
	                        		dumpstr += '\n';
	                        		for (var name in value)
	                        			dumpstr += '['+name+'] => '+value2output(value[name])+'\n';
	                        	}
	                        	else if (type == 'array')
	                        	{
	                        		dumpstr += '\n';
	                        		for (i=0; i<value.length; i++)
	                        			dumpstr += '['+i+'] = '+value2output(value[i])+'\n';
	                        	}
	                        	else
	                        		dumpstr += value2output(value) + '\n';
	                        	
	                        	this.ret = {};
	                        	this.ret.type = 'string';
	                        	this.ret.value = node.listvals[0].value;
	                        	this.output += dumpstr;
	                        }
	                        else if (node.value.toLowerCase() == 'store')
	                        {
	                        	this.ret = this.execStoreFunc(node);
	                        }
	                        else if (node.value.toLowerCase() == 'store_table')
	                        {
	                        	/*if (this.current_ids < 1)
	                    			throw this.execError(Lang.t('store_table допустимо только внутри loadpage'),
	                    					node.line, node.column, node.start, node.length);*/
	                        	this.ret = {};
	                        	this.ret.type = 'string';
	                        	this.ret.value = '';
	                        }
	                        else if (node.value.toLowerCase() == 'storefile')
	                        {
	                        	this.ret = this.execStorefileFunc(node);
	                        }
	                        else if (node.value.toLowerCase() == 'continue')
	                        {
	                        	this.ret = this.execContFunc(node);
	                        }
	                        else if (node.value.toLowerCase() == 'generateurl')
	                        {
	                        	this.ret = this.execGenUrlFunc(node);
	                        }
	                        else if (node.value.toLowerCase() == 'concat')
	                        {
	                        	this.ret = this.execConcatFunc(node);
	                        }
	                        else if (node.value.toLowerCase() == 'filter_value')
	                        {
	                        	this.ret = this.filtervalueFunc(node);
	                        }
	                        else if (node.value.toLowerCase() == 'filter_key')
	                        {
	                        	this.ret = this.filterkeyFunc(node);
	                        }
	                        else if (node.value.toLowerCase() == 'filter_eqkeys')
	                        {
	                        	this.ret = this.filterequalkeysFunc(node);
	                        }
	                        else if (node.value.toLowerCase() == 'regexp')
	                        {
	                        	this.ret = this.regexpFunc(node);
	                        }
	                        else if (node.value.toLowerCase() == 'count')
	                        {
	                        	if (node.listvals[0].type != 'array' && node.listvals[0].type != 'dict')
	                        		throw this.execError(Lang.t('Параметр count должен быть массивом или словарем'), 
	    	                				node.line, node.column, node.start, node.length);
	                        	this.ret = {};
	                        	this.ret.type = 'float';
	                        	if (node.listvals[0].type == 'array')
                        			this.ret.value = node.listvals[0].value.length;
	                        	else if (node.listvals[0].type == 'dict')
	                        	{
	                        		var dict = node.listvals[0].value;
	                        		var count = 0;
	                        		for (var name in dict)
	                        			count++;
	                        		this.ret.value = count;
	                        	}
	                        }
	                        else if (node.value.toLowerCase() == 'maketable')
	                        {
	                        	this.ret = this.maketableFunc(node);
	                        }
	                        else if (node.value.toLowerCase() == 'dbconnect')
	                        {
	                        	
	                        }
	                        else if (node.value.toLowerCase() == 'dbclose')
	                        {
	                        	
	                        }
	                        else if (node.value.toLowerCase() == 'dbfind')
	                        {
	                        	this.ret = {};
	                        	this.ret.type = 'array';
	                        	this.ret.value = [];
	                        }
	                        else if (node.value.toLowerCase() == 'dbinsert')
	                        {
	                        	this.ret = {};
	                        	this.ret.type = 'string';
	                        	this.ret.value = '';
	                        }
	                        else if (node.value.toLowerCase() == 'dbupdate')
	                        {
	                        	
	                        }
	                        else if (node.value.toLowerCase() == 'dbdelete')
	                        {
	                        	
	                        }
	                        else if (node.value.toLowerCase() == 'mail')
	                        {
	                        	if (node.listvals.length != 3)
	                        		throw this.execError(Lang.t('Функция mail принимает три параметра'), 
	    	                				node.line, node.column, node.start, node.length);
	                        	this.ret = {};
	                        	this.ret.type = 'float';
	                        	this.ret.value = 1;
	                        }
	                        else if (node.value.toLowerCase() == 'removetags')
	                        {
	                        	this.ret = this.removetagsFunc(node);
	                        }
	                        else if (node.value.toLowerCase() == 'basename')
	                        {
	                        	this.ret = this.basenameFunc(node);
	                        }
	                        else if (this.funcdecl.table[node.value])
	                        {
	                        	var fn = this.funcdecl.table[node.value].node;
	                        	var funcnode = TreeUtils.copyNode(fn);
	                        	TreeUtils.prepareNode(funcnode, null);
	                        	node.frame = HtmlFrames.activeFrame;
	                        	HtmlFrames.show(this.funcdecl.table[node.value].frame);
	                        	
	                        	var obj = {};
	                        	for (var i=0; i<funcnode.params.length; i++)
	                        	{
	                        		if (funcnode.params[i].islink)
	                        			obj[funcnode.params[i].value] = node.listvals[i];
	                        		else
	                        			obj[funcnode.params[i].value] = $.extend(true, {}, node.listvals[i]);
	                        	}
		                		obj['passparams'] = $.extend(true, {}, this.ids[this.current_ids]['passparams']);
		                		obj['pageparams'] = $.extend(true, {}, this.ids[this.current_ids]['pageparams']);
		                		this.ids.push(obj);
		                		this.sysparams.push(this.sysparams[this.current_ids]);
		            			this.current_ids++;
	                        	
	                        	node.listvals = [];
		                        this.stack.push({type: 'arr', nodes: funcnode.body, listi: -1});
		                        this.state1 = 'listnext';
		                        node.visit = 4;
		                        callfunc = true;
	                        }
	                        else throw this.execError(Lang.t('Неизвестная функция'), 
	                				node.line, node.column, node.start, node.length);
	                     
	                        if (!callfunc)
	                        {
	                        	node.visit = 2;
	                        	node.ret = $.extend(true, {}, this.ret);
	                        }
	                    }
	                    else if (node.visit == 2)   //собираем параметры
	                    {
	                        node.listvals = [];
	                        this.stack.push({type: 'arr', nodes: node.hooks, listi: -1});
	                        this.state1 = 'listnext';
	                        node.visit = 3;
	                    }
	                    else if (node.visit == 3)
	                    {
	                    	this.ret = this.execHooks(node, node.ret.type, node.ret.value);
	                    	this.stack.pop();
	                		this.state1 = 'listsave';
	                    }
	                    else if (node.visit == 4)
	                    {
	                    	this.ids.pop();
	            			this.current_ids--;
                        	HtmlFrames.show(node.frame);
	                    	node.ret = $.extend(true, {}, this.ret);
	                        node.visit = 2;
	                    }
	                    break;
	                case 'loadpage':
	                case 'submitform':
	                	if (node.visit == 0)   //собираем параметры
	                	{
	                		node.listvals = [];
	                        this.stack.push({type: 'arr', nodes: node.params, listi: -1});
	                        this.state1 = 'listnext';
	                        node.visit = 1;
	                	}
	                	else if (node.visit == 1)
	                	{
	                		if (node.passparams) 
	                		{
	                			node.passparams.visit = 0;
	                			node.passparams.listvals = [];
	                			this.stack.push({type: 'obj', nodes: node.passparams});
	                		}
	                		else
	                			this.ret = undefined;
	                		node.visit = 2;
	                	}
	                	else if (node.visit == 2)  //загрузка страницы и выход для ожидания загрузки
	                	{
	                		//в this.ret - passparams
	                		if (!this.pages_list)
	            				this.pages_list = new PagesListClass();
	                		
	                		this.sysparams[this.current_ids].loadpagenum++;
	                		var index = {nesting: this.current_ids,
	                					 num: this.sysparams[this.current_ids].loadpagenum};
	                		
	                		node.visit = 3;
	                		this.pause = true;
	                		cycle = false;
	                		
	                		var result = true;
	                		if (node.type == 'loadpage')
	                			result = this.execLoadpage(node, index, node.listvals, this.ret);
	                		if (node.type == 'submitform')
	                			this.execSubmitform(node, index, node.listvals, this.ret);
	                		
	                		if (!result)
	                		{
	                			this.pause = false;
		                		cycle = true;
		                		this.stack.pop();
		                		this.state1 = 'listnext';
	                		}
	                	}
	                	else if (node.visit == 3)  //продолжение выполнения, выполнение тела loadpage
	                	{
	                		var doc = document.getElementById(HtmlFrames.activeFrame).contentWindow.document;
	                	    if ($('body > h1', doc).attr('id') == 'error')
	                	    	throw this.execError(Lang.t('Ошибка загрузки страницы'), 
    	                				node.line, node.column, node.start, node.length);
	                		
	                		var obj = {};
	                		var page = this.createPageDict();
	                		obj['pageparams'] = {name: 'pageparams', value: page, type: 'dict'};
	                		this.cur_page.vars.add('pageparams', 'dict', page);
	                		
	                		var passp = {};
	                		if (this.pages_list.get().additparams.passparams)
	                			$.extend(true, passp, this.pages_list.get().additparams.passparams);
	                		else
	                		{
	                			passp.type = 'dict';
	                			passp.value = {};
	                		}
	                		obj['passparams'] = {name: 'passparams', value: passp.value, type: passp.type};
	                		this.cur_page.vars.add('passparams', passp.type, passp.value);
	                		
	            			this.ids.push(obj);
	            			
	            			if (this.current_ids > 0)
	            				this.sysparams[this.current_ids].nestingloadpage = true;
	            			this.sysparams.push({nestingloadpage: false,
	            								 ruleindex: 0,
	            								 groupindex: 0,
	            								 groupxpath: '',
	            								 loadpagenum: 0,
	            							    });
	            			
	            			this.current_ids++;
	            			
	            			node.listvals = [];
	                        this.stack.push({type: 'arr', nodes: node.body, listi: -1});
	                        this.state1 = 'listnext';
	            			node.visit = 4;
	                	}
	                	else if (node.visit == 4) //тело loadpage выполнено
	                	{
	                		this.pages_list.prev();
	                		this.cur_page = this.pages_list.get(); 
	                		this.ids.pop();
	                		this.current_ids--;
	                		this.sysparams.pop();
	                		this.stack.pop();
	                		this.state1 = 'listnext';
	                		if (this.cur_page && this.current_ids > 0)
	                		{
	                			this.pause = true;
	                			cycle = false;
	                			loadpage(false, this.cur_page.url, this.cur_page.type, this.cur_page.params, this.cur_page.encoding, this.cur_page.index);
	                		}
	                	}
	                	break;
	                case 'foreach':
	                	if (node.visit == 0)
	                	{
	                		node.array.visit = 0;
	                		node.array.listvals = [];
	                		this.stack.push({type: 'obj', nodes: node.array});
	                		node.visit = 1;
	                	}
	                	else if (node.visit == 1)
	                	{
	                		if (this.ret.type != 'array' && this.ret.type != 'dict')
	                			throw this.execError(Lang.t('Первый параметр foreach должен быть массивом или словарем'), 
	                					node.array.line, node.array.column, node.array.start, node.array.length);
	                		node.foreach = {};
	                		node.foreach.array = this.ret.value;
	                		node.foreach.type = this.ret.type; 
	                		node.foreach.keyarr = [];
	                		node.foreach.keyind = 0;
	                		node.foreach.bbreak = false;
	                		if (node.foreach.type == 'dict')
	                		{
	                			for (var key in node.foreach.array)
	                				node.foreach.keyarr.push(key);
	                		}
	                		else if (node.foreach.type == 'array')
	                		{
	                			for (var i=0; i<node.foreach.array.length; i++)
	                				node.foreach.keyarr.push(i);
	                		}
	                		if (this.ids[this.current_ids][node.id.value])
	                		{
	                			node.foreach.saveid = {};
	                			$.extend(true, node.foreach.saveid, this.ids[this.current_ids][node.id.value]);
	                		}
	                		if (node.key && this.ids[this.current_ids][node.key.value])
	                		{
	                			node.foreach.savekey = {};
	                			$.extend(true, node.foreach.savekey, this.ids[this.current_ids][node.key.value]);
	                		}
	                		
	                		var r = this.cur_page.rules.getByName(this.ret.idname);
	                		if (r && r.type == 'html')
	                		{
	                			node.foreach.loadpage = true;
	                			var idname = {array: this.ret.idname, key: node.key ? node.key.value : undefined, id: node.id.value};
	                			var defvals = {array: node.foreach.array};
	                			var additp = {idname: idname, defvals: defvals, astnode: node};
	                			this.cur_page = this.pages_list.get().links.add(r.name, 'html://'+r.name, 'html', {content: node.foreach.array[0]}, 'UTF-8', [], additp);
	                			this.cur_page.exp = [];
	                			//this.cur_page.index = {nesting: this.current_ids, num: ++this.sysparams[this.current_ids].loadpagenum};
	                			this.pages_list.loadLink(r.name);
	                			loadpage(false, this.cur_page.url, this.cur_page.type, this.cur_page.params, this.cur_page.encoding, this.cur_page.index);
	                			cycle = false;
	                			this.pause = true;
	                		}
	                		
	                		node.visit = 2;
	                	}
	                	else if (node.visit == 2)  //проверка условия и выполнение тела цикла или выход
	                	{
	                		if (node.foreach.keyind < node.foreach.keyarr.length && !node.foreach.bbreak)
	                		{
	                			var key = node.foreach.keyarr[node.foreach.keyind];
	                			var value = node.foreach.array[key];
	                			
	                			var type = 'string';
	                			if (typeof value == 'string')  type = 'string';
	                			else if (typeof value == 'number') type = 'float';
	                			else if (value instanceof Object) type = 'dict';
	                			else if (value instanceof Array) type = 'array';
	                				                				
	                			this.ids[this.current_ids][node.id.value] = {name: node.id.value, value: value, type: type};
	                			
	                			var keytype = 'string';
	                			if (typeof key == 'string') keytype = 'string';
	                			else if (typeof key == 'number') keytype = 'float';
	                			if (node.key)
	                				this.ids[this.current_ids][node.key.value] = {name: node.key.value, value: key, type: keytype};
	                			
	                			if (node.foreach.keyind == 0 && node.foreach.loadpage)
	                				node.foreach.firstval = value;
	                			
	                			node.foreach.keyind++;
	                			node.listvals = [];
	                			this.stack.push({type: 'arr', nodes: node.body, listi: -1});
	                			this.state1 = 'listnext';
	                			node.visit = 2;
	                		}
	                		else
	                		{
	                			if (node.foreach.saveid)
	                			{
	                				this.ids[this.current_ids][node.id.value] = {};
	                				$.extend(true, this.ids[this.current_ids][node.id.value], node.foreach.saveid);
	                			}
	                			if (node.foreach.savekey)
	                			{
	                				this.ids[this.current_ids][node.key.value] = {};
	                				$.extend(true, this.ids[this.current_ids][node.key.value], node.foreach.savekey);
	                			}
	                			if (node.foreach.loadpage)
	                			{
	                				this.pages_list.get().rules.setHtmlOpt(node.foreach.firstval);
	                				this.pages_list.prev();
	    	                		this.cur_page = this.pages_list.get(); 
	                			}
	                			
	                			this.stack.pop();
		                		this.state1 = 'listnext';
		                		
		                		if (node.foreach.loadpage)
		                		{
		                			this.pause = true;
	    	                		cycle = false;
	    	                		loadpage(false, this.cur_page.url, this.cur_page.type, this.cur_page.params, this.cur_page.encoding, this.cur_page.index);
		                		}
	                		}
	                	}
	                	break;
	                case 'break':
	                	var i = this.stack.length-2;
	                	var foreachfind = false;
	                	while (i >= 0)
	                	{
	                		if (this.stack[i].type == 'obj'
	            	            && this.stack[i].nodes.type == 'foreach')
	            	        {
	                			this.stack.splice(i+1, this.stack.length-i-1);
	            	        	var n = this.stack[this.stack.length-1].nodes;
	            	        	n.foreach.bbreak = true;
	            	        	foreachfind = true;
	                			break;
	            	        }
	                		i--;
	                	}
	                	if (!foreachfind)
	                	{
	                		throw this.execError(Lang.t('break допустимо только внутри foreach'), 
                					node.line, node.column, node.start, node.length);
	                		this.stack.pop();
	                		this.state1 = 'listnext';
	                	}
	                	break;
	                case 'if':
	                	if (node.visit == 0)
	                	{
	                		node.expr.visit = 0;
	                		node.expr.listvals = [];
	                		this.stack.push({type: 'obj', nodes: node.expr});
	                		node.visit = 1;
	                	}
	                	else if (node.visit == 1)
	                	{
	                		if (this.ret.value == 0)
	                		{
	                			if (node.elsebody)
	                			{
	                				node.listvals = [];
	                				this.stack.push({type: 'arr', nodes: node.elsebody, listi: -1});
	                				this.state1 = 'listnext';
	                			}
	                		}
	                		else
	                		{
	                			node.listvals = [];
	                			this.stack.push({type: 'arr', nodes: node.ifbody, listi: -1});
	                			this.state1 = 'listnext';
	                		}
	                		node.visit = 2;
	                	}
	                	else if (node.visit == 2)
	                	{
	                		this.stack.pop();
	                		this.state1 = 'listnext';
	                	}
	                	break;
	                case 'group':
	                	if (node.visit == 0)
	                	{
	                		var grp = this.cur_page.groups.getByName(node.value);
	                		if ((node.value == 'group1' && grp.astnode != undefined)
	                				|| (node.value != 'group1' && grp != undefined))
	                			throw this.execError(Lang.t('Имя группы должно быть уникальным'));
	                		
	                		var xpatharr = [];
	                		for (var i=0; i<node.body.length; i++)
	                		{
	                			var getfunc = node.body[i].right;
	                			if (getfunc.params[0].type != 'string')
	                				throw this.execError(Lang.t('Должна быть строка'), 
	                						getfunc.params[0].line, getfunc.params[0].column, getfunc.params[0].start, getfunc.params[0].length);
	                			if (getfunc.value != 'getregexp')
	                				xpatharr.push(getfunc.params[0].value.split('/'));
	                		}
	                			                		
	                		var jdiffstart = 0;
	                		if (xpatharr.length > 0)
	                		{
	                			for (var j=0; j<xpatharr[0].length; j++)
	                			{
	                				var isequal = true;
	                				for (i=1; i<xpatharr.length; i++)
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
	                		{
	                			var commonxpath = xpatharr[0].slice(0, jdiffstart).join('/');
	                			this.sysparams[this.current_ids].groupxpath = commonxpath;
	                		}
	                		
	                		var grp = this.cur_page.groups.getByName('group1');
	                		if (node.value == 'group1' && grp.astnode == undefined)
	                		{
	                			grp.astnode = node;
	                			node.groupref = grp;
	                			node.index = this.sysparams[this.current_ids].groupindex++;
	                		}
	                		else if (node.value != 'group1')
	                		{
	                			grp = this.cur_page.groups.add(node.value, node, this.sysparams[this.current_ids].groupindex++);
	                			node.groupref = grp;
	                		}
	                		
	                		this.group = node.value;
	                		node.listvals = [];
                			this.stack.push({type: 'arr', nodes: node.body, listi: -1});
                			this.state1 = 'listnext';
                			node.visit = 1;
	                	}
	                	else if (node.visit == 1)
	                	{
	                		this.group = '';
	                		this.sysparams[this.current_ids].groupxpath = '';
	                		this.stack.pop();
	                		this.state1 = 'listnext';
	                	}
	                	break;
	                case 'dict':
	                	if (node.visit == 0)   //собираем параметры
	                	{
	                		node.listvals = [];
	                        this.stack.push({type: 'arr', nodes: node.params, listi: -1});
	                        this.state1 = 'listnext';
	                        node.visit = 1;
	                	}
	                	else
	                	{
	                		var value = {};
	                		var idname = {};
	                		for (var i=0; i<node.listvals.length; i++)
	                		{
	                			if (node.listvals[i].keytype == 'dict' || node.listvals[i].keytype == 'array')
	                				throw this.execError(Lang.t('Неверный тип ключа словаря'), 
	    	                				node.line, node.column, node.start, node.length);
	                			value[node.listvals[i].keyvalue] = node.listvals[i].value;
	                			idname[node.listvals[i].keyvalue] = node.listvals[i].idname;
	                		}
	                		this.ret = {};
	                		this.ret.value = value;
	                		this.ret.type = 'dict';
	                		this.ret.idname = idname;
	                		this.stack.pop();
	                		this.state1 = 'listsave';
	                	}
	                	break;
	                case 'array':
	                	if (node.visit == 0)   //собираем параметры
	                	{
	                		node.listvals = [];
	                        this.stack.push({type: 'arr', nodes: node.params, listi: -1});
	                        this.state1 = 'listnext';
	                        node.visit = 1;
	                	}
	                	else
	                	{
	                		var value = [];
	                		var idname = [];
	                		for (var i=0; i<node.listvals.length; i++)
	                		{
	                			value.push(node.listvals[i].value);
	                			idname.push(node.listvals[i].idname);
	                		}
	                		this.ret = {};
	                		this.ret.value = value;
	                		this.ret.type = 'array';
	                		this.ret.idname = idname;
	                		this.stack.pop();
	                		this.state1 = 'listsave';
	                	}
	                	break;
	                case 'nameval':  // =>
	                	if (node.visit == 0)     //обрабатываем ключ массива
	                	{
	                		node.key.visit = 0;
	                    	node.key.listvals = [];
	                    	this.stack.push({type: 'obj', nodes: node.key});
	                        node.visit = 1;
	                	}
	                	else if (node.visit == 1)    //обрабатываем значение массива
	                	{
	                		node.keyvalue = this.ret;
	                		node.val.visit = 0;
	                		node.val.listvals = [];
	                		this.stack.push({type: 'obj', nodes: node.val});
	                		node.visit = 2;
	                	}
	                	else if (node.visit == 2)    //сохраняем ключ и значение в ret
	                	{
	                		var val = this.ret;
	                		this.ret = {};
	                		this.ret.type = val.type;
	                		this.ret.value = val.value;
	                		this.ret.idname = val.idname;
	                		this.ret.keytype = node.keyvalue.type;
	                		this.ret.keyvalue = node.keyvalue.value;
	                		node.visit = 2;
	                		this.stack.pop();
	                    	this.state1 = 'listsave';
	                	}
	                	break;
	                case 'logicand':
	                case 'logicor':
	                case 'logic==':
	                case 'logic!=':
	                case 'logic>':
	                case 'logic<':
	                case 'logic>=':
	                case 'logic<=':
	                	if (node.visit == 0)
	                	{
	                		node.left.visit = 0;
	                		node.left.listvals = [];
	                		this.stack.push({type: 'obj', nodes: node.left});
	                		node.visit = 1;
	                	}
	                	else if (node.visit == 1)
	                	{
	                		node.left.ret = {}; 
	                		$.extend(true, node.left.ret, this.ret);
	                		node.right.visit = 0;
	                		node.right.listvals = [];
	                		this.stack.push({type: 'obj', nodes: node.right});
	                		node.visit = 2;
	                	}
	                	else if (node.visit == 2)
	                	{
	                		node.right.ret = {};
	                		$.extend(true, node.right.ret, this.ret);
	                		if (node.left.ret.type=='array' || node.left.ret.type=='dict'
	                			|| node.right.ret.type=='array' || node.right.ret.type=='dict')
	                			throw this.execError(Lang.t('Операнд логического выражения не может быть массивом или словарем'), 
	                					node.line, node.column, node.start, node.length);
	                		this.ret = {};
	                		this.ret.type = 'float';
	                		var val = false;
	                		switch (node.type) {
	                			case 'logicand':
	                				val = node.left.ret.value && node.right.ret.value;
	                				break;
	                			case 'logicor':
	                				val = node.left.ret.value || node.right.ret.value;
	                				break;
	                			case 'logic==':
	                				val = node.left.ret.value == node.right.ret.value;
	                				break;
	                			case 'logic!=':
	                				val = node.left.ret.value != node.right.ret.value;
	                				break;
	                			case 'logic>':
	                				val = node.left.ret.value > node.right.ret.value;
	                				break;
	                			case 'logic<':
	                				val = node.left.ret.value < node.right.ret.value;
	                				break;
	                			case 'logic>=':
	                				val = node.left.ret.value >= node.right.ret.value;
	                				break;
	                			case 'logic<=':
	                				val = node.left.ret.value <= node.right.ret.value;
	                				break;
	                		}
	                		this.ret.value = (val) ? 1 : 0;
	                		this.stack.pop();
	                    	this.state1 = 'listsave';
	                	}
	                	break;
	                case 'logic!':
	                	if (node.visit == 0)
	                	{
	                		node.left.visit = 0;
	                		node.left.listvals = [];
	                		this.stack.push({type: 'obj', nodes: node.left});
	                		node.visit = 1;
	                	}
	                	else if (node.visit == 1)
	                	{
	                		var a = {};
	                		$.extend(true, a, this.ret);
	                		if (a.type=='array' || a.type=='dict')
	                			throw this.execError(Lang.t('Операнд логического выражения не может быть массивом или словарем'), 
	                					node.left.line, node.left.column, node.left.start, node.left.length);
	                		this.ret = {};
	                		this.ret.type = 'float';
	                		var val = (a.value) ? true : false;
	                		this.ret.value = (!val) ? 1 : 0;
	                		this.stack.pop();
	                    	this.state1 = 'listsave';
	                	}
	                	break;
	                case 'plus':
	                case 'minus':
	                case 'mult':
	                case 'div':
	                case 'mod':
	                case 'concat':
	                	if (node.visit == 0)
	                	{
	                		node.left.visit = 0;
	                		node.left.listvals = [];
	                		this.stack.push({type: 'obj', nodes: node.left});
	                		node.visit = 1;
	                	}
	                	else if (node.visit == 1)
	                	{
	                		node.left.ret = {}; 
	                		$.extend(true, node.left.ret, this.ret);
	                		node.right.visit = 0;
	                		node.right.listvals = [];
	                		this.stack.push({type: 'obj', nodes: node.right});
	                		node.visit = 2;
	                	}
	                	else if (node.visit == 2)
	                	{
	                		node.right.ret = {};
	                		$.extend(true, node.right.ret, this.ret);

	                		if (node.left.ret.type == 'dict' || node.right.ret.type == 'dict')
	                			throw this.execError(Lang.t('Операнд выражения не может быть словарем'), 
	                					node.left.line, node.left.column, node.left.start, node.left.length);
	                		
	                		var operand;
	                		if (node.type == 'plus')
	                			operand = '+';
	                		else if (node.type == 'minus')
	                			operand = '-';
	                		else if (node.type == 'mult')
	                			operand = '*';
	                		else if (node.type == 'div')
	                			operand = '/';
	                		else if (node.type == 'mod')
	                			operand = '%';
	                		else if (node.type == 'concat')
	                			operand = '.';
	                		
	                		this.ret = {};
	                		var val = this.funcs.evalOp(node.left.ret.value, node.right.ret.value, operand);
	                		
	                		if (val instanceof Array)
	                			this.ret.type = 'array';
	                		else if (typeof val == 'string')
	                			this.ret.type = 'string';
	                		else if (typeof val == 'number')
	                			this.ret.type = 'float';
	                		
	                		this.ret.value = val;
	                		this.stack.pop();
	                    	this.state1 = 'listsave';
	                	}
	                	break;
	                case 'unaryminus':
	                	if (node.visit == 0)
	                	{
	                		node.left.visit = 0;
	                		node.left.listvals = [];
	                		this.stack.push({type: 'obj', nodes: node.left});
	                		node.visit = 1;
	                	}
	                	else if (node.visit == 1)
	                	{
	                		var a = {};
	                		$.extend(true, a, this.ret);
	                		if (a.type == 'dict')
	                			throw this.execError(Lang.t('Операнд выражения не может быть словарем'), 
	                					node.left.line, node.left.column, node.left.start, node.left.length);
	                		
	                		var val = this.funcs.evalUnaryMinusOp(a.value);
	                		
	                		this.ret = {};
	                		if (val instanceof Array)
	                			this.ret.type = 'array';
	                		else if (typeof val == 'number')
	                			this.ret.type = 'float';
	                		
	                		this.ret.value = val;
	                		this.stack.pop();
	                    	this.state1 = 'listsave';
	                	}
	                	break;
	                	break;
	                case 'program':
	                    if (node.visit == 0)  //начало программы
	                    {
	                    	GlobalVars = new VarTableClass();
	                    	node.listvals = [];
	                        this.stack.push({type: 'arr', nodes: node.body, listi: -1});
	                        this.state1 = 'listnext';
	                        this.ids.push({});
	                        this.sysparams.push({nestingloadpage: false, loadpagenum: 0});
	                        this.current_ids++;
	                        node.visit = 1;
	                    }
	                    else   //конец программы
	                    {
	                    	if (this.pages_list)
	                    		this.pages_list.current = 0;
	                    	this.pause = false;
	                        cycle = false;
	                    }
	                    break;
	                case 'funcdecl':
	                	this.funcdecl.add(node.value, node, HtmlFrames.activeFrame);
	                	this.stack.pop();
	                	this.state1 = 'listnext';
	                	break;
	                case 'return':
	                	if (node.visit == 0)
	                	{
	                		node.expr.visit = 0;
	                		node.expr.listvals = [];
	                		this.stack.push({type: 'obj', nodes: node.expr});
	                		node.visit = 1;
	                	}
	                	else if (node.visit == 1)
	                	{
	                		var i = this.stack.length-2;
		                	var funcfind = false;
		                	while (i >= 0)
		                	{
		                		if (this.stack[i].type == 'obj'
		            	            && this.stack[i].nodes.type == 'func')
		            	        {
		                			this.stack.splice(i+1, this.stack.length-i-1);
		            	        	funcfind = true;
		                			break;
		            	        }
		                		i--;
		                	}
		                	if (!funcfind)
		                	{
		                		throw this.execError(Lang.t('return допустимо только внутри функции'), 
	                					node.line, node.column, node.start, node.length);
		                		this.stack.pop();
		                	}
	                		
		                	this.state1 = 'listnext';
	                	}
	                	break;
	            }
	        }
	    }
	},
	execHooks: function(node, type, value)
	{
		if (type != 'array' && type != 'dict' && node.hooks.length > 0)
		{
			console.log(type);
			throw this.execError(Lang.t('Значение переменной не является массивом или словарем'), 
					node.line, node.column, node.start, node.length);
		}

		var idname = node.value;
		if ((type=='dict' || type=='array') && node.hooks.length > 0)
		{
			for (var i=0; i<node.listvals.length; i++)
			{
				if (!(value instanceof Object || value instanceof Array) )
					throw this.execError(Lang.t('Словарь или массив имеет меньшую размерность'), 
        					node.line, node.column, node.start, node.length);
					
				var key = node.listvals[i];
				if (key.type == 'array' || key.type == 'dict')
					throw this.execError(Lang.t('Тип индекса словаря или массива не может быть словарем или массивом'), 
        					node.line, node.column, node.start, node.length);
				value = value[key.value];
				idname += '['+value2output(key.value)+']';
				
				//if (value == undefined)
					//throw this.execError(Lang.t('Нет элемента с ключом {val}', {val: key.value}), 
        					//node.line, node.column, node.start, node.length);
			}
			if (value == undefined) type = 'string';
			else if (typeof value == 'string')  type = 'string';
			else if (typeof value == 'number') type = 'float';
			else if (typeof value == 'object')  type = 'dict';
		}

		var ret = {};
		ret.type = type;  
		ret.value = value;
		ret.idname = idname;
		return ret;
	},
	execLoadpage: function(node, index, params, passparams)
	{
		var idname = {};
		var defvals = {};
						
		var url = '';
		if (params[0].type == 'string')
		{
			url = params[0].value;
			idname.url = params[0].idname;
			defvals.url = params[0].value;
		}
		else if (params[0].type == 'array')
		{
			var isfind = false; 
			for (var i=0; i<params[0].value.length; i++)
			{
				url = params[0].value[i];
				if (url && typeof url == 'string')
				{
					idname.url = params[0].idname;
					defvals.url = params[0].value;
					isfind = true;
					break;
				}
			}
			if (!isfind)
			{
				this.output += Lang.t('Массив, переданный в качестве первого параметра loadpage, имеет только пустые значения')+' line:'+node.line+' column:'+node.column+'\n';
				return false;
				//throw this.execError(Lang.t('Массив, переданный в качестве первого параметра loadpage, имеет только пустые значения'), 
				//		node.line, node.column, node.start, node.length);
			}
		}
		else
			throw this.execError(Lang.t('Значение первого параметра loadpage должно быть строкой или массивом строк'), 
						node.line, node.column, node.start, node.length);
		
		var method = 'get';
		if (params.length > 1)
			if (params[1].type == 'string')
			{
				method = params[1].value;
				idname.method = params[1].idname;
				defvals.method = params[1].value;
			}
			else
				throw this.execError(Lang.t('Значение второго параметра loadpage должно быть строкой'), 
						params[1].line, params[1].column, params[1].start, params[1].length);
		
		var postparams = {};
		if (params.length > 2)
		{
			if (params[2].type == 'dict')
			{
				postparams = params[2].value;
				idname.params = params[2].idname;
				defvals.params = params[2].value;
			}
			else throw this.execError(Lang.t('Третий параметр loadpage должен быть словарем'), 
						params[2].line, params[2].column, params[2].start, params[2].length);
		}
		
		var enc = 'UTF-8';
		if (params.length > 3)
		{
			if (params[3].type == 'string')
			{
				enc = params[3].value;
				idname.encoding = params[3].idname;
				defvals.encoding = params[3].value;
			}
			else throw this.execError(Lang.t('Четвертый параметр loadpage должен быть строкой'), 
					params[3].line, params[3].column, params[3].start, params[3].length);
		}
		
		var headers = [];
		if (params.length > 4)
		{
			if (params[4].type == 'array')
			{
				headers = params[4].value;
				idname.headers = params[4].idname;
				defvals.header = params[4].value;
			}
			else throw this.execError(Lang.t('Пятый параметр loadpage должен быть массивом'), 
					params[4].line, params[4].column, params[4].start, params[4].length);
		}
		
		if (this.current_ids == 0)
		{
			var additp = {passparams: passparams, idname: idname, defvals: defvals, astnode: node};
			this.pages_list.add(url, method, postparams, enc, headers, additp);
			this.cur_page = this.pages_list.get();
			this.cur_page.exp = [];
			this.pages_list.addObjVert(this.cur_page);
			loadpage(false, this.cur_page.url, this.cur_page.type, this.cur_page.params, this.cur_page.encoding, this.cur_page.index);
		}
		else if (this.current_ids > 0 && params[0].idname == undefined)
		{
			var additp = {passparams: passparams, idname: idname, defvals: defvals, astnode: node};
			this.cur_page = this.pages_list.get().links.add(null, url, method, postparams, enc, headers, additp);
			this.cur_page.exp = [];
			this.pages_list.addObj(this.cur_page);
			loadpage(false, this.cur_page.url, this.cur_page.type, this.cur_page.params, this.cur_page.encoding, this.cur_page.index);
		}
		else if (params[0].idname != undefined) 
		{
			var additp = {passparams: passparams, idname: idname, defvals: defvals, astnode: node};
			this.pages_list.get().links.add(params[0].idname, url, method, postparams, enc, headers, additp);
			this.cur_page = this.pages_list.get().links.get(params[0].idname);
			this.cur_page.exp = [];
			this.pages_list.loadLink(params[0].idname);
			loadpage(false, this.cur_page.url, this.cur_page.type, this.cur_page.params, this.cur_page.encoding, this.cur_page.index);
		}
		return true;
	},
	execSubmitform: function(node, index, params, passparams)
	{
		var idname = {};
		var defvals = {};
		
		var form = {};
		if (params[0].type != 'dict')
			throw this.execError(Lang.t('Первый параметр submitform должен быть словарем с параметрами формы'), 
					params[0].line, params[0].column, params[0].start, params[0].length);
		form = params[0].value;
		idname.form = params[0].idname;
		defvals.form = params[0].value;
		
		if (!form['form'] || form['form']['action'] == undefined
				|| form['form']['method'] == undefined || form['xpath'] == undefined)
			throw this.execError(Lang.t('Неправильно заданы параметры формы'), 
					params[0].line, params[0].column, params[0].start, params[0].length);
				
		var enc = 'UTF-8';
		if (params.length > 1)
		{
			if (params[1].type == 'string')
			{
				enc = params[1].value;
				idname.encoding = params[1].idname;
				defvals.encoding = params[1].value;
			}
			else throw this.execError(Lang.t('Второй параметр submitform должен быть строкой'), 
					params[1].line, params[1].column, params[1].start, params[1].length);
		}
		
		var headers = [];
		if (params.length > 2)
		{
			if (params[2].type == 'array')
			{
				headers = params[2].value;
				idname.headers = params[2].idname;
				defvals.headers = params[2].value;
			}
			else throw this.execError(Lang.t('Третий параметр submitform должен быть массивом'), 
					params[2].line, params[2].column, params[2].start, params[2].length);
		}
		
		var url = form['form']['action'];
		
		postparams = {};
		$.extend(true, postparams, form['params'], form['paramsnew']);
		for (name in postparams)
		{
			if (postparams[name] instanceof Array)
			{
				var arr = [];
				for (var i=0; i<postparams[name].length; i++)
					if (postparams[name][i] !== false)
						arr.push(postparams[name][i]);
				postparams[name] = arr;
			}
			else
				if (postparams[name] === false)
					delete postparams[name]; 
		}
		
		var name = params[0].idname;
		var addit = {passparams: passparams, idname: idname, defvals: defvals, astnode: node};
		this.pages_list.get().links.add(name, url, form['form']['method'], postparams, enc, headers, addit);
		this.cur_page = this.pages_list.get().links.get(name);
		this.cur_page.exp = [];
		//this.cur_page.index = index;
		this.pages_list.loadLink(name);
		loadpage(false, this.cur_page.url, this.cur_page.type, this.cur_page.params, this.cur_page.encoding, this.cur_page.index);
	},
	execGetFuncs: function(node)
	{
		var ruletype, type, value = [];
		var idname = node.value;
		var idleft = node.idleft;
		var params = node.listvals;
		
		var idnameobj = {};
		var defvals = {};
		
		if (idname.toLowerCase()=='getlink') ruletype = 'link';
		else if (idname.toLowerCase()=='gettext') ruletype = 'text';
		else if (idname.toLowerCase()=='getimglink') ruletype = 'image';
		else if (idname.toLowerCase()=='gethtml') ruletype = 'html';
		
		if (this.current_ids < 1)
			throw this.execError(Lang.t('{name} допустимо только внутри loadpage', {name: idname.toLowerCase()}),
					node.line, node.column, node.start, node.length);
							
		if (params.length < 1 || params.length > 2)
			throw this.execError(Lang.t('{name} требует один или два параметра', {name: idname.toLowerCase()}),
					node.line, node.column, node.start, node.length);
		if (params[0].type != 'string')
			throw this.execError(Lang.t('Первый параметр {name} должен быть строкой', {name: idname.toLowerCase()}),
					params[0].line, params[0].column, params[0].start, params[0].length);
		idnameobj.path = params[0].idname;
		defvals.path = params[0].value;
		
		var opt = {};
		if (params.length == 2)
		{
			if (params[1].type != 'dict')
				throw this.parseError(Lang.t('Второй параметр {name} должен быть словарем', {name: idname.toLowerCase()}),
						params[1].line, params[1].column, params[1].start, params[1].length);
			opt = params[1].value;
			idnameobj.opt = params[1].idname;
			defvals.opt = params[1].value;
		}
		
		if (idleft!=undefined && idleft!='')
		{
			funcfind = false;
			var i = this.stack.length-2;
			while (i>=0)
			{
				if (this.stack[i].type == 'obj' && this.stack[i].nodes.type == 'func')
    	        {
    	        	funcfind = true;
        			break;
    	        }
        		i--;
			}
			
			if ((opt.html == undefined || this.cur_page.type == 'html') && !funcfind)
			{
				var index = this.sysparams[this.current_ids].ruleindex++; 
				this.cur_page.rules.addWithPath(idleft, ruletype, params[0].value, true, index);
				var r = this.cur_page.rules.getByName(idleft);
				r.group = this.group;
				for (var i in r.options)
					if (typeof r.options[i] == 'boolean')
						r.options[i] = false;

				if (opt.html)
					r.options.html = opt.html;
				if (opt.next)
				{
					r.options.next = true;
					r.options.origtype = opt.nextoriginaltype;
				}
				if (opt.nodeonly)
					r.options.nodeonly = true;
				if (opt.word > 0)
				{
					r.options.word = opt.word;
					r.options.wordend = (opt.wordend && opt.wordend>0) ? opt.wordend : 0;
				}
				if (opt.decode)
					r.options.decode = true;
				if (opt.replace)
					r.options.replace = opt.replace;
				if (opt.join)
				{
					r.options.implode = true;
					r.options.implodestr = opt.join;
				}
				
				if (this.group == '' && !this.cur_page.groups.getByName(''))
					this.cur_page.groups.add('', null, this.sysparams[this.current_ids].groupindex++);
				
				r.idname = idnameobj;
				r.defvals = defvals;
				r.astnode = TreeUtils.getParentStatement(node);
				r.astnode.ruleref = r;
			}
			
			if (this.sysparams[this.current_ids].groupxpath != '')
				opt.group = this.sysparams[this.current_ids].groupxpath;
			
			value = this.funcs.getFunc(params[0].value, opt, ruletype);
		}
		type = 'array';
		return {type: type, value: value};
	},
	execGetAttrFunc: function(node)
	{
		var idname = 'getattr';
		var params = node.listvals;
		var value = [];

		if (this.current_ids < 1)
			throw this.execError(Lang.t('{name} допустимо только внутри loadpage', {name: idname.toLowerCase()}),
					node.line, node.column, node.start, node.length);
		if (params.length != 2)
			throw this.execError(Lang.t('{name} требует два параметра', {name: idname.toLowerCase()}),
					node.line, node.column, node.start, node.length);
		if (params[0].type != 'string')
			throw this.parseError(Lang.t('Первый параметр {name} должен быть строкой', {name: idname.toLowerCase()}),
					params[0].line, params[0].column, params[0].start, params[0].length);
		
		var opt = {};
		if (params.length == 2)
		{
			if (params[1].type != 'dict')
				throw this.parseError(Lang.t('Второй параметр {name} должен быть словарем', {name: idname.toLowerCase()}),
						params[1].line, params[1].column, params[1].start, params[1].length);
			opt = params[1].value;
			if (this.sysparams[this.current_ids].groupxpath != '')
				opt.group = this.sysparams[this.current_ids].groupxpath;
		}
		
		if (opt.attr != undefined)
		{
			var nodes = this.funcs.nodesOfGetFunc(params[0].value, opt);
			for (var i=0; i<nodes.length; i++)
			{
				if (opt.next)
				{
					var nextnode = nodes[i].nextSibling;
					while (nextnode && nextnode.nodeType != 1)
						nextnode = nextnode.nextSibling;
					node = nextnode; 
				}
				else
					node = nodes[i];
				
				var attr = $(node).attr(opt.attr);
				if (attr)
				{
					if (opt.replace)
						attr = attr.replace(this.funcs.stringToRegExp(opt.replace[0]), opt.replace[1]);
					value.push(attr);
				}
				else
					value.push('');
			}
		}
		
		return {type: 'array', value: value};
	},
	execGetFormFunc: function(node)
	{
		var idname = 'getform';
		var params = node.listvals;
		var value = {};
		
		var idnameobj = {};
		var defvals = {};
		
		if (this.current_ids < 1)
			throw this.execError(Lang.t('{name} допустимо только внутри loadpage', {name: idname.toLowerCase()}),
					node.line, node.column, node.start, node.length);
		if (params.length < 1 || params.length > 2)
			throw this.execError(Lang.t('{name} требует один или два параметра', {name: idname.toLowerCase()}),
					node.line, node.column, node.start, node.length);
		if (params[0].type != 'string')
			throw this.parseError(Lang.t('Первый параметр {name} должен быть строкой', {name: idname.toLowerCase()}),
					params[0].line, params[0].column, params[0].start, params[0].length);
		
		idnameobj.path = params[0].idname;
		defvals.path = params[0].value;
		
		var opt = {};
		if (params.length == 2)
		{
			if (params[1].type != 'dict')
				throw this.parseError(Lang.t('Второй параметр {name} должен быть словарем', {name: idname.toLowerCase()}),
						params[1].line, params[1].column, params[1].start, params[1].length);
			opt = params[1].value;
			idnameobj.opt = params[1].idname;
			defvals.opt = params[1].value;
			if (this.sysparams[this.current_ids].groupxpath != '')
				opt.group = this.sysparams[this.current_ids].groupxpath;
		}
		
		var nodes = this.funcs.nodesOfGetFunc(params[0].value, opt);
		if (nodes[0])
		{
			if (nodes[0].nodeName.toLowerCase() != 'form')
				throw this.parseError(Lang.t('Xpath в {name} должен ссылаться на форму', {name: idname.toLowerCase()}),
						params[1].line, params[1].column, params[1].start, params[1].length);
			
			//выполняем функцию
			value['xpath'] = params[0].value;			
			var fattrs = {}; 
			for (var i=0; i<nodes[0].attributes.length; i++)
				fattrs[nodes[0].attributes[i].name] = nodes[0].attributes[i].value;
			if (fattrs['method'] == undefined) fattrs['method'] = 'get';
			fattrs['action'] = nodes[0].action; 
			value['form'] = fattrs;
			
			var fparams = {};
			var ftypes = {};
			$('input, select, textarea', nodes[0]).each(function(i, el) {
				if (el.hasAttribute('name'))
				{
					var type;
					if (el.nodeName.toLowerCase() == 'input')
						type = el.hasAttribute('type') ? el.getAttribute('type') : 'text';
						else if (el.nodeName.toLowerCase() == 'select')
							type = 'select';
						else if (el.nodeName.toLowerCase() == 'textarea')
							type = 'textarea';
					ftypes[el.getAttribute('name')] = type;
					
					var name = el.getAttribute('name');
					var val;
					if (type == 'checkbox')
					{
						if ($(el).prop('checked'))
						{
							if (el.hasAttribute('value'))
								val = el.getAttribute('value');
							else
								val = $(el).prop('checked');
						}
						else
							val = false;
					}
					else if (type == 'radio')
					{
						if ($(el).prop('checked'))
							val = el.value;
					}
					else
						val = el.value;
					
					if (val != undefined)
					{
						if (name.search(/\[\]/) != -1)
						{
							if (fparams[name] == undefined)
								fparams[name] = [];
							fparams[name].push(val);
						}
						else
							fparams[name] = val;
					}
				}
			});
			value['params'] = fparams;
			value['paramsnew'] = {};
			value['types'] = ftypes;
			
			var fselect = {};
			var fselect2 = {};
			$('select', nodes[0]).each(function(i, el) {
				var options = {};
				var options2 = {};
				$('option', el).each(function(i, el) {
					options[$(el).text()] = el.value;
					options2[el.value] = $(el).text();
				});
				fselect[el.getAttribute('name')] = options;
				fselect2[el.getAttribute('name')] = options2;
			});
			value['select'] = fselect;
			value['select2'] = fselect2;
			
			funcfind = false;
			var i = this.stack.length-2;
			while (i>=0)
			{
				if (this.stack[i].type == 'obj' && this.stack[i].nodes.type == 'func')
    	        {
    	        	funcfind = true;
        			break;
    	        }
        		i--;
			}
			
			//добавляем правила
			if (node.idleft && node.idleft != '' && !funcfind)
			{
				var r = this.pages_list.get().rules.addWithPath(node.idleft, 'form', params[0].value, true);
				r.group = this.group;
				r.paramsnew = {};
				$.extend(true, r.paramsnew, value['paramsnew']);
				r.formsetparam = {};
				r.astnode = (node.parent.node.type == 'assign') ? node.parent.node : undefined;
				r.idname = idnameobj;
				r.defvals = defvals;
				
				for (var i in r.options)
					if (typeof r.options[i] == 'boolean')
						r.options[i] = false;
				if (opt.html)
					r.options.html = opt.html;
			}
		}

		return {type: 'dict', value: value};
	},
	execFormFuncs: function(node)
	{
		var idname = node.value.toLowerCase();
		var params = node.listvals;
		var type = 'string';
		var value = '';

		if (idname == 'formgetparam')
		{
			if (params.length != 2)
				throw this.execError(Lang.t('{name} требует два параметра', {name: idname}),
						node.line, node.column, node.start, node.length);
		}
		else if (params.length != 3)
			throw this.execError(Lang.t('{name} требует три параметра', {name: idname}),
					node.line, node.column, node.start, node.length);
		
		if (params[0].type != 'dict')
			throw this.execError(Lang.t('Первый параметр {name} должен быть словарем, возвращенным getform', {name: idname}),
					node.line, node.column, node.start, node.length);
		
		if (params[0].value['xpath'] == undefined || params[0].value['form'] == undefined
				|| params[0].value['params'] == undefined)
			throw this.execError(Lang.t('Первый параметр {name} должен быть словарем, возвращенным getform', {name: idname}),
					node.line, node.column, node.start, node.length);
		
		if (idname == 'formgetparam')
		{
			type = 'string';
			if (params[0].value['params'][params[1].value] == undefined)
				throw this.parseError(Lang.t('Форма не содержит параметр {name}', {name: params[1].value}),
						node.line, node.column, node.start, node.length);
			value = (params[0].value['paramsnew'][params[1].value] == undefined) ? params[0].value['params'][params[1].value] : params[0].value['paramsnew'][params[1].value]; 
		}
		else if (idname == 'formsetparam')
		{
			if (params[2].type != 'string' && params[2].type != 'float')
				throw this.parseError(Lang.t('Параметр формы может быть только строкой или числом'),
						node.line, node.column, node.start, node.length);
			params[0].value['paramsnew'][params[1].value] = params[2].value; 
			type = 'float';
			value = 1;

			var rulename = params[0].idname;
			if (typeof rulename == 'string') 
			{
				var r = this.pages_list.get().rules.getByName(rulename);
				if (r) 
				{
					var idname1 = {form: params[0].idname, name: params[1].idname, value: params[2].idname};
					var defvals = {form: params[0].value, name: params[1].value, value: params[2].value};
					r.formsetparam[params[1].value] = {astnode: node, idname: idname1, defvals: defvals};
				}
			}
		}
		else if (idname == 'formgetselectkey')
		{
			type = 'string';
			value = params[0].value['select'][params[1].value][params[2].value];
		}
		else if (idname == 'formgetselectvalue')
		{
			type = 'string';
			value = params[0].value['select2'][params[1].value][params[2].value];
		}
		
		return {type: type, value: value};
	},
	execGetRegexpFunc: function(node)
	{
		var idname = 'getregexp';
		var params = node.listvals;
		var idleft = node.idleft;
		var value = [];
		var idname1 = {};
		var defvals = {};

		if (this.current_ids < 1)
			throw this.execError(Lang.t('{name} допустимо только внутри loadpage', {name: idname.toLowerCase()}),
					node.line, node.column, node.start, node.length);
		if (params.length<1 || params.length>2)
			throw this.execError(Lang.t('{name} требует один или два параметра', {name: idname.toLowerCase()}),
					node.line, node.column, node.start, node.length);
		if (params[0].type != 'string')
			throw this.parseError(Lang.t('Первый параметр {name} должен быть строкой', {name: idname.toLowerCase()}),
					params[0].line, params[0].column, params[0].start, params[0].length);
		
		idname1.path = params[0].idname;
		defvals.path = params[0].value;
		
		var opt = {};
		if (params.length == 2)
		{
			if (params[1].type != 'dict')
				throw this.parseError(Lang.t('Второй параметр {name} должен быть словарем', {name: idname.toLowerCase()}),
						params[1].line, params[1].column, params[1].start, params[1].length);
			opt = params[1].value;
			idname1.opt = params[1].idname;
			defvals.opt = params[1].value;
		}
		
		var funcfind = false;
		var i = this.stack.length-2;
		while (i>=0)
		{
			if (this.stack[i].type == 'obj' && this.stack[i].nodes.type == 'func')
	        {
	        	funcfind = true;
    			break;
	        }
    		i--;
		}
		
		if (idleft!=undefined && idleft!='' && !funcfind)
		{
			var r = this.cur_page.rules.addWithPath(idleft, 'regexp', params[0].value, true);
			if (r)
			{
				r.group = this.group;
				var resultind = opt.resultind ? opt.resultind : 0;
				r.options.resultind = resultind;
				r.options.html = opt.html ? opt.html : undefined;
		
				var doc = document.getElementById(HtmlFrames.activeFrame).contentWindow.document;
				var html = opt.html ? opt.html : doc.documentElement.outerHTML;
				var value = this.funcs.preg_match_all(params[0].value, html);
		  
				value = value[resultind];
				if (!value) value = [];
				
				if (opt.replace)
					for (var i=0; i<value.length; i++)
						value[i] = value[i].replace(this.funcs.stringToRegExp(opt.replace[0]), opt.replace[1]);
				
				r.idname = idname1;
				r.defvals = defvals;
				r.astnode = node.parent.node;
			}
		}
		
		return {type: 'array', value: value};
	},
	execStoreFunc: function(node)
	{
		var idname1 = {};
		var defvals = {};
		
		if (node.listvals.length != 3)
			throw this.execError(Lang.t('{name} требует три параметра', {name: node.value}),
					node.line, node.column, node.start, node.length);
					
		/*if (node.listvals[0].type != 'string')
			throw this.execError(Lang.t('Первый параметр store должен быть строкой'), 
					node.line, node.column, node.start, node.length);
				*/
		var param1 = node.listvals[0].value;
		idname1.name = node.listvals[0].idname;
		defvals.name = node.listvals[0].value;

		/*if (node.listvals[1].type != 'string')
			throw this.execError(Lang.t('Второй параметр store должен быть строкой'), 
					node.line, node.column, node.start, node.length);*/
		var filename = node.listvals[1].value;
		idname1.filename = node.listvals[1].idname;
		defvals.filename = node.listvals[1].value;
		
		idname1.params = node.listvals[2].idname;
		defvals.params = node.listvals[2].value;
		
		var exp = ExportRules.get(param1);
		if (!exp)
			throw this.execError(Lang.t('Профиль экспорта {name} не существует', {name: param1}), 
					node.line, node.column, node.start, node.length);
		
		funcfind = false;
		var i = this.stack.length-2;
		while (i>=0)
		{
			if (this.stack[i].type == 'obj' && this.stack[i].nodes.type == 'func')
	        {
	        	funcfind = true;
    			break;
	        }
    		i--;
		}
		
		var curexp;
		if (this.current_ids > 0 && !funcfind)
		{
			if (exp.type == 'csv' || exp.type == 'excel')
			{
				if (node.listvals[2].type != 'array')
					throw this.execError(Lang.t('Третий параметр store для экспорта {name} должен быть массивом', {name: param1}), 
							node.line, node.column, node.start, node.length);

				curexp = new PageExportClass(param1, exp.type, filename);
				if (node.idleft)
				{
					var gl = node.parent.node.directiv['@global'] ? '@global ' : '';
					curexp.retvarname = gl+node.idleft;
				}

				var idname = node.listvals[2].idname;
				var val = node.listvals[2].value;
				for (var i=0; i<idname.length; i++)
				{
					if (idname[i])
						curexp.add(idname[i]);
					else
						curexp.addConst(value2output(val[i]));
					//var r = this.cur_page.rules.getByName(idname[i]);
					//if (r) r.options.store = true;
				}
			}
			else
			{
				if (node.listvals[2].type != 'dict')
					throw this.execError(Lang.t('Третий параметр store для экспорта {name} должен быть словарем', {name: param1}), 
							node.line, node.column, node.start, node.length);

				curexp = new PageExportClass(param1, exp.type, filename);
				if (node.idleft)
				{
					var gl = node.parent.node.directiv['@global'] ? '@global ' : '';
					curexp.retvarname = gl+node.idleft;
				}

				var varnames = ExportRules.getParams(param1);
				var arr = {};
				if (exp.type == 'rdb')
					for (var i in varnames)
						arr[i] = false;
				else
					for (var i=0; i<varnames.length; i++)
						arr[varnames[i]] = false;

				var idname = node.listvals[2].idname;
				var val = node.listvals[2].value;
				for (var varname in idname)
				{
					if (varnames[varname] instanceof Object && idname[varname] instanceof Array)
						curexp.add(idname[varname][0], varname);
					else if (!idname[varname])
						curexp.addConst(value2output(val[varname]), varname);
					else
						curexp.add(idname[varname], varname);
					
					//var r = this.cur_page.rules.getByName(idname[varname]);
					//if (r) r.options.store = true;
					var res = varname.match(/^(.+?)\*?$/);
					if (arr[res[1]] == undefined)
						throw this.execError(Lang.t('В экспорте {name} нет параметра {name2}', {name: param1, name2: varname}), 
								node.line, node.column, node.start, node.length);
					arr[varname] = true;
				}

				for (var varname in arr)
					if (!arr[varname] && !arr[varname+'*'])
						curexp.add(null, varname);
			}
			
			curexp.idname = idname1;
			curexp.defvals = defvals;
			
			if (node.idleft)
			{
				curexp.astnode = node.parent.node;
				
				//ищем инициализацию переменной
				if (curexp.astnode.directiv['@global'])
				{
					var cur = curexp.astnode;
					while (cur && !(cur.type == 'loadpage' || cur.type == 'submitform' || cur.type == 'foreach'))
						cur = cur.parent.node;
					var lp = cur.parent.node;
					var retvarname = node.idleft.match(/^(.+?)(\[.*\])*$/)[1];
					for (var i=cur.parent.chind-1; i>=0; i--)
						if (lp.body[i].type == 'assign' && lp.body[i].left.value == retvarname
								&& (lp.body[i].right.type == 'array' || lp.body[i].right.type == 'string'))
						{
							curexp.retvarname_node = lp.body[i];
							break;
						}
				}
			}
			else
				curexp.astnode = node;
			
			this.cur_page.exp.push(curexp);
		}
		
		var value = '';
		var type = 'string';
		if (exp.type == 'rdb')
		{
			value = this.funcs.maketable(node.listvals[2].value);
			type = 'array';
		}
		
		return {type: type, value: value};
	},
	execStorefileFunc: function(node)
	{
		var idname = node.listvals[0].idname;
    	var r = this.cur_page.rules.getByName(idname);
    	if (r && (r.type == 'image' || r.type == 'link'))
    	{
    		r.options.storefile = true;
    		r.storefile_astnode = node;
    	}
    	
    	if (node.listvals[1] && r)
    	{
    		r.storefileidname2 = node.listvals[1].idname;
    		r.storefileparam2 = node.listvals[1].value; 
    	}
    	
    	return {type: 'array', value: []};
	},
	execContFunc: function(node)
	{
		if (this.current_ids < 1)
			throw this.execError(Lang.t('continue допустимо только внутри loadpage'),
					node.line, node.column, node.start, node.length);
		
		var idname = node.listvals[0].idname;
		var r = this.cur_page.rules.getByName(idname);

		if (r && r.type == 'link')
    	{
    		r.options.cont = true;
    		r.cont_astnode = node;
    	}
    	
    	if (node.listvals.length == 2)
    	{
    		r.contparams = {};
    		r.contparams.idname = node.listvals[1].idname;
    		r.contparams.value = node.listvals[1].value;
    	}
    	
    	return {type: 'string', value: ''};
	},
	execGenUrlFunc: function(node)
	{
		if (node.listvals[0].type != 'string')
			throw this.execError(Lang.t('Первый параметр generateurl должен быть строкой'), 
					node.line, node.column, node.start, node.length);
		var param1 = node.listvals[0].value;
		
		if (node.listvals[1].type != 'dict')
			throw this.execError(Lang.t('Второй параметр generateurl должен быть словарем'), 
					node.line, node.column, node.start, node.length);
		var param2 = node.listvals[1].value;
		
		var parname = param1.match(/\{\w+\}/g);
		var par = {};
		for (var i=0; i<parname.length; i++)
		{
			var pn = parname[i].substring(1, parname[i].length-1);
			if (param2[pn] !== undefined)
			{
				if (typeof param2[pn] == 'string')
				{
					var matches = param2[pn].match(/(\d+)\.\.(\d+)(\,\d+)?/);
					if (matches.length > 2)
					{
						startstr = matches[1];
						var iszero = false;
						if (startstr[0] == '0' && startstr[1] != undefined)
						{
							iszero = true;
							startstr = startstr.substring(1);
						}
						val_start = parseInt(startstr, 10);
						val_end = parseInt(matches[2], 10);
						val_step = (matches[3] !== undefined) ? parseInt(matches[3].substring(1), 10) : 1;
						
						len = matches[2].length;
						
						valarr = [];
						for (var j=val_start; j<=val_end; j+=val_step)
							if (iszero)
							{
								s = j.toString();
								ilen = s.length;
								strzero = '';
								for (var k=ilen; k<len; k++)
									strzero += '0';
								valarr.push(strzero+s);
							}
							else
							{
								valarr.push(j.toString());
							}
						
						par[pn] = valarr;
					}
				}
				else if (typeof param2[pn] == 'object')
				{
					par[pn] = param2[pn]; 
				}
				else
					throw this.execError(Lang.t('Неправильно задан второй параметр generateurl'), 
							node.line, node.column, node.start, node.length);
			}
			else
				throw this.execError(Lang.t('Шаблон generateurl содержит незаданный параметр {name}', {name: par[i]}), 
						node.line, node.column, node.start, node.length);
		}
		
		var inc = function(counters, ind, end)
		{
			var el = counters[ind];
			el.i++;
			if (el.i >= el.count)
			{
				el.i = 0;
				if (ind > 0)
					inc(counters, ind-1, end);
				else
					end.flag = true;
			}
		},
		
		//инициализируем счетчики
		counters = [];
		for (name in par)
		{
			el = {};
			if (par[name] instanceof Array)
				el.count = par[name].length;
			else if (par[name] instanceof Object)
		    {
				var arr = par[name];
				var num = 0;
				for (var name2 in arr)
					num++;
				el.count = num;
		    }
			else
				el.count = 1;
			el.i = 0;
			el.name = name;
			counters.push(el);
		}
		
		var result = [];
		while (true)
		{
			//получаем очередной элемент
			arr = {};
			for (var i=0; i<counters.length; i++)
			{
				var c = counters[i]; 
				arr[c.name] = par[c.name][c.i];
			}

			//производим необходимые действия
			var str = param1;
			for (name in arr)
			{
				str = str.replace('{'+name+'}', arr[name]);
			}
			result.push(str);
			
			//увеличиваем счетчик
			var isend = {flag: false};
			inc(counters, counters.length-1, isend);
			if (isend.flag) break;
		}
		
		return {type: 'array', value: result};
	},
	execConcatFunc: function(node)
	{
		if (node.listvals[0].type != 'string' && node.listvals[0].type != 'array')
			throw this.execError(Lang.t('Первый параметр concat должен быть строкой или массивом'), 
					node.line, node.column, node.start, node.length);
		var type1 = node.listvals[0].type;
		var param1 = node.listvals[0].value;
		
		if (node.listvals[1].type != 'string' && node.listvals[1].type != 'array')
			throw this.execError(Lang.t('Второй параметр concat должен быть строкой или массивом'), 
					node.line, node.column, node.start, node.length);
		var type2 = node.listvals[1].type;
		var param2 = node.listvals[1].value;
		
		if (type1 == 'string' && type2 == 'string')
		{		
			var result = param1+param2;
			return {type: 'string', value: result};
		}
		else if (type1 == 'array' && type2 == 'array')
		{
			var len;
			if (param1.length > param2.length)
				len = param1.length;
			else
				len = param2.length;
			
			var result = [];
			for (var i=0; i<len; i++)
			{
				var str1 = (param1[i] === undefined) ? '' : param1[i]; 
				var str2 = (param2[i] === undefined) ? '' : param2[i];
				result[i] = str1+str2;
			}
			return {type: 'array', value: result};
		}
		else if (type1 == 'array' && type2 == 'string')
		{
			var result = [];
			for (var i=0; i<param1.length; i++)
				result[i] = param1[i] + param2;
			return {type: 'array', value: result};
		}
		else if (type1 == 'string' && type2 == 'array')
		{
			var result = [];
			for (var i=0; i<param2.length; i++)
				result[i] = param1 + param2[i];
			return {type: 'array', value: result};
		}
	},
	createPageDict: function()
	{
		var page = {};
		var url = this.pages_list.get().url;
		var method = this.pages_list.get().type;
		var params = this.pages_list.get().params;

		if (method.toLowerCase() == 'get')
		{
			var paramsstr = '';
			var num = 0;
        	for (var name in params)
        	{
        		paramsstr += '&'+encodeURIComponent(name)+'='+encodeURIComponent(params[name]);
        		//paramsstr += '&'+name+'='+params[name];
        		num++;
        	}
        	if (num > 0)
        	{
        		paramsstr = paramsstr.substring(1, paramsstr.length);
        		var char = (url.indexOf('?') != -1) ? '&' : '?';
       			url += char+paramsstr;
        	}
		}
		page.url = url;
		
		var matches = url.match(/((http\:\/\/|https\:\/\/)?[\w\-\.]+)\/?/);
		if (matches != null)
			page.domain = matches[1]+'/';
		else
			page.domain = '';
		
		var doc = document.getElementById(HtmlFrames.activeFrame).contentWindow.document;
		page.encoding = $('meta[name="OriginalEncoding"]', doc).attr('content');
		
		page.page = doc.documentElement.outerHTML;
		
		//page.headers = '';
		
		return page;
	},
	regexpFunc: function(node)
	{
		var idname = 'regexp';
		var params = node.listvals;
		
		if (params.length != 2)
			throw this.execError(Lang.t('{name} требует два параметра', {name: idname.toLowerCase()}),
					node.line, node.column, node.start, node.length);
		if (params[0].type != 'string')
			throw this.execError(Lang.t('Первый параметр {name} должен быть строкой', {name: idname.toLowerCase()}),
					params[0].line, params[0].column, params[0].start, params[0].length);
		
		if (params[1].type != 'string')
			throw this.execError(Lang.t('Второй параметр {name} должен быть строкой', {name: idname.toLowerCase()}),
					params[1].line, params[1].column, params[1].start, params[1].length);
		
		var value = this.funcs.preg_match_all(params[0].value, params[1].value);
		
		return {type: 'array', value: value};
	},
	filtervalueFunc: function(node)
	{
		var params = node.listvals;
		var value;
		
		if (params.length != 3)
			throw this.execError(Lang.t('filter_value требует три параметра'),
					node.line, node.column, node.start, node.length);
		if (params[0].type != 'array' && params[0].type != 'dict')
			throw this.execError(Lang.t('Первый параметр filter_value должен быть массивом или словарем'),
					node.line, node.column, node.start, node.length);
		if (params[1].type != 'string')
			throw this.execError(Lang.t('Второй параметр filter_value должен быть строкой'),
					node.line, node.column, node.start, node.length);
		if (params[2].type != 'string' && params[2].type != 'float')
			throw this.execError(Lang.t('Третий параметр filter_value должен быть строкой или числом'),
					node.line, node.column, node.start, node.length);
		
		if (this.current_ids > 0)
		{
			var idname = node.listvals[0].idname;
			var r = this.cur_page.rules.getByName(idname);
			if (r)
			{
				var astnode = (node.parent.node.type == 'assign') ? node.parent.node : node;  
				r.filter = {type: params[1].value, str: params[2].value, astnode: astnode};
				r.filter.idname = {type: params[1].idname, str: params[2].idname};
				r.filter.defvals = {type: params[1].value, str: params[2].value};
			}
		}
		value = this.funcs.filter_value(params[0].value, params[1].value, params[2].value);
		
		return {type: params[0].type, value: value};
	},
	filterkeyFunc: function(node)
	{
		var params = node.listvals;
		var value;
		
		if (params.length != 3)
			throw this.execError(Lang.t('filter_key требует три параметра'),
					node.line, node.column, node.start, node.length);
		if (params[0].type != 'array' && params[0].type != 'dict')
			throw this.execError(Lang.t('Первый параметр filter_key должен быть массивом или словарем'),
					node.line, node.column, node.start, node.length);
		if (params[1].type != 'string')
			throw this.execError(Lang.t('Второй параметр filter_key должен быть строкой'),
					node.line, node.column, node.start, node.length);
		if (params[2].type != 'string' && params[2].type != 'float')
			throw this.execError(Lang.t('Третий параметр filter_key должен быть строкой или числом'),
					node.line, node.column, node.start, node.length);
		
		var type = params[1].value;
		var param2 = params[2].value;
		if (params[0].type == 'array')
		{
			value = [];
			var array = params[0].value;
			for (var i=0; i<array.length; i++)
			{
				if (type == 'regexp')
				{
					var res = this.funcs.preg_match_all(param2, i.toString());
					if (res.length > 0)
						value[i] = array[i];
				}
				if (type == 'notregexp')
				{
					var res = this.funcs.preg_match_all(param2, i.toString());
					if (res.length == 0)
						value[i] = array[i];
				}
			}
		}
		else if (params[0].type == 'dict')
		{
			value = {};
			var dict = params[0].value;
			for (var i in dict)
			{
				if (type == 'regexp')
				{
					var res = this.funcs.preg_match_all(param2, i.toString());
					if (res.length > 0)
						value[i] = dict[i];
				}
				if (type == 'notregexp')
				{
					var res = this.funcs.preg_match_all(param2, i.toString());
					if (res.length == 0)
						value[i] = dict[i];
				}
			}
		}
		
		return {type: params[0].type, value: value};
	},
	filterequalkeysFunc: function(node)
	{
		var params = node.listvals;
		var num = node.listvals.length;
		
		for (var i=0; i<num; i++)
			if (node.listvals[i].type != 'dict' && node.listvals[i].type != 'array')
				throw this.execError(Lang.t('Параметры filter_eqkeys должны быть массивами или словарями'), 
	    				node.line, node.column, node.start, node.length);
		
		if (this.current_ids > 0)
		{
			var r = this.cur_page.rules.getByName(params[0].idname);
			if (r)
			{
				var grp = r.group;
				var tobrowser = true;
				var isfilter = r.filter != undefined;
				for (var i=1; i<params.length; i++)
				{
					r = this.cur_page.rules.getByName(params[i].idname);
					if (!r || r.group != grp)
					{
						tobrowser = false;
						break;
					}
					if (r.filter)
						isfilter = true;
				}
				
				if (tobrowser && isfilter)
				{
					var group = this.cur_page.groups.getByName(grp);
					group.eqkeys_astnode = node;
				}
			}
		}
		
		var valarr = [];
		for (var i=0; i<params.length; i++)
			valarr.push(params[i].value);
		
		this.funcs.filtereqkeys(valarr);
		
		for (var i=0; i<params.length; i++)
			params[i].value = valarr[i];
		
		return {type: 'float', value: 0};
	},
	maketableFunc: function(node)
	{
		if (node.listvals[0].type != 'dict' && node.listvals[0].type != 'array')
    		throw this.execError(Lang.t('Параметр maketable должен быть массивом или словарем'), 
    				node.line, node.column, node.start, node.length);
		
		var ret = this.funcs.maketable(node.listvals[0].value);
		return {type: 'array', value: ret};
	},
	removetagsFunc: function(node)
	{
		var params = node.listvals;
		var idname = {};
		
		if (params.length != 2)
			throw this.execError(Lang.t('{name} требует два параметра', {name: 'removetags'}),
					node.line, node.column, node.start, node.length);
		if (params[0].type != 'array' && params[0].type != 'string')
			throw this.execError(Lang.t('Первый параметр removetags должен быть массивом или строкой'),
					params[0].line, params[0].column, params[0].start, params[0].length);
		if (params[1].type != 'array')
			throw this.execError(Lang.t('Второй параметр removetags должен быть массивом'),
					params[1].line, params[1].column, params[1].start, params[1].length);
		
		var type = params[0].type;
		var value = this.funcs.removetags(params[0].value, params[1].value);
		
		return {type: type, value: value};
	},
	basename_one: function(str)
	{
		var pos = str.lastIndexOf('/');
		return str.substring(pos+1);
	},
	basenameFunc: function(node)
	{
		var params = node.listvals;
		var value, type;
		
		if (params[0].type != 'array' && params[0].type != 'string')
			throw this.execError(Lang.t('Первый параметр basename должен быть массивом или строкой'),
					params[0].line, params[0].column, params[0].start, params[0].length);
		
		if (params[0].type == 'array')
		{
			var arr = params[0].value;
			type = 'array';
			value = [];
			for (var i=0; i<arr.length; i++)
				value[i] = this.basename_one(arr[i]);
		}
		else
		{
			value = this.basename_one(params[0].value);
			type = 'string';
		}
		return {type: type, value: value};
	},
};
/**ScriptASTExecClass**/




/**SelectedItemsClass**/
function SelectedItemsClass() {
	this.array = new Object();
	this.count = 0;
}

SelectedItemsClass.prototype = {
	add: function(node, name, type, notshow, astnode, index, group) {
		if (group == undefined) group = 'group1';
		var path = createXPathFromElement(node);
		//var path = cssPath(node);
		this.array[name] = {node: node, name: name, type: type, path: path, 
							options: this.defaultOptions(type), group: group,
							idname: {}, defvals: {},
							astnode: astnode,
							index: (index ? index : this.count),
						    };
		this.count++;
		
		if (!notshow)
		{
			addToGroupFilter(group);
			
			var html = HTMLRenderer.render('ruleformatrow', {rule: {name: name,
																	type: type,
																	path: path,
																	group: group},
															 Lang: Lang});
			$('#rulestbl tbody').append(html);
		}
		return this.array[name]; 
    },
    addWithPath: function(name, type, path, notshow, astnode, index, group) {
    	if (group == undefined) group = 'group1';    	
    	this.array[name] = {node: null, name: name, type: type, path: path,
    						options: this.defaultOptions(type), group: group,
    						idname: {}, defvals: {},
    						astnode: astnode,
    						index: (index ? index : this.count),
    						};
    	this.count++;
		
    	if (!notshow)
    	{
    		addToGroupFilter('group1');
    		
    		var html = HTMLRenderer.render('ruleformatrow', {rule: {name: name,
																	type: type,
																	path: path,
																	group: group},
															 Lang: Lang});
    		$('#rulestbl tbody').append(html);
    	}
    	
    	
    	var rule = this.array[name];
    	if (type == 'html')
    	{
        	var nodes = this.getNodesByName(name);
    		$(nodes).on('click.onHtml', function(e) {
    			var l = PagesList.get().links;
    			if (l.isSet(name) && GoLink)
    			{
    				l.get(name).params.content = this.outerHTML;
    				l.get(name).rules.setHtmlOpt(this.outerHTML);
    				PagesList.addObj(l.get(name));
    				var page = PagesList.get();
    				loadpage(false, page.url, page.type, page.params, page.encoding, page.index);
    			}
    		});
    	}
    	
    	return this.array[name];
    },
    deleteByName: function(name) {
    	var r = this.getByName(name);
    	
    	if (r.astnode) TreeUtils.deleteNode(r.astnode);
    	if (r.cont_astnode) TreeUtils.deleteNode(r.cont_astnode);
    	if (r.storefile_astnode) TreeUtils.deleteNode(r.storefile_astnode);
    	
    	if (r.formsetparam)
    		for (var i=0; i<r.formsetparam.length; i++)
    			if (r.formsetparam[i].astnode) 
    				TreeUtils.deleteNode(r.formsetparam[i].astnode);
    	
    	if (r.type == 'html')
    	{
        	var nodes = this.getNodesByName(name);
    		$(nodes).off('click.onHtml');
    	}
    	
    	delete this.array[name];
    	$(elembyruleid(name)).remove();
    },
    getByName: function(name) {
    	return this.array[name];
    },
    getNodesByName: function(name) {
    	var nodes = [];
    	if (this.array[name] && this.array[name].type != 'regexp')
    	{
    		var doc = document.getElementById(HtmlFrames.activeFrame).contentWindow.document;
    		nodes = evaluateXPath(this.array[name].path, doc);
    	}
    	return nodes;
    },
    length: function() {
    	var num = 0;
    	for (var name in this.array)
    		num++;
    	return num;
    },
    defaultOptions: function(type) {
    	var options = {};
    	if (type == 'link')
    	{
    		options.store = true;
    		options.next = false;
    		options.storefile = false;
    		options.cont = false; 
    	}
    	else if (type == 'text')
    	{
    		options.store = true;
    		options.next = false;
    		options.nodeonly = false;
    		options.word = 0;
    		options.wordend = 0;
    		options.decode = false;
    		options.implode = false;
    		options.implodestr = ' ';
    	}
    	else if (type == 'image')
    	{
    		options.store = true;
    		options.storefile = true;
    		options.next = false;
    	}
    	else if (type == 'form')
    	{
    		options.store = false;
    	}
    	else if (type == 'regexp')
    	{
    		options.resultind = 0; 
    	}
    	else if (type == 'html')
    	{
    		options.store = false;
    		options.next = false;
    		options.content = false;
    	}
    	return options;
    },
    getByGroup: function(group) {
    	var arr = {};
    	for (var name in this.array)
    		if (this.array[name].group == group)
    			arr[name] = this.array[name];
    	return arr;
    },
    getGroupsObj: function() {
    	var groups = {};
    	for (var name in this.array)
    		//if (this.array[name].group)
    			groups[this.array[name].group] = true;
    	return groups;
    },
    getSortedArray: function()
    {
    	var rulesarr = [];
		for (var name in this.array)
			rulesarr.push(this.array[name]);
		
		var cmp = function(a, b) {
			if (a.index < b.index)
				return -1;
			if (a.index > b.index)
				return 1;
			return 0;
		};
		rulesarr.sort(cmp);
		return rulesarr;
    },
    setHtmlOpt: function(html)
    {
    	for (var name in this.array)
    		this.array[name].options.html = html;  
    },
};
/**SelectedItemsClass**/

/**GroupsListClass**/
function GroupsListClass() {
	this.array = {};
	this.lastindex = 0;
}

GroupsListClass.prototype = {
	add: function(name, astnode, index)
	{
		if (index == undefined) index = this.lastindex;
		if (index > this.lastindex) this.lastindex = index;
		this.lastindex++;
		this.array[name] = {name: name, astnode: astnode, index: index};
		return this.array[name];
	},
	getByName: function(name)
	{
		return this.array[name];
	},
	getSortedArray: function()
	{
		var groupsarr = [];
		for (var name in this.array)
			groupsarr.push(this.array[name]);
		
		var cmp = function(a, b) {
			if (a.index < b.index)
				return -1;
			if (a.index > b.index)
				return 1;
			return 0;
		};
		groupsarr.sort(cmp);
		return groupsarr;
	},
};
/**GroupsListClass**/



/**VarTableClass**/
function VarTableClass(forpage)
{
	this.array = {};
	if (forpage)
	{
		this.add('pageparams', 'dict', {});
		this.add('passparams', 'dict', {});
	}
}

VarTableClass.prototype = {
	add: function(name, type, value, isrule)
	{
		if (isrule == undefined) isrule = false;
		var obj = {name: name,
				   type: type,
				   value: value,
				   isrule: isrule,
				  };
		this.array[name] = obj;
		return obj;
	},
	get: function(name)
	{
		return this.array[name];
	},
	del: function(name)
	{
		delete this.array[name];
	},
	getSortedArray: function()
	{
		var ret = [];
		for (var name in this.array)
		{
			obj = {};
			$.extend(obj, this.array[name]);
			obj.valstr = value2output(obj.value);
			ret.push(obj);
		}
		
		var cmp = function(a, b)
		{
			if (a.isrule == b.isrule)
			{
				if (a.name > b.name)
					return 1;
				else if (a.name < b.name)
					return -1;
				else
					return 0;
			}
			else if (a.isrule && !b.isrule)
				return -1;
			else
				return 1;
		};
		
		ret.sort(cmp);
		return ret;
	},
};
/**VarTableClass**/



/**PageLinksClass**/
function PageLinksClass(PageListRef) 
{
	this.array = {};
	this.array2 = [];
	this.pageListRef = PageListRef;
}

PageLinksClass.prototype = {
	add: function(name, url, type, params, encoding, headers, additparams) {
		if (type == undefined)  type = 'get';
		if (params == undefined)  params = {};
		if (encoding == undefined) encoding = 'UTF-8';
		if (headers == undefined) headers = [];
		if (additparams == undefined) additparams = {idname: {}, defvals: {}};
		
		var newobj = {url: url,
					  type: type,
					  params: params,
					  rules: new SelectedItemsClass(),
					  links: new PageLinksClass(this.pageListRef),
					  exp: [new PageExportClass('csv', 'csv', 'data')],
					  vars: new VarTableClass(true),
					  groups: new GroupsListClass(),
					  encoding: encoding,
					  headers: headers,
					  additparams: additparams};
		newobj.groups.add('group1');
		
		if (name)
		{
			this.array[name] = newobj;
			this.array2.push(name);
		}
		else
			this.array2.push(newobj);
		
		newobj.index = this.pageListRef.getInd(newobj);
		
		return newobj;
	},
	addObj: function(name, obj) {
		if (name)
			this.array[name] = obj;
		else
			this.array2.push(obj);
		
		obj.index = this.pageListRef.getInd(obj);
	},
	get: function(name) {
		return this.array[name];
	},
	isSet: function(name) {
		return this.array[name] != undefined;
	},
	deleteByName: function(name) {
		delete this.array[name];
		var delarr = [];
		for (var i=0; i<this.array2.length; i++)
			if ((typeof this.array2[i] == 'string') && this.array2[i] == name)
				delarr.push(i);
		
		var offset = 0;
		for (i=0; i<delarr.length; i++)
			this.array2.splice(delarr[i-offset++], 1);
	},
	getByIndex: function(index)
	{
		var obj = this.array2[index];
		if (typeof obj == 'string')
			return this.array[obj];
		else
			return obj;
	},
	getMergedArray: function()
	{
		var retarr = [];
		for (var i=0; i<this.array2.length; i++)
			retarr.push(this.getByIndex(i));
		return retarr;
	},
};
/**PageLinksClass**/


/**PagesListClass**/
function PagesListClass() {
    this.array = [];
    this.current = -1;
    this.array2 = [];
    this.current2 = -1;
}

PagesListClass.prototype = {
	add: function(url, type, params, encoding, headers, additparams) {
		if (type == undefined)  type = 'get';
		if (params == undefined)  params = {};
		if (encoding == undefined) encoding = 'UTF-8';
		if (headers == undefined) headers = [];
		if (additparams == undefined) additparams = {idname: {}, defvals: {}};
		
		if (this.current < this.array.length-1)
			this.array.splice(this.current+1, this.array.length-this.current-1);
		var obj = {url: url,
				   type: type,
				   params: params,
				   rules: new SelectedItemsClass(),
	  			   links: new PageLinksClass(this),
	  			   exp: [new PageExportClass('csv', 'csv', 'data')],
	  			   vars: new VarTableClass(true),
	  			   groups: new GroupsListClass(),
	  			   encoding: encoding,
	  			   headers: headers,
	  			   additparams: additparams};
		obj.groups.add('group1');
		this.array.push(obj);
		this.current++;
		return this.array[this.current]; 
	},
	addObj: function(obj) {
		if (this.current < this.array.length-1)
			this.array.splice(this.current+1, this.array.length-this.current-1);
		this.array.push(obj);
		this.current++;
		return this.array[this.current];
	}, 
	get: function() {
		return this.array[this.current];
	},
	next: function() {
		if (this.current < this.array.length-1)
		{
			this.current++;
			return true;
		}
		else return false; 
	},
	prev: function() {
		if (this.current > 0)
		{
			this.current--;
			return true;
		}
		else return false;
	},
	loadLink: function(name) {
		var curpage = this.get();
		var nextpage = curpage.links.get(name);
		this.addObj(nextpage);
	},
	addObjVert: function(obj) {
		this.array2.push(obj);
		this.current2++;
		obj.index = this.getInd(obj);
	},
	getVert: function(i) {
		return this.array2[i];
	},
	findActivePage: function(whatfind, lp, activeInd)
	{
		var isfind = false;
		for (var i=0; i<lp.links.array2.length; i++)
		{
			var link = lp.links.array2[i];
			if (typeof link == 'string')
				link = lp.links.array[link];
			if (link == whatfind)
			{
				activeInd.splice(0, 0, i);
				isfind = true;
			}
		}
		
		if (!isfind)
		{
			var isfind = false;
			for (var i=0; i<lp.links.array2.length; i++)
			{
				var link = lp.links.array2[i];
				if (typeof link == 'string')
					link = lp.links.array[link];
				if (this.findActivePage(whatfind, link, activeInd))
				{
					isfind = true;
					activeInd.splice(0, 0, i);
					break;
				}
			}
		}
		return isfind;
	},
	getInd: function(page) {
		var Ind = [];
		if (page)
		{
			var isfind = false;
			for (var i=0; i<this.array2.length; i++)
				if (this.array2[i] == page)
				{
					isfind = true;
					Ind.splice(0, 0, i);
					break;
				}
			
			if (!isfind)
			{
				for (var i=0; i<this.array2.length; i++)
					if (this.findActivePage(page, this.array2[i], Ind))
						Ind.splice(0, 0, i);
			}
		}
		return Ind;
	},
	getActiveInd: function() {
		return this.getInd(this.get());
	},
	getByInd: function(ind)
	{
		var page = this.array2[ind[0]];
		for (var i=1; i<ind.length; i++)
		{
			var name = page.links.array2[ind[i]];
			if (typeof name == 'string')
				page = page.links.array[name];
			else
				page = name;
		}
		return page;
	},
};
/**PagesListClass**/



/**PageExportClass**/
function PageExportClass(name, type, filename)
{
	this.name = name;
	this.type = type;
	this.filename = filename;
	if (type == 'csv' || type == 'excel')
	{
		this.array = [];
		this.paramstype = 'array';
		this.vartypes = [];
	}
	else
	{
		this.array = {};
		this.paramstype = 'dict';
		this.vartypes = {};
	}
	this.retvarname = undefined;
	this.idname = {};
	this.defvals = {};
}

PageExportClass.prototype = {
	add: function(rulename, varname) {
		if (this.type == 'csv' || this.type == 'excel')
		{
			this.array.push(rulename);
			this.vartypes.push('var');
		}
		else if (varname)
		{
			this.array[varname] = rulename;
			this.vartypes[varname] = 'var';
		}
	},
	addConst: function(value, varname)
	{
		if (this.type == 'csv' || this.type == 'excel')
		{
			this.array.push(value);
			this.vartypes.push('const');
		}
		else if (varname)
		{
			this.array[varname] = value;
			this.vartypes[varname] = 'const';
		}
	},
	delByRulename: function(rulename) {
		if (this.type == 'csv' || this.type == 'excel')
		{
			var pos = -1;
			for (var i=0; i<this.array.length; i++)
				if (this.array[i] == rulename)
				{
					pos = i;
					break;
				}
			if (pos != -1)
			{
				this.array.splice(pos, 1);
				this.vartypes.splice(pos, 1);
			}
		}
		else
		{
			for (var name in this.array)
				if (this.array[name] == rulename)
				{
					this.array[name] = null;
					this.vartypes[name] = null;
					break;
				}
		}
	},
	delByVarname: function(varname) {
		if (this.type != 'csv' && this.type != 'excel')
		{
			delete this.array[varname];
		}
	},
	length: function() {
		if (this.type == 'csv' || this.type == 'excel')
			return this.array.length;
		else
		{
			var len = 0;
			for (var name in this.array)
				if (this.array[name])
					len++;
			return len;
		}
	},
	objForAjax: function()
	{
		var obj = {name: this.name, type: this.type, filename: this.filename,
					retvarname: this.retvarname, paramstype: this.paramstype};
		return obj;
	},
};
/**PageExportClass**/



/**HtmlCacheClass**/
function HtmlCacheClass()
{
	this.cache = {};
}

HtmlCacheClass.prototype = {
	hashparams: function(url, method, params, encoding, headers)
	{
		var str = url;
		if (method)
			str += method;
		if (params && !valequal(params, {}))
			str += value2output(params);
		if (encoding)
			str += encoding;
		if (headers && headers.length > 0)
			str += value2output(headers);
		return hashCode(str);
	},
	find: function(url, method, params, encoding, headers)
	{
		var hash = this.hashparams(url, method, params, encoding, headers); 
		return this.cache[hash];
	},
	store: function(html, url, method, params, encoding, headers)
	{
		var hash = this.hashparams(url, method, params, encoding, headers);
		this.cache[hash] = {html: html};
		return true;
	},
};
/**HtmlCacheClass**/


/**HtmlFramesClass**/
function HtmlFramesClass()
{
	this.frames = {};
	this.num = 10;
	this.activeFrame = 'html';
}

HtmlFramesClass.prototype = {
	hashparams: function(url, method, params, encoding, headers, index)
	{
		var str = url;
		if (method)
			str += method;
		if (params && !valequal(params, {}))
			str += value2output(params);
		if (encoding)
			str += encoding;
		if (headers && headers.length > 0)
			str += value2output(headers);
		if (index)
			str += index.join(':');
		return hashCode(str);
	},
	getFrameId: function(url, method, params, encoding, headers, index)
	{
		var hash = this.hashparams(url, method, params, encoding, headers, index); 
		return this.frames[hash];
	},
	create: function(url, method, params, encoding, headers, index)
	{
		var hash = this.hashparams(url, method, params, encoding, headers, index);
		var name = 'html'+this.num++;
		
		var $iframe = $('<iframe id="'+name+'" width="99%" height="350" style="display:none"></iframe>');
		$iframe.appendTo('#iframes');
		$('#'+name).on('load', setFrameFunctions);
		
		this.frames[hash] = {id: name};
		this.show(name);
		return name;
	},
	show: function(frameid)
	{
		if (frameid && frameid != this.activeFrame)
		{
			$('#'+this.activeFrame).hide();
			$('#'+frameid).show();
			this.activeFrame = frameid;
		}
	},
};
/**HtmlFramesClass**/


/**HTTPHeadersClass**/
function HTTPHeadersClass()
{
	this.cookies = {};
	this.referer = '';
}

HTTPHeadersClass.prototype = {
	setCookiesFromPage: function(url, doc)
	{
		var matches = url.match(/(?:http\:\/\/|https\:\/\/)?(?:www\.)?([\w\-\.]+)\/?/i);
		var domain = matches[1];
		var _context = this;
		
		$('meta[name="Set-Cookie"]', doc).each(function(i, el) {
			var cookstr = $(el).attr('content');
			//var matches = cookstr.match(/(.+)=([^;]+)(?:;\s)?/i);
			var matches = cookstr.split('; ')[0].match(/(.+?)=(.+)/i);
			if (matches != null)
			{
				if (_context.cookies[domain] == undefined)
					_context.cookies[domain] = {};
				_context.cookies[domain][matches[1]] = matches[2];
			}
		});
	},
	getCookiesStrForSite: function(url)
	{
		var matches = url.match(/(?:http\:\/\/|https\:\/\/)?(?:www\.)?([\w\-\.]+)\/?/i);
		var domain = matches[1];
		
		var str = '';
		if (this.cookies[domain] != undefined)
		{
			for (var name in this.cookies[domain])
				str += '; '+name+'='+this.cookies[domain][name];
			str = str.substring(2);
		}
		
		return str;		
	},
	getLocationFromPage: function(doc)
	{
		var loc = $('meta[name="Location"]', doc).attr('content');
		var url = loc;
		if (loc)
		{
			if (loc.search(/^(http\:\/\/|https\:\/\/)/i) == -1)
			{
				if (loc[0] == '/')
					url = loc.substring(1);

				var currenturl = $('#url').val(); //PagesList.get().url;
				var matches = currenturl.match(/((?:http\:\/\/|https\:\/\/)?[\w\-\.]+)\/?/i);
				if (matches != null)
					url = matches[1]+'/'+url;
			}
		}
		return url;
	}
};
/**HTTPHeadersClass**/

