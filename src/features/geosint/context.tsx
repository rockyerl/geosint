"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useSyncExternalStore,
} from "react";
import {
  DemoState,
  EventFilter,
  EventStatus,
  Role,
  Briefing,
  Evidence,
  GeoEvent,
  ImportDraft,
  Review,
} from "./types";
import { INITIAL_FIXTURE, STORAGE_KEY } from "./fixtures";
import { GeosintRepository, saveStateToStorage } from "./repository";

export interface ToastMessage {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  timestamp: string;
}

interface GeosintContextValue {
  role: Role;
  setRole: (role: Role) => void;
  state: DemoState;
  repo: GeosintRepository;
  kpis: {
    totalAreas: number;
    activeEvents: number;
    pendingReview: number;
    followUpRequired: number;
    resolvedEvents: number;
  };
  filter: EventFilter;
  setFilter: (updater: EventFilter | ((prev: EventFilter) => EventFilter)) => void;
  clearFilter: () => void;
  reviewEvent: (
    eventId: string,
    targetStatus: EventStatus,
    note: string,
    evidenceIds: string[]
  ) => { success: boolean; error?: string; review?: Review; event?: GeoEvent };
  simulateImport: (draft: ImportDraft) => {
    success: boolean;
    isDuplicate?: boolean;
    message?: string;
    error?: string;
    evidence?: Evidence;
  };
  publishBriefing: (
    eventId: string,
    bahan: { findings: string; limitations: string; nextAction: string }
  ) => { success: boolean; error?: string; briefing?: Briefing };
  resetDemo: (confirmed: boolean) => { success: boolean; error?: string; message?: string };
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  showToast: (message: string, type?: "info" | "success" | "warning" | "error") => void;
}

const GeosintContext = createContext<GeosintContextValue | null>(null);

const ROLE_STORAGE_KEY = "geosint-role-v1";

function notifySync() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("geosint-sync"));
  }
}

function subscribeSync(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("storage", callback);
  window.addEventListener("geosint-sync", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("geosint-sync", callback);
  };
}

let cachedRoleRaw: string | null = null;
let cachedRole: Role = "analis";

function getRoleSnapshot(): Role {
  if (typeof window === "undefined") return "analis";
  const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
  if (stored !== cachedRoleRaw) {
    cachedRoleRaw = stored;
    cachedRole =
      stored === "pimpinan" || stored === "analis" || stored === "operator" ? stored : "analis";
  }
  return cachedRole;
}

function getRoleServerSnapshot(): Role {
  return "analis";
}

let cachedStateRaw: string | null = null;
let cachedState: DemoState = INITIAL_FIXTURE;

function getStateSnapshot(): DemoState {
  if (typeof window === "undefined") return INITIAL_FIXTURE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cachedState;
    }
    if (raw === cachedStateRaw) {
      return cachedState;
    }
    const parsed = JSON.parse(raw);
    if (parsed && parsed.fixtureVersion === 2 && Array.isArray(parsed.events)) {
      cachedStateRaw = raw;
      cachedState = parsed as DemoState;
      return cachedState;
    }
  } catch {
    // ignore parse errors
  }
  return cachedState;
}

function getStateServerSnapshot(): DemoState {
  return INITIAL_FIXTURE;
}

export function GeosintProvider({ children }: { children: React.ReactNode }) {
  // Use React's useSyncExternalStore to subscribe to client storage with 100% hydration safety
  const role = useSyncExternalStore(subscribeSync, getRoleSnapshot, getRoleServerSnapshot);
  const state = useSyncExternalStore(subscribeSync, getStateSnapshot, getStateServerSnapshot);

  const [filter, setFilterState] = useState<EventFilter>({
    aoiId: "all",
    kind: "all",
    status: "all",
    search: "",
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [
        ...prev.slice(-4),
        { id, message, type, timestamp: new Date().toLocaleTimeString("id-ID") },
      ]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setRole = useCallback((newRole: Role) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ROLE_STORAGE_KEY, newRole);
      document.cookie = `geosint_role=${newRole}; path=/; max-age=86400; SameSite=Lax`;
      cachedRoleRaw = newRole;
      cachedRole = newRole;
      notifySync();
    }
  }, []);

  const commitState = useCallback((newState: DemoState) => {
    cachedState = newState;
    cachedStateRaw = JSON.stringify(newState);
    saveStateToStorage(newState);
    notifySync();
  }, []);

  // Instance of repository bound to current state
  const repo = useMemo(() => new GeosintRepository(state), [state]);

  const clearFilter = useCallback(() => {
    setFilterState({
      aoiId: "all",
      kind: "all",
      status: "all",
      search: "",
    });
  }, []);

  const reviewEvent = useCallback(
    (eventId: string, targetStatus: EventStatus, note: string, evidenceIds: string[]) => {
      const activeRepo = new GeosintRepository(state);
      const res = activeRepo.reviewEvent(role, eventId, targetStatus, note, evidenceIds);
      if (res.success) {
        commitState(activeRepo.getState());
        showToast(`Status ${eventId} diperbarui menjadi ${targetStatus}`, "success");
        return { success: true, review: res.review, event: res.event };
      } else {
        showToast(res.error, "error");
        return { success: false, error: res.error };
      }
    },
    [role, state, commitState, showToast]
  );

  const simulateImport = useCallback(
    (draft: ImportDraft) => {
      const activeRepo = new GeosintRepository(state);
      const res = activeRepo.simulateImport(role, draft);
      commitState(activeRepo.getState());
      if (res.success) {
        if (res.isDuplicate) {
          showToast(res.message || "Batch duplikat terdeteksi", "warning");
        } else {
          showToast(res.message || "Batch berhasil diimpor", "success");
        }
        return {
          success: true,
          isDuplicate: res.isDuplicate,
          message: res.message,
          evidence: res.evidence,
        };
      } else {
        showToast(res.error, "error");
        return { success: false, error: res.error };
      }
    },
    [role, state, commitState, showToast]
  );

  const publishBriefing = useCallback(
    (eventId: string, bahan: { findings: string; limitations: string; nextAction: string }) => {
      const activeRepo = new GeosintRepository(state);
      const res = activeRepo.publishBriefing(role, eventId, bahan);
      if (res.success) {
        commitState(activeRepo.getState());
        showToast(
          `Briefing v${res.briefing.version} berhasil disetujui & dipublikasikan`,
          "success"
        );
        return { success: true, briefing: res.briefing };
      } else {
        showToast(res.error, "error");
        return { success: false, error: res.error };
      }
    },
    [role, state, commitState, showToast]
  );

  const resetDemo = useCallback(
    (confirmed: boolean) => {
      const activeRepo = new GeosintRepository(state);
      const res = activeRepo.resetDemo(role, confirmed);
      if (res.success) {
        commitState(res.state);
        clearFilter();
        showToast("Sistem berhasil di-reset ke data awal demonstrasi", "info");
        return { success: true, message: res.message };
      } else {
        showToast(res.error, "error");
        return { success: false, error: res.error };
      }
    },
    [role, state, commitState, clearFilter, showToast]
  );

  const kpis = useMemo(() => {
    return repo.getKpis();
  }, [repo]);

  return (
    <GeosintContext.Provider
      value={{
        role,
        setRole,
        state,
        repo,
        kpis,
        filter,
        setFilter: setFilterState,
        clearFilter,
        reviewEvent,
        simulateImport,
        publishBriefing,
        resetDemo,
        toasts,
        dismissToast,
        showToast,
      }}
    >
      {children}
    </GeosintContext.Provider>
  );
}

export function useGeosint() {
  const ctx = useContext(GeosintContext);
  if (!ctx) {
    throw new Error("useGeosint must be used within a GeosintProvider");
  }
  return ctx;
}
