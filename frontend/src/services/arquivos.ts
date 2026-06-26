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