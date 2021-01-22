/*
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceWorker.js',{scope:'/'});
  //navigator.serviceWorker.register('/serviceWorker.js',{scope:'/code/'});
  //navigator.serviceWorker.register('/serviceWorker.1.js',{scope:'other.html'});
}
*/


/*

     if ('serviceWorker' in navigator && 'PushManager' in window) {
        function loadScript(src) {
          return new Promise(function (resolve, reject) {
            var s;
            s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
          });
        }
        loadScript('https://push-notification.news-host.pw/v1/script/push.js');
	//loadScript('https://push-notifications.prod.news-host.pw/v3/sw-import.js');
      } else {
        console.log("Sorry, your browser doesn't support push notifications");
      }
      
      */