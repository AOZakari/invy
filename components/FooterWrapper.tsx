'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Footer from './Footer';

const EVENT_PAGE_RE = /^\/e\/([^/]+)$/;

export default function FooterWrapper() {
  const pathname = usePathname();
  const [hideBranding, setHideBranding] = useState<boolean | null>(null);

  useEffect(() => {
    const match = pathname?.match(EVENT_PAGE_RE);
    if (!match) {
      setHideBranding(null);
      return;
    }
    const slug = match[1];
    fetch(`/api/events/${encodeURIComponent(slug)}/branding`)
      .then((r) => r.json())
      .then((d) => setHideBranding(d.hideBranding === true))
      .catch(() => setHideBranding(false));
  }, [pathname]);

  if (pathname && EVENT_PAGE_RE.test(pathname) && hideBranding === true) {
    return null;
  }

  return <Footer minimal={pathname?.startsWith('/e/') ?? false} />;
}
