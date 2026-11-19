import React, { useState, useEffect } from 'react';
import './App.css';

// Components
import HomeScreen from './components/HomeScreen';
import KeypadScreen from './components/KeypadScreen';
import MenuScreen from './components/MenuScreen';
import OrderSuccessModal from './components/OrderSuccessModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' | 'keypad' | 'menu'
  const [currentStudent, setCurrentStudent] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orderComplete, setOrderComplete] = useState(null);

  // Fetch Menu from SQLite Backend
  useEffect(() => {
    fetch('http://localhost:5000/api/menu')
      .then(res => res.json())
      .then(data => setMenuItems(data))
      .catch(() => console.log('Backend not connected, using fallback items.'));
  }, []);

  // Student identification via SQLite
  const handleStudentSubmit = async (studentId) => {
    if (!studentId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/students/${studentId}`);
      const data = await res.json();
      setCurrentStudent(data);
    } catch {
      setCurrentStudent({ id: studentId, name: `Student ${studentId}`, points: 20 });
    }
    setCurrentScreen('menu');
  };

  const handleGuestSubmit = () => {
    setCurrentStudent({ id: 'GUEST', name: 'Guest', points: 0 });
    setCurrentScreen('menu');
  };

  return (
    <div className="app-viewport">
      {currentScreen === 'home' && (
        <HomeScreen onStartOrder={() => setCurrentScreen('keypad')} />
      )}

      {currentScreen === 'keypad' && (
        <KeypadScreen
          onBack={() => setCurrentScreen('home')}
          onStudentSubmit={handleStudentSubmit}
          onGuestSubmit={handleGuestSubmit}
        />
      )}

      {currentScreen === 'menu' && (
        <MenuScreen
          student={currentStudent}
          menuItems={menuItems}
          onHomeClick={() => setCurrentScreen('home')}
          onOrderSuccess={(orderData) => setOrderComplete(orderData)}
        />
      )}

      <OrderSuccessModal
        orderData={orderComplete}
        onClose={() => setOrderComplete(null)}
      />
    </div>
  );
}