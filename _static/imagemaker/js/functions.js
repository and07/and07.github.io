// JavaScript Document

jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

function helpviewer (day) //Показываем/прячем пункт посмощи. 
{
	var date = $.cookie('prints_data');
	if (date==null) {
		tabswicher('help_block', 'hbinfo', 0, 'closer');
		$.cookie('prints_data', new Date(), { expires: day}); // Сохраняем количество дней непоказа в куках
				  }
	else {tabswicher('help_block', 'hbinfo', -1, 'closer');}
}


function dropdown (dropid)
		{	
			var timerclose_msec=500;  // Время задержки скрытия части ячейки (в милисекундах - 1сек=1000мсек)
			var clickcount=0;
			
			$('#'+dropid).mouseenter(
									 function () {$(this).stopTime('timer_out');	 });
			
			$('#'+dropid).click(
									 function () { if (clickcount==0) {$('.ddmenu', this).css('visibility','visible').css('z-index','10'); clickcount++;} 
									 						else {$('.ddmenu', this).css('visibility','hidden').css('z-index','1'); clickcount=0;}
														
														}) 
																
			
			$('#'+dropid+' ul li').click(
									 function () { $('#'+dropid+' input').val($(this).text()); });
																								  
			$('#'+dropid).mouseleave(
									function () {
										$(this).oneTime(timerclose_msec,'timer_out', 				
														function () {
															$('.ddmenu', this).css('visibility','hidden').css('z-index','1'); clickcount=0;
															
															});
										});

		}


function swichvisibility(id, mode)
{  
	 if (mode == "dropblock") // Значения селекторов кнопки переключения для выпадающих блоков - должны бить прописаны в CSS
	 {elemisopen = "admsets_isopen_ttl";
	    elemisclose = "admsets_isclose_ttl";}
	 
	 idelement = 'swich'+id; swicher = document.getElementById(idelement);
	 idelement = 'swkey'+id;  ;swkey = document.getElementById(idelement); //alert (swkey.className)
	
	if (swicher.offsetHeight > 0)
		{ swicher.style.display = "none"; swkey.className = elemisclose;}
	else
		{swicher.style.display = "block"; swkey.className = elemisopen;}
}

function swichsize()
{  		
	var attrname='DATA-SWVIS';// имя атрибута который нам нужен
	var startsize = 2.5 // Начальная высота окна (измеряется количеством строк)
	var swichsize = 4 // Конечная высота окна (измеряется количеством строк)
	
	$('['+attrname+']').each(function() {
												  idswichblock = $(this).attr(attrname);
												  tag = $(this).attr('DATA-HEIGHT');
												  swichtext = $(this).attr('DATA-ALTTXT');
												  if (swichsize>$(this).attr('DATA-CR')) {swichsize=$(this).attr('DATA-CR')}
												  normtext = $(this).text();
												  heightrow=$('#'+idswichblock+' '+tag).height();
												  if (heightrow<100){heightrow=$('#'+idswichblock).css('height');
												  					 heightrow=heightrow.replace('px',"")*1-10;
																	 }
												  heightrow	= heightrow	* startsize;	 
												  $('#'+idswichblock).height(heightrow+'px')

	
	$('['+attrname+']').click( 
						function () {
							if ($('#'+idswichblock).height()*1<heightrow/startsize*swichsize)
							   { $('#'+idswichblock).animate ({height:heightrow/startsize*swichsize+10+'px'}, 500);
							   								   $(this).text(swichtext);}
							else
							   { $('#'+idswichblock).animate ({height:heightrow+'px'}, 500); $(this).text(normtext); }
									  
									 }
							  );
							  			}
							)
}

function imgchange()
{	var delay=1500; //ms
	var attrname='DATA-IDGLR';// имя атрибута который нам нужен (его значение - id галереи фонов)
	var attridform='DATA-FORM';// имя атрибута который нам нужен ( его значение - id блока ввода пользователя)
	
	
	var idgaleryblock = $('['+attrname+']').attr(attrname);
	var idformblock = $('['+attrname+']').attr(attridform);
	userautorstart = $('[name=userautor]').val();
	var autorlinevalue = "";
	imglink=$('['+attrname+']').attr('src'); //$('.butsave').attr('href',imglink);

	var radiobutselname='alignobj'; // имя тега name радиопереключателя
	

	var buts_txtalign='txt_align'+$('[name = '+radiobutselname+']').eq(0).val();	// имя css-селектора секции кнопок
																			// горизонтального выравнивания текста
	var buts_txtvalign='txt_valign';//  имя css-селектора секции кнопок вертикального выравнивания текста	
	var buts_txtalign_cur = $('#'+idformblock+' [name = '+buts_txtalign+']').val();
	var buts_txtvalign_cur = $('#'+idformblock+' [name = '+buts_txtvalign+']').val();

	var buts_txtalign_autor = 'txt_align'+$('[name = '+radiobutselname+']').eq(1).val();// имя css-селектора секции кнопок
																						// горизонтального выравнивания автора
	var buts_txtalign_autor_cur = $('#'+idformblock+' [name = '+buts_txtalign_autor+']').val();// Тек знач гор выравн автора
	
	var alignobjcur=radbutton(idformblock, radiobutselname,0); // Текущее значение радиопереключателя
	
	var idsocnetbox='usersocnet'; var buts_socnet = 'sellike_box';
	var buts_socnet_cur=$('#'+idsocnetbox+' [name = '+buts_socnet+']').val();
		
	$('#'+idgaleryblock+' a').click(
						function () {
									  	$('.avw_tabl img').css('borderColor','#FFFFFF');
										$('img ', this).css('borderColor','#FBA927');
										imglink = $('img ', this).attr('src');
										imglink = imglink.slice(0,-5)+imglink.slice(-4);
										$('['+attrname+']='+idgaleryblock).attr('src',imglink);									  
									 }
							  );	
	
	$('#'+idformblock+' [name = userfont]').change(
						function () {	
									  	selectitem =  ($('#'+idformblock+' [name = userfont]').val()); 
										if (selectitem.slice(-4)=="Bold")
													{ fontname=selectitem.slice(0,-5), fontweight='bold';}
											else {fontname=selectitem; fontweight='normal'}
										$('#'+idformblock+' textarea').css('fontFamily',fontname).css('fontWeight',fontweight);
										$('#'+idformblock+' input').css('fontFamily',fontname).css('fontWeight',fontweight);
										$('[name=userautor]').focus(); $('[name=userautor]').blur(); 
										getimage(attrname); 
									 }
							  );
	$('#'+idformblock+' [name = user_lh]').change(	function () {getimage(attrname);});	
	$('#'+idformblock+' [name = user_fs]').change(	function () {getimage(attrname);});	
	$('#'+idformblock+' [name = '+radiobutselname+']').change(
									function () {alignobjcur=radbutton(idformblock, radiobutselname, 600)});
	
	function txtbutton (idblock, cssnameblock, numcurrentkey) // постановка и обработка клика на кнопках параметров текста
	{
		$('#'+idblock+' .'+cssnameblock+' div').each(function(index) { // инициализация - перебор блока кнопок
		cssname = $(this).attr('class'); cssname = cssname.replace('_cur',"");
		if (index==numcurrentkey) {cssname = cssname+"_cur";} // определение нажатой кнопки по умолчанию
		$(this).attr('class',cssname);
		
			
		$(this).click(	function () { 
						//отжимаем нажатую кнопку
						cssname = $('#'+idblock+' .'+cssnameblock+' div').eq(numcurrentkey).attr('class').replace('_cur',"");
						$('#'+idblock+' .'+cssnameblock+' div').eq(numcurrentkey).attr('class', cssname);
						cssname = $(this).attr('class'); $(this).attr('class', cssname+'_cur')//нажимаем нажатую кнопку
						numcurrentkey = $(this).text(); // запоминаем какая кнопка нажата
						$('#'+idblock+' [name = '+cssnameblock+']').val(numcurrentkey); // сохраняем номер нажатой кнопки в форме
						getimage(attrname); // вызов обновления картинки
						return numcurrentkey // возврат номера нажатой кнопки
						}) 
											}
					  );	
	}
	function radbutton (idblock, name, timechange)
	{	var res
		$('#'+idblock+' [name = '+name+']').each(function() {
			if($(this).attr('checked')=='checked')
				{res=$(this).val();	 $('#'+idformblock+' [name = txt_align'+res+']').parent('div').slideDown(timechange);}
				else {$('#'+idformblock+' [name = txt_align'+$(this).val()+']').parent('div').slideUp(0);}
															});
 		return res
	}
	
	buts_txtalign_cur=txtbutton (idformblock, buts_txtalign, buts_txtalign_cur); // Для кнопок горизонтального выравнивания
	buts_txtalign_autor_cur=txtbutton (idformblock, buts_txtalign_autor, buts_txtalign_autor_cur); // Для кн гор выр автра
	buts_txtvalign_cur=txtbutton (idformblock, buts_txtvalign, buts_txtvalign_cur); // Для кнопок вертикального выравнивания
	buts_socnet_cur=txtbutton (idsocnetbox, buts_socnet, buts_socnet_cur);
	
	
    $('['+attrname+']').click(function () {
	  elementClick = $(this).attr(attrname);
      destination = $('[name=galery]').offset().top;
      if($.browser.safari){
        $('body').animate( { scrollTop: destination }, 1100 );
      }else{
        $('html').animate( { scrollTop: destination }, 1100 );
      }
      return false;
    });

	$('#'+idformblock+' [name=usertext], #'+idformblock+' [name=userautor]').keyup(
						function () {
							$(this).stopTime('send');
							$(this).oneTime(delay,'send', function () { getimage(attrname);}); // end oneTime
									 }
							  														); //end keyup
	
} //end imgchange

function getimage(attrname)
{	
	usertext=$('[name=usertext]').val();
	userautor=$('[name=userautor]').val(); if (userautor==userautorstart){userautor=' '}
	userfont=$('[name=userfont]').val();
	user_lh=$('[name=user_lh]').val();
	user_fs=$('[name=user_fs]').val();
	user_align=$('[name=txt_align_text]').val();
	user_align_autor=$('[name=txt_align_autor]').val(); 
	user_valign=$('[name=txt_valign]').val();
	user_socnet=$('.sellike_box div').eq($('[name=sellike_box]').val()).text();
	pname=$('[name=pname]').val();
	datasend =  "usertext="+usertext+"&userautor="+userautor+
				"&userfont="+userfont+"&userfontsize="+user_fs+"&userbgimg="+imglink+"&userlh="+user_lh+"&pname="+pname+
				"&align="+user_align+"&valign="+user_valign+"&alignautor="+user_align_autor+"&socnet="+user_socnet;
		//alert (datasend);
						$.ajax({
						  type: "POST",
						  url: "/imagemaker/",
						  beforeSend: function(){$('.loading').css('visibility','visible');},
						  cache: false,
						  data: datasend,
						  dataType: "html",
						  success: function(msg) {
							  						$('.loading').css('visibility','hidden');
													$('['+attrname+']').attr('src',msg);
													//$('['+attrname+']').after(msg);
													//alert (msg);
						  						  
												  }
						}); // end ajax	
}




function showblock(id)
{  
	$(id).mouseenter( 
					 function () {$(this).stopTime('timer_out');
					 $(id).children('div').css('visibility','hidden');
					 $(this).children('div').css('visibility','visible');});
	$(id).mouseleave( function () {$(this).oneTime(500,'timer_out', function () {$(this).children('div').css('visibility','hidden');});})
} 

function tabswicher(idpanelblock, classdesign,  numpanstart, class_secondcloser)
		{
// class '.tablink' - dlya tabov
// class '.tabpanel' - dlya paneley
		var numtablink = $('#'+idpanelblock+' .tablink').size();
		var numtabpanel = $('#'+idpanelblock+' .tabpanel').size(); 
		if (class_secondcloser!="") {secondclicker=', #'+idpanelblock+' .'+class_secondcloser;} else {secondclicker='';}
		if (numtablink != numtabpanel) {alert ('tabswicher: Количество табов не соответствует количеству панелей'); return false;}
		
		if (numpanstart<0)	{$('#'+idpanelblock+' .tabpanel').css('display','none'); // Hide all tabs
										  $('#'+idpanelblock+' .tablink').removeClass(classdesign + 'cur').addClass(classdesign);}
		
		if (numpanstart==0){$('#'+idpanelblock+' .tabpanel').css('display','block'); // Show all tabs
											$('#'+idpanelblock+' .tablink').removeClass(classdesign).addClass(classdesign + 'cur')}
		
		if (numpanstart>0){$('#'+idpanelblock+' .tabpanel').eq(numpanstart-1).css('display','block'); // Hide all tabs, show start tab
										  $('#'+idpanelblock+' .tablink').removeClass(classdesign + 'cur').addClass(classdesign);
										  $('#'+idpanelblock+' .tablink').eq(numpanstart-1).removeClass(classdesign).addClass(classdesign + 'cur');}
				
		
		$('#'+idpanelblock+' a:.tablink'+secondclicker).click(
			 function () { for (i=0; i<numtablink; i++)
				{ 
					if ($(this).text()==$('#'+idpanelblock+' .tablink').eq(i).text() || $(this).hasClass('closer') )
						{
							if (numpanstart!=0)
							{$('#'+idpanelblock+' .'+classdesign + 'cur').removeClass(classdesign+ 'cur').addClass(classdesign);}
							
							if ($('#'+idpanelblock+' .tabpanel').eq(i).css('display')=='block')
									{
												$('#'+idpanelblock+' .tabpanel').eq(i).animate({height:'hide'},1000);
												$(this).removeClass(classdesign + 'cur').addClass(classdesign)
									}
									else
										{
												$('#'+idpanelblock+' .tabpanel').eq(i).animate({height:'show'},1000);
												$(this).removeClass(classdesign).addClass(classdesign + 'cur');
										}
							
						}
						else {if (numpanstart!=0){$('#'+idpanelblock+' .tabpanel').eq(i).animate({height:'hide'},1000);}}
				}
						   }                    ) 

		}//end tabswicher

function checkForm(form)
{	
	 	 var errTxt = {
								 1 : "Вы не ввели правильно Имя (необходимо использовать 0-9 A-Z a-z А-Я а-я)",
								 2 : "Введите телефон так +ХХ-ХХХ-ХХХХХХХ или так 0ХХ-ХХХХХХХ)",
								 3 : "Вы не ввели корректный e-mail",
								 4 : "Выберите один из вариантов оплаты",
								 5 : "Выберите один из вариантов доставки",
								 6 : "Ваше сообщение должно быть более 10 символов не учитывая пробелы",
								 7 : "Вы ввели неправильный код",
								 8 : "Введите пароль более 5 символов",
								 9 : "Повторный пароль не соответствует первому"
							 }
	
	var sendform = true;
	
	var idform = "#"+$(form).attr('id');
	$(idform+" span.ofzak_err").remove()
	delnameouter = $(idform+" .errbox_inp input").each(function(){$(this).unwrap(); }); 
	delnameouter = $(idform+" .errbox_arr textarea").each(function(){$(this).unwrap();  });
	
	// выборка формы по атрибуту name - если менять значение атрибута name то здесь его тоже нужно поменять
	var name = $('[name=name]', form).val(); 
	var phone = $('[name=phone]', form).val();
	var email = $('[name=email]', form).val(); 
	var payment = $('[name=payment]', form).val();
	var delivery = $('[name=delivery]', form).val();
	var text =  $('[name=text]', form).val();
	var notes =  $('[name=notes]', form).val();
	var code =   $('[name=code]', form).val();
	var passold =  $('[name=passold]', form).val();
	
	if (passold!='Старый пароль (обязательно)')
	{
	var pass1 =  $('[name=pass1]', form).val();
	var pass2 =  $('[name=pass2]', form).val();
	}

	if ($('input:checkbox', form).attr("name") == 'useragr') {   // проверка чекбокса на обязательную галочку (пользовательское соглашение)
		if ($('input:checkbox', form).filter("[name=useragr]").attr('checked')!="checked")
			{sendform = false; }
	}

	if (typeof (name) != 'undefined') // Проверка формы для имени
		{if (name == "Ваше имя (обязательно)" || !/^[\wА-Яа-яЁё]+/.test(name) || name == "") {inserr_on_page('name', errTxt[1], 0);}}
	if (typeof (phone) != 'undefined')
		{	if (!/^(\+?\d+)?\s*(\(\d+\))?[\s-]*([\d-]*)$/.test(phone) || !/\d+/.test(phone)) {inserr_on_page('phone', errTxt[2], 0);}}
	if (typeof (email) != 'undefined')
		{	if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.[A-Za-z]{2,4})+$/.test(email) ) {inserr_on_page('email', errTxt[3], 0);}}
	if (typeof (payment) != 'undefined')
		{	if (payment == "Способ оплаты (обязательно)" ||  payment == 'undefined' || payment == ''){inserr_on_page('payment', errTxt[4], 2);}}
	if (typeof (delivery) != 'undefined')
		{	if (delivery == "Способ доставки (обязательно)" || delivery == 'undefined' || delivery == ''){inserr_on_page('delivery', errTxt[5], 2);}}
	if (typeof (text)!= 'undefined') // проверка теkстового поля 
		{		if (text == "Адрес доставки (обязательно)" ||
					 text == "Ваш комментарий (обязательно)" || 
					 text == "Ваше сообщение (обязательно)" ||
					 text == 'undefined' || 
					 !/^[\w\sА-Яа-яЁё]{10,}/.test(text) || //на длину записи
					 /^[\s]+ | [\s]{5,}/.test(text) ){inserr_on_page('text', errTxt[6], 1);}} //на количество пробелов
		
	if (typeof (code) != 'undefined'){if (/\D+/.test(code)){inserr_on_page('code', errTxt[7], 0);}}
	if (typeof (passold) != 'undefined')
		{	if (pass1 == '' || !/.{6,}/.test(passold)) {inserr_on_page('passold', errTxt[8], 0);}}
	
	if (typeof (pass1) != 'undefined')
		{	if (pass1 == "Пароль (обязательно)" || 
				 pass1 == "Новый пароль (обязательно)" || 
				 pass1 == '' || !/.{6,}/.test(pass1)) {inserr_on_page('pass1', errTxt[8], 0);}
			if (typeof (pass2) != 'undefined')
				{
					if (pass2 != pass1) {inserr_on_page('pass2', errTxt[9], 0);}
				}
		}
return sendform;		// если возвращаем true тоформа отправится 
		

	function inserr_on_page(name, insmsg, mode)
			{
				
				thisform = $("[name="+name+"]", form)
				if(mode==0) // добавление индикатора ошибки для поля input
				{
					thisform.wrap("<div class='errbox_inp'></div>");
					thisform.after('<span class="ofzak_err cr5" title="'+insmsg+'">!</span>');
				}
				if(mode==1) // добавление индикатора ошибки для поля textarea
				{
					thisform.wrap("<div class='errbox_arr'></div>");
					thisform.after('<span class="ofzak_err cr5" title="'+insmsg+'">!</span>');
				}
				if(mode==2) // добавление индикатора ошибки для поля рукодульного jump_box
				{
					thisform.before('<span class="ofzak_err cr5" title="'+insmsg+'">!</span>');
				}
				
				sendform = false; //если был вызов этой функции то форма не отправится
			}

}

function chvalue () 
{	 
	var mode=1;// режим когда значениям атрибутов присв. знач тегов
	var attrname='defval';// имя атрибута который нам нужен
	// ловим теги "input" и "textarea" с атрибутом в переменной attrname ('defval' - по умолчанию)
	$('input['+attrname+'], textarea['+attrname+']').each(function() {
							if (mode==1)  {$(this).attr(attrname,$(this).val());}//значениям атрибута присв. знач тегов
							if (mode==2)	{$(this).val($(this).attr(attrname));} //значениям тегов присв. знач атрибута
							 										 }
														  )
	
	$('input['+attrname+'], textarea['+attrname+']').focus( 
					 function () { if($(this).val()==$(this).attr(attrname)){$(this).val('');} }); //при клике значение = пусто
	$('input['+attrname+'], textarea['+attrname+']').blur(
					 function () { if($(this).val()==''){$(this).val($(this).attr(attrname));} }); // при потере фокуса значение = значению тега

}

function softscroll ()
{ 
    $("[href*=#], [DATA-SCROLL]").click(function () {
	  if (elementClick = $(this).attr("href")){ elementClick=elementClick.replace("#","");}
	  		else {elementClick = $(this).attr("DATA-SCROLL")}
				  
      destination = $('[name='+elementClick+']').offset().top;
      if($.browser.safari){
        $('body').animate( { scrollTop: destination }, 1100 );
      }else{
        $('html').animate( { scrollTop: destination }, 1100 );
      }
      return false;
    });
}

function scrolltop()
{
$(window).scroll(function () {
	if ($(this).scrollTop() > 600) {$('#scroller').fadeIn();} else {$('#scroller').fadeOut();}
	});
$('#scroller').click(function () {$('body,html').animate({scrollTop: 0}, 300); return false;});	
}

function vieweadr (id, line){var id, line; $('#'+id).html(unescape(line)); }

$(document).ready(function(){
 
  chvalue();
  swichsize();
  imgchange();
  softscroll();
  scrolltop();
  helpviewer (10);
  //tabswicher('help_block', 'hbinfo', -1, 'closer');
 });
