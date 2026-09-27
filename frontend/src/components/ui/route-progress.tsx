'use client';
/**
 * Thin top-of-page progress bar that fires on every client-side route change.
 * Provides immediate visual feedback without blocking UI or showing a spinner.
 *
 * Architecture: uses Next.js usePathname + useSearchParams to detect navigation.
 * The bar auto-completes after 300ms and fades out, then resets for next navigation.
 */
import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRef = useRef(`${pathname}?${searchParams}`);

  const clearTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const complete = () => {
    clearTimers();
    setProgress(100);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  };

  useEffect(() => {
    const key = `${pathname}?${searchParams}`;
    if (key === prevRef.current) return;
    prevRef.current = key;

    clearTimers();
    setProgress(0);
    setVisible(true);

    // Simulate progress from 0 → 85 over ~600 ms, then jump to 100
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 85) {
        p = 85;
        clearInterval(intervalRef.current!);
      }
      setProgress(Math.min(p, 85));
    }, 80);

    // Complete after 500 ms regardless (pessimistic timeout)
    timeoutRef.current = setTimeout(complete, 600);

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-[#2563EB] transition-all duration-150 ease-out"
        style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
      />
    </div>
  );
}
