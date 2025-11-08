import api from "./api/api.js";

api
  .get("/health")
  .then((r) => console.log("API health:", r.data))
  .catch(console.error);


import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from 'react-router-dom';
import {AuthProvider} from './auth/AuthContext.jsx'

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);
