import { faDesktop, faMessage, faPeopleGroup, faStop } from '@fortawesome/free-solid-svg-icons';
import { DataPacket_Kind, Room } from 'livekit-client';
import React, { ReactElement } from 'react';
import { useParticipant } from '@livekit/react-core';
import { AudioSelectButton } from './AudioSelectButton';
import { ControlButton } from './ControlButton';
import styles from './styles.module.css';
import { VideoSelectButton } from './VideoSelectButton';

export interface ControlsProps {
  room: Room;
  enableChat?: boolean;
  enableParticipantList?: boolean;
  enableScreenShare?: boolean;
  enableAudio?: boolean;
  enableVideo?: boolean;
  onLeave?: (room: Room) => void;
}

export const ControlsView = ({
  room,
  enableScreenShare,
  enableAudio,
  enableVideo,
  onLeave,
}: ControlsProps) => {
  const { cameraPublication: camPub, microphonePublication: micPub } = useParticipant(
    room.localParticipant,
  );

  if (enableScreenShare === undefined) {
    enableScreenShare = true;
  }
  if (enableVideo === undefined) {
    enableVideo = true;
  }
  if (enableAudio === undefined) {
    enableAudio = true;
  }

  const [audioButtonDisabled, setAudioButtonDisabled] = React.useState(false);
  let muteButton: ReactElement | undefined;
  if (enableAudio) {
    const enabled = !(micPub?.isMuted ?? true);
    muteButton = (
      <AudioSelectButton
        isMuted={!enabled}
        isButtonDisabled={audioButtonDisabled}
        onClick={async () => {
          setAudioButtonDisabled(true);
          room.localParticipant
            .setMicrophoneEnabled(!enabled)
            .finally(() => setAudioButtonDisabled(false));
        }}
        onSourceSelected={(device) => {
          setAudioButtonDisabled(true);
          room
            .switchActiveDevice('audioinput', device.deviceId)
            .finally(() => setAudioButtonDisabled(false));
        }}
      />
    );
  }

  const [videoButtonDisabled, setVideoButtonDisabled] = React.useState(false);

  let videoButton: ReactElement | undefined;
  if (enableVideo) {
    const enabled = !(camPub?.isMuted ?? true);
    videoButton = (
      <VideoSelectButton
        isEnabled={enabled}
        isButtonDisabled={videoButtonDisabled}
        onClick={() => {
          setVideoButtonDisabled(true);
          room.localParticipant
            .setCameraEnabled(!enabled)
            .finally(() => setVideoButtonDisabled(false));
        }}
        onSourceSelected={(device) => {
          setVideoButtonDisabled(true);
          room
            .switchActiveDevice('videoinput', device.deviceId)
            .finally(() => setVideoButtonDisabled(false));
        }}
      />
    );
  }

  const [screenButtonDisabled, setScreenButtonDisabled] = React.useState(false);
  let screenButton: ReactElement | undefined;
  if (enableScreenShare) {
    const enabled = room.localParticipant.isScreenShareEnabled;
    screenButton = (
      <ControlButton
        label={enabled ? 'Stop sharing' : 'Share screen'}
        icon={enabled ? faStop : faDesktop}
        disabled={screenButtonDisabled}
        onClick={() => {
          setScreenButtonDisabled(true);
          room.localParticipant
            .setScreenShareEnabled(!enabled)
            .finally(() => setScreenButtonDisabled(false));
        }}
      />
    );
  }

  let chatButton: ReactElement | undefined;
  if (true) {
    chatButton = (
      <ControlButton
        label="聊天"
        icon={faMessage}
        onClick={() => {
          let encoder = new TextEncoder();
          const msg = encoder.encode("chatMsg");
          room.localParticipant.publishData(msg, DataPacket_Kind.RELIABLE);
        }}
      />
    );
  }

  let participantButton: ReactElement | undefined;
  participantButton = (
    <ControlButton
      label="成员"
      icon={faPeopleGroup}
      onClick={() => {
        alert("成员列表");
      }}
    />
  );

  return (
    <div className={styles.controlsWrapper}>
      {muteButton}
      {videoButton}
      {screenButton}
      {participantButton}
      {chatButton}
      {onLeave && (
        <ControlButton
          label="End"
          className={styles.dangerButton}
          onClick={() => {
            room.disconnect();
            onLeave(room);
          }}
        />
      )}
    </div>
  );
};
