'use strict';
/*
importScripts('sw-toolbox.js');
toolbox.precache(["index.html","css/core.css"]);
toolbox.router.get("/images/*", toolbox.cacheFirst);
toolbox.router.get("/icons/*", toolbox.cacheFirst);
toolbox.router.get("/*", toolbox.networkFirst, {
networkTimeoutSeconds: 5});
*/

const VERSION = 'v0.0.5';

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

self.addEventListener('push', function(event) {

	let notificationData = {};

	try {
		notificationData = event.data.json();
	} catch (e) {
		notificationData = {
			title: 'Default title',
			body: 'Default message',
			icon: '/icons/android-icon-72x72.png'
		};
	}
	
	event.waitUntil(
		self.registration.showNotification(notificationData.title, {
			body: notificationData.body,
			icon: notificationData.icon
		})
	);

});

self.addEventListener('notificationclick', function(event) {

	// close the notification
	event.notification.close();

	// see if the current is open and if it is focus it
	// otherwise open new tab
  event.waitUntil(

    self.clients.matchAll().then(function(clientList) {
 
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
 
      return self.clients.openWindow('/');
    })
  );
});
