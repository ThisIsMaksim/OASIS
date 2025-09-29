export const API_BASE_URL = "http://158.160.200.56:8080";
/* Bridge between WebView (React) and native (Flutter) via JS exposed API and postMessage */
import { useAppStore } from "../store/useAppStore";

type NavigatorFn = (path: string) => void;

let navigatorFn: NavigatorFn | null = null;

export function registerNavigator(fn: NavigatorFn) {
  navigatorFn = fn;
}

function navigateTo(path: string) {
  if (navigatorFn) {
    navigatorFn(path);
  } else {
    // Fallback for hash router if navigator not yet registered
    if (!path.startsWith("/")) path = "/" + path;
    window.location.hash = "#" + path;
  }
}

function notify(event: string, payload: unknown) {
  const message = { source: "webapp", event, payload };
  try {
    // Notify generic listeners (e.g., web)
    window.postMessage(message, "*");
  } catch {
    // no-op
  }
  try {
    // Notify Flutter webview via JavaScriptChannel if injected
    // In Flutter (webview_flutter), create a JavascriptChannel named "FlutterBridge"
    // and call: controller.addJavaScriptChannel("FlutterBridge", onMessageReceived: ...)
    // This will receive the stringified payload below.
    // @ts-ignore
    if (typeof window !== "undefined" && (window as any).FlutterBridge?.postMessage) {
      // @ts-ignore
      (window as any).FlutterBridge.postMessage(JSON.stringify(message));
    }
  } catch {
    // no-op
  }
}

export type WebAppBridge = {
  getAvatarUrl: () => string | null;
  setAvatarUrl: (url: string | null) => void;
  openEditor: () => void;
  openViewer: () => void;
};

declare global {
  interface Window {
    WebAppBridge?: WebAppBridge;
  }
}

export function initBridge() {
  const getState = () => useAppStore.getState();

  window.WebAppBridge = {
    getAvatarUrl: () => getState().avatarUrl,
    setAvatarUrl: (url) => {
      getState().setAvatarUrl(url);
      notify("avatar.updated", { url });
    },
    openEditor: () => navigateTo("/editor"),
    openViewer: () => navigateTo("/viewer"),
  };
}

export function notifyAvatarExported(url: string) {
  notify("avatar.exported", { url });
}
/* Inbound messages from Flutter WebView (window.postMessage({...}) from native) */
if (typeof window !== "undefined") {
  const __flutterInboundHandler = (ev: MessageEvent) => {
    const data: any = (ev as MessageEvent<any>).data;
    if (!data || typeof data !== "object") return;
    if ((data as any).source !== "flutter") return;

    try {
      const event: string | undefined = (data as any).event;
      const payload: any = (data as any).payload;

      // Flutter native can push current avatar url into the web app
      // via: window.postMessage({ source: 'flutter', event: 'avatar.push', payload: { url } }, '*')
      if (event === "avatar.push") {
        const url = payload?.url ?? null;
        // Update local state so the entire web UI (viewer, etc.) reacts
        useAppStore.getState().setAvatarUrl(url);
      }
    } catch {
      // ignore malformed messages
    }
  };

  // Avoid duplicate listener registration during HMR in dev
  // @ts-ignore
  if (!(window as any).__flutterInboundInstalled) {
    window.addEventListener("message", __flutterInboundHandler);
    // @ts-ignore
    (window as any).__flutterInboundInstalled = true;
  }
}