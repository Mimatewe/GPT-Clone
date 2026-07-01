import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Download, MessageSquarePlus, RefreshCw, Sparkles } from 'lucide-react';
import MessageList from './components/MessageList/MessageList';
import ChatInput from './components/ChatInput/ChatInput';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const STARTER_PROMPT = 'What is a closure in JavaScript?';

// Teacher note:
// Axios errors have different shapes depending on what failed.
// This helper gives the UI one safe message string to show.
function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    'Something went wrong try again later'
  );
}

// Temporary messages make the UI feel fast before the backend responds.
// They use a string id so they cannot conflict with MySQL numeric ids.
function createClientMessage(role, content) {
  return {
    id: `${role}-${Date.now()}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function App() {
  // conversations is the visible chat history.
  // It comes from GET /api/chat/conversations and POST responses.
  const [conversations, setConversations] = useState([]);

  // isLoading is true while waiting for Gemini/backend response.
  const [isLoading, setIsLoading] = useState(false);

  // isBooting is only for the first page load.
  const [isBooting, setIsBooting] = useState(true);

  // toast stores short feedback messages like "Copied" or errors.
  const [toast, setToast] = useState('');

  // messagesEndRef points to an invisible div at the bottom of the chat.
  // Scrolling to it moves the chat view to the newest message.
  const messagesEndRef = useRef(null);

  const showToast = useCallback(message => {
    // Clear the previous timer so a new toast gets a full 3 seconds.
    setToast(message);
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => setToast(''), 3000);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchConversations = useCallback(async () => {
    // This matches the PDF's GET endpoint.
    // The backend returns { success, message, data: { conversations } }.
    const response = await axios.get(`${API_BASE_URL}/chat/conversations`);

    if (response.data.success) {
      setConversations(response.data.data.conversations);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function boot() {
      try {
        // Load saved chat messages when the page opens or refreshes.
        await fetchConversations();
      } catch (error) {
        if (isMounted) {
          showToast(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsBooting(false);
        }
      }
    }

    boot();

    return () => {
      // Correction note:
      // This guard avoids setting state after the component unmounts.
      // It is especially useful in React StrictMode development behavior.
      isMounted = false;
    };
  }, [fetchConversations, showToast]);

  useEffect(() => {
    // Whenever messages change, keep the newest message visible.
    scrollToBottom();
  }, [conversations, isLoading, scrollToBottom]);

  const handleSendMessage = useCallback(async question => {
    // Show the user's question immediately before the server finishes.
    const tempUserMessage = createClientMessage('user', question);

    setConversations(prev => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      // This matches the PDF's POST endpoint.
      // The only required body field is question.
      const response = await axios.post(`${API_BASE_URL}/chat/conversations`, {
        question,
      });

      if (response.data.success) {
        const { userConversation, assistantConversation } = response.data.data;

        setConversations(prev => {
          // Remove the temporary client message and replace it with the saved
          // database row so the UI has the real id and timestamp.
          const withoutTemp = prev.filter(
            message => message.id !== tempUserMessage.id,
          );

          return [...withoutTemp, userConversation, assistantConversation];
        });
      }
    } catch (error) {
      const errorConversation = createClientMessage(
        'assistant',
        getErrorMessage(error),
      );

      // Correction note:
      // We keep the user's temp message when an error happens so the student can
      // see what they tried to send. The assistant bubble shows the error.
      setConversations(prev => [...prev, errorConversation]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      // Refresh pulls the saved database history again.
      await fetchConversations();
      showToast('History refreshed');
    } catch (error) {
      showToast(getErrorMessage(error));
    }
  }, [fetchConversations, showToast]);

  const handleNewChat = useCallback(() => {
    // Correction note:
    // In this simple PDF version there are no sessions, so "New chat" only
    // clears the screen. It does not delete database history. Press Refresh to
    // bring saved messages back.
    setConversations([]);
  }, []);

  const handleStarterPrompt = useCallback(() => {
    // Sends a beginner-friendly prompt from the empty state.
    handleSendMessage(STARTER_PROMPT);
  }, [handleSendMessage]);

  const handleCopyMessage = useCallback(
    async content => {
      try {
        // Browser clipboard API copies the selected message text.
        await navigator.clipboard.writeText(content);
        showToast('Copied');
      } catch {
        showToast('Copy failed');
      }
    },
    [showToast],
  );

  const handleExportChat = useCallback(() => {
    if (conversations.length === 0) {
      showToast('No messages to export');
      return;
    }

    // Convert the current visible chat into a Markdown file.
    const transcript = conversations
      .map(message => `## ${message.role}\n\n${message.content}`)
      .join('\n\n');
    const blob = new Blob([`# Gemini Clone Chat\n\n${transcript}\n`], {
      type: 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'gemini-clone-chat.md';
    anchor.click();
    // Release the temporary browser URL after the download starts.
    URL.revokeObjectURL(url);
  }, [conversations, showToast]);

  return (
    <div className='app'>
      <aside className='sidebarShell'>
        <div className='brand'>
          <div className='brandMark'>
            <Sparkles size={18} />
          </div>
          <div>
            <div className='brandName'>MILI GPT</div>
            <div className='brandMeta'>Gemini clone</div>
          </div>
        </div>

        <button className='sidebarAction' type='button' onClick={handleNewChat}>
          <MessageSquarePlus size={18} />
          <span>Clear screen</span>
        </button>

        <div className='historySummary'>
          <span>History</span>
          <strong>{conversations.length}</strong>
        </div>
      </aside>

      <main className='chat'>
        <header className='chatHeader'>
          <div>
            <div className='modelLabel'>Gemini 2.5 Flash Lite</div>
            <h1>Programming Assistant</h1>
          </div>

          <div className='headerActions'>
            <button
              aria-label='Refresh history'
              className='iconBtn'
              title='Refresh history'
              type='button'
              onClick={handleRefresh}
            >
              <RefreshCw size={18} />
            </button>
            <button
              aria-label='Export chat'
              className='iconBtn'
              title='Export chat'
              type='button'
              onClick={handleExportChat}
            >
              <Download size={18} />
            </button>
          </div>
        </header>

        <MessageList
          conversations={conversations}
          isBooting={isBooting}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
          onCopyMessage={handleCopyMessage}
          onStarterPrompt={handleStarterPrompt}
        />

        <ChatInput
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
          onFeedback={showToast}
          placeholder='Ask a programming question'
        />
      </main>

      {toast && <div className='toast'>{toast}</div>}
    </div>
  );
}

export default App;
