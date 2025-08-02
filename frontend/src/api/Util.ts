export const BASE_URL = (function () {
    const envBase = import.meta.env.VITE_BASE_URL

    if (envBase) return envBase
    else return "http://localhost:8080/api"
})()
