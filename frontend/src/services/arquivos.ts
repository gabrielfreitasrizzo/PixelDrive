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