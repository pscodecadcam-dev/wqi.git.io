import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home, ClipboardList, Map as MapIcon } from 'lucide-react';
import DataEntryForm from './pages/DataEntryForm';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import './App.css'; // We can put layout specific CSS here or in index.css

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Main Content Area */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DataEntryForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map" element={<MapView />} />
          </Routes>
        </main>

        {/* Bottom Navigation for Mobile / Sidebar for Desktop */}
        <nav className="bottom-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ClipboardList size={24} />
            <span>เก็บข้อมูล</span>
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Home size={24} />
            <span>ภาพรวม</span>
          </NavLink>
          <NavLink to="/map" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MapIcon size={24} />
            <span>แผนที่</span>
          </NavLink>
        </nav>
      </div>
    </Router>
  );
}

export default App;
