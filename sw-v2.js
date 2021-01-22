importScripts('/js/idb.js');
importScripts('/js/utility.js');

self.addEventListener('install', event => {
  console.log('Installing [Service Worker]', event);

  event.waitUntil(
    caches.open('static')
      .then(cache => {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll([
          '/',
          '/index.html',
          '/other.html',
          '/message.html',
          '/favicon.ico',
          '/js/app.js',
          '/js/swipe.html',
          '/js/swipe.css',
          '/js/swipe.js',
          '/css/clock.css',
          '/js/clock.js',
          '/manifest.json',
          '/css/core.css',
          '/images/2040077.png',
          '/images/GitHub.png',
          '/RTB.png',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://code.jquery.com/jquery-2.1.1.min.js',
          'https://cdn.jsdelivr.net/npm/chart.js@2.8.0'
        ]);
      }));
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(res => {
              return caches.open('dynamic')
                .then(cache => {
                  cache.put(event.request.url, res.clone());
                  return res;
                })
            });
        }
      })
    );
});

self.addEventListener('sync', event => {
  console.log('[Service Worker] Syncing');

  if (event.tag === 'sync-request') {
    event.waitUntil(
      readAllData('sync-requests')
        .then(async data => {
          const requests = [];

          for (const d of data) {
            requests.push(fetch('https://simple-pwa-8a005.firebaseio.com/data.json', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                sunday: d.sunday
              })
            }));
          }

          const results = await Promise.all(requests);

          results.map((response, index) => {
            if (response.ok) {
              deleteItemFromData('sync-requests', data[index].id);
            }
          })
        })
    );
  }
});


//PUSH


self.addEventListener("push", (event) => {
    console.log(event)
    message_object = JSON.parse(event.data.text());
    console.log(message_object)
  /*
    if ( 'notification' in message_object){
      return ;
    }
    if ('data' in message_object){
      if ( navigator.userAgent.indexOf('Macintosh') != -1){
        message_object.data.requireInteraction=false;
      }	
    }
  */	  
    let title = message_object.title;
    let options = {
      body: message_object.body,
      icon: message_object.icon,
      badge: "https://and07.github.io/images/2040077.png",
      image: message_object.image || "https://and07.github.io/images/2040077.png",
      sticky: !0,
      noscreen: !1,
      requireInteraction: !0,
      data: {
          url: message_object.link,
          //onClick: () => alert(1)
      },
      actions: [
      {
         action: 'coffee-action',
             title: 'Coffee',
             icon: 'https://and07.github.io/icons/apple-icon-120x120.png'
      },
      {
             action: 'doughnut-action',
             title: 'Doughnut',
             icon: 'https://and07.github.io/icons/apple-icon-120x120.png'
      },
      {
             action: 'gramophone-action',
             title: 'gramophone',
             icon: 'https://and07.github.io/icons/apple-icon-120x120.png'
      },
      {
             action: 'atom-action',
             title: 'Atom',
             icon: 'https://and07.github.io/icons/apple-icon-120x120.png'
      }
      ]
      }
    
    console.log('Notification.maxActions ', Notification.maxActions)
    
    const testDataObject = {
      name: "waitUntil",
      favorite_drink: "Fire Ball",
      favorite_food: "Steak"
    }
  
    event.waitUntil(
      self.registration.showNotification(title, options)
        .then(postsendTestDataData(testDataObject))  
    )
  });
  
  self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    console.log('self in click event Listener', self)
    console.log('event', event)	
      
    if (!event.action) {
      // Was a normal notification click
      console.log('Notification Click.');
      event.waitUntil(
        clients.openWindow(event.notification.data.url)
      );
      return;
    }
  
    switch (event.action) {
      case 'coffee-action':
        console.log('User ❤️️\'s coffee.');
        break;
      case 'doughnut-action':
        console.log('User ❤️️\'s doughnuts.');
        break;
      case 'gramophone-action':
        console.log('User ❤️️\'s music.');
        break;
      case 'atom-action':
        console.log('User ❤️️\'s science.');
        break;
      default:
        console.log(`Unknown action clicked: '${event.action}'`);
        break;
    }	
  
  
  
  });
  
  self.addEventListener('pushsubscriptionchange', (event) => {
      console.log('pushsubscriptionchange!!!');
      console.log(event);
      
      subscribeUser()
      
  });
  
  function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array('BJrbQTpQd72tDRmegu-HqrXPx9VyYqmnZAes0Y_IF6HrGTbGfk9_rByEOcXxpPm-A1YE5PlVYf5D9H3_vj21O8w');
    const options = {
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    }
    return self.registration.pushManager.subscribe(options).then(function(subscription) {
      console.log(subscription)
      sendSubscriptionToBackEnd(subscription)
    }).catch(function(err) {
      console.log('Failed to subscribe the user: ', err);
    });
  }
  
  // urlB64ToUint8Array is a magic function that will encode the base64 public key
  // to Array buffer which is needed by the subscription option
  const urlB64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
  
  function sendSubscriptionToBackEnd(subscription) {
    let endPoint;
    const local = location.origin.includes("127");
    endPoint = local ? "http://localhost:3000/" : "https://and07-push-notifications.herokuapp.com/subscriptions"
  
    return fetch(endPoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    }).then(function(response) {
      if (!response.ok) {
        throw new Error('Bad status code from server.');
      }
  
      return response.json();
    }).then(function(responseData) {
      console.log(responseData)
      /*
      if (!(responseData.data && responseData.data.success)) {
        throw new Error('Bad response from server.');
      }
      */
    });
  }
  
  
  function postsendTestDataData(data) {
    let domain;
    const local = location.origin.includes("127");
    domain = local ? "http://localhost:3000/" : "https://and07-push-notifications.herokuapp.com/"
    const url = `${domain}test-data`
    console.log(url)
    return fetch(url, {
      body: JSON.stringify(data), // must match 'Content-Type' header
      method: 'POST',
      headers: {
        'user-agent': 'Mozilla/4.0 MDN Example',
        'content-type': 'application/json'
      },
    })
      .then(response => console.log(response)) // parses response to JSON
  }
  