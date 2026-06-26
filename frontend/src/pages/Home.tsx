import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { listarArquivos, type Arquivo } from "../services/arquivos";

function formatarTamanho(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatarData(dataIso: string) {
    const data = new Date(dataIso);
    return data.toLocaleDateString();
}

export function Home() {
    const { logout } = useAuth();
    const [arquivos, setArquivos] = useState<Arquivo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        carregarArquivos();
    }, []);
    
    const carregarArquivos = async () => {
        try {
            setIsLoading(true);
            const dados = await listarArquivos();
            setArquivos(dados);
        } catch (err) {
            setError("Falha ao carregar arquivos.");
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isLoading) return <p>Carregando arquivos...</p>;

    return (
        <div style={{ maxWidth: '800px', margin: '50px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Meus Arquivos</h2>
                <button onClick={logout}>Sair</button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {arquivos.length === 0 && !error ? (
                <p>Nenhum arquivo encontrado.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>
                            <th style={{ padding: '10px 0' }}>Nome</th>
                            <th>Tamanho</th>
                            <th>Data de Upload</th>
                        </tr>
                    </thead>
                    <tbody>
                        {arquivos.map((arq) => (
                            <tr key={arq.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px 0' }}>{arq.nome}</td>
                                <td>{formatarTamanho(arq.tamanho)}</td>
                                <td>{formatarData(arq.data_upload)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}