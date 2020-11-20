groupNums = (
	function() {
		var r = /(\d{3})/g;
		return function(text) {
			text = String(text);
			return text.split("").reverse().join("").replace(r, "$1 ").split("").reverse().join("");
		}
	}
)()

calculateCredit = (

	function() {
	
 		var 
 			errMsg = "Ошибочка. Проверьте введённые цифры",
			wrongResult = {
				overpay: errMsg, 
				payments: [errMsg],
				total: errMsg 
			}
		;
		
		return {
		
			differ: function(sum, term, rate) {
			 	var 
			 		overpay, payment, count, x,pay,
			 		result = { 
						total: 0,
						overpay: 0,
						payments: [ ],
						pay:[ ]
					}
			 	;
	
				for(var x in arguments) {
					arguments[x] = parseFloat(arguments[x]);
					if( isNaN( arguments[x] ) ) return wrongResult;
					if( arguments[x] === 0) arguments[x] = 0.0000000000001;
				}

				if(rate) rate = rate / 100 / 12; 
				while(term) {
					payment = sum / term;
					overpay =  sum * rate;
					result.overpay += overpay;
					count = result.payments.length; 
					result.payments.push( +(payment + overpay ).toFixed( 2 ) );
					result.pay.push( +overpay.toFixed( 2 ));
					result.total += result.payments[count];
					term--;
					sum -= payment;
				}
				result.total = result.total.toFixed(2);
				result.overpay = result.overpay.toFixed(2);
				return result
				
			},
			
			annuitet: function(sum, term, rate) {
				var 
					x, koeffAnn	,
					result = { 
						total: 0,
						overpay: 0,
						payments: [ ]
					}
				;
	
				for(var x in arguments) {
					arguments[x] = parseFloat(arguments[x]);
					if( isNaN( arguments[x] ) ) return wrongResult;
					if( arguments[x] === 0) arguments[x] = 0.0000000000001;
				}
				
				if(rate) rate = rate / 100 / 12; 
				koeffAnn = rate * Math.pow( ( 1 + rate ), term ) / (  Math.pow( ( 1 + rate ), term ) - 1 );
				result.payments.push( ( sum * koeffAnn ).toFixed( 2 ) );
				result.total = ( result.payments[0] * term ).toFixed( 2 );
				result.overpay = ( result.total - sum ).toFixed( 2 );

				return result;
			}
		}//object
		
	}//anonymous function
	
)()