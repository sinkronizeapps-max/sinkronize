import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Marketplace from "./pages/Marketplace";
import AppDetail from "./pages/AppDetail";
import { Login, Register, AuthCallback } from "./pages/Auth";
import ProducerDashboard from "./pages/ProducerDashboard";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import Wallet from "./pages/Wallet";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import { ForProducers, ForAffiliates } from "./pages/Info";
import "./App.css";

function AppRouter() {
    const location = useLocation();
    // Detect session_id during render (NOT in useEffect) to handle OAuth callback
    if (location.hash?.includes("session_id=")) {
        return <AuthCallback />;
    }
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/app/:slug" element={<AppDetail />} />
            <Route path="/checkout/:slug" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProducerDashboard />} />
            <Route path="/afiliado" element={<AffiliateDashboard />} />
            <Route path="/checkout/:slug/sucesso" element={<CheckoutSuccess />} />
            <Route path="/carteira" element={<Wallet />} />
            <Route path="/produtores" element={<ForProducers />} />
            <Route path="/afiliados" element={<ForAffiliates />} />
        </Routes>
    );
}

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <AuthProvider>
                    <AppRouter />
                    <Toaster position="top-right" richColors />
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
