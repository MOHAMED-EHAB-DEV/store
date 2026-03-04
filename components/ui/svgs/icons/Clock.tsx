type Props = { className?: string, isActive?: boolean };

export const Clock = ({ className }: Props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="10" />
    </svg>
);
