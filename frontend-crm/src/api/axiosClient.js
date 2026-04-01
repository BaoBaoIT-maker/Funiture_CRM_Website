import axios from "axios";

const apiBaseUrl =
    (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");
export const apiOrigin = apiBaseUrl.replace(/\/api$/, "");

const axiosClient = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Request interceptor: gắn token vào mọi request ────────────
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = token.startsWith("Bearer ")
                ? token
                : `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: xử lý lỗi tập trung ────────────────
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        // Token hết hạn/không hợp lệ -> xóa token và chuyển về login
        if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        // Server lỗi
        if (typeof status === "number" && status >= 500) {
            console.error("Lỗi server, vui lòng thử lại sau.");
        }

        return Promise.reject(error);
    }
);

export default axiosClient;