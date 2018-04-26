import React, { Component } from 'react';
import './Progress.css';

class Progress extends Component {
    constructor(props) {
        super(props);       
        this.state = {
            position: 0
        }
    }
    updateTime = (ev) => {
        let duration;
        if (this.props.playerYT != null)
            duration = this.props.playerYT.getDuration();
        else
            duration = this.props.player.duration;
        const percent = ((ev.nativeEvent.layerX / ev.nativeEvent.target.parentElement.clientWidth) * 100);
        const newTime = duration / 100 * percent;
        if (this.props.playerYT != null)
            this.props.playerYT.seekTo(newTime);
        else
            this.props.player.currentTime = newTime;
    }
    render() {     
        let currentTime, duration, paused, ended;
        if (this.props.playerYT != null) {
            currentTime = this.props.playerYT.getCurrentTime();
            duration = this.props.playerYT.getDuration();
            paused: this.props.playerYT.paused;
            ended: currentTime == duration ? true : false;
        }
        else {
            currentTime = this.props.player.currentTime;
            duration = this.props.player.duration;
            paused = this.props.player.paused;
            ended = this.props.player.ended;
        }

        setTimeout(() => {
            if (!paused && !ended)
                this.setState({ position: currentTime / duration * 100 });
            else 
                if (ended)
                    this.props.ended();
        }, 250);

        let currentTimeMins = Math.floor(currentTime / 60)
        if (currentTimeMins < 10)
            currentTimeMins = "0" + currentTimeMins
        let currentTimeSecs = Math.floor(currentTime - currentTimeMins * 60)
        if (currentTimeSecs < 10)
            currentTimeSecs = "0" + currentTimeSecs
        let durationMins = Math.floor(duration / 60)
        if (durationMins < 10)
            durationMins = "0" + durationMins
        let durationSecs = Math.floor(duration - durationMins * 60)
        if (durationSecs < 10)
            durationSecs = "0" + durationSecs
        return (
            <div className="progress-container">
                <div className="progress" onClick={this.updateTime.bind(this)}>
                    <div className="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" style={{width:this.state.position+"%"}}></div>
                </div>
                <div className="clear"></div>
                <div className="row time">
                    <div className="col-xs-6 text-left">
                        {currentTimeMins}:{currentTimeSecs}
                    </div>
                    <div className="col-xs-6 text-right">
                        {durationMins}:{durationSecs}
                    </div>
                </div>
            </div>
        );
    }
}

export default Progress;