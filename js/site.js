if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceWorker.js',{scope:'/'});
  navigator.serviceWorker.register('/serviceWorker.js',{scope:'/index.html'});
  navigator.serviceWorker.register('/serviceWorker.js',{scope:'other.html'});
  navigator.serviceWorker.register('/serviceWorker.js',{scope:'code'});
}
