import { useEffect, useState } from "react";
import { B, SANS } from "../theme";
import type { DailyStatusOffice } from "../types";

type OfficePickerProps = {
  offices: DailyStatusOffice[];
  value: string;
  onChange: (officeId: string) => void;
};

const ALL_OFFICES_LABEL = "All offices";

export function OfficePicker({ offices, value, onChange }: OfficePickerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const options = [{ id: "", name: ALL_OFFICES_LABEL }, ...offices];
  const current = value ? offices.find((office) => office.id === value)?.name ?? "Unknown office" : ALL_OFFICES_LABEL;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          background: B.charcoal,
          border: `1px solid ${B.faint}`,
          borderRadius: 0,
          padding: "5px 10px",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: B.muted,
            fontWeight: 600,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
          }}
        >
          Office
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: B.soft, whiteSpace: "nowrap" }}>{current}</span>
          <svg width={10} height={10} viewBox="0 0 10 10" fill="none">
            <path
              d="M2.5 3.75l2.5 2.5 2.5-2.5"
              stroke={B.muted}
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setOpen(false)} />
          <div
            role="listbox"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              zIndex: 10,
              background: B.charcoal,
              border: `1px solid ${B.faint}`,
              borderRadius: 0,
              overflow: "hidden",
              minWidth: 148,
              boxShadow: "0 12px 32px rgba(0,0,0,.6)",
            }}
          >
            {options.map((option) => {
              const active = option.id === value;
              return (
                <button
                  key={option.id || "all"}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 14px",
                    background: active ? "rgba(255,185,2,.12)" : "transparent",
                    border: "none",
                    color: active ? B.orange : B.soft,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: SANS,
                    transition: "background .1s, color .1s",
                  }}
                  onMouseEnter={(event) => {
                    if (active) return;
                    event.currentTarget.style.background = "rgba(255,255,255,.05)";
                    event.currentTarget.style.color = B.text;
                  }}
                  onMouseLeave={(event) => {
                    if (active) return;
                    event.currentTarget.style.background = "transparent";
                    event.currentTarget.style.color = B.soft;
                  }}
                >
                  {option.name}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
