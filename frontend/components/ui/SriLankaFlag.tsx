import LK from "country-flag-icons/react/3x2/LK";

type SriLankaFlagProps = {
  className?: string;
};

export function SriLankaFlag({ className = "h-3.5 w-5" }: SriLankaFlagProps) {
  return (
    <LK
      title="Sri Lanka"
      aria-label="Sri Lanka"
      className={`rounded-[2px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] ${className}`}
    />
  );
}
