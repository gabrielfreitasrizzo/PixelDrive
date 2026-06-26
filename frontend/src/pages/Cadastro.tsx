import { useState, type SubmitEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cadastro } from "../services/auth";

export function Cadastro() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
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
            await cadastro({ username, email, password });
            navigate("/login");
        } catch (err) {
            setError("Falha no cadastro. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h2>Cadastro</h2>
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
                    type="email" 
                    placeholder="E-mail (opcional)" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
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
                    {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
            </form>
            <p>
                Já tem uma conta? <Link to="/login">Faça Login</Link>
            </p>
        </div>
    );
}