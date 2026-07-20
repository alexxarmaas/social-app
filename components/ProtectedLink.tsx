import Link from "next/link";

interface ProtectedLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
}

export default function ProtectedLink({ href, children, className = "" }: ProtectedLinkProps) {
    return (
        <Link href={href} className={className}>
            {children}
        </Link>
    );
}
