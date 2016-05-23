if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/js/serviceWorker.js', {
    scope: '/js/'
  });
}
