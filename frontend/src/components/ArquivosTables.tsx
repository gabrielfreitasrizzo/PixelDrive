import { FiDownload, FiTrash2 } from "react-icons/fi";
import type { Arquivo } from "../services/arquivos";

interface ArquivosTableProps {
    arquivos: Arquivo[];
    onDownload: (id: number, nome: string) => void;
    onDelete: (id: number) => void;
    formatarTamanho: (bytes: number) => string;
    formatarData: (dataIso: string) => string;
}

export function ArquivosTable({
    arquivos,
    onDownload,
    onDelete,
    formatarTamanho,
    formatarData,
}: ArquivosTableProps) {
    if (arquivos.length === 0) {
        return <p>Nenhum arquivo encontrado.</p>;
    }

    return (
        <table className="files-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Tamanho</th>
                    <th style={{ width: "120px" }}>Data de Upload</th>
                    <th style={{ textAlign: "center" }}>Ações</th>
                </tr>
            </thead>
            <tbody>
                {arquivos.map((arq) => (
                    <tr key={arq.id} className="table-row">
                        <td style={{ fontWeight: 500 }}>{arq.nome}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{formatarTamanho(arq.tamanho)}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{formatarData(arq.data_upload)}</td>
                        <td style={{ textAlign: "center" }}>
                            <div className="table-actions">
                                <button
                                    className="btn-icon btn-icon-download"
                                    onClick={() => onDownload(arq.id, arq.nome)}
                                    aria-label={`Baixar o arquivo ${arq.nome}`}
                                >
                                    <FiDownload />
                                </button>
                                <button
                                    className="btn-icon btn-icon-delete"
                                    onClick={() => onDelete(arq.id)}
                                    aria-label={`Deletar o arquivo ${arq.nome}`}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}