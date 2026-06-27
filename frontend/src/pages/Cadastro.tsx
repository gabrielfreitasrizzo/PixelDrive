import { useState, type SubmitEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cadastro } from "../services/auth";
import { AlertBanner } from "../components/AlertBanner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Cadastro() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        setError("");

        if (!firstName.trim()) {
            setError("O campo Nome é obrigatório.");
            return;
        }
        if (!email.trim()) {
            setError("O campo E-mail é obrigatório.");
            return;
        }
        if (!EMAIL_REGEX.test(email.trim())) {
            setError("Por favor, insira um e-mail válido.");
            return;
        }
        if (!password.trim()) {
            setError("O campo Senha é obrigatório.");
            return;
        }

        setIsLoading(true);

        try {
            await cadastro({
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                email: email.trim(),
                password,
            });
            navigate("/login", {
                state: { message: "Cadastro realizado com sucesso! Faça login para continuar." },
            });
        } catch (err: any) {
            const msg = err.response?.data?.email?.[0];
            setError(msg || "Falha no cadastro. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Crie a sua conta</h2>

                {error && <AlertBanner type="error" message={error} />}

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="text"
                        placeholder="Nome"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={isLoading}
                        className="input-field"
                    />
                    <input
                        type="text"
                        placeholder="Sobrenome (opcional)"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={isLoading}
                        className="input-field"
                    />
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
                        {isLoading ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </form>

                <p className="auth-footer">
                    Já tem uma conta? <Link to="/login">Faça Login</Link>
                </p>
            </div>
        </div>
    );
}