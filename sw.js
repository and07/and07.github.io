'use strict';
/*
importScripts('sw-toolbox.js');
toolbox.precache(["index.html","css/core.css"]);
toolbox.router.get("/images/*", toolbox.cacheFirst);
toolbox.router.get("/icons/*", toolbox.cacheFirst);
toolbox.router.get("/*", toolbox.networkFirst, {
networkTimeoutSeconds: 5});
*/
const VERSION = 0.01

let message_object = {}

self.addEventListener('install', function(event) {
	self.skipWaiting();
	event.waitUntil(
		caches.open(VERSION).then(function(cache) {
			return cache.addAll([
				'/',
				'/manifest.json',
				'/css/core.css',
				'/script/push.js'
			]);
		})
	);
});

self.addEventListener('fetch', function(event) {
	let request = event.request;

	if (request.method !== 'GET') return;

	event.respondWith(
		caches.match(request).then(function(response) {
			return response || fetch(request);
		}).catch(function() {
			return caches.match('/');
		})
	);
});

self.addEventListener('activate', function(event) {
	if (self.clients && clients.claim) {
		clients.claim();
	}
	event.waitUntil(
		caches
			.keys()
			.then(function (keys) {
				return Promise.all(
					keys
						.filter(function (key) {
							return !key.startsWith(VERSION);
						})
						.map(function (key) {
							return caches.delete(key);
						})
				);
			})
			.then(function() {
				console.log('new service worker version registered', VERSION);
			}).catch(function (error) {
				console.error('error registering new service worker version', error);
			})
	);
});

self.addEventListener("push", (event) => {
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
    tag: "push-simple-demo-notification-tag",
    icon: message_object.icon,
    link: message_object.link
  }

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
  event.waitUntil(
    clients.openWindow(event.currentTarget.message_object.link)
  );
});

self.addEventListener('pushsubscriptionchange', function(event) {
    console.log('pushsubscriptionchange!!!');
    console.log(event);
});

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
