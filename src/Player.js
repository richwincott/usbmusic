import React, { Component } from 'react';
import Progress from './Progress';
import Artwork from './Artwork';
import './Player.css';

class Player extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 0, // 0 = audio, 1 = youtube
            player: new Audio(),
            playerYT: null,
            tracks: [],
            current: {
                id: null,
                url: "",
                artist: "No track selected...",
                name: "No track selected...",
                artwork_url: "note.png"
            },
            paused: true,
            position: 0,
            shuffle: false,
            modal: false,
            search: null,
            youtubeUrl: null,
        }
        if (sessionStorage.getItem("params") != null)
            this.params = JSON.parse(sessionStorage.getItem("params"));
        window.$.ajax({
            url: this.props.dataUrl
        }).then((response) => {
            let tracks = [];
            let id = 0; 
            for (var i = 0; i < window.$(response).find("a").length; i++) {
                var link = window.$(response).find("a")[i];
                ["xml", "config", "Old Music", "Bruno Mars"].forEach((word) => {
                    if (link.innerHTML.indexOf(word) > -1)
                        link.bad = true;
                })
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
                        artwork_url: "note.png",
                        showBars: false
                    });
                    id++;
                }
            };
            this.setState({ tracks: tracks })
        });    
    }
    toggle = () => {
        if (this.state.current.id != null) {
            if (this.state.mode == 1) {
                let playerYT = this.state.playerYT;
                if (this.state.paused) {
                    this.state.playerYT.playVideo();
                    playerYT.paused = false;
                }
                else {
                    this.state.playerYT.pauseVideo();
                    playerYT.paused = true;
                }
                this.setState({ playerYT: playerYT });
            }
            else {
                if (this.state.paused)
                    this.state.player.play();         
                else
                    this.state.player.pause();        
            }
            let current = this.state.current;
            current.showBars = !current.showBars;
            this.setState({ paused: !this.state.paused, current: current });
        }
    }
    shuffle = () => {
        this.setState({ shuffle: !this.state.shuffle });
    }
    select = (track) => {
        this.setState({ mode: track.type });
        if (track.type == 0) {
            if (this.state.playerYT)
                this.setState({ playerYT: null });
            this.state.player.src = track.url;
            this.state.player.play(); 
        }
        else {
            this.state.player.pause();
        }
        this.state.tracks.forEach(function(track) {
            track.showBars = false;
        });
        track.showBars = true;
        this.setState({ current: track, paused: false })
        window.scrollTo(0, 0);
        if (this.params) {
            window.$.ajax({
                url: "https://api.spotify.com/v1/search?query=" + track.title.split("ft.")[0].split("(")[0].replace(/[|&;$%@"<>()+,]/g, "") + "+artist:" + track.artist.split("ft.")[0].replace(/[|&;$%@"<>()+,]/g, "") + "&type=track",
                headers: {
                    "Authorization": "Bearer " + this.params["access_token"]
                },
            }).then((response, status) => {
                if (response.tracks.items.length > 0) {
                    let _track = this.state.current;
                    _track.artwork_url = response.tracks.items[0].album.images[0].url;
                    this.setState({ current: _track });
                }
            }, (response) => {
                if (window.confirm(response.responseJSON.error.message + ". Redirect to Spotify to re-authenticate?")) {
                    const client_id = "cfb217e62b304cfda01dc7e92319fbe4";
                    const request_uri = encodeURI("http://192.168.1.251:3000/");
                    const url = "https://accounts.spotify.com/authorize?client_id=" + client_id + "&redirect_uri=" + request_uri + "&response_type=token&state=123"
                    window.location.href = url;
                }
            });   
        }
    }
    next = () => {
        let nextId = this.state.current.id + 1;
        if (nextId == this.state.tracks.length + 1)
            nextId = this.state.tracks.length
        if (this.state.shuffle)
            nextId = Math.floor(Math.random() * this.state.tracks.length-1);
        this.select(this.state.tracks[nextId]);
    }
    previous = () => {
        let nextId = this.state.current.id - 1;
        if (nextId == -1)
            nextId = 0;
        if (this.state.shuffle)
            nextId = Math.floor(Math.random() * this.state.tracks.length-1);
        this.select(this.state.tracks[nextId]);
    }
    toggleModal = () => {
        this.setState({ modal: !this.state.modal });
    }
    searchChanged = (ev) => {
        this.setState({ search: ev.currentTarget.value })
    }
    youtubeUrlChanged = (ev) => {
        this.setState({ youtubeUrl: ev.currentTarget.value })
    }
    addToPlaylist = () => {
        if (this.state.youtubeUrl.indexOf("youtu") > -1) {     
            window.$.ajax({
                url: "http://richardwincott.co.uk/youtubemetadata?url=" + this.state.youtubeUrl,
            }).then((response, status) => {
                var response = JSON.parse(response);
                if (response.title.indexOf(" - ") > -1) {
                    let tracks = this.state.tracks;
                    tracks.push({
                        id: tracks.length,
                        type: 1,
                        url: "ytId:" + response.thumbnail_url.split("/")[4],
                        name: response.title,
                        title: response.title.split(" - ")[1],
                        artist: response.title.split(" - ")[0],
                        artwork_url: "note.png",
                        showBars: false
                    });
                    this.setState({ tracks: tracks });
                }
            });
        }
    }
    handleYTReady = (event) => {
        // access to player in all event handlers via event.target
        // e.g. event.target.pauseVideo();
        this.setState({ mode: 1, playerYT: event.target });
    }
    render() {
        let title = <div className="hack"></div>
        if (this.state.current.title)
            title = <div><b>{this.state.current.title}</b></div>
        const tracks = this.state.tracks.map((track) => {
            if (track.title.indexOf(this.state.search) > -1 || track.artist.indexOf(this.state.search) > -1 || this.state.search == null) {
                const barsClass = track.showBars ? "pull-right bars show" : "pull-right bars";
                return (
                    <li onClick={this.select.bind(this, track)} key={track.id}>
                        <b>{track.title}</b>
                        <br/>{track.artist}
                        <img className={barsClass} src="bars.gif" />
                    </li>
                )
            }
        });
        const playOrPause = () => {
            return this.state.paused ? "fa fa-play" : "fa fa-pause"
        }
        const shuffleClass = () => {
            return this.state.shuffle ? "selected" : "";
        }          
        const modalClass = (others) => {
            return this.state.modal ? others + " show" : others;
        }
        // sexy close icon - https://d30y9cdsu7xlg0.cloudfront.net/png/582631-200.png
        return (
            <div>
                <div className={modalClass("modal-background")}>
                    <div className={modalClass("modal")}>
                        <div className="modal-content">
                            <div className="modal-header">                               
                                <a className="btn close" onClick={this.toggleModal.bind(this)}><img src="close.png" height="50" /></a>
                            </div>
                            <div className="modal-body">
                                <h2>USBMusic <small>v5</small></h2>
                                <p>Personal web app to play music remotely from usb device.</p>
                                <p>Written with ReactJS.</p>
                                <p>This app uses the Spotify API to download album artwork.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12 col-sm-6">
                        <div className="player">
                            <Artwork current={this.state.current} handleYTReady={this.handleYTReady} />
                            <Progress player={this.state.player} playerYT={this.state.playerYT} ended={this.next} />
                            <div className="padding">
                                <div className="title">
                                    {title}{this.state.current.artist}
                                </div>
                                <ul className="buttons main list-unstyled list-inline">
                                    <li onClick={this.previous.bind(this)}><i className="fa fa-fast-backward" aria-hidden="true"></i></li>
                                    <li onClick={this.toggle.bind(this)}><i className={playOrPause()} aria-hidden="true"></i></li>
                                    <li onClick={this.next.bind(this)}><i className="fa fa-fast-forward" aria-hidden="true"></i></li>
                                </ul>
                                <ul className="buttons extras list-unstyled list-inline">
                                    <li onClick={this.shuffle.bind(this)} className={shuffleClass()}><i className="fa fa-random" aria-hidden="true"></i></li>
                                    <li><i className="fa fa-list-ul" aria-hidden="true"></i></li>
                                    <li onClick={this.toggleModal.bind(this)}><i className="fa fa-info" aria-hidden="true"></i></li>
                                </ul>
                                <br/>
                                <br/>
                                <div className="input-group">                             
                                    <input className="form-control" onChange={this.youtubeUrlChanged.bind(this)} placeholder="Youtube song url" />
                                    <a className="input-group-addon btn btn-default" onClick={this.addToPlaylist.bind(this)}>Add</a>
                                </div>
                            </div>
                        </div>                       
                    </div>
                    <div className="col-xs-12 col-sm-6">         
                        <ul className="tracks list-unstyled">
                            <li>
                                <input className="form-control search" onChange={this.searchChanged.bind(this)} placeholder="Search" />
                                <i className="fa fa-search" aria-hidden="true"></i>
                            </li>
                            {tracks}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

export default Player;