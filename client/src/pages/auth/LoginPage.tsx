import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth";
import { Button, Input } from "../../components/ui";
import { Role } from "../../types";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login({ email, password });
      // Redirect based on role
      if (user.role === Role.STUDENT) {
        navigate("/student");
      } else if (user.role === Role.CLUB_LEADER) {
        navigate("/leader");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      if (err instanceof TypeError || !err?.error) {
        setError("Impossible de se connecter au serveur. Vérifiez que le backend est démarré.");
      } else {
        setError(err.error.message || "Email ou mot de passe incorrect");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)", marginBottom: "var(--space-5)" }}>
        Sign in to your account
      </h2>

      {error && (
        <div
          role="alert"
          style={{
            padding: "var(--space-3)",
            background: "var(--color-error-50)",
            color: "var(--color-error-700)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            marginBottom: "var(--space-4)",
            border: "1px solid var(--color-error-100)",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoFocus
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <Button
          type="submit"
          disabled={isLoading}
          loading={isLoading}
          style={{ width: "100%" }}
        >
          Sign In
        </Button>
      </div>
    </form>
  );
}
