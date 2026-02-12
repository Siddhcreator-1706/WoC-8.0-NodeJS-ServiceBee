import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from './ChatWidget';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-night text-ghost font-inter selection:bg-pumpkin selection:text-night">
            <Navbar />
            <main className="flex-grow pt-20">
                <Outlet />
            </main>
            <Footer />
            <ChatWidget />
        </div>
    );
};

export default Layout;
