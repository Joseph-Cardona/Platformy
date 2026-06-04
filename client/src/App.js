import './App.css';
import { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen.js';
import Login from './components/Login.js';
import Signup from './components/Signup.js';
import Dashboard from './components/Dashboard.js';
import Editor from './components/Editor.js';
import Browser from './components/Browser.js';

function App() {
  const [screen, setScreen] = useState('start');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          setUser(parsedUser);
          setScreen('dashboard');
        }
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const signout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setScreen('start');
    window.location.reload();
  }

  const switchToStartScreen = () => {
    setScreen('start');
  }
  const switchToLogin = () => {
    setScreen('login');
  }
  const switchToSignup = () => {
    setScreen('signup');
  }
  const switchToEditor = () => {
    setScreen('editor');
  }
  const switchToBrowser = () => {
    setScreen('browser');
  }

  return (
    <div className="App">
      <header className="App-header">
        {user && (
          <div>
            <p>{user.username}</p>
            <button onClick={signout}>Logout</button>
          </div>
        )}
        {screen === 'start' && (
          <StartScreen loginClicked={switchToLogin} signupClicked={switchToSignup} />
        )}
        {screen === 'login' && <Login />}
        {screen === 'signup' && <Signup />}
        {screen === 'dashboard' && (
          <Dashboard editorClicked={switchToEditor} browserClicked={switchToBrowser} />
        )}
        {screen === 'editor' && <Editor />}
        {screen === 'browser' && <Browser />}
      </header>
    </div>
  );
}

export default App;
