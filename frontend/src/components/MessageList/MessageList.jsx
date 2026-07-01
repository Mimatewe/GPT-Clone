import { Bot } from 'lucide-react';
import ChatMessage from '../ChatMessage/ChatMessage';
import styles from './MessageList.module.css';

export default function MessageList({
  conversations,
  isBooting,
  isLoading,
  messagesEndRef,
  onCopyMessage,
  onStarterPrompt,
}) {
  // Teacher note:
  // MessageList decides what the middle of the chat shows:
  // loading state, empty state, saved messages, and assistant typing indicator.
  return (
    <div className={styles.messages}>
      {isBooting ? (
        <div className={styles.empty}>Loading chats...</div>
      ) : conversations.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.empty}>What are you working on?</div>
          <button className={styles.starterBtn} type='button' onClick={onStarterPrompt}>
            Start with a prompt
          </button>
        </div>
      ) : (
        conversations.map(msg => (
          // Each saved row becomes one ChatMessage bubble.
          <ChatMessage
            content={msg.content}
            key={msg.id}
            role={msg.role}
            onCopy={() => onCopyMessage(msg.content)}
          />
        ))
      )}

      {isLoading && (
        // This typing indicator appears while the POST request is waiting.
        <div className={styles.loadingContainer}>
          <div className={styles.loadingAvatar}>
            <Bot size={18} color='white' />
          </div>
          <div className={styles.loading} aria-label='Assistant is responding'>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
