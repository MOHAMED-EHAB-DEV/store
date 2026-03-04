type Props = { className?: string, isActive?: boolean };

export const MousePointer = ({ className }: Props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="M3 3l7.5 17L12 13l7-2.5L3 3z" />
    </svg>
)
