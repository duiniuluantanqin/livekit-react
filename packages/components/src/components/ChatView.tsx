import { DataPacket_Kind, Room, RoomEvent } from 'livekit-client';
import React, { ReactElement, useEffect, useState } from 'react';
import { useParticipant } from '@livekit/react-core';
import styles from './styles.module.css';
import { ControlButton } from './ControlButton';

export interface ChatProps {
  room: Room;
  enableChat?: boolean;
}

export const ChatView = ({
  room,
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
      from = participant.identity;
    }
    setRecvMsg(recvMsg + "\n" + from + ": " + strData);
  })

  function onSendMsg() {
    let encoder = new TextEncoder();
    const msg = encoder.encode(sendMsg);
    room.localParticipant.publishData(msg, DataPacket_Kind.RELIABLE);
    setRecvMsg(recvMsg + "\n" + room.localParticipant.identity + "(me): " + sendMsg);
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
    <div className={styles.chatWrapper}>
      <div>
        <textarea className={styles.textareaRecvMsg} readOnly value={recvMsg} />
      </div>
      <div>
        <textarea 
        className={styles.textareaRecvMsg} 
        value={sendMsg}  
        placeholder="Type your message here" 
        onChange={(e) => setSendMsg(e.target.value)} 
        onKeyDown={onTextareaKeyDown}
        />
      </div>
      <div className="right">
        {chatButton}
      </div>
    </div>
  );
};


