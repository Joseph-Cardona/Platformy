import { useState } from 'react';

function Signup () {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const send = async () => { 
    if (password !== confirmPassword)
    {
      alert('BOTH PASSWORDS MUST MATCH');
      return;
    }
    try {
      const msg = await fetch('http://localhost:5000/api/newUser', {
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
        setConfirmPassword('');
        window.location.reload();
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
      <br />
      <input type='email' value={email} placeholder='Email' onChange={e => setEmail(e.target.value)} />
      <br />
      <input type='password' value={password} placeholder='Password' onChange={e => setPassword(e.target.value)} />
      <br/>
      <input type='password' value={confirmPassword} placeholder='Confirm Password' onChange={e => setConfirmPassword(e.target.value)} />
      <br />
      <button onClick={send}>Send</button>
    </div>
  );
}

export default Signup;
