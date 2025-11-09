
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const CLIENT_ID = "545463699061-8ragccbe0lgfb662pco5qnj2q65v452t.apps.googleusercontent.com"

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
)