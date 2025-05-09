import React from "react"

type CompanyLogoProps = {
    domain?: string;
    className?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ domain, className = "h-10 w-auto" }) => {
    if (!domain) return null;

    let hostname = "";
    try {
        hostname = new URL(domain.startsWith("http") ? domain : `https://${domain}`).hostname;
    } catch {
        return null;
    }

    const logoUrl = `https://logo.clearbit.com/${hostname}`;

    return (
        <img
            src={logoUrl}
            alt="Logo entreprise"
            className={className}
            onError={(e) => {
                e.currentTarget.style.display = "none";
            }}
        />
    );
};