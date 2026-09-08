import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Admin from './Admin';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;
