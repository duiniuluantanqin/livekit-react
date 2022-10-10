import { Participant, Room, Track, VideoTrack } from 'livekit-client';
import React, { ReactElement, useEffect, useState } from 'react';
import { ChatView } from '../ChatView';
import { ControlsView } from '../ControlsView';
import { ParticipantListView } from '../ParticipantListView';
import { ParticipantView } from '../ParticipantView';
import { ScreenShareView } from '../ScreenShareView';
import { SidebarTabs } from '../SidebarTabs';
import { StageProps } from '../StageProps';
import { defaultSortParticipants } from '../StageUtils';
import styles from './styles.module.css';

export const SpeakerStage = ({
  roomState,
  participantRenderer,
  controlRenderer,
  onLeave,
  sortParticipants,
}: StageProps) => {
  const { isConnecting, error, participants, room } = roomState;
  const [showOverlay, setShowOverlay] = useState(false);
  const sortFn = sortParticipants ?? defaultSortParticipants;
  const [sortedParticipants, setSortedParticipants] = useState(sortFn(participants));

  type TabsType = {
    label: string;
    index: number;
    Component: React.FC<{ room: Room, participants: Participant[], index: number }>;
  }[];
  
  // Tabs Array
  const tabs: TabsType = [
    {
      label: "聊天",
      index: 1,
      Component: ChatView
    },
    {
      label: "成员管理",
      index: 2,
      Component: ParticipantListView
    }
  ];
  const [selectedTab, setSelectedTab] = useState<number>(tabs[0].index);

  useEffect(() => {
    setSortedParticipants(sortFn(participants));
  }, [participants, sortFn]);

  if (error) {
    return <div>error {error.message}</div>;
  }

  if (isConnecting) {
    return <div>connecting</div>;
  }
  if (!room) {
    return <div>room closed</div>;
  }

  if (sortedParticipants.length === 0) {
    return <div>no one is in the room</div>;
  }

  const ParticipantRenderer = participantRenderer ?? ParticipantView;
  const ControlRenderer = controlRenderer ?? ControlsView;

  // find first participant with screen shared
  let screenTrack: VideoTrack | undefined;
  sortedParticipants.forEach((p) => {
    if (screenTrack) {
      return;
    }
    const track = p.getTrack(Track.Source.ScreenShare);
    if (track?.isSubscribed && track.videoTrack) {
      screenTrack = track.videoTrack;
    }
  });

  let otherParticipants = sortedParticipants;
  let participantInFocus: Participant;
  let mainView: ReactElement;
  if (screenTrack) {
    mainView = <ScreenShareView track={screenTrack} height="100%" width="100%" />;
  } else {
    [participantInFocus, ...otherParticipants] = sortedParticipants;
    mainView = (
      <ParticipantRenderer
        key={participantInFocus.identity}
        participant={participantInFocus}
        width="100%"
        height="100%"
        orientation="landscape"
        showOverlay={showOverlay}
        showConnectionQuality
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
      />
    );
  }

  return (
    // global container
    <div className={styles.container}>
      <div className={styles.stage}>
        <div className={styles.stageCenter}>{mainView}</div>
        <div className={styles.sidebar}>
          {otherParticipants.map((participant) => {
            return (
              <ParticipantRenderer
                key={participant.identity}
                participant={participant}
                width="100%"
                aspectWidth={16}
                aspectHeight={9}
                showOverlay={showOverlay}
                onMouseEnter={() => setShowOverlay(true)}
                onMouseLeave={() => setShowOverlay(false)}
              />
            );
          })}
        </div>
      </div>
      <div className={styles.sideBarTab}>
        <SidebarTabs selectedTab={selectedTab} onClick={setSelectedTab} tabs={tabs} participants={participants} room={room}/>
      </div>
      <div className={styles.controlsArea}>
        <ControlRenderer room={room} onLeave={onLeave} />
      </div>
    </div>
  );
};
