import { useEffect } from "react";
import { useLogo } from "../../features/logo";

export function Favicon() {
  const { logo } = useLogo();

  useEffect(() => {
    const link =
      (document.querySelector("link[rel='icon']") as HTMLLinkElement) ||
      document.createElement("link");
    link.rel = "icon";
    link.type = logo ? "image/png" : "image/svg+xml";

    if (logo) {
      link.href = logo;
    } else {
      link.href =
        "data:image/svg+xml," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="%2310b981"/><text x="16" y="22" text-anchor="middle" font-size="18" font-weight="bold" fill="white" font-family="sans-serif">C</text></svg>`
        );
    }

    document.head.appendChild(link);
  }, [logo]);

  return null;
}
