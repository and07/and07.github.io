    LoadTree = new TreeComponentClass(document.getElementById('loadtree-content'), null);
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
    
    HtmlTree = new TreeComponentClass(document.getElementById('htmltree-content'), null);
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
	
	var ExportRules = new ExportRulesClass();
	var TreeUtils = new TreeUtilsClass();
	var ScriptFunctions = new ScriptFunctionsClass();
	var GlobalVars = new VarTableClass();
	var PagesList = new PagesListClass(); 
	var HtmlCache = new HtmlCacheClass();
	var HtmlFrames = new HtmlFramesClass();
	var HTTPHeaders = new HTTPHeadersClass();
	
	
	//http://www.listjs.com/examples/add-get-remove
	var ParseOptions = {
	  valueNames: [ 'id', 'name', 'url', 'date_edit' ],
	  //item: '<tr class="odd"><td class="id"></td><td class="name"></td><td class="url"></td><td class="date_edit" style="width: 180px;"></td><td style="width: 95px"><a style="margin-left: 5px;" class="edit" rel="tooltip" href="#" data-original-title="Редактировать"><i class="icon-edit"></i></a><a style="margin-left: 5px;" rel="tooltip" href="/generate/" data-original-title="Генерировать"><i class="icon-file"></i></a><a style="margin-left: 5px;" onclick="showRunDialog(this);" rel="tooltip" href="#" data-original-title="Управление запуском"><i class="icon-play"></i></a><a style="margin-left: 5px;" onclick="showResultDialog(this);" rel="tooltip" href="#" data-original-title="Результат выполнения"><i class="icon-folder-open"></i></a><a style="margin-left: 5px;" class="delete" rel="tooltip" href="#" data-original-title="Удалить"><i class="icon-remove"></i></a></td></tr>'
	};
	// Init list
	var parseList = new List('parser_list', ParseOptions);
	