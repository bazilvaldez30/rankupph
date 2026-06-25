"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ color: "#a3a3a3", marginTop: 8 }}>
          A critical error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 24,
            padding: "10px 24px",
            borderRadius: 9999,
            border: "none",
            background: "linear-gradient(135deg, #F4E9BE, #D4AF37 45%, #937321)",
            color: "#0a0a0a",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
