type Props = { className?: string, isActive?: boolean };

export const Code2 = ({ className }: Props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <polyline points="18 16 22 12 18 8" />
        <polyline points="6 8 2 12 6 16" />
        <line x1="14" y1="4" x2="10" y2="20" />
    </svg>
)
