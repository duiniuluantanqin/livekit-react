import { Participant, Room } from 'livekit-client';
import { RoomState } from '@livekit/react-core';
import { ControlsProps } from './ControlsView';
import { ParticipantProps } from './ParticipantView';
import { ChatProps } from './ChatView';
import { ParticipantListProps } from './ParticipantListView';

export interface StageProps {
  roomState: RoomState;
  participantRenderer?: (props: ParticipantProps) => React.ReactElement | null;
  controlRenderer?: (props: ControlsProps) => React.ReactElement | null;
  chatRenderer?: (props: ChatProps) => React.ReactElement | null;
  participantListRenderer?: (props: ParticipantListProps) => React.ReactElement | null;
  onLeave?: (room: Room) => void;
  sortParticipants?: (participants: Participant[]) => Participant[];
}
