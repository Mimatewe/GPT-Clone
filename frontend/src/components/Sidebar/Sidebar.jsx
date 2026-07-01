import { useMemo, useState } from 'react';
import {
  Code2,
  FolderKanban,
  Image as ImageIcon,
  LayoutGrid,
  MessageSquare,
  Microscope,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Trash2,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const modeIcons = {
  chat: MessageSquare,
  images: ImageIcon,
  apps: LayoutGrid,
  research: Microscope,
  codex: Code2,
  projects: FolderKanban,
};

export default function Sidebar({
  activeMode,
  activeSessionId,
  isCollapsed,
  modes,
  onClearAll,
  onDeleteSession,
  onModeChange,
  onNewChat,
  onSelectSession,
  onToggleCollapse,
  sessions,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return sessions;
    }

    return sessions.filter(session =>
      session.title.toLowerCase().includes(normalizedSearch),
    );
  }, [searchTerm, sessions]);

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <button
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={styles.iconBtn}
          type='button'
          onClick={onToggleCollapse}
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
        <button
          aria-label='Start new chat'
          className={styles.iconBtn}
          type='button'
          onClick={onNewChat}
        >
          <MessageSquare size={20} />
        </button>
      </div>

      <nav className={styles.nav} aria-label='Assistant modes'>
        <button className={styles.item} type='button' onClick={onNewChat}>
          <MessageSquare size={18} />
          <span>New chat</span>
        </button>
        <button
          className={`${styles.item} ${isSearchOpen ? styles.active : ''}`}
          type='button'
          onClick={() => setIsSearchOpen(prev => !prev)}
        >
          <Search size={18} />
          <span>Search chats</span>
        </button>

        {isSearchOpen && (
          <div className={styles.searchWrap}>
            <input
              aria-label='Search chats'
              className={styles.searchInput}
              placeholder='Search'
              type='search'
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />
          </div>
        )}

        {modes
          .filter(mode => mode.id !== 'chat')
          .map(mode => {
            const Icon = modeIcons[mode.id];

            return (
              <button
                className={`${styles.item} ${
                  activeMode === mode.id ? styles.active : ''
                }`}
                key={mode.id}
                type='button'
                onClick={() => onModeChange(mode.id)}
              >
                <Icon size={18} />
                <span>{mode.label}</span>
              </button>
            );
          })}
      </nav>

      <div className={styles.sessions}>
        <div className={styles.sessionsHeader}>
          <span>Chats</span>
          {sessions.length > 0 && (
            <button
              aria-label='Clear all chats'
              className={styles.smallBtn}
              type='button'
              onClick={onClearAll}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div className={styles.sessionList}>
          {filteredSessions.map(session => (
            <div
              className={`${styles.sessionRow} ${
                activeSessionId === session.id ? styles.activeSession : ''
              }`}
              key={session.id}
            >
              <button
                className={styles.sessionBtn}
                type='button'
                onClick={() => onSelectSession(session.id)}
              >
                {session.title}
              </button>
              <button
                aria-label={`Delete ${session.title}`}
                className={styles.deleteBtn}
                type='button'
                onClick={() => onDeleteSession(session.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {filteredSessions.length === 0 && (
            <div className={styles.emptySessions}>No chats</div>
          )}
        </div>
      </div>
    </aside>
  );
}
