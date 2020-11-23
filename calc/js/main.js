//Вспомогательное
function getMonthName(month,nameMonth)
{
 // Создаем массив, для хранения названия каждого месяца
 var ar = new Array(12)
	if (nameMonth=="rus"||nameMonth=="russ"||nameMonth=="russs")
	{
	 ar[0] = "Январь"
	 ar[1] = "Феврать"
	 ar[2] = "Март"
	 ar[3] = "Апрель"
	 ar[4] = "Май"
	 ar[5] = "Июнь"
	 ar[6] = "Июль"
	 ar[7] = "Август"
	 ar[8] = "Сентабрь"
	 ar[9] = "Октябрь"
	 ar[10] = "Ноябрь"
	 ar[11] = "Декабрь"
	}else
	{
	 ar[0] = "January"
	 ar[1] = "February"
	 ar[2] = "March"
	 ar[3] = "April"
	 ar[4] = "May"
	 ar[5] = "June"
	 ar[6] = "July"
	 ar[7] = "August"
	 ar[8] = "September"
	 ar[9] = "October"
	 ar[10] = "November"
	 ar[11] = "December"
	}
 return ar[month]
}

function groupThis(e) {
	var start = this.selectionStart, end = this.selectionEnd;
	e = e || window.event;
	this.value = this.value.replace(/\s/g, "");
	this.value = groupNums(this.value);
}

function go(e) {
	e = e || window.event;
	if(e.keyCode === 13) gc("input[value = 'Рассчитать']").onclick();
}

function checkNumbers(inputs) {
	var x, result = true;
	inputs = inputs || [this];
	for(x = 0; x < inputs.length; x++) {
		if( isNaN( parseFloat( inputs[x].value ) ) || inputs[x].value === "") {
			if ( !inputs[x].getAttribute( "data-oldClass" ) ) {
				inputs[x].setAttribute("data-oldClass", inputs[x].className);
			}
			inputs[x].className = "form-control wrong";
			result = false;
			
		} else {
			inputs[x].className = inputs[x].getAttribute( "data-oldClass" );
			inputs[x].className = "form-control normCheck";
		}
	}
	return result;
}

//Оператор расчёта
gc("input[value = 'Расчёт']").onclick = (
	function() {
		var 
			term = gc(".calc input[name = 'term']"),
			rate = gc(".calc input[name = 'rate']"),
			sum = gc(".calc input[name = 'sum']"),
			firstPayment = gc(".calc input[name = 'firstPayment']"),
			report = gc("#report")
		;
		
		sum.onchange = function() {
			checkNumbers.call(this);
			groupThis.call(this);
		}
		term.onchange = rate.onchange = function() {
			checkNumbers.call(this);
		}
		firstPayment.onkeyup = rate.onkeyup = go;
		
		return function()	{
			var 
				proc = ( firstPayment.value.replace( /\s/g, "" ).substr( -1 ) === "%" ), result,
				type = gc('#paymentType').value,
				MorY = gc('#MorY').value,
			//	type = gc.getCheckedValues('paymentType')[0],
				fP = parseFloat( firstPayment.value.replace( /\s/g, "" ) ),
				textReport = "",
				summ = sum.value.replace(/\s/g, "")
			;

			if(MorY === 'year'){
				var _term = parseInt(term.value);
				_term = _term*12;
			}else{
				var _term = parseInt(term.value);
			}

			//console.log(_term);
			if( isNaN( fP ) ) fP = 0;
			fP = proc ? summ * ( fP / 100 ) : fP;
			
			if( !checkNumbers( gc( ".calc input.needCheck, .calc input.wrong", true ) ) ) {
				textReport = "<p class='reportText'>В отмеченных полях обязательно должны быть цифры. Исправьте, пожалуйста, иначе расчёт сделать не получится.</p>";
			} else {
				result = calculateCredit[type]((summ - fP), _term, rate.value);
				textReport += "<table class = 'reportTable'><tr >";
				textReport += "<td>Сумма кредита: </td><td><span class='red'>" + groupNums((summ - fP) )+ "</span> руб.</td><tr>";
				textReport += "<td>Придётся переплатить за весь срок: </td><td><span class='red'>" +groupNums(result.overpay) + "</span>  руб. (" + groupNums(( ( result.overpay / summ ) * 100 ).toFixed( 2 ) ) + "%)</td><tr>";
				textReport += "<td>Всего нужно отдать: </td><td><span class='red'>" + groupNums(result.total )+ "</span> руб.</td><tr>";
				textReport += "</table>";
				textReport += "<h3>ПЛАТЕЖИ</h3>";
				textReport += "<div class = 'column'>";
				/*********************/	
				 var now = new Date();
				 var year = now.getYear()+1900;
				 var month = now.getMonth();
				 var monthName =  new Array();
				 var k=0;
				 var balance = summ - fP;
				/*********************/	
				for(x = 0; x < result.payments.length; x++) {
				
					if(type === "annuitet") {
						if(MorY === 'year'){	var MorY_term = term.value+' лет';	}else{ var MorY_term = term.value+' мес.';}
						textReport += "<p class = 'payment'><b>" + result.payments[x] + " X " + MorY_term + "</b></p>";
						break
					}
					/****************/					
					  var monthN;
					   monthN  = month+k;
					  if( monthN > 11) {
						monthN = 0;
						 k=0;
						 month=0;
						 year = year+1;
					  }else{  }
					/***************/
					var payrate = +(result.payments[x] - result.pay[x] ).toFixed( 2 ) ;
					balance = +(balance - payrate ).toFixed( 2 );
					
					if(x == 0)
					{
					textReport += '<table   id = "tab_payment" cellpadding="15"  cellspacing="15"><tr class ="reportHeader"><td>НОМЕР</td><td>ДАТА ПЛАТЕЖА</td><td>СУММА ПЛАТЕЖА</td><td>НАЧИСЛЕННЫЕ ПРОЦЕНТЫ</td><td>ОСНОВНОЙ ДОЛГ</td><td>ОСТАТОК ЗАДОЛЖЕННОСТИ</td></tr>';
					}
					textReport += '<tr><td>' + ( x + 1 ) + '</td><td>' + getMonthName(monthN, 'rus') + ' ' +year+ '</td><td><span class="red">' + groupNums(result.payments[x]) + '</span> руб.</td><td><span class="red">' + groupNums(result.pay[x]) + '</span></td><td><span class="red">' + groupNums(payrate) + '</span></td><td><span class="red">' + groupNums(balance) + '</span></td></tr>';
					if(x == result.payments.length -1)
					{
					textReport += "</table>";
					}
					//if( ( x + 1 ) % 12 === 0 ) textReport += "</div><div class = 'column'>";
				k++;

				}
				textReport += "</div>";
				textReport = textReport.replace(/NaN/g, "?");
				//textReport = groupNums(textReport);
			}
			report.innerHTML = textReport;
		}
	}
)()