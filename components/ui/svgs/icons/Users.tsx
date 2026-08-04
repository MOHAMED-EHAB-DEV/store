type Props = {
  className?: string;
  hidePlus?: boolean;
};

export const Users = ({ className, hidePlus = false }: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="-3 -3 30 30"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    {hidePlus ? (
      <>
        <path d="M21 21v-2a3.5 3.5 0 0 0-3-3.5" />
        <path d="M15.5 4.5a3.5 3.5 0 0 1 0 6.2" />
      </>
    ) : (
      <>
        <path d="M20 8v6" />
        <path d="M23 11h-6" />
      </>
    )}
  </svg>
);
