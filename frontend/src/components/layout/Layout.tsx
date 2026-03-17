import Footer from "../common/Footer";
import Header from "../common/Header";

interface LayoutProps {
    children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header - 고정 높이 */}
            <Header />

            {/* Main Content - 남은 공간을 모두 차지하며 스크롤 가능 */}
            <div className="flex-1 overflow-y-auto">
                {children}
                {/* Footer - 이제 콘텐츠와 함께 스크롤됩니다. */}
                <Footer />
            </div>
        </div>
    )
}

export default Layout;