import { useState } from "react";
import { Btn, Input } from "../ui";

const FORM_INICIAL = {
  email: "",
  password: "",
  confirmPassword: "",
};

export default function AuthScreen({
  loading = false,
  error = "",
  info = "",
  onSignIn,
  onSignUp,
}) {
  const [modo, setModo] = useState("login");
  const [form, setForm] = useState(FORM_INICIAL);

  const isCadastro = modo === "cadastro";

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    if (isCadastro) {
      await onSignUp?.(form);
      return;
    }

    await onSignIn?.(form);
  }

  function atualizarCampo(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(201,138,46,0.18), transparent 28%), linear-gradient(180deg, #0F0F0F 0%, #171717 100%)",
        color: "#E8E4DD",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        className="auth-stack"
        style={{ width: "100%", maxWidth: "960px", display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}
      >
        <section
          style={{
            background: "linear-gradient(160deg, rgba(28, 28, 28, 0.96), rgba(14, 14, 14, 0.98))",
            border: "1px solid rgba(201,138,46,0.18)",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.35)",
          }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "999px", border: "1px solid rgba(201,138,46,0.22)", background: "rgba(201,138,46,0.08)", color: "#F4C542", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'Oswald',sans-serif" }}>
            Manejo Solucoes
          </div>

          <h1
            style={{
              margin: "22px 0 10px",
              fontSize: "clamp(34px, 5vw, 58px)",
              lineHeight: 0.95,
              fontFamily: "'Oswald',sans-serif",
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "#F6E7C5",
            }}
          >
            Ranch
            <br />
            Sorting
          </h1>

          <p style={{ margin: 0, color: "#9A9489", fontSize: "15px", lineHeight: 1.6, maxWidth: "44ch" }}>
            Acesso protegido para administrar provas, controlar duplas e publicar resultados em tempo real.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "28px" }}>
            {[
              { label: "Provas", value: "Controle" },
              { label: "Ranking", value: "Ao vivo" },
              { label: "Historico", value: "Seguro" },
            ].map((item) => (
              <div key={item.label} style={{ padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: "11px", color: "#7D776E", textTransform: "uppercase", letterSpacing: "1px" }}>{item.label}</div>
                <div style={{ marginTop: "6px", color: "#F0ECE4", fontFamily: "'Oswald',sans-serif", fontSize: "22px" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            background: "#151515",
            border: "1px solid #2A2A2A",
            borderRadius: "24px",
            padding: "28px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.28)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", padding: "6px", background: "#101010", borderRadius: "16px", border: "1px solid #242424", marginBottom: "22px" }}>
            <button
              type="button"
              onClick={() => setModo("login")}
              style={{
                border: "none",
                borderRadius: "12px",
                padding: "12px 14px",
                background: !isCadastro ? "linear-gradient(135deg,#C98A2E,#8B5E1A)" : "transparent",
                color: !isCadastro ? "#fff" : "#7D776E",
                cursor: "pointer",
                fontFamily: "'Oswald',sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setModo("cadastro")}
              style={{
                border: "none",
                borderRadius: "12px",
                padding: "12px 14px",
                background: isCadastro ? "linear-gradient(135deg,#C98A2E,#8B5E1A)" : "transparent",
                color: isCadastro ? "#fff" : "#7D776E",
                cursor: "pointer",
                fontFamily: "'Oswald',sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Cadastrar
            </button>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "28px", color: "#F4C542", textTransform: "uppercase", letterSpacing: "1px" }}>
              {isCadastro ? "Criar conta" : "Acessar painel"}
            </div>
            <div style={{ marginTop: "6px", fontSize: "13px", color: "#7D776E", lineHeight: 1.5 }}>
              {isCadastro
                ? "Cadastre um usuario para administrar as provas do seu ambiente."
                : "Entre com seu email e senha para continuar."}
            </div>
          </div>

          {error ? (
            <div style={{ marginBottom: "14px", padding: "12px 14px", borderRadius: "12px", background: "#2A1212", border: "1px solid #5B2323", color: "#F3B1B1", fontSize: "13px" }}>
              {error}
            </div>
          ) : null}

          {info ? (
            <div style={{ marginBottom: "14px", padding: "12px 14px", borderRadius: "12px", background: "#132215", border: "1px solid #24442B", color: "#AAD5B4", fontSize: "13px" }}>
              {info}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => atualizarCampo("email", e.target.value)}
              autoComplete="email"
              placeholder="voce@exemplo.com"
            />

            <Input
              label="Senha"
              type="password"
              value={form.password}
              onChange={(e) => atualizarCampo("password", e.target.value)}
              autoComplete={isCadastro ? "new-password" : "current-password"}
              placeholder="Sua senha"
            />

            {isCadastro ? (
              <Input
                label="Confirmar senha"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => atualizarCampo("confirmPassword", e.target.value)}
                autoComplete="new-password"
                placeholder="Repita a senha"
              />
            ) : null}

            <Btn type="submit" variant="primary" size="lg" full disabled={loading}>
              {loading ? "Processando..." : isCadastro ? "Criar conta" : "Entrar"}
            </Btn>
          </form>
        </section>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-stack {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
