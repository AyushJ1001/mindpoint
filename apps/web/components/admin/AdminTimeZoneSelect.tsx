"use client";

import {
  ADMIN_TIME_ZONE_OPTIONS,
  getAdminTimeZoneLabel,
} from "@/lib/admin-timezone";
import { useAdminTimeZone } from "@/components/admin/AdminTimeZoneProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminTimeZoneSelect() {
  const { timeZone, setTimeZone } = useAdminTimeZone();

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs font-medium tracking-wide text-slate-500 uppercase md:inline">
        Edit Zone
      </span>
      <Select value={timeZone} onValueChange={setTimeZone}>
        <SelectTrigger className="w-[120px] bg-white">
          <SelectValue placeholder="Time zone" />
        </SelectTrigger>
        <SelectContent>
          {ADMIN_TIME_ZONE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {getAdminTimeZoneLabel(option.value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
