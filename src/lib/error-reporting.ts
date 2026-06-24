type ErrorReportOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") {
    console.error(error, context);
    return;
  }

  console.error(error, {
    source: "react_error_boundary",
    route: window.location.pathname,
    ...context,
  });
}
