import { Participant, Room, RoomEvent } from 'livekit-client';
import React, { FC, Fragment } from 'react';
import { useParticipant } from '@livekit/react-core';
import styles from './styles.module.css';

export interface ParticipantListProps {
  room: Room;
  participants: Participant[];
}

export const ParticipantListView: FC<ParticipantListProps> = ({
  room,
  participants,
}: ParticipantListProps) => {
  const { } = useParticipant(
    room.localParticipant,
  );

  room.on(RoomEvent.ParticipantMetadataChanged, (data, participant) => {
    console.log("ParticipantMetadataChanged", data);
    var p = participants.find(item => item.sid == participant.sid);
    if (p && (participant.sid !== room.localParticipant.sid)) {
      alert("ddddd" + p.name);
      p.name = data;
    }
  })

  function onChangeName(participant: Participant) {
    if (participant.sid === room.localParticipant.sid) {
      let strName = "测试修改名字";
      console.log("当前的metedata是：" + participant.metadata);
      room.localParticipant.name = strName;
      // TODO: 这是内部函数，不会通知给其他参与者
      //room.localParticipant.setMetadata(strName);
    }
  }

  return (
    <Fragment>
      <div className={styles.participantListWrapper}>
        <ul>
          {participants.map((participant) => {
            return (
              <li>
                <label>
                  {participant.name || participant.identity}
                </label>
                <button hidden>
                  静音
                </button>
                <button hidden onClick={() => { onChangeName(participant) }}>
                  改名
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Fragment>
  );
};

