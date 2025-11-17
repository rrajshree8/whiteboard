import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Whiteboard from './pages/Whiteboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board/:roomId" element={<Whiteboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
