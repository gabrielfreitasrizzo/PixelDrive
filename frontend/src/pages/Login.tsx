import { useState, type SubmitEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Por favor, preencha todos os campos.");
            return;
        }
        
        setIsLoading(true);

        try {
            await login(username, password);
            navigate("/");
        } catch (err) {
            setError("Falha no login. Verifique suas credenciais.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    disabled={isLoading}
                />
                <input 
                    type="password" 
                    placeholder="Senha" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
            <p>
                Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
            </p>
        </div>
    );
}