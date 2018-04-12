import React, { Component } from 'react';
import Player from './Player';
import './App.css';

class App extends Component {
  constructor() {
    super();    
    this.state = {
      dataUrl: "http://192.168.1.251/data/"
    }
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
