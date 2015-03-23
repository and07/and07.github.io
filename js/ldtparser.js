
ldtparser = new Parser({
		whitespace: /\s+/,
		comment: /\/\*([^\*]|\*[^\/])*(\*\/?)?|(\/\/)[^\r\n]*/,
		string: /'(\\.|[^'])*'?/,
		number: /0x[\dA-Fa-f]+|-?(\d+\.?\d*|\.\d+)/,
		func: /(gettext|getlink|getimglink|getregexp|getattr|storefile|store|continue|dump|generateurl|concat|regexp|count|filter_value|filter_key|filter_eqkeys|maketable|getform|formsetparam|formgetparam|formgetselectkey|formgetselectvalue|gethtml|removetags|basename)(?!\w|=)/,
		keyword: /(loadpage|dict|array|pageparams|passparams|foreach|as|break|if|else|group|submitform|function|return)(?!\w|=)/,
		variable: /[\@](\->|\w)+(?!\w)|\${\w*}?/,
		define: /[$A-Z_a-z0-9]+/,
		op: /[\+\-\*\/=<>!]=?|[\(\)\{\}\[\]\.\|\;\,]/,
		other: /\S+/,
	});