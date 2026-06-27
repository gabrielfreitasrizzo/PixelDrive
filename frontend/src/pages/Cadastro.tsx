import { useState, type SubmitEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cadastro } from "../services/auth";

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
                password 
            });
            navigate("/login", {
                state: { message: "Cadastro realizado com sucesso! Faça login para continuar." }
            });
        } catch (err: any) {
            const msg = err.response?.data?.email?.[0];
            setError(msg || "Falha no cadastro. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#fff', borderRadius: 'var(--border-radius)', boxShadow: '0 4px 6px rgba(0,0,0,0.15)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-primary)' }}>Crie a sua conta</h2>
                
                {error && (
                    <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: 'var(--border-radius)', border: '1px solid #F87171', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input 
                        type="text" 
                        placeholder="Nome" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        disabled={isLoading}
                        style={{ padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                    <input 
                        type="text" 
                        placeholder="Sobrenome (opcional)" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        disabled={isLoading}
                        style={{ padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                    <input 
                        type="text" 
                        placeholder="E-mail" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        disabled={isLoading}
                        style={{ padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                    <input 
                        type="password" 
                        placeholder="Senha" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        disabled={isLoading}
                        style={{ padding: '12px', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                    <button type="submit" disabled={isLoading} style={{ padding: '12px', marginTop: '8px' }}>
                        {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>
                
                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Já tem uma conta? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>Faça Login</Link>
                </p>
            </div>
        </div>
    );
}