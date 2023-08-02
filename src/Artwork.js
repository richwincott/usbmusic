import React, { useState } from 'react';
import YouTube from 'react-youtube';
import './Artwork.css';

export const Artwork = ({ current, handleYTReady }) => {
  const [opts, setOpts] = useState({
    height: '390',
    width: '640',
    playerVars: { // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
      controls: 0,
      showinfo: 0,
      rel: 0
    }
  })

  return (
    <div className="artwork-container">
      <img className="artwork" alt="album artwork" src={current.artwork_url} />
      {current.url.indexOf("ytId:") > -1 ? <YouTube
        videoId={current.url.split(":")[1]}
        opts={opts}
        onReady={handleYTReady}
      /> : null}
    </div>
  );
}