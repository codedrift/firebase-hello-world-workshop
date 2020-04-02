import React, { useState } from "react";
import styles from "./App.module.css";
import { createTodo, useToDos, removeTodo, useAuth, login, logout } from "./firebase";

function App() {
  // all the hooks first
  // hook rule #1: they always have to be called in the same order
  const [text, setText] = useState("");
  const user = useAuth();
  const todos = useToDos(user?.uid);

  // show login button if user is logged out
  if (!user) {
    return <button onClick={login} className={styles.authButton}>Login</button>;
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleCreateTodo = () => {
    // only create the todo if we have text and the user is logged in
    if (text && user) {
      createTodo(user?.uid, text);
      setText("");
    }
  };

  const handleRemoveTodo = (todoId: string) => () => {
    if(user) {
      removeTodo(user?.uid, todoId);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.contentWrapper}>
        <div className={styles.todoList}>
          {todos.map(t => (
            <div className={styles.todoItem} key={t.id}>
              {t.text} <button onClick={handleRemoveTodo(t.id)}>X</button>
            </div>
          ))}
          <div className={styles.todoItem}>
            <input type="text" value={text} onChange={handleTextChange} />
            <button onClick={handleCreateTodo}>Add todo</button>
          </div>
        </div>
        <button onClick={logout} className={styles.authButton}>Logout</button>;
      </div>
    </div>
  );
}

export default App;
