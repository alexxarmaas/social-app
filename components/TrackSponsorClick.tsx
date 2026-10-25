"use client";

import { track } from "@vercel/analytics/react";
import { ReactNode } from "react";

interface TrackSponsorClickProps {
  sponsorName: string;
  websiteUrl: string;
  children: ReactNode;
  className?: string;
  placement?: string;
}

export default function TrackSponsorClick({ sponsorName, websiteUrl, children, className, placement = "directory" }: TrackSponsorClickProps) {
  return (
    <a
      href={websiteUrl}
      target="_blank"
      rel="noreferrer"
      onClick={() => track("Sponsor_Outbound_Click", { sponsor: sponsorName, placement })}
      className={className}
    >
      {children}
    </a>
  );
}
