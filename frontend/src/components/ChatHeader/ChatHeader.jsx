import { useState } from 'react';
import { ChevronDown, Download, MessageSquare, Trash2 } from 'lucide-react';
import styles from './ChatHeader.module.css';

export default function ChatHeader({
  activeMode,
  activeSession,
  modes,
  onClearAll,
  onExportChat,
  onModeChange,
  onNewChat,
}) {
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.modelBtn}
          type='button'
          onClick={() => setIsModeMenuOpen(prev => !prev)}
        >
          <span>{activeMode.label}</span>
          <ChevronDown size={16} />
        </button>

        {isModeMenuOpen && (
          <div className={styles.menu}>
            {modes.map(mode => (
              <button
                className={styles.menuItem}
                key={mode.id}
                type='button'
                onClick={() => {
                  onModeChange(mode.id);
                  setIsModeMenuOpen(false);
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.title}>{activeSession?.title || 'New chat'}</div>

      <div className={styles.right}>
        <button
          aria-label='Start new chat'
          className={styles.iconBtn}
          type='button'
          onClick={onNewChat}
        >
          <MessageSquare size={18} />
        </button>
        <button
          className={styles.avatar}
          type='button'
          onClick={() => setIsUserMenuOpen(prev => !prev)}
        >
          IT
        </button>

        {isUserMenuOpen && (
          <div className={`${styles.menu} ${styles.userMenu}`}>
            <button className={styles.menuItem} type='button' onClick={onExportChat}>
              <Download size={16} />
              Export chat
            </button>
            <button className={styles.menuItem} type='button' onClick={onClearAll}>
              <Trash2 size={16} />
              Clear all
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
