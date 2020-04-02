# firebase-hello-world-workshop

This firebase hello world tutorial will guide you through the process of creating your very first firebase project.

No credit card required!

These are the topics we will cover:

- Setting up a simple PWA (Progressive Web App)
- Setting up a new firebase project
- Reading/Writing data to the database (And receiving real time updates!)
- Adding authentication
- Securing the data
- Deploying to production! 🚀

---

## 1. Create a new web app

Everything begins with some code.

These days it has gotten very common to create progressive web apps. They are very easy to develop, deploy, maintain and work on every device that has a web browser.
We will use a react PWA for this tutorial but you can use anything as long as it creates web artefacts that can be statically served.

E.g. create-react-app creates a `build` folder.

Meaning a html file and javascript in a `<script></script>` will do as well.

Alright. Lets get started!

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

Now we need an actual firebase project. This process is specific to firebase and these steps are the fastest way to get started. After creating a few firebase projects (trust me you will do this quite often from now on ;)) this goes pretty fast.
This is the heavy lifting so lets get to it!

NOTE: Once you create your firestore in a specific region (e.g. eu-west or us-central) you cannot go back. Choose wisely!

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

Extra work for our PWA:

To make sure our app gets built every time we deploy add the following configuration to `firebase.json`

```json
"hosting": {
...
"predeploy": ["npm install", "npm run build"],
...
}
```


5. Install firebase in the project `npm i firebase`
6. Create a file where all the firebase code lives e.g. `src/firebase.ts`
7. Copy the project configuration from the firebase console (App-settings -> Configuration) and use it to initialize the firebase instance.

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

## 3. Add some data

Next we're going to add some data to the firestore and read it (duh!).

1. Creating and deleting data is a walk in the park

```javascript
export const createTodo = async (userId: string, text: string) => {
  return (
    firebase
      .firestore()
      .collection(`users/${userId}/todos`)
      // this will auto generate an id for us
      .add({
        text
      })
  );
};

export const removeTodo = async (userId: string, todoId: string) => {
  return firebase
    .firestore()
    .collection(`users/${userId}/todos`)
    .doc(todoId)
    .delete();
};
```

2. Now add a function to read data

We can use [React Hooks](https://reactjs.org/docs/hooks-intro.html) to listen for changes and handle some state for us.

```javascript

export const useToDos = (userId: string) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    firebase
      .firestore()
      // do not bother with this collection path. we will cover that soon!
      .collection(`users/${userId}/todos`)
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

3. Add an input field and buttons to create and delete todos.

See `App.tsx` for an implementation with react.

Of course you can do this as you like. Don't get lost in CSS just now. We still have some important stuff to do.

👇👇👇

## 4. Authentication

The next thing you probably wanna do is add authentication. This is probably the easiest part of firebase. But see for yourself...

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
    // once initialized our app will receive all auth state changes
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
        .collection(`users/${userId}/todos`)
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

Thats it. Time to go live....

## 6. Go live live to PRODUCTION

1. Run `firebase deploy` in the project directory
   1. This will automatically create all the security rules and deploy our web app.
2. [Look at what you've done (The app should be deployed now!)](https://fir-hello-world-workshop-d5076.firebaseapp.com/)
