import Footer from "../common/Footer";
import Header from "../common/Header";

interface LayoutProps {
    children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
    return (
        <>
            <Header />
            <div>{children}</div>
            <Footer />
        </>
    )
}

export default Layout;