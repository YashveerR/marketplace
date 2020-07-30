import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "mobx-react";
import store from "./stores";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import Firebase, { FirebaseContext } from "./components/Firebase";

ReactDOM.render(
  <React.StrictMode>
    <Provider {...store}>
      <FirebaseContext.Provider value={new Firebase()}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FirebaseContext.Provider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA <App />
serviceWorker.unregister();
