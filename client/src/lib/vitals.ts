import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import type { Metric } from "web-vitals";

const BASE_URL = import.meta.env.VITE_API_URL;

function sendToBackend(metric: Metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigation_type: metric.navigationType,
    url: window.location.pathname,
  });

  const url = `${BASE_URL}/vitals`;

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
  } else {
    fetch(url, {
      method: "POST",
      body,
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export function reportWebVitals() {
  onCLS(sendToBackend);
  onFCP(sendToBackend);
  onINP(sendToBackend);
  onLCP(sendToBackend);
  onTTFB(sendToBackend);
}
