import { faBolt } from '@fortawesome/free-solid-svg-icons';
import { createLocalVideoTrack, LocalVideoTrack } from 'livekit-client';
import { AudioSelectButton, ControlButton, VideoSelectButton } from '@livekit/react-components';
import { VideoRenderer } from '@livekit/react-core';
import { ReactElement, useEffect, useState } from 'react';
import { AspectRatio } from 'react-aspect-ratio';
import { useNavigate } from 'react-router-dom';

export const PreJoinPage = () => {
  // initial state from query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const storedUrl = searchParams.get('url') ?? 'wss://rtc.educlouds.cn:5551';
  var token = searchParams.get('token') ?? '';
  const storedRoomName = searchParams.get('roomName') ?? 'my-test-room-name';
  const storedUserName = searchParams.get('userName') ?? '乐智用户';

  // state to pass onto room
  const [url, setUrl] = useState(storedUrl);
  //const [token, setToken] = useState<string>(storedToken);
  const [roomName, setRoomName] = useState(storedRoomName);
  const [userName, setUserName] = useState(storedUserName);
  const [simulcast, setSimulcast] = useState(true);
  const [dynacast, setDynacast] = useState(true);
  const [adaptiveStream, setAdaptiveStream] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  // disable connect button unless validated
  const [connectDisabled, setConnectDisabled] = useState(true);
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack>();
  const [audioDevice, setAudioDevice] = useState<MediaDeviceInfo>();
  const [videoDevice, setVideoDevice] = useState<MediaDeviceInfo>();
  const navigate = useNavigate();

  useEffect(() => {
    if (roomName && url) {
      setConnectDisabled(false);
    } else {
      setConnectDisabled(true);
    }
  }, [roomName, url]);

  const toggleVideo = async () => {
    if (videoTrack) {
      videoTrack.stop();
      setVideoEnabled(false);
      setVideoTrack(undefined);
    } else {
      const track = await createLocalVideoTrack({
        deviceId: videoDevice?.deviceId,
      });
      setVideoEnabled(true);
      setVideoTrack(track);
    }
  };

  useEffect(() => {
    // enable video by default
    createLocalVideoTrack({
      deviceId: videoDevice?.deviceId,
    }).then((track) => {
      setVideoEnabled(true);
      setVideoTrack(track);
    });
  }, [videoDevice]);

  const toggleAudio = () => {
    if (audioEnabled) {
      setAudioEnabled(false);
    } else {
      setAudioEnabled(true);
    }
  };

  const selectVideoDevice = (device: MediaDeviceInfo) => {
    setVideoDevice(device);
    if (videoTrack) {
      if (videoTrack.mediaStreamTrack.getSettings().deviceId === device.deviceId) {
        return;
      }
      // stop video
      videoTrack.stop();
    }
  };

  function getRandomString(length: any) {
    var str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) 
        result += str[Math.floor(Math.random() * str.length)];
    return result;
}


 const connectToRoomWithToken = async () => {
    const identity = getRandomString(11);
    // let getTokenUrl = "https://rtc.educlouds.cn:8999/getToken?roomName=" + roomName + "&identity=" + identity;
    let getTokenUrl = "http://localhost:8000/getToken?roomName=" + roomName + "&identity=" + identity;
    if (userName) {
      getTokenUrl += "&userName=" + userName;
    }
    fetch(getTokenUrl, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
      .then((response) => response.text())
      .then((data) => {
        token = data;
        navigateToRoom();
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const navigateToRoom = async () => {
    if (!token) {
      alert("token is empty.");
      return;
    }
    const params: { [key: string]: string } = {
      url,
      token,
      videoEnabled: videoEnabled ? '1' : '0',
      audioEnabled: audioEnabled ? '1' : '0',
      simulcast: simulcast ? '1' : '0',
      dynacast: dynacast ? '1' : '0',
      adaptiveStream: adaptiveStream ? '1' : '0',
    };
    if (audioDevice) {
      params.audioDeviceId = audioDevice.deviceId;
    }
    if (videoDevice) {
      params.videoDeviceId = videoDevice.deviceId;
    } else if (videoTrack) {
      // pass along current device id to ensure camera device match
      const deviceId = await videoTrack.getDeviceId();
      if (deviceId) {
        params.videoDeviceId = deviceId;
      }
    }
    navigate({
      pathname: '/room',
      search: '?' + new URLSearchParams(params).toString(),
    });
  }

  const connectToRoom = async () =>  {
    if (videoTrack) {
      videoTrack.stop();
    }

    if (
      window.location.protocol === 'https:' &&
      url.startsWith('ws://') &&
      !url.startsWith('ws://localhost')
    ) {
      alert('Unable to connect to insecure websocket from https');
      return;
    }

    // get token first
    connectToRoomWithToken();
  };

  let videoElement: ReactElement;
  if (videoTrack) {
    videoElement = <VideoRenderer track={videoTrack} isLocal={true} />;
  } else {
    videoElement = <div className="placeholder" />;
  }

  return (
    <div className="prejoin">
      <main>
        <h2>LiveKit Video</h2>
        <hr />
        <div className="entrySection">
          <div hidden>
            <div className="label">LiveKit URL</div>
            <div>
              <input type="text" disabled  name="url" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="label">Room</div>
            <div>
              <input type="text" name="roomName" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
            </div>
          </div>
          <div>
            <div className="label">User</div>
            <div>
              <input type="text" name="userName" value={userName} autoFocus={true} onChange={(e) => setUserName(e.target.value)} />
            </div>
          </div>
          <div className="options">
            <div>
              <input
                id="simulcast-option"
                type="checkbox"
                name="simulcast"
                checked={simulcast}
                disabled
                onChange={(e) => setSimulcast(e.target.checked)}
              />
              <label htmlFor="simulcast-option">Simulcast</label>
            </div>
            <div>
              <input
                id="dynacast-option"
                type="checkbox"
                name="dynacast"
                checked={dynacast}
                disabled
                onChange={(e) => setDynacast(e.target.checked)}
              />
              <label htmlFor="dynacast-option">Dynacast</label>
            </div>
            <div>
              <input
                id="adaptivestream-option"
                type="checkbox"
                name="adaptiveStream"
                checked={adaptiveStream}
                disabled
                onChange={(e) => setAdaptiveStream(e.target.checked)}
              />
              <label htmlFor="adaptivestream-option">Adaptive Stream</label>
            </div>
          </div>
        </div>

        <div className="videoSection">
          <AspectRatio ratio={16 / 9}>{videoElement}</AspectRatio>
        </div>

        <div className="controlSection">
          <div>
            <AudioSelectButton
              isMuted={!audioEnabled}
              onClick={toggleAudio}
              onSourceSelected={setAudioDevice}
            />
            <VideoSelectButton
              isEnabled={videoTrack !== undefined}
              onClick={toggleVideo}
              onSourceSelected={selectVideoDevice}
            />
          </div>
          <div className="right">
            <ControlButton
              label="Connect"
              disabled={connectDisabled}
              icon={faBolt}
              onClick={connectToRoom}
            />
          </div>
        </div>
      </main>
      <footer>
        Powered by Chenhaibo
      </footer>
    </div>
  );
};
