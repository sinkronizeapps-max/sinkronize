import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Marketplace from "./pages/Marketplace";
import AppDetail from "./pages/AppDetail";
import { Login, Register, AuthCallback, ForgotPassword, ResetPassword } from "./pages/Auth";
import ProducerDashboard from "./pages/ProducerDashboard";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import Wallet from "./pages/Wallet";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Welcome from "./pages/Welcome";
import MinhasCompras from "./pages/MinhasCompras";
import { ForProducers, ForAffiliates } from "./pages/Info";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import FAQ from "./pages/FAQ";
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
            <Route path="/bem-vindo" element={<Welcome />} />
            <Route path="/minhas-compras" element={<MinhasCompras />} />
            <Route path="/carteira" element={<Wallet />} />
            <Route path="/produtores" element={<ForProducers />} />
            <Route path="/para-produtores" element={<ForProducers />} />
            <Route path="/afiliados" element={<ForAffiliates />} />
            <Route path="/para-afiliados" element={<ForAffiliates />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />
            <Route path="/redefinir-senha" element={<ResetPassword />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/faq" element={<FAQ />} />
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
