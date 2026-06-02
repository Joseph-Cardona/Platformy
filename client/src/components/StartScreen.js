import React from 'react';

function StartScreen ({loginClicked, signupClicked}) {
  return (
    <div>
      <h1>Platformy Platformer Social</h1>
      <button onClick={loginClicked}>Login</button>
      <button onClick={signupClicked}>Signup</button>
    </div>
  );
}

export default StartScreen;
