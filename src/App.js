import React, { useState } from 'react';
import { Player } from './Player';
import './App.css';

export const App = () => {
  const [dataUrl, setDataUrl] = useState(process.env.REACT_APP_PUBLIC_URL.split(':3000')[0] + "/../data/")

  return (
    <div className="app container">
      <Player dataUrl={dataUrl} />
    </div>
  );
}
