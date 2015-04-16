
$(document).ready(function() {

	$('.popup').draggable({handle: '.popup-title'});
	$('.popup:not(#helper) .close').click(function() {
	   	$(this).parent().parent().parent().fadeOut('slow');
	});
	
	$(".datepicker" ).datepicker({
		closeText:  "Закрыть",
        dayNames: ["Воскресенье","Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
        dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        firstDay: 1,
        monthNamesShort: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
        monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
		showOn: "button",
		dateFormat: 'yy-mm-dd',
		changeYear:true,
		changeMonth:true,
		buttonImage: 'images/icons/16x16/Calendar.png',
		buttonImageOnly: true
	});
	
	
	$('#runresult #files tbody').on('click', '.folderdown', function() {
		if (this.href.indexOf('#') != -1)
		{
			curdir += '/'+$(this).text();
			var dir = findResultDir(curdir);
			showResultDir(dir);
		}
	});
	
	$('#runresult #files tbody').on('click', '.folderup', function() {
		curdir = curdir.substring(0, curdir.lastIndexOf('/'));
		var dir = findResultDir(curdir);
		showResultDir(dir);
	});
});


$(document).ready(function() {

	var iframe = document.getElementById('html');
	iframe.contentWindow.contents = DEF_TPL;
	iframe.src = 'javascript:window.contents';
	
    
    $.fn.getStyleObject = function(){
        var dom = this.get(0);
        var style;
        var returns = {};
        if(window.getComputedStyle){
            var camelize = function(a,b){
                return b.toUpperCase();
            };
            style = window.getComputedStyle(dom, null);
			if(style && style.length){
				for(var i = 0, l = style.length; i < l; i++){
					var prop = style[i];
					var camel = prop.replace(/\-([a-z])/, camelize);
					var val = style.getPropertyValue(prop);
					returns[camel] = val;
				}
			}
            return returns;
        }
        if(dom.currentStyle){
            style = dom.currentStyle;
            for(var prop in style){
                returns[prop] = style[prop];
            }
            return returns;
        }
        if(style = dom.style){
            for(var prop in style){
                if(typeof style[prop] != 'function'){
                    returns[prop] = style[prop];
                }
            }
            return returns;
        }
        return returns;
    };
    

    
    //подсветка выделенных элементов при наведении курсора на строку таблицы с правилами
    $('#rulestbl tbody').on('mouseover', 'tr', function() {
    	var id = this.id.match(/\-(.+)/);
    	var name = id[1];
    	var nodes = PagesList.get().rules.getNodesByName(name);
    	//$(rule.node).data('oldstyle3', $(rule.node).css('border'));
    	for (var i=0; i<nodes.length; i++)
    	   	$(nodes[i]).css('border', '3px dashed green');
    });
    
    $('#rulestbl tbody').on('mouseout', 'tr', function() {
    	var id = this.id.match(/\-(.+)/);;
    	var name = id[1];
    	var nodes = PagesList.get().rules.getNodesByName(name);
    	for (var i=0; i<nodes.length; i++)
    	   	$(nodes[i]).css('border', '3px dashed red');
    });
    //end подсветка выделенных элементов при наведении курсора на строку таблицы с правилами 
    
    $('#closeModal').find('#yes-close-btn').click(function() {
    	var _self = this;
    	var $loader = $('#closeModal .popup3');
    	$loader.show();
    	rulessave(function(data) {
    		$loader.hide();
    		location.href = $(_self).attr('data-url');
    	});
	});
    
    $('#closeModal').find('#no-close-btn').click(function() {
		location.href = $(this).attr('data-url');
	});
    
    $('#mainmenu a').click(function(e) {
    	e.preventDefault();
    	rulesclose(this.href);
    });
    
    $('#rules-right-btns a').click(function(e) {
    	e.preventDefault();
    	rulesclose(this.href);
    });
    
    $('#pageexport select[name="exportname"]').change(function() {
    	var name = $(this).find('option:selected').val();
    	var ind = $('#pageexport-profile input[name="pageexport-profile-ind"]').val();
    	
   		var exp = ExportRules.get(name);
   		var pageexp = (PagesList.get().exp[ind]) ? PagesList.get().exp[ind] : {};
    		
   		$('#pageexport #divfilename').show();
   		$('#pageexport #divfilename input[name="filename"]').val('');

   		$('#pageexport-profile .label').hide();
   		if (exp.type == 'csv')
   			$('#pageexport-profile #labelcsv').show();
   		else if (exp.type == 'xml')
   			$('#pageexport-profile #labelxml').show();
   		else if (exp.type == 'sql')
   			$('#pageexport-profile #labelsql').show();
   		else if (exp.type == 'excel')
   			$('#pageexport-profile #labelexcel').show();
   		else if (exp.type == 'rdb')
   			$('#pageexport-profile #labelrdb').show();
   		
   		if (exp.type == 'csv' || exp.type == 'excel')
   		{
   			var arr = [];
   			var vartypes = [];
   			if (pageexp.name == name)
   			{
   				arr = pageexp.array;
   				vartypes = pageexp.vartypes;
   				$('#pageexport #divfilename input[name="filename"]').val(pageexp.filename);
   				$('#pageexport-profile #divretvarname input[name="retvarname"]').val(pageexp.retvarname ? pageexp.retvarname : '');
   			}
   			
   			var vars = PagesList.get().vars.getSortedArray();
   			var gvars = GlobalVars.getSortedArray();
   			$('#savearray-table table tr').remove();
   			
   			var html = exportpageformat('array', {array: arr, vartypes: vartypes, rules: vars, global: gvars});
   			$('#savearray-table table').append(html);
   			$('#pageexport #savearray').show();
   			$('#pageexport #savedict').hide();
   		}
   		else
   		{
   			var arr = {};
   			var vartypes = {};
   			if (pageexp.name == name)
   			{
   				arr = pageexp.array;
   				vartypes = pageexp.vartypes;
   				$('#pageexport #divfilename input[name="filename"]').val(pageexp.filename);
   				$('#pageexport-profile #divretvarname input[name="retvarname"]').val(pageexp.retvarname ? pageexp.retvarname : '');
   			}
   			else
   			{
   				var varnames = ExportRules.getParams(name);
   				if (exp.type == 'rdb')
   					for (var i in varnames)
   					{
   						arr[i] = null;
   						vartypes[i] = 'var';
   					}
   				else
   					for (var i=0; i<varnames.length; i++)
   					{
   						arr[varnames[i]] = null;
   						vartypes[varnames[i]] = 'var';
   					}
   			}
   			
   			var vars = PagesList.get().vars.getSortedArray();
   			var gvars = GlobalVars.getSortedArray();
   			$('#savedict-table table tr').remove();
   			
   			var html = exportpageformat('dict', {array: arr, vartypes: vartypes, rules: vars, global: gvars});
   			
   			$('#savedict-table table').append(html);
   			if (exp.type == 'rdb')
				$('#savedict-table table tr td:first-child').click(function() {
					$point = $(this).find('span');
					if ($point.length > 0)
						$point.remove();
					else
						$(this).append('<span title="'+Lang.t('Обновлять')+'">*</span>');
				});
   			
   			$('#pageexport #savearray').hide();
   			$('#pageexport #savedict').show();
   		}
    });
    
    $('#savedict-table table').on('change', 'tr td:nth-child(3) select', function() {
    	if (this.value == '{const}')
    		$(this).parent().find('input').show();
    	else
    		$(this).parent().find('input').hide();
    });
    $('#savearray-table table').on('change', 'tr td:nth-child(2) select', function() {
    	if (this.value == '{const}')
    		$(this).parent().find('input').show();
    	else
    		$(this).parent().find('input').hide();
    });
    
    $('#tabBrowser #url').keypress(function(e) {
    	if ( e.which == 13 ) {
    		loadpage(true, $('#url').val());
    	}
    });
    
    $('#tabBrowser #itemname input[name="name"]').keypress(function(e) {
    	if ( e.which == 13) {
    		setItemName();
    	}
    });
    
    $('#tabBrowser select[name="groupfilter"]').change(function() {
    	var group = $(this).val();
    	if (PagesList.get())
    		rulesshowfilter(PagesList.get().rules, group);
    });
    
    $('#getregexp input[name="pattern"]').keypress(function(e) {
    	if ( e.which == 13 ) {
    		getregexp_exec();
    	}
    });
    
    $('.popup').draggable({handle: '.popup-title'});
    $('.popup:not(#helper) .close').click(function() {
    	$(this).parent().parent().parent().fadeOut('slow');
    });
    $('#htmltree .close').click(function() {
    	cancelHtmlTree();
    });
    
    $('#rules-container').height($(window).height()-$('#html').height()-$('#header').height()-150);
    

    initxpath(window, document);

});

/***main-rules.js***/


/***main-rules2.js***/

$(document).ready(function() {
	//$('#script').resizable({maxWidth: $('#tabScript').parent().width()-20});
	
	var disBrowser = $('#tabScript input[name="disablebrowser"]').prop('checked');
	
	$('#script-container').height($(window).height()-120);
	
	$('#script').keyup(function(e) {
		linecolumnEvent(this);
		//$('#divtest').text(this.selectionStart);
    });
	
	$('#script').mouseup(function(e) {
		linecolumnEvent(this);
	});

	var textarea = document.getElementById('script');

});

/***main-rules2.js***/


/***main-rules3.js***/

$(document).ready(function() {

	
	$('#exportRadio a').click(function() {
		if (this.href.search('#tabCSV') != -1)
			$('#exportedit input[name="exportType"]').val('csv');
		else if (this.href.search('#tabXML') != -1)
			$('#exportedit input[name="exportType"]').val('xml');
		else if (this.href.search('#tabSQL') != -1)
			$('#exportedit input[name="exportType"]').val('sql');
		else if (this.href.search('#tabExcel') != -1)
			$('#exportedit input[name="exportType"]').val('excel');
		else if (this.href.search('#tabRDB') != -1)
			$('#exportedit input[name="exportType"]').val('rdb');
	});
/*	
	$('#tabXML #exportTemplateHead').tabby({tabString: '    '});
	$('#tabXML #exportTemplateBody').tabby({tabString: '    '});
	$('#tabXML #exportTemplateTail').tabby({tabString: '    '});
	
	$('#tabSQL #exportTemplateHead').tabby({tabString: '    '});
	$('#tabSQL #exportTemplateBody').tabby({tabString: '    '});
	$('#tabSQL #exportTemplateTail').tabby({tabString: '    '});
	
	$('#tabExcel #exportTemplateHead').tabby({tabString: '    '});
*/	
	var rdbtypes = '';
	RDBFlat = {};
	/*
	for (var name in RDBExportTypes)
	{
		rdbtypes += '<option value="'+name+'">'+name+'</option>';
		RDBFlat[name] = {};
		rdb2flat(RDBExportTypes[name], RDBFlat[name]);
	}
	*/
	$('#tabRDB #exportRDBType').append(rdbtypes);
	
	$('#exportRDBType').click(function() {
		var tbl = RDBFlat[this.value];
		var str = '';
		for (var name in tbl)
			str += '<option value="'+name+'">'+name+'</option>';
		$('#exportDataset option').remove();
		$('#exportDataset').append(str);
		//$('#rdbview').empty().append(rdb2text(RDBExportTypes[this.value]));
	});
	
	$('#tabRDB #exportRDBType').click();
	$('#tabRDB #exportIssave').change(function() {
		if (this.checked)
			$('#dbparams').show();
		else
			$('#dbparams').hide();
	});	
});
/***main-rules3.js***/


/***main-rules5.js***/
$(document).ready(function() {
	
	$('#helper').draggable({handle: '.tab-content'});
	
	$('#helper .close').click(function() {
		$('#helper').fadeOut('slow');
	});
	
	//$('#helper button.btn').click(insertFunc);
	
	var $win = $('#helper');
	$win.css('left', $(window).width()-500);
	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2 - 250);
	
});
/***main-rules5.js***/



