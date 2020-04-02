import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { auth } from "firebase";
import { useState, useEffect } from "react";
import { TodoItem } from "./model";

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

export const useToDos = (userId?: string) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
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

export const createTodo = async (userId: string, text: string) => {
  return firebase
    .firestore()
    .collection(`users/${userId}/todos`)
    .add({
      text
    });
};

export const removeTodo = async (userId: string, todoId: string) => {
  return firebase
    .firestore()
    .collection(`users/${userId}/todos`)
    .doc(todoId)
    .delete();
};

export const login = () =>
  auth().signInWithRedirect(new auth.GoogleAuthProvider());

export const logout = () => {
  auth().signOut();
};

export const useAuth = () => {
  const [user, setUser] = useState<firebase.User | null>(null);

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
