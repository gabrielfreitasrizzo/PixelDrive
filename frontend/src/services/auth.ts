import api from "./api";

interface Credenciais {
    username: string;
    password: string;
}

interface DadosCadastro {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export async function login({ username, password }: Credenciais) {
    const response = await api.post("/login/", { username, password });
    const { access, refresh } = response.data;

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    return response.data;
}

export async function cadastro(dados: DadosCadastro) {
    const response = await api.post("/cadastro/", dados);
    return response.data;
}

export function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}

export function isAuthenticated() {
    const token = localStorage.getItem("access_token");
    return !!token;
}