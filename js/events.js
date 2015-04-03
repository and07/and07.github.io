/***main-index.js***/
$(document).ready(function() {
/*
	$('a.create').click(function(e) {
		e.preventDefault();
		$('#createModal').modal('show');
	});

	$('a.delete').click(function(e) {
		e.preventDefault();
		$('#deleteModal').find('#ok-del-btn').attr('href', $(this).attr('href'));
		$('#deleteModal').modal('show');
	});
	
	$('#deleteModal').find('#ok-del-btn').click(function() {
		location.href = $(this).attr('href');
	});
*/
	$('.popup').draggable({handle: '.popup-title'});
	$('.popup:not(#helper) .close').click(function() {
	   	$(this).parent().parent().parent().fadeOut('slow');
	   	
	   	if (SetIntervalID != -1)
	   		clearInterval(SetIntervalID);
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
	
	$('#btnrun').click(runclick);
	$('#btnstop').click(runclick);
	
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

/***main-index.js***/

/***main-rules.js***/

$(document).ready(function() {




    $('#html').on('load', setFrameFunctions);
	//$('#'+HtmlFrames.activeFrame).contents().find('html').html(DEF_TPL)
	//document.getElementById(HtmlFrames.activeFrame).src = "data:text/html;charset=utf-8," + DEF_TPL;
	var iframe = document.getElementById('html');
	iframe.contentWindow.contents = DEF_TPL;
	iframe.src = 'javascript:window.contents';
	
    HTMLRenderer = ECT({root: ECTTemplates});
    
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
    
    //обработчики кнопок
    $('#seltext').click(function() {
    	SelectText = true; GoLink = false; SelectLink = false; SelectImage = false;
    	SelectHTML = false; 
    });

    $('#golink').click(function() {
		PARSE_SETTING.golink = true;
    	//SelectText=false; GoLink = true; SelectLink = false; SelectImage = false;
    	//SelectHTML = false;
    	/*pushBtnFunction(this, 
                function() { GoLink = true; },
                function() { GoLink = false; }
        );*/
    });
    
    $('#sellink').click(function() {
    	SelectText=false; GoLink = false; SelectLink = true; SelectImage = false;
    	SelectHTML = false;
        /*pushBtnFunction(this, 
                function() { SelectLink = true; },
                function() { SelectLink = false; }
        );
        */
    });
    
    $('#selimg').click(function() {
    	SelectText=false; GoLink = false; SelectLink = false; SelectImage = true;
    	SelectHTML = false;
    });
    
    $('#selhtml').click(function() {
    	SelectText=false; GoLink = false; SelectLink = false; SelectImage = false;
    	SelectHTML = true;
    });
    //обработчики кнопок end
    
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
    
    /*$.xpath('//div[@id="test"]/*[position()=1]').each(function(i, el) {
    	selectBorder(el, 'text', null, false);
    });*/
    initxpath(window, document);
    /*$('#testbtn').click(function() {
    	var nodes = evaluateXPath('//div[@id="test"]/div[@class="test1"][2]', document);
        for (var i=0; i<nodes.length; i++)
        	$(nodes[i]).css('border', '3px dashed red');
    });
    */
});

/***main-rules.js***/


/***main-rules2.js***/

$(document).ready(function() {
	//$('#script').resizable({maxWidth: $('#tabScript').parent().width()-20});
	
	disBrowser = $('#tabScript input[name="disablebrowser"]').prop('checked');
	
	$('#script-container').height($(window).height()-120);
	
	$('#script').keyup(function(e) {
		linecolumnEvent(this);
		//$('#divtest').text(this.selectionStart);
    });
	
	$('#script').mouseup(function(e) {
		linecolumnEvent(this);
	});

	textarea = document.getElementById('script');
	funcsdef = {'loadpage': {name: 'loadpage',
		 					 params: [{name: 'url'},
		 					          {name: 'method', def: 'get', types: ['get', 'post']},
		 					          {name: 'params', def: {}, types: [{}] },
		 					          {name: 'encoding', def: 'UTF-8', types: ['UTF-8', 'windows-1251']},
		 					          {name: 'headers', def: [], types: [[]] }
		 					          ],
		 					 helpurl: HelpUrl+'func/loadpage'
         					},
				'gettext': {name: 'gettext', 
	  					    params: [{name: 'xpath'},
	                                 {name: 'options', def: {}, types: [{}] }
								    ],
							helpurl: HelpUrl+'func/gettext'
							},
			    'getlink': {name: 'getlink',
			    			params: [{name: 'xpath'},
                                     {name: 'options', def: {}, types: [{}] }
							        ],
							helpurl: HelpUrl+'func/getlink'
							},
				'getimglink': {name: 'getimglink',
				    		   params: [{name: 'xpath'},
	                                     {name: 'options', def: {}, types: [{}] }
								        ],
							   helpurl: HelpUrl+'func/getimglink'
							  },
				'getregexp': {name: 'getregexp',
				   			params: [{name: 'pattern'},
		                             {name: 'options', def: {}, types: [{}] }
							        ],
							helpurl: HelpUrl+'func/getregexp'
							},
				'getattr': {name: 'getattr',
				    		params: [{name: 'xpath'},
	                                 {name: 'options', def: {}, types: [{}] }
							        ],
							helpurl: HelpUrl+'func/getattr'
							},
				'gethtml': {name: 'gethtml',
				    		params: [{name: 'xpath'},
	                                 {name: 'options', def: {}, types: [{}] }
							        ],
					    	helpurl: HelpUrl+'func/gethtml'
							},			
	            'store':    {name: 'store',
							 params: [{name: 'profile'},
		                              {name: 'filename'},
		                              {name: 'params'},
		                              ],
		                     helpurl: HelpUrl+'func/store'
		                     },
		        'storefile': {name: 'storefile',
						   	  params: [{name: 'link'},
			                           {name: 'filename'}
							          ],
							  helpurl: HelpUrl+'func/storefile'
							  },
			    'continue': {name: 'continue',
							 params: [{name: 'link'},
				                      {name: 'param', def: {} }
							         ],
							 helpurl: HelpUrl+'func/continue'
							},
				'dump': {name: 'dump',
					 	 params: [{name: 'var' }],
					     helpurl: HelpUrl+'funcs.dump'
						},
				'generateurl': {name: 'generateurl',
					 			params: [{name: 'pattern'},
					 			         {name: 'params' }
					 					],
					 			helpurl: HelpUrl+'func/generateurl'
								},
				'concat': {name: 'concat',
					 	   params: [{name: 'param1'},
					 	            {name: 'param2'}
					         		],
					       helpurl: HelpUrl+'func/concat'
						   },
				'regexp': {name: 'regexp',
					 	   params: [{name: 'pattern'},
					 	            {name: 'subject'}
					         		],
					       helpurl: HelpUrl+'func/regexp'
						   }, 
			    'filter_key': {name: 'filter_key',
					 		   params: [{name: 'data'},
					 			        {name: 'type', types: ['regexp', 'notregexp'] },
					 			        {name: 'str'}
					 			    	],
					 		   helpurl: HelpUrl+'func/filterkey'
							   },
				'filter_value': {name: 'filter_value',
					 			 params: [{name: 'data'},
					 			          {name: 'type', types: ['equal', 'notequal', 'regexp', 'notregexp', 'condition']},
					 			          {name: 'str'}
					 			  		  ],
					 			 helpurl: HelpUrl+'func/filtervalue'
								 },
				'filter_eqkeys': {name: 'filter_eqkeys',
		 		     			  params: [{name: 'p1'},
		 			  			           {name: 'p2'},
		 			  			           {name: '...'},
		 			  			           {name: 'pn'}
		 			  			           ],
		 			  			  helpurl: HelpUrl+'func/filtereqkeys'
					 			  },
			    'count': {name: 'count',
	     			  	  params: [{name: 'param'}],
			  			  helpurl: HelpUrl+'func/count'
		 			  	 },
		 	    'maketable': {name: 'maketable',
   			  	  			  params: [{name: 'params'}],
   			  	  			  helpurl: HelpUrl+'func/maketable'
 			  	 			 },
 			  	'store_table': {name: 'store_table',
		  	  			  		params: [{name: 'profile'},
		  	  			  				 {name: 'filename'},
		  	  			  				 {name: 'params'},
		  	  			  				],
		  	  			  		helpurl: HelpUrl+'func/storetable'
			  	 			 	},
			  	'dbconnect': {name: 'dbconnect',
	  			  			  params: [{name: 'host'},
  	  			  				       {name: 'user'},
  	  			  				       {name: 'password'},
  	  			  				       {name: 'dbname'},
  	  			  				      ],
  	  			  			  helpurl: HelpUrl+'func/dbconnect'
	  	 			 		 },
	  	 	    'dbfind': {name: 'dbfind',
		  			  	   params: [{name: 'connection'},
			  				        {name: 'table'},
			  				        {name: 'attrs'},
			  				        {name: 'condition', def: ''},
			  				        {name: 'params', def: {}},
			  				       ],
			  			   helpurl: HelpUrl+'func/dbfind'
	 			 		   },
	 			'dbinsert': {name: 'dbinsert',
	  			  	   		 params: [{name: 'connection'},
		  				              {name: 'table'},
		  				              {name: 'attrs'},
		  				             ],
		  				     helpurl: HelpUrl+'func/dbinsert'
	 						},
	 			'dbupdate': {name: 'dbupdate',
			  	   		 	 params: [{name: 'connection'},
			  	   		 	          {name: 'table'},
			  	   		 	          {name: 'attrs'},
			  	   		 	          {name: 'whereattrs'},
			  	   		 	          ],
			  	   		 	 helpurl: HelpUrl+'func/dbupdate'
 							 },
 				'dbdelete': {name: 'dbdelete',
	  	   		 	 		 params: [{name: 'connection'},
	  	   		 	 		          {name: 'table'},
	  	   		 	 		          {name: 'whereattrs'},
	  	   		 	 		          ],
	  	   		 	 		 helpurl: HelpUrl+'func/dbdelete'
						 	},
				'dbclose': {name: 'dbclose',
	   		 	 		 	params: [{name: 'connection'}],
	   		 	 		 	helpurl: HelpUrl+'func/dbclose'
					 	   },
	            'mail': {name: 'mail',
		 	 		 	 params: [{name: 'to'},
		 	 		 	          {name: 'subject'},
		 	 		 	          {name: 'message'},
		 	 		 	          ],
   		 	 		 	 helpurl: HelpUrl+'func/mail'
				 	    },
				'getform': {name: 'getform',
		    			    params: [{name: 'xpath'},
                                     {name: 'options', def: {}, types: [{}] }
					                ],
			    	        helpurl: HelpUrl+'func/getform'
					        },
		        'submitform': {name: 'submitform',
					 		   params: [{name: 'form'},
					 		            {name: 'encoding', def: 'UTF-8' },
					 		            {name: 'headers', def: [], types: [[]] }
					 		            ],
					 		   helpurl: HelpUrl+'func/submitform'
 							  },
 			    'formgetparam': {name: 'formgetparam',
			 		   			 params: [{name: 'form'},
			 		   			          {name: 'name'},
			 		   			          ],
			 		   			 helpurl: HelpUrl+'func/formgetparam'
						  		},
				'formsetparam': {name: 'formsetparam',
				 		   		 params: [{name: 'form'},
				 		   		          {name: 'name'},
				 		   		          {name: 'value'},
				 		   		          ],
				 		   		 helpurl: HelpUrl+'func/formsetparam'
							  	},
				'formgetselectkey': {name: 'formgetselectkey',
					 		   		 params: [{name: 'form'},
					 		   		          {name: 'name'},
					 		   		          {name: 'text'},
					 		   		          ],
					 		   		 helpurl: HelpUrl+'func/formgetselectkey'
								  	},
				'formgetselectvalue': {name: 'formgetselectvalue',
	 		   		 				   params: [{name: 'form'},
	 		   		 				            {name: 'name'},
	 		   		 				            {name: 'key'},
	 		   		 				            ],
	 		   		 				   helpurl: HelpUrl+'func/formgetselectvalue'
				  					  },
				'removetags': {name: 'removetags',
		 				   	   params: [{name: 'html'},
	   		 				            {name: 'tags'},
	   		 				            ],
	   		 				   helpurl: HelpUrl+'func/removetags',
	  					  	  },
	  		    'basename': {name: 'basename',
				   	   		 params: [{name: 'path'}],
		 				     helpurl: HelpUrl+'func/basename',
					  	    },
			};
	hinter = new CodeCompletionClass(textarea, funcsdef);
	decorator = hinter.decorator;
	
	// detect all changes to the textarea,
	// including keyboard input, cut/copy/paste, drag & drop, etc
	if( textarea.addEventListener ){
		// standards browsers: oninput event
		textarea.addEventListener("input", onScriptChange, false);
	} else {
		// MSIE: detect changes to the 'value' property
		textarea.attachEvent( "onpropertychange",
			function(e){
				if( e.propertyName.toLowerCase() === 'value' ){
					onScriptChange();
				}
			}
		);
	}
	
	Keybinder.bind(textarea, {'Ctrl-Y': deleteLine});
	Keybinder.bind(document, {'Alt-S': rulessave});
	
	var iserror = checkErrorFromUrl();
	
	$('#script').tabby({tabString: '    ', func: decorator.update});
	
    $('#sidetabs a[data-toggle="tab"]').on('shown', function (e) {
    	if (e.target.id == 'tab-browser')
    	{
    		tabBrowserClick();
    	}
        /*if (e.target.id == 'tab-browser' && isParseFinish==2 && ASTExec && !ASTExec.pause) // activated tab
        {
        	isParseFinish = 3;
        	var page = PagesList.get();
			loadpage(false, page.url, page.type, page.params, page.encoding);
        }*/
        /*if (e.target.id == 'tab-browser' && showScriptTab)  
        {
        	showScriptTab = false;
        	$('#tab-script').tab('show');
        }*/
        //e.relatedTarget // previous tab
    });
    
    $('input[name="disablebrowser"]').click(function() {
    	disBrowser = $(this).prop('checked');
    	SetNotSaved();
    });
    
    Lang = new Translate();
    
    if (!iserror && !disBrowser && $('#script').val() != '')
	{
		//showLoadingProcess();
		//parsetest2();
	}
    else if (!iserror && !disBrowser && $('#script').val() == '')
    {
    	IsSaved = false;
    	loadpage(true, $('#url').val());
    }
});

/***main-rules2.js***/


/***main-rules3.js***/

$(document).ready(function() {
	ExportRules.load();
	
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
	
	$('#tabXML #exportTemplateHead').tabby({tabString: '    '});
	$('#tabXML #exportTemplateBody').tabby({tabString: '    '});
	$('#tabXML #exportTemplateTail').tabby({tabString: '    '});
	
	$('#tabSQL #exportTemplateHead').tabby({tabString: '    '});
	$('#tabSQL #exportTemplateBody').tabby({tabString: '    '});
	$('#tabSQL #exportTemplateTail').tabby({tabString: '    '});
	
	$('#tabExcel #exportTemplateHead').tabby({tabString: '    '});
	
	var rdbtypes = '';
	RDBFlat = {};
	for (var name in RDBExportTypes)
	{
		rdbtypes += '<option value="'+name+'">'+name+'</option>';
		RDBFlat[name] = {};
		rdb2flat(RDBExportTypes[name], RDBFlat[name]);
	}
	$('#tabRDB #exportRDBType').append(rdbtypes);
	
	$('#exportRDBType').click(function() {
		var tbl = RDBFlat[this.value];
		var str = '';
		for (var name in tbl)
			str += '<option value="'+name+'">'+name+'</option>';
		$('#exportDataset option').remove();
		$('#exportDataset').append(str);
		$('#rdbview').empty().append(rdb2text(RDBExportTypes[this.value]));
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
	
	$('#helper button.btn').click(insertFunc);
	
	var $win = $('#helper');
	$win.css('left', $(window).width()-500);
	$win.css('top', ($(window).height()-$win[0].offsetHeight)/2 - 250);
	
});
/***main-rules5.js***/



