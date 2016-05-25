if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceWorker.js',{scope:'/'});
  navigator.serviceWorker.register('/serviceWorker.js',{scope:'/code/'});
}
