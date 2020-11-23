import React from "react";
import ReactDOM from "react-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";
import "./index.css";

ReactDOM.render(
  <Auth0Provider
    domain="fsnd-projx.us.auth0.com"
    clientId="mEjuktD53sengTxLtjq0Lpk3chmZ9szm"
    redirectUri={window.location.origin}
  >
    <App />
  </Auth0Provider>,
  document.getElementById("app")
);
