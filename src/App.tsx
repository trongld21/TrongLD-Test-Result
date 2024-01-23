import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Chú ý sử dụng Routes thay vì Router
import Orders from './pages/Orderbook/Order';

function App() {
  return (
    <div className="App" id="wrapper">
      <Router>
        <Routes>
          <Route path="/" element={<Orders />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
