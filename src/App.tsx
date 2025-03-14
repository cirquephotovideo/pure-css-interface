
import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import ProductDisplay from './components/product/ProductDisplay'
import Settings from './pages/Settings'
import { Toaster } from './components/ui/sonner'

function App() {
  const [currentPage, setCurrentPage] = useState('products');

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Sidebar onNavigate={handleNavigation} activePage={currentPage} />
      
      <main className="flex-1 overflow-auto">
        {currentPage === 'products' && <ProductDisplay />}
        {currentPage === 'settings' && <Settings />}
        {/* Other pages will be added here later */}
        {['catalogs', 'brands', 'activities'].includes(currentPage) && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-medium mb-4">Page {currentPage} en cours de développement</h2>
              <p className="text-gray-400">Cette fonctionnalité sera disponible prochainement.</p>
            </div>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  )
}

export default App
