import { useRef, useState } from 'react';
import { ArrowUp, Mic, MicOff, Paperclip } from 'lucide-react';
import styles from './ChatInput.module.css';

export default function ChatInput({
  handleSendMessage,
  isLoading,
  onFeedback,
  placeholder,
}) {
  // Teacher note:
  // ChatInput owns the text currently being typed. App owns saved messages.
  // When the form submits, this component sends the text up to App.
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Refs store browser objects without causing re-renders.
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const handleSubmit = event => {
    // preventDefault stops the browser from reloading the page on form submit.
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    // Parent App performs the API call. This component only passes the question.
    handleSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = event => {
    // Enter sends the message. Shift+Enter allows a new line.
    if (event.key === 'Enter' && !event.shiftKey) {
      handleSubmit(event);
    }
  };

  const handleFileChange = async event => {
    // Optional helper: read small text/code files into the prompt box.
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 200000) {
      // Correction note:
      // This file feature is helpful, but the backend still receives plain text.
      // For real file upload storage, you would need a separate upload endpoint.
      onFeedback('File is too large');
      event.target.value = '';
      return;
    }

    try {
      const text = await file.text();
      setInput(prev => `${prev}${prev ? '\n\n' : ''}${file.name}\n${text}`);
      onFeedback('File attached');
    } catch {
      onFeedback('Could not read file');
    } finally {
      event.target.value = '';
    }
  };

  const toggleRecording = () => {
    // Voice input uses the browser's SpeechRecognition API when available.
    // It is not supported by every browser.
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onFeedback('Voice input is not supported in this browser');
      return;
    }

    if (isRecording) {
      // Stop the current recognition session.
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = event => {
      // Put the spoken words into the same textarea as typed input.
      const transcript = event.results[0][0].transcript;
      setInput(prev => `${prev}${prev ? ' ' : ''}${transcript}`);
    };
    recognition.onerror = () => {
      onFeedback('Voice input failed');
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          ref={fileInputRef}
          className={styles.fileInput}
          type='file'
          accept='.txt,.md,.js,.jsx,.ts,.tsx,.css,.html,.json,.sql'
          onChange={handleFileChange}
        />
        <button
          aria-label='Attach file'
          className={styles.icon}
          disabled={isLoading}
          type='button'
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip size={20} />
        </button>
        <textarea
          className={styles.input}
          disabled={isLoading}
          placeholder={placeholder}
          rows={1}
          value={input}
          onChange={event => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        {input.trim() ? (
          <button
            aria-label='Send message'
            className={styles.submitBtn}
            disabled={isLoading}
            type='submit'
          >
            <ArrowUp size={18} />
          </button>
        ) : (
          <button
            aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}
            className={`${styles.icon} ${isRecording ? styles.recording : ''}`}
            disabled={isLoading}
            type='button'
            onClick={toggleRecording}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        )}
      </form>
    </div>
  );
}
