import { DataPacket_Kind, Participant, Room, RoomEvent } from 'livekit-client';
import React, { FC, Fragment, ReactElement, useEffect, useState } from 'react';
import { useParticipant } from '@livekit/react-core';
import styles from './styles.module.css';
import { ControlButton } from './ControlButton';

export interface ChatProps {
  room: Room;
  participants: Participant[]
  enableChat?: boolean;
}

export const ChatView: FC<ChatProps> = ({
  room,
  participants,
  enableChat,
}: ChatProps) => {
  const { } = useParticipant(
    room.localParticipant,
  );

  if (enableChat === undefined) {
    enableChat = true;
  }

  const [sendMsg, setSendMsg] = useState("");
  const [recvMsg, setRecvMsg] = useState("");
  // disable connect button unless validated
  const [chatButtonDisabled, setChatButtonDisabled] = useState(true);

  useEffect(() => {
    if (sendMsg) {
      setChatButtonDisabled(false);
    } else {
      setChatButtonDisabled(true);
    }
  }, [sendMsg]);

  
  room.on(RoomEvent.DataReceived, (payload, participant) => {
    const decoder = new TextDecoder();
    const strData = decoder.decode(payload);
    let from = 'server';
    if (participant) {
      from = participant.name || participant.identity;
    }
    setRecvMsg(recvMsg + "\n" + from + ": " + strData);
  })

  function onSendMsg() {
    console.log(participants);
    let encoder = new TextEncoder();
    const msg = encoder.encode(sendMsg);
    room.localParticipant.publishData(msg, DataPacket_Kind.RELIABLE);
    setRecvMsg(recvMsg + "\n" + (room.localParticipant.name || room.localParticipant.identity) + "(me): " + sendMsg);
    setSendMsg("");
  }

  const onTextareaKeyDown=(e: { which: number; })=>{
    if (e.which === 13) {
      onSendMsg();
    }    
  }

  let chatButton: ReactElement | undefined;
  if (enableChat) {
    chatButton = (
      <ControlButton
        label="发送"
        disabled={chatButtonDisabled}
        className={styles.chatButton}
        onClick={onSendMsg}
      />
    );
  }

  return (
    <Fragment>
      <div className={styles.chatWrapper}>
        <textarea className={styles.textareaRecvMsg} readOnly value={recvMsg} />
        <textarea 
          className={styles.textareaRecvMsg} 
          value={sendMsg}  
          placeholder="Type your message here" 
          onChange={(e) => setSendMsg(e.target.value)} 
          onKeyDown={onTextareaKeyDown}
        />
        <div className="right">
          {chatButton}
        </div>
    </div>
    </Fragment>
    
  );
};


