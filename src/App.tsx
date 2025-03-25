import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CareerCards from './components/CareerCards';
import Counselors from './components/Counselors';
import AptitudeTest from './components/AptitudeTest';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Schedule from './pages/Schedule';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <main>
              <Hero />
              <CareerCards />
              <Counselors />
              <AptitudeTest />
            </main>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/careers" element={<CareerCards />} />
          <Route path="/counselors" element={<Counselors />} />
          <Route path="/aptitude-test" element={<AptitudeTest />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;