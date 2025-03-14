
import { useState, useEffect } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import ProductDisplay from './components/product/ProductDisplay'
import Settings from './pages/Settings'
import Catalogs from './pages/Catalogs'
import { Toaster } from './components/ui/sonner'

function App() {
  const [currentPage, setCurrentPage] = useState('products');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check if dark mode is enabled on mount
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModeEnabled);
  }, []);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div className={`flex h-screen text-foreground ${isDarkMode ? 'dark' : ''}`} style={{ backgroundImage: 'var(--app-gradient)' }}>
      <Sidebar onNavigate={handleNavigation} activePage={currentPage} />
      
      <main className="flex-1 overflow-auto p-3">
        {currentPage === 'products' && <ProductDisplay />}
        {currentPage === 'settings' && <Settings />}
        {currentPage === 'catalogs' && <Catalogs />}
        {/* Other pages will be added here later */}
        {['brands', 'activities'].includes(currentPage) && (
          <div className="h-full flex items-center justify-center">
            <div className="ios-glass p-8 rounded-2xl text-center">
              <h2 className="text-2xl font-medium mb-4">Page {currentPage} en cours de développement</h2>
              <p className="text-muted-foreground">Cette fonctionnalité sera disponible prochainement.</p>
            </div>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  )
}

export default App
