import { useCallback, useEffect, useState } from "react";

export function useTelaoFullscreen(enabled) {
  const [precisaClique, setPrecisaClique] = useState(false);

  const entrarFullscreen = useCallback(async () => {
    if (!enabled || !document.documentElement.requestFullscreen) return;
    try {
      if (document.fullscreenElement) return;
      await document.documentElement.requestFullscreen();
      setPrecisaClique(false);
    } catch {
      setPrecisaClique(true);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    entrarFullscreen();
    const onFsChange = () => {
      if (!document.fullscreenElement) setPrecisaClique(true);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [enabled, entrarFullscreen]);

  return { precisaClique, entrarFullscreen };
}
