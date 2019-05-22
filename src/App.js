import React, { Component } from 'react';
import Player from './Player';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      dataUrl: process.env.REACT_APP_PUBLIC_URL.split(':3000')[0] + "/../data/"
    }
    console.log(this.state)
  }
  render() {
    return (
      <div className="app container">
        <Player dataUrl={this.state.dataUrl} />
      </div>
    );
  }
}

export default App;
