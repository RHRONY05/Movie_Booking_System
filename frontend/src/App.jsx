import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { ThemeShowcasePage } from './pages/ThemeShowcasePage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '125328161222-7qskkth90u7f557ck18hhe6s3moko0du.apps.googleusercontent.com';

const MainContent = () => {
  const [currentTab, setCurrentTab] = useState('movies');
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleSelectMovie = (movie, time, day) => {
    setSelectedMovie({
      ...movie,
      selectedTime: time || (movie?.showtimes ? movie.showtimes[0] : '7:00 PM'),
      selectedDay: day || 'Today'
    });
  };

  const handleNavigateHome = () => {
    setSelectedMovie(null);
    setCurrentTab('movies');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar
        onNavigate={(tab) => {
          setSelectedMovie(null);
          setCurrentTab(tab);
        }}
        currentTab={currentTab}
      />

      <AuthModal />

      <main style={{ flex: 1, width: '100%' }}>
        {selectedMovie ? (
          <SeatSelectionPage
            movie={selectedMovie}
            onBack={handleNavigateHome}
          />
        ) : currentTab === 'theme-showcase' ? (
          <ThemeShowcasePage />
        ) : currentTab === 'profile' ? (
          <MyBookingsPage onBrowseMovies={handleNavigateHome} />
        ) : (
          <LandingPage onSelectMovie={handleSelectMovie} />
        )}
      </main>
    </div>
  );
};

export function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ToastProvider>
        <AuthProvider>
          <MainContent />
        </AuthProvider>
      </ToastProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
