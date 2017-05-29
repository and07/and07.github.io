//http://getinstance.info/articles/javascript/introduction-to-service-workers/
var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
    '/',
    '/index.html',
    '/other.html',
    '/images/GitHub.png',
    '/images/2040077.png',
    '/css/core.css',
    '/js/site.js'
];

self.addEventListener('install', function(event) {
  // установка
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // ресурс есть в кеше
        if (response) {
          return response;
        }

        /* Важно: клонируем запрос. Запрос - это поток, может быть обработан только раз. Если мы хотим использовать объект request несколько раз, его нужно клонировать */
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // проверяем, что получен корректный ответ
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            /* ВАЖНО: Клонируем ответ. Объект response также является потоком. */
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});
