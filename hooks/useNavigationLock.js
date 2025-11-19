// hooks/useNavigationLock.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { getSession } from "../lib/sessionClient";

/**
 * Prevents browser back button & refresh during protected routes.
 * Redirects to login if no valid session found.
 */
export default function useNavigationLock(allowedPath = "/login") {
  const router = useRouter();

  useEffect(() => {
    // Prevent back navigation
    const pushState = () => window.history.pushState(null, "", window.location.href);
    pushState();
    const onPop = () => pushState();
    window.addEventListener("popstate", onPop);

    // Disable refresh (F5, Ctrl+R / Cmd+R)
    const onKey = (e) => {
      if (
        e.key === "F5" ||
        (e.ctrlKey && e.key.toLowerCase() === "r") ||
        (e.metaKey && e.key.toLowerCase() === "r")
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);

    // Session enforcement
    const session = getSession();
    if (!session && allowedPath !== "/login") {
      router.replace("/login");
    }

    // Cleanup
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("keydown", onKey);
    };
  }, [router, allowedPath]);
}
