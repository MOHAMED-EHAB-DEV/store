type Props = { className?: string, isActive?: boolean };

export const Cpu = ({ className }: Props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 1v2" />
        <path d="M15 1v2" />
        <path d="M9 21v2" />
        <path d="M15 21v2" />
        <path d="M1 9h2" />
        <path d="M1 15h2" />
        <path d="M21 9h2" />
        <path d="M21 15h2" />
    </svg>
)
