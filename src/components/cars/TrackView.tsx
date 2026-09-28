"use client";

import { useEffect } from "react";
import { track, type TrackParams } from "@/lib/analytics";

export function TrackView({ params }: { params: TrackParams }) {
  const key = JSON.stringify(params);
  useEffect(() => {
    track("view_car", JSON.parse(key));
  }, [key]);
  return null;
}
