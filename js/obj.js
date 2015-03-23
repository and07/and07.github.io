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
	