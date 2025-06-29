import { useEffect } from "react";
import { useLocation } from "wouter";

export default function RedirectHandler() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const redirectUrl = sessionStorage.redirect;
    if (redirectUrl) {
      const path = redirectUrl.replace(
        window.location.origin + "/Educhess",
        ""
      );
      setLocation(path || "/");
      sessionStorage.removeItem("redirect");
    }
  }, []);

  return null;
}
