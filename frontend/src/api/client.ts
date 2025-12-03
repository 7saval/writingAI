import axios from "axios";

export const apiClient = axios.create({
    // baseURL: process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api',
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
})