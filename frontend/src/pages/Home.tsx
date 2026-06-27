import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { listarArquivos, fazerUpload, fazerDownload, deletarArquivo, type Arquivo } from "../services/arquivos";
import { AlertBanner } from "../components/AlertBanner";
import { UploadForm } from "../components/UploadForm";
import { ArquivosTable } from "../components/ArquivosTables";
import { Modal } from "../components/Modal";

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
    const [successMessage, setSuccessMessage] = useState("");

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
            setSuccessMessage("Arquivo enviado com sucesso!");
            setTimeout(() => setSuccessMessage(""), 4000);
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
            setSuccessMessage("Arquivo deletado com sucesso!");
            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (err) {
            setError("Falha ao deletar o arquivo.");
        } finally {
            closeDeleteModal();
        }
    }   
            
    if (isLoading) return <p>Carregando arquivos...</p>;

    return (
        <div className="home-container">
            <div className="home-header">
                <h2>Meus Arquivos</h2>
                <button onClick={logout}>Sair</button>
            </div>

            <UploadForm
                arquivoSelecionado={arquivoSelecionado}
                uploadProgress={uploadProgress}
                uploadError={uploadError}
                onFileChange={handleFileChange}
                onSubmit={handleUpload}
            />

            {successMessage && <AlertBanner type="success" message={successMessage} />}
            {error && <AlertBanner type="error" message={error} />}

            <ArquivosTable
                arquivos={arquivos}
                onDownload={handleDownload}
                onDelete={openDeleteModal}
                formatarTamanho={formatarTamanho}
                formatarData={formatarData}
            />

            {isDeleteModalOpen && (
                <Modal
                    title="Confirmar exclusão"
                    onCancel={closeDeleteModal}
                    onConfirm={confirmDelete}
                    confirmLabel="Sim, excluir"
                >
                    Tem certeza que deseja excluir este arquivo? Esta ação não poderá ser desfeita.
                </Modal>
            )}
        </div>
    );
}