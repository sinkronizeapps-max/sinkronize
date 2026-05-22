import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = ({ children, noFooter }) => (
    <div className="min-h-screen bg-[#FAF9F5]">
        <Header />
        <main className="pt-16">{children}</main>
        {!noFooter && <Footer />}
    </div>
);
