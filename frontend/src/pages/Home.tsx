import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { listarArquivos, fazerUpload, fazerDownload, deletarArquivo, type Arquivo } from "../services/arquivos";
import { FiDownload, FiTrash2 } from "react-icons/fi";

function formatarTamanho(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatarData(dataIso: string) {
    const data = new Date(dataIso);
    return data.toLocaleDateString("pt-BR");
}

export function Home() {
    const { logout } = useAuth();
    const [arquivos, setArquivos] = useState<Arquivo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadError, setUploadError] = useState("");

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [arquivoParaDeletar, setArquivoParaDeletar] = useState<number | null>(null);

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

    function openDeleteModal(id: number) {
        setArquivoParaDeletar(id);
        setIsDeleteModalOpen(true);
    }

    function closeDeleteModal() {
        setIsDeleteModalOpen(false);
        setArquivoParaDeletar(null);
    }

    async function confirmDelete() {
        if (arquivoParaDeletar === null) return;
        
        try {
            await deletarArquivo(arquivoParaDeletar);
            await carregarArquivos();
        } catch (err) {
            setError("Falha ao deletar o arquivo.");
        } finally {
            closeDeleteModal();
        }
    }   

    async function handleDelete(id: number) {
        if (window.confirm("Tem certeza que deseja deletar este arquivo?"))
            try {
                await deletarArquivo(id);
                await carregarArquivos();
            } catch (err) {
                setError("Falha ao deletar o arquivo.");
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
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <label style={{
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--border-radius)',
                        padding: '30px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#fff',
                        transition: 'border-color 0.2s'
                    }}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                            {arquivoSelecionado ? arquivoSelecionado.name : 'Clique para selecionar um arquivo'}
                        </span>
                        <input 
                            id="fileInput"
                            type="file" 
                            onChange={handleFileChange}
                            disabled={uploadProgress !== null}
                            style={{ display: 'none' }}
                        />
                    </label>
                    
                    <button type="submit" disabled={!arquivoSelecionado || uploadProgress !== null} style={{ width: '100%' }}>
                        Enviar Arquivo
                    </button>
                </form>

                {uploadProgress !== null && (
                    <div style={{ marginTop: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            <span>Enviando...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--primary-color)', transition: 'width 0.2s ease' }}></div>
                        </div>
                    </div>
                )}
                
                {uploadError && (
                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: 'var(--border-radius)', border: '1px solid #F87171', fontSize: '14px' }}>
                        {uploadError}
                    </div>
                )}
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {arquivos.length === 0 && !error ? (
                <p>Nenhum arquivo encontrado.</p>
            ) : (
                <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse', 
                    backgroundColor: '#fff',
                    borderRadius: 'var(--border-radius)',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)' 
                }}>
                    <thead style={{ backgroundColor: '#F3F4F6', borderBottom: '1px solid var(--border-color)' }}>
                        <tr style={{ textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>Nome</th>
                            <th style={{ padding: '15px' }}>Tamanho</th>
                            <th style={{ padding: '15px', width: '120px' }}>Data de Upload</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {arquivos.map((arq) => (
                            <tr key={arq.id} style={{ 
                                borderBottom: '1px solid var(--border-color)',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                                <td style={{ padding: '15px', fontWeight: '500' }}>{arq.nome}</td>
                                <td style={{ padding: '15px', color: 'var(--text-secondary)' }}>{formatarTamanho(arq.tamanho)}</td>
                                <td style={{ padding: '15px', color: 'var(--text-secondary)' }}>{formatarData(arq.data_upload)}</td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                        <button 
                                            onClick={() => handleDownload(arq.id, arq.nome)}
                                        style={{ 
                                            background: 'transparent',
                                            color: '#4d83f9',
                                            border: '1px solid #4d83f9', 
                                            marginRight: '10px', 
                                            padding: '8px 12px',
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center' 
                                            }} 
                                        >
                                            <FiDownload />
                                        </button>
                                        <button 
                                            onClick={() => openDeleteModal(arq.id)} 
                                            style={{ 
                                            background: 'var(--danger)',
                                            color: 'white', 
                                            border: 'none',
                                            padding: '8px 12px',
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center' 
                                            }}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {isDeleteModalOpen && (
                <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2000 // Fica acima do cabeçalho
                    }}>
                        <div style={{
                            backgroundColor: '#fff',
                            padding: '24px',
                            borderRadius: 'var(--border-radius)',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}>
                            <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Confirmar exclusão</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                                Tem certeza que deseja excluir este arquivo? Esta ação não poderá ser desfeita.
                            </p>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button 
                                    onClick={closeDeleteModal}
                                    style={{ 
                                        background: '#E5E7EB', // Fundo cinza
                                        color: 'var(--text-primary)',
                                        border: 'none'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    style={{ 
                                        background: 'var(--danger)', // Mantemos vermelho aqui, sem gradiente
                                        color: 'white',
                                        border: 'none'
                                    }}
                                    >
                                    Sim, excluir
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
}