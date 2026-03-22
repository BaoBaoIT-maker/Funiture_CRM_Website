import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 1. Cấu hình Style (Ant Design & Custom CSS)
import 'antd/dist/reset.css'; // Quan trọng: Reset CSS của Antd trước
import './index.css';         // Global CSS của bạn (ghi đè nếu cần)

// 2. Component chính
import App from './App.jsx';

// 3. Render ứng dụng
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);