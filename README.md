# firebase-hello-world-workshop

## 1. Create a new PWA web app (react)

We will use a react pwa for this tutorial but you can use anything as long as it creates web artefacts that can be statically served.

E.g. create-react-app creates a `build` folder.

Now, create the pwa:

```bash
npx create-react-app firebase-hello-world-workshop --template typescript
```

Start app

```bash
npm start
```

Build app

```bash
npm run build
```

## 2. Setup new firebase project

1. [firebase.com](https://console.firebase.google.com/)
2. Add new project
   1. Call it whatever you like e.g. `firebase-hello-world-workshop`
   2. No need for analytics
3. Register a new web app
   1. Call it whatever you like e.g. `my-web-app`
   2. Also set up hosting (checkbox)
   3. Init firestore
      1. Select correct region (eu-west)
      2. Start in test mode (not secure!)
4. Install firebase tools globally
   1. `npm install -g firebase-tools`
   2. `firebase login`
   3. `firebase init`
      1. Select existing project from step
      2. Select `Firestore` and `Hosting` for setup
      3. Select default location for `firestore.rules` and `firestore.indexes.json`
      4. Set `build` as public web directory
      5. Answer `yes` when asked for single page setup
5. Run `firebase deploy`
6. [Look at what you've done (The app should be deployed now!](https://fir-hello-world-workshop-d5076.firebaseapp.com/)

## 3. Add some data

1. Install firebase in the project `npm i firebase`

2. Create a file where all the firebase code lives e.g. `src/firebase.ts`

3. Copy the project configuration from the firebase console (App-settings -> Configuration) and use it to initialize the firebase instance.

It should look like this

```javascript
import firebase from "firebase/app";

// This config can be public
const firebaseConfig = {
  apiKey: "AIzaSyDfrjOtN-QQkffT6aJidFUAFtap010mHOw",
  authDomain: "fir-hello-world-workshop-d5076.firebaseapp.com",
  databaseURL: "https://fir-hello-world-workshop-d5076.firebaseio.com",
  projectId: "fir-hello-world-workshop-d5076",
  storageBucket: "fir-hello-world-workshop-d5076.appspot.com",
  messagingSenderId: "496398002753",
  appId: "1:496398002753:web:9911086dbbd106cdbaf4c0"
};

firebase.initializeApp(firebaseConfig);
```

1. Add a function to read data

We can use [React Hooks](https://reactjs.org/docs/hooks-intro.html) to listen for changes and handle some state for us.

```javascript

export const useToDos = (userId: string) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    firebase
      .firestore()
      // do not bother with this collection path. we will cover that soon!
      .collection(`user/${userId}/todos`)
      .onSnapshot(({ docs }) =>
        setTodos(
          docs.map(d => ({
            id: d.id,
            ...(d.data() as TodoItem)
          }))
        )
      );
  }, [userId]);

  return todos;
};
```

5. Adding and creating data is just as simple

```javascript
export const createTodo = async (userId: string, text: string) => {
  return (
    firebase
      .firestore()
      .collection(`user/${userId}/todos`)
      // this will auto generate an id for us
      .add({
        text
      })
  );
};

export const removeTodo = async (userId: string, todoId: string) => {
  return firebase
    .firestore()
    .collection(`user/${userId}/todos`)
    .doc(todoId)
    .delete();
};
```

6. Add some input field and button to create and delete todos.

See `App.tsx` for an implementation with react

## 4. Authentication

1.  Go to to firebase console -> authentication -> sign in method
2.  Select "Google"
    1. check "Activate"
    2. Select support email
    3. Click save
3.  Add login/logout code to `firebase.ts`

```javascript
import "firebase/auth";
import { auth } from "firebase";

export const login = () =>
  auth().signInWithRedirect(new auth.GoogleAuthProvider());

export const logout = () => {
  auth().signOut();
};
```

4. Add auth state to `firebase.ts`

```javascript
export const useAuth = () => {
  const [user, setUser] = (useState < firebase.User) | (null > null);

  useEffect(() => {
    auth().onAuthStateChanged(async (authUser: firebase.User | null) => {
      console.log("Auth changed", authUser);
      setUser(authUser);
      if (authUser) {
        console.log("User is logged in!");
      } else {
        console.log("User is logged out!");
      }
    });
  }, []);

  return user;
};
```

5. Use this auth state in `App.tsx`

```javascript
const user = useAuth();
// show login button if user is logged out
if (!user) {
  return <button onClick={login}>Login</button>;
}
```

6. Update `useToDos` to handle an `undefined` userId and replace the faked userid we used before

```javascript
// add the ? for typescript to accept undefined values
export const useToDos = (userId?: string) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    // this simple if will do
    if (userId) {
      firebase
        .firestore()
        .collection(`user/${userId}/todos`)
        .onSnapshot(({ docs }) =>
          setTodos(
            docs.map(d => ({
              id: d.id,
              ...(d.data() as TodoItem)
            }))
          )
        );
    }
  }, [userId]);

  return todos;
};
```

7. Add a "Logout" Button (i usually forget this)



## 5. Security

Up until now every user is able to access all the data. Our Firestore is running in "testmode" and will be sealed off after 30 days. Now that we have authentication set up it is time to secure the data.

Configure `firestore.rules` to look like this:

```default
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/todos/{document=**} {
      allow create, read, update, delete: if request.auth.uid == userId;
    }
  }
}
```