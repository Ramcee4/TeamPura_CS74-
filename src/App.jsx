import React, { useState, useEffect } from 'react';
import './App.css';

// Components
import HomeScreen from './components/HomeScreen';
import KeypadScreen from './components/KeypadScreen';
import RegisterScreen from './components/RegisterScreen';
import MenuScreen from './components/MenuScreen';
import PaymentScreen from './components/PaymentScreen';
import OrderConfirmationScreen from './components/OrderConfirmationScreen';
import AdminScreen from './components/AdminScreen';
import AdminPinModal from './components/AdminPinModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home' | 'keypad' | 'register' | 'menu' | 'payment' | 'confirmation' | 'admin'
  const [currentStudent, setCurrentStudent] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [trayItems, setTrayItems] = useState([]);
  const [orderResult, setOrderResult] = useState(null);
  const [isAdminPinOpen, setIsAdminPinOpen] = useState(false);
  const [keypadError, setKeypadError] = useState(''); // Displays error if ID is not in SQLite

  // Fetch real menu items from SQLite
  const fetchMenu = () => {
    fetch('http://localhost:5000/api/menu')
      .then(res => res.json())
      .then(data => setMenuItems(data))
      .catch(() => console.log('Database empty or not connected.'));
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Check if Student ID is exactly 7 digits and exists in SQLite database
  const handleStudentSubmit = async (studentId) => {
    // 1. Strictly enforce 7 digits
    if (!studentId || studentId.length !== 7) {
      setKeypadError('Student ID must be exactly 7 digits.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/students/${studentId}`);
      const data = await res.json();

      // 2. If ID does NOT exist in SQLite database, block login
      if (!res.ok) {
        setKeypadError(data.error || 'Student ID not found in database. Please tap Register.');
        return;
      }

      // 3. ID is real in SQLite -> proceed to Menu
      setKeypadError('');
      setCurrentStudent(data);
      setCurrentScreen('menu');
    } catch {
      setKeypadError('Unable to connect to database server.');
    }
  };

  const handleRegisterSuccess = (newStudent) => {
    setKeypadError('');
    setCurrentStudent(newStudent);
    setCurrentScreen('menu');
  };

  const handleProceedToPayment = (items) => {
    setTrayItems(items);
    setCurrentScreen('payment');
  };

  const handlePaymentSuccess = (result) => {
    setOrderResult(result);
    const updated = result.updatedStudent || result.student;
    if (updated) {
      setCurrentStudent(updated);
    }
    setCurrentScreen('confirmation');
  };

  // Open the custom Admin PIN modal
  const handleOpenAdmin = () => {
    setIsAdminPinOpen(true);
  };

  const handlePinSuccess = () => {
    setIsAdminPinOpen(false);
    setCurrentScreen('admin');
  };

  const handleMenuItemAdded = (newItem) => {
    setMenuItems(prev => [newItem, ...prev]);
  };

  const handleMenuItemDeleted = (id) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="app-viewport">
      {/* 1. Landing / Home Screen */}
      {currentScreen === 'home' && (
        <HomeScreen
          onStartOrder={() => {
            setKeypadError('');
            setCurrentScreen('keypad');
          }}
          onOpenAdmin={handleOpenAdmin}
        />
      )}

      {/* 2. Admin Staff Portal */}
      {currentScreen === 'admin' && (
        <AdminScreen
          menuItems={menuItems}
          onBackToKiosk={() => setCurrentScreen('home')}
          onMenuItemAdded={handleMenuItemAdded}
          onMenuItemDeleted={handleMenuItemDeleted}
        />
      )}

      {/* 3. 7-Digit Student Keypad Login (No Guest Option) */}
      {currentScreen === 'keypad' && (
        <KeypadScreen
          errorMessage={keypadError}
          onBack={() => {
            setKeypadError('');
            setCurrentScreen('home');
          }}
          onStudentSubmit={handleStudentSubmit}
          onGoToRegister={() => {
            setKeypadError('');
            setCurrentScreen('register');
          }}
        />
      )}

      {/* 4. Student Registration Screen */}
      {currentScreen === 'register' && (
        <RegisterScreen
          onBack={() => setCurrentScreen('keypad')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      {/* 5. Food Menu Screen (with Log Out Confirmation Modal and Tray) */}
      {currentScreen === 'menu' && (
        <MenuScreen
          student={currentStudent}
          menuItems={menuItems}
          onHomeClick={() => setCurrentScreen('home')}
          onProceedToPayment={handleProceedToPayment}
          onLogout={() => {
            setCurrentStudent(null);
            setTrayItems([]);
            setCurrentScreen('home');
          }}
        />
      )}

      {/* 6. Checkout & Payment (Cash or GCash) */}
      {currentScreen === 'payment' && (
        <PaymentScreen
          student={currentStudent}
          trayItems={trayItems}
          onBackToMenu={() => setCurrentScreen('menu')}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* 7. Order Confirmation & Digital Points Card (Interactive Treat Redemption) */}
      {currentScreen === 'confirmation' && (
        <OrderConfirmationScreen
          orderResult={orderResult}
          onStudentUpdate={(updated) => setCurrentStudent(updated)}
          onEndSession={() => {
            setCurrentStudent(null);
            setTrayItems([]);
            setCurrentScreen('home');
          }}
          onOrderMore={() => {
            setTrayItems([]);
            setCurrentScreen('menu');
          }}
        />
      )}

      {/* Custom Admin PIN Verification Modal (PIN: 1234) */}
      <AdminPinModal
        isOpen={isAdminPinOpen}
        onClose={() => setIsAdminPinOpen(false)}
        onSuccess={handlePinSuccess}
      />
    </div>
  );
}