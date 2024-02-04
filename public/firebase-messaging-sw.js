//public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

const DEFAULT_VAPID_KEY = 'BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4'
const ENDPOINT = 'https://fcmregistrations.googleapis.com/v1'
const urlBase64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

const arrayToBase64 = array => {
  const uint8Array = new Uint8Array(array);
  const base64String = btoa(String.fromCharCode(...uint8Array));
  return base64String.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getHeaders({
  appConfig,
  installations
}) {
  const authToken = await installations.getToken();

  return new Headers({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-goog-api-key': appConfig.apiKey,
    'x-goog-firebase-installations-auth': `FIS ${authToken}`
  });
}

function getBody({
  p256dh,
  auth,
  endpoint,
  vapidKey
}) {
  const body = {
    web: {
      endpoint,
      auth,
      p256dh
    }
  };

  if (vapidKey !== DEFAULT_VAPID_KEY) {
    body.web.applicationPubKey = vapidKey;
  }

  return body;
}
function getEndpoint({ projectId }) {
  return `${ENDPOINT}/projects/${projectId}/registrations`;
}

async function requestGetToken(
  firebaseDependencies,
  subscriptionOptions
) {
  const headers = await getHeaders(firebaseDependencies);
  const body = getBody(subscriptionOptions);

  const subscribeOptions = {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  };

  let responseData;
  try {
    const response = await fetch(
      getEndpoint(firebaseDependencies.appConfig),
      subscribeOptions
    );
    responseData = await response.json();
  } catch (err) {
    throw ERROR_FACTORY.create(ErrorCode.TOKEN_SUBSCRIBE_FAILED, {
      errorInfo: err
    });
  }

  if (responseData.error) {
    const message = responseData.error.message;
    throw ERROR_FACTORY.create(ErrorCode.TOKEN_SUBSCRIBE_FAILED, {
      errorInfo: message
    });
  }

  if (!responseData.token) {
    throw ERROR_FACTORY.create(ErrorCode.TOKEN_SUBSCRIBE_NO_TOKEN);
  }

  return responseData.token;
}


async function requestDeleteToken(
  firebaseDependencies,
  token
) {
  const headers = await getHeaders(firebaseDependencies);

  const unsubscribeOptions = {
    method: 'DELETE',
    headers
  };

  try {
    const response = await fetch(
      `${getEndpoint(firebaseDependencies.appConfig)}/${token}`,
      unsubscribeOptions
    );
    const responseData = await response.json();
    if (responseData.error) {
      const message = responseData.error.message;
      throw ERROR_FACTORY.create(ErrorCode.TOKEN_UNSUBSCRIBE_FAILED, {
        errorInfo: message
      });
    }
  } catch (err) {
    throw ERROR_FACTORY.create(ErrorCode.TOKEN_UNSUBSCRIBE_FAILED, {
      errorInfo: err
    });
  }
}

const DATABASE_NAME = 'firebase-messaging-database';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'firebase-messaging-store';
let dbPromise = null;

function getDbPromise() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onerror = event => {
        reject(event.target.error);
      };

      request.onsuccess = event => {
        const db = event.target.result;
        resolve(db);
      };

      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (event.oldVersion === 0) {
          db.createObjectStore(OBJECT_STORE_NAME);
        }
      };
    });
  }
  return dbPromise;
}
function getKey({ appConfig }) {
  return `${appConfig.appId}`;
} 
async function dbSet(firebaseDependencies, tokenDetails) {
  const key = getKey(firebaseDependencies);
  const db = await getDbPromise();
  const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
  await tx.objectStore(OBJECT_STORE_NAME).put(tokenDetails, key);
  await tx.done;
  return tokenDetails;
}

async function getNewToken(firebaseDependencies, subscriptionOptions) {
  const token = await requestGetToken(firebaseDependencies, subscriptionOptions);
  const tokenDetails = {
    token,
    createTime: Date.now(),
    subscriptionOptions
  };
  await dbSet(firebaseDependencies, tokenDetails);
  return tokenDetails.token;
}

const firebaseConfig = {
  apiKey: "AIzaSyCs-HVXoPyNvgtCTSzbe_kEIrf80DDKwd8",
  authDomain: "aws-combine.firebaseapp.com",
  projectId: "aws-combine",
  storageBucket: "aws-combine.appspot.com",
  messagingSenderId: "277427664559",
  appId: "1:277427664559:web:d6f37cc6a72d5cfe17465a",
  measurementId: "G-TBSQM3JZGQ",
  databaseURL: "https://aws-combine-default-rtdb.asia-southeast1.firebasedatabase.app"
};

firebase.initializeApp(self.firebaseConfig || firebaseConfig);
if (firebase.messaging.isSupported()) {
  const messaging = firebase.messaging();
  messaging.vapidKey = "BHy2NoGMctqKYls5ct9DIDquqBKbKAG1cut9VakoevPfgqUnWfPWW4qmb12K8vdYBWzW0VwNJf9Iesf4MRLdAVY"
  const channel = new BroadcastChannel('notifications');
  messaging.onBackgroundMessage(async function (payload) {
    
    console.log("onBackgroundMessage", payload)
    var dataFromServer = payload.notification;
    var notificationTitle = dataFromServer.title;
    var notificationOptions = {
      body: dataFromServer.body,
      image: dataFromServer.image,
      data: {
        url: payload.data['webpushURL']
      }
    };
   
    return self.registration.showNotification(notificationTitle,
      notificationOptions);
  });

  self.addEventListener('activate', async (e) => {
    const subscription = await self.registration.pushManager.subscribe({
      userVisibleOnly:true, 
      applicationServerKey: urlBase64ToUint8Array(messaging.vapidKey)
    })
    console.log(subscription)
    const subscriptionOptions = {
      vapidKey: messaging.vapidKey,   
      swScope: self.registration.scope,
      endpoint: subscription.endpoint,
      auth: arrayToBase64(subscription.getKey('auth')),
      p256dh: arrayToBase64(subscription.getKey('p256dh'))
    }; 
    console.log(subscriptionOptions)
    
  })
}

self.addEventListener('notificationclick', function (event) {
  console.log("notificationclick", event)
  var urlToRedirect = event.notification.data.url;
  event.notification.close();
  event.waitUntil(self.clients.openWindow(urlToRedirect));

});
