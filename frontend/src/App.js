import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider } from './context/AuthContext';
import ReceiptDetailPage from './pages/ReceiptDetailPage';



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
       <Routes>
         <Route path = "/" element={<HomePage />} />
         <Route path = "/login" element={<LoginPage />} />
         <Route path = "/register" element={<RegisterPage />} />
         <Route path="/receipt/:id" element={<ReceiptDetailPage />} />
       </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;