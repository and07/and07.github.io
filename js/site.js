/*
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceWorker.js',{scope:'/'});
  //navigator.serviceWorker.register('/serviceWorker.js',{scope:'/code/'});
  //navigator.serviceWorker.register('/serviceWorker.1.js',{scope:'other.html'});
}
*/
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/serviceWorker.js').then(function(registration) {
            // Регистрация успешна
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(function(err) {
            // Регистрация не успешна
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
