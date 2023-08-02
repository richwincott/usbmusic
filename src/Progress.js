import React, { useEffect, useState } from 'react';
import './Progress.css';

export const Progress = ({ playerYT, player, ended }) => {
  const [position, setPosition] = useState(0)
  const [currentTimeMins, setCurrentTimeMins] = useState(0)
  const [currentTimeSecs, setCurrentTimeSecs] = useState(0)
  const [durationMins, setDurationMins] = useState(0)
  const [durationSecs, setDurationSecs] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      let currentTime, duration, paused, _ended;
      if (playerYT != null) {
        currentTime = playerYT.getCurrentTime();
        duration = playerYT.getDuration();
        paused = playerYT.paused;
        _ended = currentTime === duration ? true : false;
      }
      else {
        currentTime = player.currentTime;
        duration = player.duration;
        paused = player.paused;
        _ended = player.ended;
      }

      if (!paused && !_ended) {
        const currentTimeMins = Math.floor(currentTime / 60)
        setCurrentTimeMins(currentTimeMins)
        setCurrentTimeSecs(Math.floor(currentTime - currentTimeMins * 60))
        const durationMins = Math.floor(duration / 60);
        setDurationMins(durationMins)
        setDurationSecs(Math.floor(duration - durationMins * 60))
        setPosition(currentTime / duration * 100);
      }
      else
        if (_ended) {
          setPosition(100)
          clearInterval(interval)
          ended();
        }
    }, 250);
    return () => clearInterval(interval);
  }, [player, playerYT])

  const updateTime = (ev) => {
    let duration;
    if (playerYT != null)
      duration = playerYT.getDuration();
    else
      duration = player.duration;
    const percent = ((ev.nativeEvent.layerX / ev.nativeEvent.target.parentElement.clientWidth) * 100);
    const newTime = duration / 100 * percent;
    if (playerYT != null)
      playerYT.seekTo(newTime);
    else
      player.currentTime = newTime;
  }

  const formatTime = (time) => {
    return time < 10 ? "0" + time : time;
  }

  return (
    <div className="progress-container">
      <div className="progress" onClick={updateTime.bind(this)}>
        <div className="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" style={{ width: position + "%" }}></div>
      </div>
      <div className="clear"></div>
      <div className="row time">
        <div className="col-xs-6 text-left">
          {formatTime(currentTimeMins)}:{formatTime(currentTimeSecs)}
        </div>
        <div className="col-xs-6 text-right">
          {formatTime(durationMins)}:{formatTime(durationSecs)}
        </div>
      </div>
    </div>
  );
}