import { ConnectOptions, Room } from "livekit-client";
import React, { useEffect } from "react";
import { ControlsProps } from "./components/ControlsView";
import { ParticipantProps } from "./components/ParticipantView";
import { StageProps } from "./components/StageProps";
import { StageView } from "./components/StageView";
import { useRoom } from "./useRoom";

export interface RoomProps {
  url: string;
  token: string;
  connectOptions?: ConnectOptions;
  /**
   * when set to true, optimize bandwidth (and room capacity)
   * by disabling video streams that are not visible on screen
   */
  disableHiddenVideo?: Boolean;
  // when first connected to room
  onConnected?: (room: Room) => void;
  // when user leaves the room
  onLeave?: (room: Room) => void;
  stageRenderer?: (props: StageProps) => React.ReactElement | null;
  participantRenderer?: (props: ParticipantProps) => React.ReactElement | null;
  controlRenderer?: (props: ControlsProps) => React.ReactElement | null;
}

export const LiveKitRoom = ({
  url,
  token,
  connectOptions,
  stageRenderer,
  participantRenderer,
  controlRenderer,
  onConnected,
  onLeave,
  disableHiddenVideo,
}: RoomProps) => {
  const roomState = useRoom();

  useEffect(() => {
    roomState.connect(url, token, connectOptions).then((room) => {
      if (!room) {
        return;
      }
      if (onConnected) {
        onConnected(room);
      }
    });
  }, []);

  const selectedStageRenderer = stageRenderer ?? StageView;

  return selectedStageRenderer({
    roomState,
    participantRenderer,
    controlRenderer,
    onLeave,
    disableHiddenVideo,
  });
};
