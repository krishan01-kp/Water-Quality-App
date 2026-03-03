import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DataEntry from './pages/DataEntry';
import Dashboard from './pages/Dashboard';
import ExportExcel from './pages/ExportExcel';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<DataEntry />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/export" element={<ExportExcel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
