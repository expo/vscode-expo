/**
 * useTrackingPermissions.js
 *
 * React hook to query and request App Tracking Transparency (ATT) permissions on iOS.
 * - Uses expo-tracking-transparency if available at runtime (works in managed and bare Expo).
 * - On Android the concept of ATT does not apply; the hook returns "not-applicable".
 *
 * Exports:
 *   default function useTrackingPermissions()
 *     returns {
 *       status,                            // 'undetermined' | 'granted' | 'denied' | 'blocked' | 'not-applicable' | 'unavailable'
 *       getTrackingPermissionAsync,       // async -> status
 *       requestTrackingPermissionAsync,   // async -> status
 *       openSettings                      // async -> void (attempts to open OS settings)
 *     }
 *
 * Usage:
 *   const {
 *     status,
 *     getTrackingPermissionAsync,
 *     requestTrackingPermissionAsync,
 *     openSettings
 *   } = useTrackingPermissions();
 *
 * Notes:
 * - This file is defensive: it will not throw if expo-tracking-transparency isn't installed,
 *   but will return 'unavailable' or 'not-applicable' as appropriate.
 * - If you want stricter behavior, install expo-tracking-transparency and ensure it's present at build time.
 */

import { useCallback, useEffect, useState } from "react";
import { Platform, Linking } from "react-native";

let Tracking;
try {
  // Resolve at runtime so this file is safe even when the package isn't installed.
  // In EAS builds / local dev, expo-tracking-transparency provides the ATT APIs on iOS.
  // eslint-disable-next-line global-require
  Tracking = require("expo-tracking-transparency");
} catch (e) {
  Tracking = null;
}

/** Normalized status values returned by this hook */
const STATUS = {
  UNDETERMINED: "undetermined",
  GRANTED: "granted",
  DENIED: "denied",
  BLOCKED: "blocked",
  NOT_APPLICABLE: "not-applicable",
  UNAVAILABLE: "unavailable",
};

function normalizeRawStatus(raw) {
  if (!raw) return STATUS.UNAVAILABLE;
  const s = String(raw).toLowerCase();

  // Common values returned by various libraries/versions:
  // 'not-determined', 'not_determined', 'undetermined' => undetermined
  // 'authorized', 'granted' => granted
  // 'denied' => denied
  // 'restricted', 'blocked' => blocked
  if (s.includes("not") && (s.includes("determined") || s.includes("determined"))) {
    return STATUS.UNDETERMINED;
  }
  if (s === "not-determined" || s === "not_determined" || s === "undetermined") {
    return STATUS.UNDETERMINED;
  }
  if (s === "authorized" || s === "granted") return STATUS.GRANTED;
  if (s === "denied") return STATUS.DENIED;
  if (s === "restricted" || s === "blocked") return STATUS.BLOCKED;

  // Fallback: if iOS and module present but unknown, return unavailable
  return STATUS.UNAVAILABLE;
}

/** Query current tracking permission status */
async function queryStatus() {
  try {
    if (Platform.OS === "ios" && Tracking && typeof Tracking.getTrackingStatusAsync === "function") {
      // Some versions return a string, others return { status: "..." }
      const raw = await Tracking.getTrackingStatusAsync();
      if (raw && typeof raw === "object" && raw.status) {
        return normalizeRawStatus(raw.status);
      }
      return normalizeRawStatus(raw);
    }

    if (Platform.OS === "android") {
      // ATT is an iOS concept. Return not-applicable to indicate there's nothing to request.
      return STATUS.NOT_APPLICABLE;
    }

    return STATUS.UNAVAILABLE;
  } catch (err) {
    // Fail safe: don't throw from the hook
    // eslint-disable-next-line no-console
    console.warn("[useTrackingPermissions] queryStatus error:", err);
    return STATUS.UNAVAILABLE;
  }
}

/** Request tracking permission from the OS (iOS ATT) */
async function requestPermission() {
  try {
    if (Platform.OS === "ios" && Tracking && typeof Tracking.requestTrackingPermissionsAsync === "function") {
      const res = await Tracking.requestTrackingPermissionsAsync();
      // Some versions return { status: 'authorized' } others return string
      if (res && typeof res === "object" && res.status) {
        return normalizeRawStatus(res.status);
      }
      return normalizeRawStatus(res);
    }

    if (Platform.OS === "android") {
      // No ATT flow on Android — treat as not-applicable (or granted depending on your needs)
      return STATUS.NOT_APPLICABLE;
    }

    return STATUS.UNAVAILABLE;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[useTrackingPermissions] requestPermission error:", err);
    return STATUS.UNAVAILABLE;
  }
}

/** Attempt to open the app settings so the user can change permissions manually */
async function openAppSettings() {
  try {
    if (Linking && typeof Linking.openSettings === "function") {
      await Linking.openSettings();
    } else if (Linking && typeof Linking.openURL === "function") {
      // Fallback: try the generic app settings url
      await Linking.openURL("app-settings:");
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[useTrackingPermissions] openAppSettings error:", err);
    throw err;
  }
}

/** Hook */
export default function useTrackingPermissions() {
  const [status, setStatus] = useState(STATUS.UNAVAILABLE);

  const getTrackingPermissionAsync = useCallback(async () => {
    const s = await queryStatus();
    setStatus(s);
    return s;
  }, []);

  const requestTrackingPermissionAsync = useCallback(async () => {
    const s = await requestPermission();
    setStatus(s);
    return s;
  }, []);

  const openSettings = useCallback(async () => {
    await openAppSettings();
  }, []);

  useEffect(() => {
    // On mount, read current status
    let mounted = true;
    (async () => {
      const s = await queryStatus();
      if (mounted) setStatus(s);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return {
    status,
    getTrackingPermissionAsync,
    requestTrackingPermissionAsync,
    openSettings,
    STATUS, // expose status enum for callers
  };
}
