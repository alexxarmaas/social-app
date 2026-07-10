"use client";

import { track } from "@vercel/analytics/react";
import { ReactNode } from "react";

interface TrackSponsorClickProps {
  sponsorName: string;
  websiteUrl: string;
  children: ReactNode;
  className?: string;
}

export default function TrackSponsorClick({ sponsorName, websiteUrl, children, className }: TrackSponsorClickProps) {
  return (
    <a
      href={websiteUrl}
      target="_blank"
      rel="noreferrer"
      onClick={() => track("Sponsor_Outbound_Click", { sponsor: sponsorName })}
      className={className}
    >
      {children}
    </a>
  );
}
