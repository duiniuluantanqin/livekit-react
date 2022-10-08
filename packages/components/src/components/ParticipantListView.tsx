import { Participant, Room } from 'livekit-client';
import React from 'react';
import { useParticipant } from '@livekit/react-core';
import styles from './styles.module.css';

export interface ParticipantListProps {
  room: Room;
  participants: Participant[];
}

export const ParticipantListView = ({
  room,
  participants,
}: ParticipantListProps) => {
  const { } = useParticipant(
    room.localParticipant,
  );

  function onChangeName() {
    let strName = "测试修改名字";
    room.localParticipant.name = strName;
    room.localParticipant.setMetadata(strName);
  }

  return (
    <div className={styles.participantListWrapper}>
      {participants.map((participant) => {
        return (
          <div>
            <ul>
              <li>
                <label>
                  { 
                   participant.identity }
                </label>
                <button>
                  静音
                </button>
                <button onClick={()=> {onChangeName}}>
                  改名
                </button>
              </li>
            </ul>
          </div>
        );
      })}
    </div>
  );
};

