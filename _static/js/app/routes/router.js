//http://blog.creapptives.com/post/71046410960/writing-a-70-line-js-router
(function(obj, win) {
  var Routes = [];
  var doc = win.document;
  
  function fireCustomEvent(name, data) {
	if (doc.createEvent) {
		var evt = doc.createEvent("HTMLEvents");
		evt.initEvent(name, true, true ); // event type,bubbling,cancelable
		evt.data = data;
		return !doc.dispatchEvent(evt);
	}else{
		var evt = doc.createEventObject();
		evt.eventType = name;
		return doc.fireEvent("on" + evt.eventType, evt);
	}
  }
  
  function hashChange() {
    var url = (win.location.hash || "#").slice(1);
    obj.Router.match(url);
  }

  obj.Router = {
    map: function (r, e) {
      // Escape anything except () and replace (name) with (.+)
      var es_tmp = r.replace(/[-[\]{}*+?.,\\^$|#\s]/g, "\\$&").replace(/\([^\)]+\)/g, "([^/]+)");
      var r_exp = new RegExp("^"+es_tmp+"$", "g");
      
      // Save names and routes under with expression and variable names
      Routes.push({
        exp: r_exp,
        names: r_exp.exec(r).slice(1),
        event: e
      });
    },
    
    match: function (r) {
      for(var i in Routes) {
        var rout = Routes[i];
        
        if (r.match(rout.exp)){
          var params = {};
          info = rout.exp.exec(r).slice(1);
          for(var k in info) {
            params[rout.names[k].replace(/[()]/g, "")] = info[k];
          }
                                         
          if(typeof rout.event === 'function') {
            rout.event({data: {params: params, route: r}});
          }else if( typeof rout.event === 'string') {
            fireCustomEvent(rout.event, {params: params, route: r});
          }
        }
      }
    },

    start: function() {
      if (window.addEventListener) {
        window.addEventListener("hashchange", hashChange, false);
      }
      else if (window.attachEvent) {
        window.attachEvent("onhashchange", hashChange);    
      }
      hashChange(); // Call first time for loading first URL
    },

    stop: function() {
      if (window.removeEventListener) {
          window.removeEventListener("hashchange", hashChange, false);
        }
        else if (window.attachEvent) {
          window.detachEvent("onhashchange", hashChange);    
        }
      }
  };
})(window, window);
