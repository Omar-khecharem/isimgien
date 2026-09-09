import { useState, useEffect } from "react";

interface SessionTimerProps {
  startTime: string;
  isActive: boolean;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}min`;
  }
  return `${minutes}min ${String(seconds).padStart(2, "0")}s`;
}

export function SessionTimer({ startTime, isActive }: SessionTimerProps) {
  const [elapsed, setElapsed] = useState(() => {
    const diff = Date.now() - new Date(startTime).getTime();
    return Math.max(0, diff);
  });

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const diff = Date.now() - new Date(startTime).getTime();
      setElapsed(Math.max(0, diff));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isActive]);

  return (
    <span>{formatElapsed(elapsed)}</span>
  );
}
