"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ProtectedLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
}

export default function ProtectedLink({ href, children, className = "" }: ProtectedLinkProps) {
    const router = useRouter();
    const { data: session } = useSession();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (session) {
            router.push(href);
        } else {
            router.push(`/login?next=${encodeURIComponent(href)}`);
        }
    };

    return (
        <a href={href} onClick={handleClick} className={className}>
            {children}
        </a>
    );
}
