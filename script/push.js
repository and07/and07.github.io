'use strict';

const appServerKey = 'BDrMpQUpg-UIpH-yMenUWXZW9WMBM8hYWL6bhViiANpZCCgdJ5fbDpYBzwlUnZQQOiF6xNkLxPwDuFyMk7q6BC4';

let serviceWorkerRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
function subscribeUser() {
  serviceWorkerRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(appServerKey)
  })
  .then(function(subscription) {

    fetch('/push/subscribe',{
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    })
    .then(function(response) {
      return response;
    })
    .then(function(text) {
      console.log('User is subscribed.');
    })
    .catch(function(error) {
      console.error('error fetching subscribe', error);
    });
    
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
  });
}

function unsubscribeUser() {
  serviceWorkerRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      subscriptionData = {
        endpoint: subscription.endpoint
      };
      
      fetch('/push/unsubscribe',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      })
      .then(function(response) {
        return response;
      })
      .then(function(text) {
        console.log('User is unsubscribe.');
      })
      .catch(function(error) {
        console.error('error fetching unsubscribe', error);
      });
      
      return subscription.unsubscribe();
    }
  });
}

function askPermission() {
  return new Promise(function(resolve, reject) {
  const permissionResult = Notification.requestPermission(function(result) {        
    resolve(result);
    if (result === 'granted') {
      subscribeUser();
    }
  });
if (permissionResult) {
    permissionResult.then(resolve, reject);
  }
  }).then(function(permissionResult) {
    if (permissionResult !== 'granted') {
    throw new Error('We weren\'t granted permission.');
  }
});}

function initPush() {

  // Set the initial subscription value
  serviceWorkerRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    console.log("subscription ",subscription)
  });

}

navigator.serviceWorker.register('sw.js')
.then(function(sw) {
  console.log('Service Worker is registered', sw);           
  if (Notification.permission == 'default') {            
    askPermission()
  }

  serviceWorkerRegistration = sw;
  initPush();
})
.catch(function(error) {
  console.error('Service Worker Error', error);
});

