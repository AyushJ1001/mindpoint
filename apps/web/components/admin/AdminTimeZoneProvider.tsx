"use client";

import { createContext, useContext, useMemo, useState } from "react";
import {
  ADMIN_TIME_ZONE_STORAGE_KEY,
  formatPlainDateForAdmin,
  formatPlainDateTimeForAdmin,
  formatTimestampInTimeZone,
  getAdminTimeZoneLabel,
  resolveDefaultAdminTimeZone,
} from "@/lib/admin-timezone";

type AdminTimeZoneContextValue = {
  timeZone: string;
  timeZoneLabel: string;
  setTimeZone: (value: string) => void;
  formatTimestamp: (value: number | string | Date) => string;
  formatDate: (value?: string) => string | null;
  formatDateTime: (dateValue?: string, timeValue?: string) => string | null;
};

const AdminTimeZoneContext = createContext<AdminTimeZoneContextValue | null>(
  null,
);

export function AdminTimeZoneProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [timeZone, setTimeZoneState] = useState<string>(() => {
    if (typeof window === "undefined") {
      return "America/New_York";
    }

    return (
      window.localStorage.getItem(ADMIN_TIME_ZONE_STORAGE_KEY) ||
      resolveDefaultAdminTimeZone()
    );
  });

  const value = useMemo<AdminTimeZoneContextValue>(
    () => ({
      timeZone,
      timeZoneLabel: getAdminTimeZoneLabel(timeZone),
      setTimeZone: (nextTimeZone) => {
        setTimeZoneState(nextTimeZone);
        window.localStorage.setItem(ADMIN_TIME_ZONE_STORAGE_KEY, nextTimeZone);
      },
      formatTimestamp: (input) => formatTimestampInTimeZone(input, timeZone),
      formatDate: (input) => formatPlainDateForAdmin(input),
      formatDateTime: (dateValue, timeValue) =>
        formatPlainDateTimeForAdmin(dateValue, timeValue, timeZone),
    }),
    [timeZone],
  );

  return (
    <AdminTimeZoneContext.Provider value={value}>
      {children}
    </AdminTimeZoneContext.Provider>
  );
}

export function useAdminTimeZone() {
  const context = useContext(AdminTimeZoneContext);

  if (!context) {
    throw new Error(
      "useAdminTimeZone must be used inside AdminTimeZoneProvider",
    );
  }

  return context;
}
