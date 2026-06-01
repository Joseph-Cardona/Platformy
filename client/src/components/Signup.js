import { useState } from 'react';

function Signup () {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const send = () => {
    fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, email: email, password: password }),
    });
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return ( 
    <div>
      <h1>Signup</h1>
      <input value={username} placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input value={email} placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input value={password} placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  );
}

export default Signup;
