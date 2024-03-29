import React, { useEffect, useState } from 'react';
import { Progress } from './Progress';
import { Artwork } from './Artwork';
import './Player.css';
import { http } from './Http';

const defaultCurrent = {
  id: null,
  url: "",
  artist: "No track selected...",
  name: "No track selected...",
  artwork_url: "note.png"
}

export const Player = ({ dataUrl }) => {
  const [mode, setMode] = useState(0) // 0 = audio, 1 = youtube
  const [player, setPlayer] = useState(new Audio())
  const [playerYT, setPlayerYT] = useState(null)
  const [tracks, setTracks] = useState(localStorage.getItem("tracks") ? JSON.parse(localStorage.getItem("tracks")) : [])
  const [current, setCurrent] = useState(defaultCurrent)
  const [paused, setPaused] = useState(true)
  const [position, setPosition] = useState(0)
  const [shuffle, setShuffle] = useState(false)
  const [infoModal, setInfoModal] = useState(false)
  const [ytModal, setYtModal] = useState(false)
  const [search, setSearch] = useState(null)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [youtubeResults, setYoutubeResults] = useState([])
  const [showTracks, setShowTracks] = useState(window.innerWidth < 576 ? false : true)
  const [params, setParams] = useState(sessionStorage.getItem("params") != null ?
    JSON.parse(sessionStorage.getItem("params")) : null)

  /* useEffect(() => {
    window.$.ajax({
      url: dataUrl
    }).then((response) => {
      let tracks = [];
      let id = 0;
      for (var i = 0; i < window.$(response).find("a").length; i++) {
        var link = window.$(response).find("a")[i];
        bad(link);
        if (i > 0 && !link.bad) {
          const name = link.innerHTML.replace(".mp3", "");
          tracks.push({
            id: id,
            type: 0,
            url: link.href.replace(":3000", ""),
            name: name,
            title: name.split(" - ")[1] ? name.split(" - ")[1] : "",
            artist: name.split(" - ")[0],
            // https://png.icons8.com/color/300/music-record
            artwork_url: "note.png"
          });
          id++;
        }
      };
      setTracks(tracks)
    });
  }, []) */

  useEffect(() => {
    if (!!youtubeUrl)
      http.get('youtubeSearch?query=' + youtubeUrl).then((data) => {
        setYoutubeResults(data)
      })
  }, [youtubeUrl])

  const bad = (link) => {
    ["xml", "config", "Old Music", "Bruno Mars"].forEach((word) => {
      if (link.innerHTML.indexOf(word) > -1)
        link.bad = true;
    })
  }

  const toggle = () => {
    if (current.id != null) {
      if (mode === 1) {
        if (paused) {
          playerYT.playVideo();
          playerYT.paused = false;
        }
        else {
          playerYT.pauseVideo();
          playerYT.paused = true;
        }
        setPlayerYT(playerYT)
      }
      else {
        if (paused)
          player.play();
        else
          player.pause();
      }
      setPaused(!paused)
      setCurrent(current)
    }
  }

  const shuffleSongs = () => {
    setShuffle(!shuffle)
  }

  const select = (track) => {
    if (params) {
      const url = "https://api.spotify.com/v1/search?query=" + track.title.split("ft.")[0].split("(")[0].replace(/[|&;$%@"<>()+,]/g, "") + "+artist:" + track.artist.split("ft.")[0].replace(/[|&;$%@"<>()+,]/g, "") + "&type=track";
      window.$.ajax({
        url,
        headers: {
          "Authorization": "Bearer " + params["access_token"]
        },
      }).then((response, status) => {
        if (response.tracks.items.length > 0) {
          track.artwork_url = response.tracks.items[0].album.images[0].url;
        }

        setMode(track.type)
        setCurrent(track)
        setPaused(false)
        setShowTracks(window.innerWidth < 576 ? false : true)

        if (track.type === 0) {
          if (playerYT)
            setPlayerYT(null)
          player.src = track.url;
          setPlayer(player)
          player.play();
        }
        else {
          player.pause();
        }
        window.scrollTo(0, 0);
      }, (response) => {
        if (window.confirm(response.responseJSON.error.message + ". Redirect to Spotify to re-authenticate?")) {
          window.location.href = process.env.REACT_APP_PUBLIC_URL + '?';
        }
      });
    }
  }

  const next = () => {
    let nextId = current.id + 1;
    if (shuffle)
      nextId = Math.floor(Math.random() * tracks.length - 1);
    if (tracks[nextId])
      select(tracks[nextId]);
    else {
      setCurrent(defaultCurrent)
    }
  }

  const previous = () => {
    let nextId = current.id - 1;
    if (nextId === -1)
      nextId = 0;
    if (shuffle)
      nextId = Math.floor(Math.random() * tracks.length - 1);
    if (tracks[nextId])
      select(tracks[nextId]);
  }

  const toggleInfoModal = () => {
    setInfoModal(!infoModal)
  }

  const toggleYTModal = () => {
    setYtModal(!ytModal)
  }

  const toggleTracks = () => {
    setShowTracks(!showTracks)
  }

  const searchChanged = (ev) => {
    setSearch(ev.currentTarget.value)
  }

  const youtubeUrlChanged = (ev) => {
    setYoutubeUrl(ev.currentTarget.value)
  }

  const addToPlaylist = async (videoUrl) => {
    if (videoUrl.indexOf("youtu") > -1) {
      window.$.ajax({
        //url: process.env.REACT_APP_PUBLIC_URL.split(':3000')[0] + "/youtubemetadata?url=" + youtubeUrl,
        url: "https://dev.richardwincott.co.uk/youtubemetadata?url=" + videoUrl,
      }).then((response, status) => {
        const response_json = JSON.parse(response);
        if (response_json.title.indexOf(" - ") > -1) {
          let track = {
            id: tracks.length,
            type: 1,
            url: "ytId:" + response_json.thumbnail_url.split("/")[4],
            name: response_json.title,
            title: response_json.title.split(" - ")[1].split("(")[0].split("[")[0],
            artist: response_json.title.split(" - ")[0],
            artwork_url: "note.png"
          }
          tracks.push(track);
          setTracks(tracks)
          setYoutubeUrl("")
          setYtModal(!ytModal)
          localStorage.setItem("tracks", JSON.stringify(tracks))
        }
        else {
          alert("Not a music video. Please try another url.")
        }
      })
    }
  }

  const handleYTReady = (event) => {
    // access to player in all event handlers via event.target
    // e.g. event.target.pauseVideo();
    setMode(1)
    setPlayerYT(event.target)
  }

  const playOrPause = () => {
    return paused ? "fa fa-play" : "fa fa-pause"
  }

  const shuffleClass = () => {
    return shuffle ? "selected" : "";
  }

  const infoModalClass = (others) => {
    return infoModal ? others + " show" : others;
  }

  const ytModalClass = (others) => {
    return ytModal ? others + " show" : others;
  }

  const _player = showTracks && window.innerWidth < 576 ? null : <div className="col-xs-12 col-sm-6">
    <div className="player">
      <Artwork current={current} handleYTReady={handleYTReady} />
      <Progress current={current} player={player} playerYT={playerYT} ended={next} />
      <div className="padding">
        <div className="title">
          {current.title ? <div><b>{current.title}</b></div> : <div className="hack"></div>}{current.artist}
        </div>
        <ul className="buttons main list-unstyled list-inline">
          <li onClick={previous}><i className="fa fa-fast-backward" aria-hidden="true"></i></li>
          <li onClick={toggle}><i className={playOrPause()} aria-hidden="true"></i></li>
          <li onClick={next}><i className="fa fa-fast-forward" aria-hidden="true"></i></li>
        </ul>
        <ul className="buttons extras list-unstyled list-inline">
          <li onClick={shuffleSongs} className={shuffleClass()}><i className="fa fa-random" aria-hidden="true"></i></li>
          <li onClick={toggleTracks} className="hidden-sm hidden-md hidden-lg"><i className="fa fa-list-ul" aria-hidden="true"></i></li>
          <li onClick={toggleYTModal}><i className="fa fa-plus" aria-hidden="true"></i></li>
          <li onClick={toggleInfoModal}><i className="fa fa-info" aria-hidden="true"></i></li>
        </ul>
      </div>
    </div>
  </div>;

  const trackList = () => {
    const _tracks = tracks.map((track) => {
      if (track.title.toLowerCase().indexOf(search) > -1 || track.artist.toLowerCase().indexOf(search) > -1 || search == null) {
        const barsClass = track.id == current.id && !paused ? "pull-right bars show" : "pull-right bars";
        return (
          <li onClick={select.bind(this, track)} key={track.id}>
            <b>{track.title}</b>
            <br />{track.artist}
            <img className={barsClass} src="bars.gif" alt="music bars animation" />
          </li>
        )
      }
      return undefined;
    });

    return showTracks ? <div className="col-xs-12 col-sm-6 text-center">
      <a className="btn close tracklist hidden-sm hidden-md hidden-lg" onClick={toggleTracks}><img src="close.png" height="50" alt="close button" /></a>
      <ul className="tracks list-unstyled">
        <li>
          <input className="form-control search" onChange={searchChanged} placeholder="Search" />
          <i className="fa fa-search" aria-hidden="true"></i>
        </li>
        {_tracks}
      </ul>
    </div> : null;
  }

  return (
    <div>
      <div className={infoModalClass("modal-background")}>
        <div className={infoModalClass("modal")}>
          <div className="modal-content">
            <div className="modal-header">
              <a className="btn close" onClick={toggleInfoModal}><img src="close.png" height="50" alt="close button" /></a>
            </div>
            <div className="modal-body">
              <h2>Music Player <small>v5</small></h2>
              <p>Personal web app to play music from a remote device.</p>
              <p>Written with ReactJS.</p>
              <p>This app uses Youtube for the player and Spotify to download album artwork.</p>
            </div>
          </div>
        </div>
      </div>
      <div className={ytModalClass("modal-background")}>
        <div className={ytModalClass("modal")}>
          <div className="modal-content">
            <div className="modal-header">
              <a className="btn close" onClick={toggleYTModal}><img src="close.png" height="50" alt="close button" /></a>
            </div>
            <div className="modal-body" style={{ paddingBottom: '15px' }}>
              <p>Add a song from Youtube.</p>
              <p>Songs with the title format 'Artist - Track' work best and will map to the player correctly.</p>
              <input className="form-control" value={youtubeUrl} onChange={youtubeUrlChanged} placeholder="Search here..." />
              <ul className='list-unstyled' style={{ overflowY: 'scroll', height: '380px', marginTop: '15px' }}>
                {youtubeResults.map((result, index) => (<li key={index} style={{ display: 'flex', alignItems: 'center', padding: '5px 0' }}>
                  <img src={result.snippet.thumbnails.default.url} height="55px" style={{ borderRadius: '5px', marginRight: '10px' }} />
                  <span style={{ flex: '1' }}>{result.title}<br />Duration: {result.snippet.duration} | Views: {result.snippet.views}</span>
                  <a className="btn btn-default" style={{ marginRight: '5px' }} onClick={() => addToPlaylist(result.url)}>Add</a>
                </li>))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        {_player}
        {trackList()}
      </div>
    </div >
  );
}