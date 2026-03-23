import { BrowserRouter, Routes, Route } from "react-router-dom";

// IMPORT ĐÚNG PATH
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Customers from "../pages/Customers";
import MainLayout from "../layouts/MainLayout";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Login riêng */}
                <Route path="/login" element={<Login />} />

                {/* Layout */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/customers" element={<Customers />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}