import { Participant, Room } from 'livekit-client';
import React, { FC } from 'react';
import styles from './styles.module.css';

type SidebarTabsProps = {
  tabs: {
    label: string;
    index: number;
    Component: FC<{ index: number, room: Room, participants: Participant[]}>;
  }[];
  selectedTab: number;
  room: Room;
  participants: Participant[],
  onClick: (index: number) => void;
};

/**
 * Avalible Props
 * @param className string
 * @param tab Array of object
 * @param selectedTab number
 * @param onClick Function to set the active tab
 */
export const SidebarTabs: FC<SidebarTabsProps> = ({
  tabs = [],
  selectedTab = 0,
  room,
  participants,
  onClick,
}) => {
  const Panel = tabs && tabs.find((tab) => tab.index === selectedTab);

  return (
    <div className={styles.tabsComponent}>
      <div role="tablist">
        {tabs.map((tab) => (
          <button
            className={selectedTab === tab.index ? "active" : ""}
            onClick={() => onClick(tab.index)}
            key={tab.index}
            type="button"
            role="tab"
            aria-selected={selectedTab === tab.index}
            aria-controls={`tabpanel-${tab.index}`}
            tabIndex={selectedTab === tab.index ? 0 : -1}
            id={`btn-${tab.index}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        aria-labelledby={`btn-${selectedTab}`}
        id={`tabpanel-${selectedTab}`}
      >
        {Panel && <Panel.Component index={selectedTab} room={room} participants={participants} />}
      </div>
    </div>
  );
};


