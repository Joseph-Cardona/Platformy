import React from 'react';

function Dashboard ({editorClicked, browserClicked}) {
  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={editorClicked}>Level Editor</button>
      <button onClick={browserClicked}>Level Browser</button>
    </div>
  );
}

export default Dashboard;
