import logo from './logo.svg';
import './App.css';
import { subscribeUserToPush } from './pushNotifications';
import { useState } from 'react';
import Calendar from './Calendar';
import { FaBell, FaBellSlash } from 'react-icons/fa';


function App() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushError, setPushError] = useState('');

  const handleEnablePush = async () => {
    setPushError('');
    if (typeof window.Notification === 'undefined') {
      setPushError('Le notifiche push non sono supportate su questo browser o dispositivo. Usa Safari su iOS 16.4+ o Chrome/Edge su Android.');
      return;
    }
    const granted = await Notification.requestPermission();
    if (granted === 'granted') {
      const ok = await subscribeUserToPush();
      setPushEnabled(ok);
      if (!ok) setPushError('Errore nella registrazione della notifica push.');
    } else {
      setPushError('Permesso per le notifiche negato.');
    }
  };

  return (
    <div className="App bg-dark min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm animate__animated animate__fadeInDown">
        <div className="container-fluid">
          <span className="navbar-brand d-flex align-items-center">
            <img src={logo} alt="logo" width={40} height={40} className="me-2" />
            <span style={{fontWeight: 700, fontSize: 28}}>My Super Calendar</span>
          </span>
          <button
            className={`btn btn-${pushEnabled ? 'success' : 'outline-light'} ms-auto d-flex align-items-center`}
            onClick={handleEnablePush}
            disabled={pushEnabled}
            title={pushEnabled ? 'Notifiche attive' : 'Abilita notifiche push'}
          >
            {pushEnabled ? <FaBell className="me-2" /> : <FaBellSlash className="me-2" />}
            {pushEnabled ? 'Notifiche attive' : 'Abilita notifiche'}
          </button>
        </div>
      </nav>
      {pushError && <div className="alert alert-danger text-center m-0">{pushError}</div>}
      <main className="container py-4 animate__animated animate__fadeInUp">
        <Calendar />
      </main>
    </div>
  );
}

export default App;
