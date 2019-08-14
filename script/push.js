'use strict';

const appServerKey = 'BDrMpQUpg-UIpH-yMenUWXZW9WMBM8hYWL6bhViiANpZCCgdJ5fbDpYBzwlUnZQQOiF6xNkLxPwDuFyMk7q6BC4';

let swRegistration = null

function askPermission() {
  return new Promise(function(resolve, reject) {
    const permissionResult = Notification.requestPermission(function(result) {
      resolve(result);
      if (result === 'granted') {
        var notification = new Notification('Notification title', {
          icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
          body: "Hey there! You've been notified!",
        });

        allTheEvents(notification);
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
  });
}

function subscribeUser() {
  const applicationServerKey = urlBase64ToUint8Array(appServerKey);
  const options = {
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  }
  return swRegistration.pushManager.subscribe(options).then(function(subscription) {
    sendSubscriptionToBackEnd(subscription)
  }).catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function sendSubscriptionToBackEnd(subscription) {
  let endPoint;
  if(window.location.href === 'https://digitaldrk.github.io') {
    endPoint = 'https://arcane-stream-87798.herokuapp.com'
  } else {
    endPoint = 'http://localhost:3000/subscriptions'
  }

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
    if (!(responseData.data && responseData.data.success)) {
      throw new Error('Bad response from server.');
    }
  });
}
 
/**************/


if ('serviceWorker' in navigator && 'PushManager' in window) {
  // console.log('Service Worker and Push is supported');
  navigator.serviceWorker.register('sw.js')
    .then(function(swReg) {
      // console.log('Service Worker is registered', swReg);
      if (Notification.permission == 'default') {
        askPermission()
      }
      swRegistration = swReg;
    })
    .catch(function(error) {
      console.error('Service Worker Error', error);
    });
} else {
  console.warn('Push messaging is not supported');
  pushButton.textContent = 'Push Not Supported';
}
// Just the push button
function notifyMe() {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.');
    return;
  }
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  } else {
    var notification = new Notification('Notification title', {
      icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
      body: "Hey there! You've been notified!",
    });
    allTheEvents(notification);
  }
}
function allTheEvents(notification) {
  notification.addEventListener("show", (e) => {
    const testDataObject = {
      name: "show",
      favorite_drink: "Fire Ball",
      favorite_food: "Steak"
    }
    new Promise((resolve, reject) => {
      resolve(postsendTestDataData(testDataObject))
    })
  })
  notification.addEventListener("click", (e) => {
    const testDataObject = {
      name: "click",
      favorite_drink: "Fire Ball",
      favorite_food: "Steak"
    }
    new Promise((resolve, reject) => {
      postsendTestDataData(testDataObject)
    })
  })
  notification.addEventListener("close", (e) => {
    const testDataObject = {
      name: "close",
      favorite_drink: "Fire Ball",
      favorite_food: "Steak"
    }
    new Promise((resolve, reject) => {
      postsendTestDataData(testDataObject)
    })
  })
  notification.addEventListener("error", (e) => {
    const testDataObject = {
      name: "error",
      favorite_drink: "Fire Ball",
      favorite_food: "Steak"
    }
    new Promise((resolve, reject) => {
      postsendTestDataData(testDataObject)
    })
  })
}
function postsendTestDataData(data) {
    let domain;
    const local = window.location.href.includes("127");
    local ? domain = "http://localhost:3000/" : "https://arcane-stream-87798.herokuapp.com/"
    return fetch(`${domain}/test_data`, {
      body: JSON.stringify(data), // must match 'Content-Type' header
      method: 'POST',
      headers: {
        'user-agent': 'Mozilla/4.0 MDN Example',
        'content-type': 'application/json'
      },
    })
      .then(response => console.log(response)) // parses response to JSON
  }

notifyMe()
