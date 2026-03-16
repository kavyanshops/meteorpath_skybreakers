import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { CataloguePage } from './pages/CataloguePage';
import { EventDetailPage } from './pages/EventDetailPage';
import { ComparePage } from './pages/ComparePage';
import { LiveFeedPage } from './pages/LiveFeedPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 flex flex-col items-center w-full">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/events" element={<CataloguePage />} />
                        <Route path="/events/:id" element={<EventDetailPage />} />
                        <Route path="/compare" element={<ComparePage />} />
                        <Route path="/live-feed" element={<LiveFeedPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
