import api from "./api/api.js";

api
  .get("/health")
  .then((r) => console.log("API health:", r.data))
  .catch(console.error);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import {AuthProvider} from './auth/AuthContext.jsx'
import { ThemeProvider } from './theme/ThemeProvider.jsx'

import App from "./App.jsx";
import './styles/app.css'

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
