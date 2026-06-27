import { useState, type SubmitEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AlertBanner } from "../components/AlertBanner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const successMessage = (location.state as { message?: string })?.message;

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Informe seu e-mail.");
            return;
        }
        if (!EMAIL_REGEX.test(email.trim())) {
            setError("Por favor, insira um e-mail válido.");
            return;
        }
        if (!password) {
            setError("Informe sua senha.");
            return;
        }

        setIsLoading(true);

        try {
            await login(email.trim(), password);
            navigate("/");
        } catch (err) {
            setError("Falha no login. Verifique suas credenciais.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Acesse sua conta</h2>

                {successMessage && <AlertBanner type="success" message={successMessage} />}
                {error && <AlertBanner type="error" message={error} />}

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="text"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="input-field"
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="input-field"
                    />
                    <button type="submit" disabled={isLoading} style={{ marginTop: "8px" }}>
                        {isLoading ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <p className="auth-footer">
                    Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
                </p>
            </div>
        </div>
    );
}