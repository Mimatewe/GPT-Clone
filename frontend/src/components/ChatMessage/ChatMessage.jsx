import { Bot, Copy, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import styles from './ChatMessage.module.css';

export default function ChatMessage({ role, content, onCopy }) {
  // Teacher note:
  // role controls the visual side of the message:
  // user messages get the user icon/style, assistant messages get bot style.
  return (
    <div className={`${styles.message} ${styles[role]}`}>
      <div className={`${styles.avatar} ${styles[role]}`}>
        {role === 'user' ? (
          <User size={18} color='white' />
        ) : (
          <Bot size={18} color='white' />
        )}
      </div>
      <div className={styles.body}>
        <button
          aria-label='Copy message'
          className={styles.copyBtn}
          type='button'
          onClick={onCopy}
        >
          <Copy size={14} />
        </button>
        <div className={styles.content}>
          {role === 'user' ? (
            // User messages are rendered as plain text.
            content
          ) : (
            <div className={styles.markdownBody}>
              {/* Assistant messages can include Markdown and code blocks. */}
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
