export function StatCard({ value, label, color }) {
  return (
    <div style={{ textAlign: "center", padding: "12px 6px" }}>
      <div
        style={{
          fontSize: "clamp(20px,5vw,30px)",
          fontWeight: 700,
          color,
          fontFamily: "'Oswald',sans-serif",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "10px",
          color: "#555",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginTop: "3px",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function ModernTab({ id, label, icon, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        flex: 1,
        padding: "13px 6px",
        border: "none",
        cursor: "pointer",
        background: "transparent",
        fontFamily: "'Oswald',sans-serif",
        fontSize: "clamp(11px,3vw,13px)",
        fontWeight: 500,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        transition: "all 0.2s",
        touchAction: "manipulation",
        color: active ? "#F4C542" : "#555",
        borderBottom: active ? "2px solid #C98A2E" : "2px solid transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3px",
      }}
    >
      <span style={{ fontSize: "18px" }}>{icon}</span>
      {label}
    </button>
  );
}

export function Input({ label, ...props }) {
  return (
    <div>
      {label ? (
        <label
          style={{
            display: "block",
            fontSize: "11px",
            color: "#666",
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            fontFamily: "'Oswald',sans-serif",
          }}
        >
          {label}
        </label>
      ) : null}
      <input
        {...props}
        style={{
          width: "100%",
          padding: "13px 12px",
          borderRadius: "8px",
          border: "1px solid #2A2A2A",
          background: "#252525",
          color: "#F0F0F0",
          fontSize: "16px",
          fontFamily: "inherit",
          boxSizing: "border-box",
          outline: "none",
          ...props.style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#C98A2E";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#2A2A2A";
          props.onBlur && props.onBlur(e);
        }}
      />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div>
      {label ? (
        <label
          style={{
            display: "block",
            fontSize: "11px",
            color: "#666",
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            fontFamily: "'Oswald',sans-serif",
          }}
        >
          {label}
        </label>
      ) : null}
      <div style={{ position: "relative" }}>
        <select
          {...props}
          style={{
            width: "100%",
            padding: "13px 36px 13px 12px",
            borderRadius: "8px",
            border: "1px solid #2A2A2A",
            background: "#252525",
            color: props.value ? "#F0F0F0" : "#555",
            fontSize: "16px",
            fontFamily: "inherit",
            boxSizing: "border-box",
            outline: "none",
            appearance: "none",
            WebkitAppearance: "none",
          }}
        >
          {children}
        </select>
        <span
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#555",
            pointerEvents: "none",
            fontSize: "12px",
          }}
        >
          ▼
        </span>
      </div>
    </div>
  );
}

export function TextArea({ label, ...props }) {
  return (
    <div>
      {label ? (
        <label
          style={{
            display: "block",
            fontSize: "11px",
            color: "#666",
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            fontFamily: "'Oswald',sans-serif",
          }}
        >
          {label}
        </label>
      ) : null}
      <textarea
        {...props}
        style={{
          width: "100%",
          minHeight: "90px",
          padding: "13px 12px",
          borderRadius: "8px",
          border: "1px solid #2A2A2A",
          background: "#252525",
          color: "#F0F0F0",
          fontSize: "15px",
          fontFamily: "inherit",
          boxSizing: "border-box",
          outline: "none",
          resize: "vertical",
          ...props.style,
        }}
      />
    </div>
  );
}

export function Btn({ children, variant = "primary", size = "md", full, style: s = {}, ...props }) {
  const sizes = {
    sm: { padding: "9px 12px", fontSize: "12px" },
    md: { padding: "14px 18px", fontSize: "13px" },
    lg: { padding: "17px 22px", fontSize: "15px" },
  };
  const variants = {
    primary: {
      background: "linear-gradient(135deg,#C98A2E,#8B5E1A)",
      color: "#fff",
      boxShadow: "0 3px 10px rgba(201,138,46,0.25)",
      border: "none",
    },
    success: {
      background: "linear-gradient(135deg,#22C55E,#16A34A)",
      color: "#fff",
      boxShadow: "0 3px 10px rgba(34,197,94,0.25)",
      border: "none",
    },
    secondary: { background: "#252525", color: "#C98A2E", border: "1px solid #C98A2E33" },
    danger: { background: "transparent", color: "#EF4444", border: "1px solid #EF444430" },
    ghost: { background: "transparent", color: "#666", border: "1px solid #2A2A2A" },
    amber: { background: "linear-gradient(135deg,#D4A017,#A07010)", color: "#fff", border: "none" },
  };

  return (
    <button
      style={{
        ...sizes[size],
        ...variants[variant],
        borderRadius: "8px",
        cursor: "pointer",
        fontFamily: "'Oswald',sans-serif",
        fontWeight: 600,
        letterSpacing: "0.8px",
        textTransform: "uppercase",
        transition: "all 0.15s",
        touchAction: "manipulation",
        width: full ? "100%" : "auto",
        ...s,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function EmptyState({ title, text, icon = "🐄" }) {
  return (
    <div
      style={{
        textAlign: "center",
        color: "#333",
        padding: "40px 16px",
        border: "1px dashed #2A2A2A",
        borderRadius: "12px",
      }}
    >
      <div style={{ fontSize: "36px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontFamily: "'Oswald',sans-serif", color: "#444", marginBottom: "6px" }}>
        {title}
      </div>
      {text ? <div style={{ fontSize: "12px", color: "#555" }}>{text}</div> : null}
    </div>
  );
}
