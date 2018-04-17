import React, { Component } from 'react';
import './Artwork.css';

class Artwork extends Component {
    render() {
        let video = null;
        if (this.props.current.artwork_url.indexOf("mp4") > -1)
            video = <video src={this.props.current.artwork_url} autoPlay controls></video>
        return (
            <div className="artwork-container">
                <img className="artwork" src={this.props.current.artwork_url} />
                {video}
            </div>
        );
    }
}

export default Artwork;