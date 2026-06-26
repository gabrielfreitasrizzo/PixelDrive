import api from "./api";

export interface Arquivo {
    id: number;
    nome: string;
    tamanho: number;
    mime_type: string;
    data_upload: string;
}

export async function listarArquivos(): Promise<Arquivo[]> {
    const response = await api.get<Arquivo[]>("/arquivos/");
    return response.data;
}

export async function fazerUpload(
    arquivo: File,
    onPrograss: (percentual: number) => void
): Promise<Arquivo> {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    
    const response = await api.post("/arquivos/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
            const total = progressEvent.total ?? progressEvent.loaded;
            const percentual = Math.round((progressEvent.loaded * 100) / total);
            onPrograss(percentual);
        },
    });
    
    return response.data;
}

export async function fazerDownload(id: number, nomeArquivo: string): Promise<void> {
    const response = await api.get(`/arquivos/${id}/download/`, {
        responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", nomeArquivo);
    document.body.appendChild(link);
    link.click();
    
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
}

export async function deletarArquivo(id: number): Promise<void> {
    await api.delete(`/arquivos/${id}/`);
}