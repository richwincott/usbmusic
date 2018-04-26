import React, { Component } from 'react';
import YouTube from 'react-youtube';
import './Artwork.css';

class Artwork extends Component {
    render() {
        const opts = {
            height: '390',
            width: '640',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                autoplay: 1,
                controls: 0,
                showinfo: 0,
                rel: 0
            }
        };
        let video = null;
        if (this.props.current.url.indexOf("ytId:") > -1) {
            const ytId = this.props.current.url.split(":")[1];
            video = <YouTube
                videoId={ytId}
                opts={opts}
                onReady={this.props.handleYTReady}
            /> 
        }
        return (
            <div className="artwork-container">
                <img className="artwork" src={this.props.current.artwork_url} />
                {video}
            </div>
        );
    }
}

export default Artwork;