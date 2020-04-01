import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { createTodo, useToDos } from "./firebase";

function App() {
  const [text, setText] = useState("");
  const todos = useToDos("ich");

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleCreateTodo = () => {
    if(text) {
      createTodo("ich", text);
      setText("");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <div>
        <ul>
          {todos.map(t => (
            <li key={t.id}>{t.text}</li>
          ))}
        </ul>
        <div>
          <input type="text" value={text} onChange={handleTextChange} />
          <button onClick={handleCreateTodo}>Create</button>
        </div>
      </div>
    </div>
  );
}

export default App;
