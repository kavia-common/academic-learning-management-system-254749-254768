 /**
  * PUBLIC_INTERFACE
  * notifyError
  * Displays a simple alert for errors. Replace with a toast system if available.
  */
export function notifyError(message) {
  /** This is a public function. Simple user-facing error notification. */
  // Basic fallback: alert
  // Avoid leaking sensitive info; keep messages user-friendly in production.
  // In a real app, route to a toast/notification component.
  if (typeof window !== "undefined") {
    window.alert(message || "An error occurred. Please try again.");
  }
}
