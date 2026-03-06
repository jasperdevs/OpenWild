"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { APP_VERSION } from "@/lib/gowilder-data";

type SessionUser = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  premium: boolean;
  provider: "email" | "google";
};

type Credentials = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

type SessionContextValue = {
  ready: boolean;
  user: SessionUser | null;
  releaseNotesOpen: boolean;
  signIn: (credentials: Credentials) => void;
  register: (credentials: Credentials) => void;
  signInWithGoogle: () => void;
  signOut: () => void;
  upgrade: () => void;
  dismissReleaseNotes: () => void;
};

const SESSION_STORAGE_KEY = "gowilder-local-user";
const RELEASE_NOTES_STORAGE_KEY = "gowilder-release-notes";

const SessionContext = createContext<SessionContextValue | null>(null);

function readUser() {
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function writeUser(user: SessionUser | null) {
  if (!user) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

function getFallbackName(email: string) {
  const [value] = email.split("@");

  return value.replace(/[._-]/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false);

  useEffect(() => {
    const storedUser = readUser();
    const releaseNotesVersion = window.localStorage.getItem(RELEASE_NOTES_STORAGE_KEY);

    /* eslint-disable react-hooks/set-state-in-effect */
    setUser(storedUser);
    setReleaseNotesOpen(releaseNotesVersion !== APP_VERSION);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const value: SessionContextValue = {
    ready,
    user,
    releaseNotesOpen,
    signIn: (credentials) => {
      const existingUser = readUser();
      const nextUser: SessionUser =
        existingUser && existingUser.email === credentials.email
          ? existingUser
          : {
              firstName: credentials.firstName || getFallbackName(credentials.email),
              lastName: credentials.lastName || "",
              email: credentials.email,
              phone: credentials.phone,
              premium: /premium|vip|pro/.test(credentials.email.toLowerCase()),
              provider: "email",
            };

      writeUser(nextUser);
      setUser(nextUser);
    },
    register: (credentials) => {
      const nextUser: SessionUser = {
        firstName: credentials.firstName || "Traveler",
        lastName: credentials.lastName || "",
        email: credentials.email,
        phone: credentials.phone,
        premium: false,
        provider: "email",
      };

      writeUser(nextUser);
      setUser(nextUser);
    },
    signInWithGoogle: () => {
      const nextUser: SessionUser = {
        firstName: "Frontier",
        lastName: "Traveler",
        email: "traveler@gowilder.local",
        premium: false,
        provider: "google",
      };

      writeUser(nextUser);
      setUser(nextUser);
    },
    signOut: () => {
      writeUser(null);
      setUser(null);
    },
    upgrade: () => {
      if (!user) {
        return;
      }

      const nextUser = {
        ...user,
        premium: true,
      };

      writeUser(nextUser);
      setUser(nextUser);
    },
    dismissReleaseNotes: () => {
      window.localStorage.setItem(RELEASE_NOTES_STORAGE_KEY, APP_VERSION);
      setReleaseNotesOpen(false);
    },
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}
