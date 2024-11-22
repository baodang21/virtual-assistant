import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import OperatorMode from './pages/OperatorMode';
import ClientMode from './pages/ClientMode';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/operator" element={<OperatorMode />} />
          <Route path="/client" element={<ClientMode />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;