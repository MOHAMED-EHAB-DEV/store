type Props = { className?: string, isActive?: boolean };

export const MousePointer2 = ({ className }: Props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
        <path d="M13 13l6 6" />
    </svg>
);
