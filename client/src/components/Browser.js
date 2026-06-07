import React from 'react';

function Browser () {
  const num = 2;
  const getLevel = async () => { 
    try {
      const msg = await fetch('http://localhost:5000/api/getLevelById', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num }),
      });
      const data = await msg.json();
      if (msg.ok) {
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
      <h1>Browser</h1>
      <p>Insert Level Browser Here</p>
    </div>
  );
}

export default Browser;
