import type { ChangeEvent, SubmitEvent } from "react";

interface UploadFormProps {
    arquivoSelecionado: File | null;
    uploadProgress: number | null;
    uploadError: string;
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: SubmitEvent) => void;
}

export function UploadForm({
    arquivoSelecionado,
    uploadProgress,
    uploadError,
    onFileChange,
    onSubmit,
}: UploadFormProps) {
    return (
        <div className="upload-box">
            <h3>Novo Upload</h3>
            <form onSubmit={onSubmit} className="upload-form">
                <label className="upload-dropzone">
                    <span>
                        {arquivoSelecionado ? arquivoSelecionado.name : "Clique para selecionar um arquivo"}
                    </span>
                    <input
                        id="fileInput"
                        type="file"
                        onChange={onFileChange}
                        disabled={uploadProgress !== null}
                        style={{ display: "none" }}
                    />
                </label>

                <button type="submit" disabled={!arquivoSelecionado || uploadProgress !== null} style={{ width: "100%" }}>
                    Enviar Arquivo
                </button>
            </form>

            {uploadProgress !== null && (
                <div className="upload-progress">
                    <div className="upload-progress-info">
                        <span>Enviando...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                </div>
            )}

            {uploadError && <div className="alert alert-error" style={{ marginTop: "15px" }}>{uploadError}</div>}
        </div>
    );
}