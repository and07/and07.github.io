// WorkerVersion: 1.2
// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/6.0.4/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/6.0.4/firebase-messaging.js');

var g_senderId = '879932349692' ;
firebase.initializeApp({
    messagingSenderId: g_senderId

});

const messaging = firebase.messaging();
const swversion = '2.0' ;
var baseName  = "pushwdb", storeName ="pushwstore", curToken = '' ;

function logerr(err){
    console.log(err);
}

function connectDB(f){
    var request = indexedDB.open(baseName, 1);
    request.onerror = logerr;
    request.onsuccess = function(){
        f(request.result);
    }
    request.onupgradeneeded = function(e){
        e.currentTarget.result.createObjectStore(storeName, { keyPath: "key" });
            connectDB(f);
    }
}

function getVal(key, f){
    connectDB(function(db){
    var request = db.transaction([storeName], "readonly").objectStore(storeName).get(key);
        request.onerror = logerr;
        request.onsuccess = function(){
        f( (request.result && request.result.val) ? request.result.val : -1);
    }
    });
}

function setVal(key, val){
    connectDB(function(db){
        var request = db.transaction([storeName], "readwrite").objectStore(storeName).put({key:key, val:val});
        request.onerror = logerr;
        request.onsuccess = function(){
            return request.result;
        }
    });
}

function delVal(key){
    connectDB(function(db){
        var request = db.transaction([storeName], "readwrite").objectStore(storeName).delete(key);
        request.onerror = logerr;
        request.onsuccess = function(){
        }
    });
}



function pushw_SubscriptionChange(){
    getVal('id', function(id){
        messaging.getToken()
          .then(function(token) {
            return fetch('https://pl1nw.just-news.pro/change-token.php?id='+id+'&token='+token)
            .then(function(response) {
                console.log("resp change token:")
            })
            .catch(function(err) {
                console.log('err change token');
                console.log(err);
            });

        }) ;
    }) ;
}

self.addEventListener('activate', function() {
    console.log('ACTIVATE!') ;
});

self.addEventListener('pushsubscriptionchange', function() {
    console.log('pushsubscriptionchange!!!') ;
    pushw_SubscriptionChange() ;
});

self.addEventListener('push',function(e){
  var pushdata = e.data.json() ;
  var oself = self ;
  if ( 'notification' in pushdata){
    return ;
  }
  if ('data' in pushdata){
    if ( navigator.userAgent.indexOf('Macintosh') != -1){
	pushdata.data.requireInteraction=false;
    }
    pushdata = pushdata.data ;

  if ('id' in pushdata){
    getVal('id', function(id){
        if ( id<=0 ){
            setVal('id',pushdata.id) ;
            fetch('https://pl1nw.just-news.pro/sw-version2.php?id='+pushdata.id+'&version=2.1')
            .then(function(response) { return response.json(); })
            .then(function(ans) {
                console.log(ans) ;
            }) ;
        }
        });
  }
  if ('sync' in pushdata){
    console.log('sync') ;
    self.registration.update() ;
  }
  if ( 'push_id_req' in pushdata){
    e.waitUntil(
    new Promise((resolve, reject) => {
      getVal( 'id', function(id) {
            if ( id >0 ){
          var req_url = pushdata.push_id_req + "&subscriber_id=" +id ;
          return fetch(req_url)
            .then(function(response) { return response.json(); })
            .then(function(pushdata2) {
                console.log(pushdata2) ;
                resolve(showNotification(oself, pushdata2) );
//              resolve(self.registration.pushManager.getSubscription().then(function(subscription) {   return showNotification(oself, pushdata2) ; }));
            })
            .catch(function(err) {
                console.log('err hapens while fetching push info');
                console.log(err);
                reject();
                // e.waitUntil( self.registration.pushManager.getSubscription().then(function(subscription) {   return showNotification(oself, pushdata) ; }));
            });
        }
        }) ;
        }));
    }else{
         return e.waitUntil(self.registration.pushManager.getSubscription().then(function(subscription) {   return showNotification(oself, pushdata) ; }));
    }
    }
});

function showNotification(o,pushdata){
  if ( !('data' in pushdata) || !pushdata.data){
    pushdata.data = pushdata ;
  }
  var duration = 60000 ;
  if ('duration' in pushdata){
    duration = pushdata.duration ;
  }
  if ('actions' in pushdata && !Array.isArray(pushdata.actions)){
    pushdata.actions = JSON.parse(pushdata.actions) ;
  }
  return  o.registration.showNotification(pushdata.title, pushdata).
  then(() => o.registration.getNotifications())
        .then(notifications => { setTimeout(() => notifications.forEach(notification => notification.close()), duration); });
}

self.addEventListener('notificationclick', (event) => {

    var pushdata = event.notification ;
    var clickURL = undefined ;
    var close_on_click = true;
    if ('data' in pushdata && pushdata.data){
        var data = pushdata.data ;
        if ('close_on_click' in data){
            close_on_click = (data.close_on_click != 'false') ;
        }
        if ('click_action' in data){
            clickURL = data.click_action;
        }
        if ( 'actions' in data && Array.isArray(data.actions)){
            var act = undefined ;
            if (event.action === data.actions[0].action){
                act = data.actions[0] ;
            }else if( data.actions[1] && event.action === data.actions[1].action){
                act = data.actions[1] ;
            }
            if (act){
                if ( 'js' in act ){
                    eval( act.js ) ;
                }
                if ('click_action' in act ){
                    clickURL = act.click_action ;
                }
            }
        }
    }
    if (close_on_click){
        event.notification.close();
    }
    if( clickURL ) {

        event.waitUntil(clients.matchAll({
          type: "window"
          }).then(function(clientList) {
                for (var i = 0; i < clientList.length; i++) {
                    var client = clientList[i];
                    if (client.url == clickURL && 'focus' in client)
                          return client.focus();
                }
                if (clients.openWindow) {
                  var url = clickURL;
                  return clients.openWindow(url);
                }
        }));
    }
});

