"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export default function AuthSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("tuitora_synced_user");
      }
      return;
    }

    if (user && !syncingRef.current) {
      const syncedId = typeof window !== "undefined" ? sessionStorage.getItem("tuitora_synced_user") : null;

      if (syncedId !== user.id) {
        syncingRef.current = true;
        fetch("/api/auth/sync", { method: "POST" })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && typeof window !== "undefined") {
              sessionStorage.setItem("tuitora_synced_user", user.id);
            }
          })
          .catch((err) => {
            console.error("Immediate user sync failed:", err);
          })
          .finally(() => {
            syncingRef.current = false;
          });
      }
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
}
