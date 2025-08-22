'use client';

import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function TopLoadingBar() {
  const loadingBarRef = useRef<LoadingBarRef>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const currentRef = loadingBarRef.current;
    if (currentRef) {
      currentRef.continuousStart();
      setTimeout(() => {
        currentRef.complete();
      }, 500);
    }
  }, [pathname, searchParams]);

  return (
    <LoadingBar
      ref={loadingBarRef}
      color="#ec4a0a"
      height={3}
      shadow={true}
      className="loading-bar"
    />
  );
} 