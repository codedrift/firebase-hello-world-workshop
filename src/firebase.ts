import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
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

firebase
  .firestore()
  .enablePersistence()
  .catch((err: any) => {
    console.log("Persistence disabled: ", err.code);
    if (err.code === "failed-precondition") {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a a time.
      // ...
    } else if (err.code === "unimplemented") {
      // The current browser does not support all of the
      // features required to enable persistence
      // ...
    }
  });

export const useToDos = (userId: string) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    firebase
      .firestore()
      .collection(`todos/${userId}`)
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

export const createTodo = async (userId: string, text: string) => {
  return firebase
    .firestore()
    .collection(`todos/${userId}`)
    .add({
      text
    });
};
