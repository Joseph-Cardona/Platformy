import { useState } from 'react';

function Signup ({signupMade}) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const send = async () => { 
    try {
      const msg = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await msg.json();
      if (msg.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUsername('');
        setEmail('');
        setPassword('');
        alert('NEW ACCOUNT CREATED');
        signupMade();
      } else {
        alert(data.error || 'SIGNUP FAILED TRY AGAIN');
      }
    } catch (err) {
      alert('NETWORK ERROR: THE SERVER MIGHT NOT BE UP');
    }
  }

  return ( 
    <div>
      <h1>Signup</h1>
      <input type='text' value={username} placeholder='Username' onChange={e => setUsername(e.target.value)} />
      <input type='email' value={email} placeholder='Email' onChange={e => setEmail(e.target.value)} />
      <input type='password' value={password} placeholder='Password' onChange={e => setPassword(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  );
}

export default Signup;
