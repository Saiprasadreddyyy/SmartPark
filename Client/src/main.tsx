import React from "react";
import ReactDOM from "react-dom/client";
import socket from "./socket/socket";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./index.css";
import "./styles/theme.css";

socket.connect();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);