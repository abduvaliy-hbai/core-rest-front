import { B } from "../theme";

type BackBarProps = {
  onBack: () => void;
  title: string;
};

export function BackBar({ onBack, title }: BackBarProps) {
  return (
    <div
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderBottom: `1px solid ${B.line}`,
        background: B.surface,
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          // Comfortably past the 44px minimum touch target once padding counts.
          minHeight: 36,
          padding: "6px 12px 6px 8px",
          borderRadius: 0,
          border: `1px solid ${B.faint}`,
          background: B.charcoal,
          color: B.soft,
          fontSize: 13,
          cursor: "pointer",
        }}
        type="button"
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M14.5 5.5 8 12l6.5 6.5"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Roster
      </button>

      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 13,
          fontWeight: 600,
          color: B.text,
          textAlign: "right",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </span>
    </div>
  );
}
