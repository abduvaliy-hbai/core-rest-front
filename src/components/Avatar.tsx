import { useEffect, useState } from "react";
import { B } from "../theme";
import { initials } from "../utils/statusSummary";

type AvatarProps = {
  name: string;
  size?: number;
  src?: string | null;
};

export function Avatar({ name, size = 34, src }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  // A recycled <img> would otherwise keep the previous person's broken-image
  // state when the list re-renders onto a different member.
  useEffect(() => setFailed(false), [src]);

  const showImage = Boolean(src) && !failed;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        overflow: "hidden",
        background: B.charcoal,
        border: "1px solid rgba(255,185,2,.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.34,
        fontWeight: 600,
        color: B.orange,
        letterSpacing: "0.01em",
        userSelect: "none",
      }}
    >
      {showImage ? (
        <img
          alt=""
          decoding="async"
          loading="lazy"
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
          src={src ?? undefined}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        initials(name)
      )}
    </div>
  );
}
