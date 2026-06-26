import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { listarArquivos, fazerUpload, fazerDownload, type Arquivo } from "../services/arquivos";

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

    const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadError, setUploadError] = useState("");

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

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            setArquivoSelecionado(e.target.files[0]);
            setUploadError("");
        }
    }

    async function handleUpload(e: SubmitEvent) {
        e.preventDefault();
        setUploadError(""); 

        if (!arquivoSelecionado) {
            setUploadError("Selecione um arquivo para upload.");
            return;
        }

        const limite_bytes = 10 * 1024 * 1024;
        if (arquivoSelecionado.size > limite_bytes) {
            setUploadError("O arquivo excede o tamanho máximo de 10MB.");
            return;
        }

        const extensoesPermitidas = [".jpg", ".png", ".pdf", ".txt"];
        const extensao = arquivoSelecionado.name.substring(arquivoSelecionado.name.lastIndexOf(".")).toLowerCase();
        if (!extensoesPermitidas.includes(extensao)) {
            setUploadError("Tipo de arquivo não permitido. Use .jpg, .png, .pdf ou .txt.");
            return;
        }
        
        try {
            setUploadProgress(0);
            await fazerUpload(arquivoSelecionado, (percentual) => {
                setUploadProgress(percentual);
            });

            setArquivoSelecionado(null);
            const fileInput = document.getElementById("fileInput") as HTMLInputElement;
            if (fileInput) fileInput.value = "";
            
            await carregarArquivos();
        } catch (err) {
            setUploadError("Falha no upload. Tente novamente.");
        } finally {
            setUploadProgress(null);
        }
    }

    async function handleDownload(id: number, nome: string) {
        try {
            await fazerDownload(id, nome);
        } catch (err) {
            setError("Falha no download do arquivo.");
        }
    }
    
    if (isLoading) return <p>Carregando arquivos...</p>;

    return (
        <div style={{ maxWidth: '800px', margin: '50px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Meus Arquivos</h2>
                <button onClick={logout}>Sair</button>
            </div>

            <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <h3>Novo Upload</h3>
                <form onSubmit={handleUpload} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                        id="fileInput"
                        type="file" 
                        onChange={handleFileChange}
                        disabled={uploadProgress !== null}
                    />
                    <button type="submit" disabled={!arquivoSelecionado || uploadProgress !== null}>
                        Enviar
                    </button>
                </form>

                {uploadProgress !== null && (
                    <div style={{ marginTop: '10px' }}>
                        <progress value={uploadProgress} max="100" style={{ width: '100%' }}></progress>
                        <span>{uploadProgress}%</span>
                    </div>
                )}
                
                {uploadError && <p style={{ color: 'red', marginTop: '10px' }}>{uploadError}</p>}
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
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {arquivos.map((arq) => (
                            <tr key={arq.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px 0' }}>{arq.nome}</td>
                                <td>{formatarTamanho(arq.tamanho)}</td>
                                <td>{formatarData(arq.data_upload)}</td>
                                <td>
                                    <button onClick={() => handleDownload(arq.id, arq.nome)}>Download</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}