
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import { Auth0ContextProvider } from "./context/Auth0Context.tsx";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(
    <Auth0ContextProvider>
      <App />
    </Auth0ContextProvider>
  );
  