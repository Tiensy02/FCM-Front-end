import { ref, set, update, query, orderByChild, onValue, equalTo } from "firebase/database";
import { getToken } from "firebase/messaging";
import { dbFirebase } from "./index";
import { messaging } from "./index";

const DEFAULT_VAPID_KEY = 'BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4'
const ENDPOINT = 'https://fcmregistrations.googleapis.com/v1'
const DATABASE_NAME = 'firebase-messaging-database';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'firebase-messaging-store';
let dbPromise


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
    console.log("errror")
  }

  if (responseData.error) {
    const message = responseData.error.message;
    console.log(message)
  }

  if (!responseData.token) {
    console.log("errror")
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
      console.log(message)
    }
  } catch (err) {
    console.log("errror")
  }
}

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
  return `clientGet! ${appConfig.appId}`;
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

const createToken = async () => {
  getToken(messaging, { vapidKey: 'BHy2NoGMctqKYls5ct9DIDquqBKbKAG1cut9VakoevPfgqUnWfPWW4qmb12K8vdYBWzW0VwNJf9Iesf4MRLdAVY' }).then(currenToken => {
    console.log(currenToken)
  })
}


const addRecord = async (name, password, pattern, browserID, token) => {
  try {
    await set(ref(dbFirebase, 'User/' + `${pattern}!${name}`), {
      userName: name,
      userPassword: password,
      pattern,
      tokenDetail: {
        web: [{ browserID, token }],
        app: [],
        ios: []
      }
    });
    console.log("Add success");
  } catch (error) {
    console.error("Add error:", error);
  }
};


/**
 * 
 * @param {String} key khoá của user
 * @param {Object} tokenDetail 
 */
const updateData = (key, tokenDetail) => {

     update(ref(dbFirebase, 'User/' + key), {
      tokenDetail
    }).then(()=> {
      console.log("update success")
    }).catch(error => {
      console.log(error)
    })
}

const login = async (userName, password, pattern) => {

  if (userName === 'nguyentiensy') {
    const user = {
      userName,pattern
    }
    user['admin'] = true
    localStorage.setItem('userData', JSON.stringify(user))
  } else {
    const subscriptionOptions = await getSubscriptionOptions();
    try {
      var user = await getUser(userName, pattern)
    } catch {
      user = null
    }

    if (user) {
      let isBrowserExist = false
      let web = []
      const token = await getNewToken(messaging.firebaseDependencies, subscriptionOptions)
      let oldWebUSer = user?.tokenDetail?.web ?? []
      oldWebUSer.forEach((element,index) => {
        if (element['browserID'] === JSON.stringify(navigator.userAgentData)) {
          oldWebUSer[index].token = token
          isBrowserExist = true
        }
      });
      if (!isBrowserExist) {
        const webElem = {
          browserID: JSON.stringify(navigator.userAgentData),
          token
        }
         web = [...oldWebUSer, webElem]
      }else {
         web = oldWebUSer
      }
        const tokenDetail = user?.tokenDetail ? {...user['tokenDetail'], web} : {web}
        updateData(user.key,tokenDetail)
    
  }
  else {
    const newToken = await getNewToken(messaging.firebaseDependencies, subscriptionOptions);
    await addRecord(userName, password, pattern, JSON.stringify(navigator.userAgentData), newToken);
  }
  localStorage.setItem("userData", JSON.stringify({userName,pattern}))
}
}
const logout = async () => {
  const user = JSON.parse(localStorage.getItem("userData"))
  if(!user) {
    console.log("error")
  }else {
    try {
      const userDB = await getUser(user.userName,user.pattern)
      let tokenWeb = userDB?.tokenDetail?.web ?? []
      let token =""
      tokenWeb.forEach((element,index) => {
        if (element['browserID'] === JSON.stringify(navigator.userAgentData)) {
          token = tokenWeb[index].token 
          tokenWeb[index] = {}
        }
      });
      const web = tokenWeb.filter(elm => elm != {})
       requestDeleteToken(messaging.firebaseDependencies, token)
       const tokenDetail =  {...userDB['tokenDetail'], web} 
       updateData(userDB.key,tokenDetail)
       localStorage.removeItem("userData")

    } catch(error) {
      console.log(error)
    }

  }
}


function getUser(userName, pattern) {
  return new Promise((resolve, reject) => {
    const usersRef = ref(dbFirebase, "/User");
    const order = [orderByChild('userName'), equalTo(userName)]
    const query1 = query(usersRef, ...order)
    onValue(query1, snapshot => {
      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        if (user['pattern'] == pattern) {
          resolve({...user, key: childSnapshot.key})
        }
      });
      reject("error")
    })
  })
}
async function getSubscriptionOptions() {
  const subscription = await messaging.swRegistration.pushManager.getSubscription();

  const subscriptionOptions = {
    vapidKey: messaging.vapidKey,
    swScope: messaging.swRegistration.scope,
    endpoint: subscription.endpoint,
    auth: arrayToBase64(subscription.getKey('auth')),
    p256dh: arrayToBase64(subscription.getKey('p256dh'))
  };
  return subscriptionOptions
}

export { createToken, login, logout };


