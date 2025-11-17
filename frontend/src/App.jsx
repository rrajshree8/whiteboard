import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Whiteboard from './pages/Whiteboard';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/board/:roomId" element={<Whiteboard />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
