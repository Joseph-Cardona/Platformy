import { useState } from 'react';

function Login () {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const send = async () => { 
    try {
      const msg = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await msg.json();
      if (msg.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUsername('');
        setPassword('');
        window.location.reload();
      } else {
        alert(data.error || 'LOGIN FAILED TRY AGAIN');
      }
    } catch (err) {
      alert('NETWORK ERROR: THE SERVER MIGHT NOT BE UP');
    }
  }

  return ( 
    <div>
      <h1>Login</h1>
      <input type='text' value={username} placeholder='Username' onChange={e => setUsername(e.target.value)} />
      <br />
      <input type='password' value={password} placeholder='Password' onChange={e => setPassword(e.target.value)} />
      <br />
      <button onClick={send}>Send</button>
    </div>
  );
}

export default Login;
