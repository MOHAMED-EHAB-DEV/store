type Props = { className?: string, strokeWidth?: number };

export const ChevronUp = ({ className, strokeWidth = 2 }: Props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
        className={className}>
        <path d="m18 15-6-6-6 6" />
    </svg>
);
