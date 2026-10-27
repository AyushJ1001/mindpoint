"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

import { ContactClickTracker } from "@/components/analytics/ContactClickTracker";
import {
  ANALYTICS_CONSENT_EVENT,
  readAnalyticsConsent,
  type ConsentDecision,
} from "@/lib/consent";

// Free, effective tracking. Each provider loads only when its id is configured
// AND the visitor has allowed analytics, so nothing changes until the owner sets
// the env var and a visitor opts in.
//
//   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXX
//   NEXT_PUBLIC_CLARITY_PROJECT_ID=abcdefghij
//   NEXT_PUBLIC_META_PIXEL_ID=1234567890      (needs the flag below as well)
//   NEXT_PUBLIC_META_PIXEL_ENABLED=true
//
// GA4 gives the funnel and Search Console linkage; Clarity gives free heatmaps
// and session recordings. The Meta Pixel stays off until advertising starts and
// the owner both sets the id and flips the flag.

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ENABLED === "true"
    ? process.env.NEXT_PUBLIC_META_PIXEL_ID
    : undefined;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

const ANY_ANALYTICS_ID = Boolean(GA_ID || PIXEL_ID || CLARITY_ID);

export default function AnalyticsScripts() {
  const [decision, setDecision] = useState<ConsentDecision | null>(null);

  useEffect(() => {
    setDecision(readAnalyticsConsent());
    const onChange = (event: Event) => {
      setDecision((event as CustomEvent<ConsentDecision>).detail);
    };
    window.addEventListener(ANALYTICS_CONSENT_EVENT, onChange);
    return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, onChange);
  }, []);

  // Contact links are site behaviour, not tracking: the listener only records
  // an event through lib/analytics.ts, which is a no-op until a vendor loads.
  if (!ANY_ANALYTICS_ID || decision !== "granted") {
    return null;
  }

  return (
    <>
      <ContactClickTracker />

      {GA_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { send_page_view: true });
            `}
          </Script>
        </>
      ) : null}

      {PIXEL_ID ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      ) : null}

      {CLARITY_ID ? (
        <Script id="clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        </Script>
      ) : null}
    </>
  );
}
