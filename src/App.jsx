import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import CardDetail from './components/CardDetail';
import Navbar from './components/Navbar';
import ScanCamera from './components/ScanCamera';
import AddCard from './components/AddCard';
import Top from './components/Top';
import './App.css';

function App() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch('http://localhost:5000/cards');
      if (!response.ok) throw new Error('Server responded with ' + response.status);
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  return (
    <Router>
      <Top />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home cards={cards} fetchCards={fetchCards} />} />
          <Route path="/card/:id" element={<CardDetail fetchCards={fetchCards} />} />
          <Route path="/camera" element={<ScanCamera />} />
          <Route path="/add-card" element={<AddCard fetchCards={fetchCards} />} />
        </Routes>
      </div>
      <Navbar />
      <style>{`
        html, body, #root, .app-container {
          margin: 0 !important;
          padding: 0 !important;
          width: 100vw;
          min-height: 100vh;
          box-sizing: border-box;
          overflow-x: hidden !important;
          max-width: 100vw;
        }
        body {
          max-width: 100vw;
          overflow-x: hidden !important;
        }
        .app-container {
          padding-top: 60px !important; /* height of Top */
          padding-bottom: 56px !important; /* height of Navbar */
        }
        .navbar.fixed-bottom {
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          z-index: 9999;
          border-top: 1px solid #eaeaea;
          background: #fff;
        }
        .navbar {
          min-width: 0;
          max-width: 100vw;
          overflow-x: auto;
        }
        .navbar .nav-link {
          min-width: 0;
          max-width: 100vw;
          word-break: break-word;
        }
        @media (max-width: 700px) {
          html, body, #root, .app-container {
            width: 100vw;
            max-width: 100vw;
            overflow-x: hidden !important;
          }
          .navbar.fixed-bottom {
            min-width: 100vw;
            max-width: 100vw;
            overflow-x: auto;
            display: flex;
            flex-wrap: nowrap;
            justify-content: space-around;
          }
          .navbar .nav-link {
            flex: 1 0 20%;
            min-width: 60px;
            max-width: 100px;
            padding: 0.5rem 0;
            font-size: 13px;
            word-break: break-word;
          }
        }
      `}</style>
    </Router>
  );
}

export default App;