/* @refresh reload */
import "solid-devtools";
import { registerSW } from "virtual:pwa-register";
import { render } from "solid-js/web";

registerSW({
  onNeedRefresh() {
    console.log("New version available");
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});

import App from "./app";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(() => <App />, root!);
