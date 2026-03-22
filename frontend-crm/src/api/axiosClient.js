import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:5000/api",
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

        // Token hết hạn hoặc không hợp lệ → đá ra trang login
        if (status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        // Không có quyền truy cập
        if (status === 403) {
            console.warn("Bạn không có quyền thực hiện thao tác này.");
        }

        // Server lỗi
        if (status >= 500) {
            console.error("Lỗi server, vui lòng thử lại sau.");
        }

        return Promise.reject(error);
    }
);

export default axiosClient;