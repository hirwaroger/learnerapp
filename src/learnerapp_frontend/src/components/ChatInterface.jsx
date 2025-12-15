import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatInterface = ({ api, actor, notebookId, user }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history for this user and topic
  useEffect(() => {
    loadChatHistory();
  }, [notebookId, user]);

  const loadChatHistory = async () => {
    try {
      const sessionId = `${user.name}_${notebookId}`;
      const history = await actor.getChatHistory(sessionId);
      // Parse and set messages if history exists
      if (history.length > 0) {
        const parsedMessages = history.map(h => {
          try {
            return JSON.parse(h);
          } catch {
            return { type: 'system', content: h };
          }
        });
        setMessages(parsedMessages.flat());
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { 
      type: 'user', 
      content: inputValue,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await api.chat(notebookId, currentInput, true);

      const botMessage = {
        type: 'bot',
        content: result.enhanced_response || result.response,
        original: result.original_response,
        enhanced: result.enhanced || false,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);

      // Store in backend
      const sessionId = `${user.name}_${notebookId}`;
      try {
        await actor.storeChatMessage(sessionId, JSON.stringify([userMessage, botMessage]));
      } catch (storageError) {
        console.error('Failed to store chat message:', storageError);
      }

    } catch (error) {
      const errorMessage = {
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="card flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h4 className="text-xl font-semibold text-gray-900">Chat Assistant</h4>
          <span className="text-sm text-gray-500">{messages.length} messages</span>
        </div>
        <button onClick={clearChat} className="btn-danger">
          Clear Chat
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`${
            message.type === 'user' ? 'flex justify-end' : 
            message.type === 'error' ? 'flex justify-center' : 'flex justify-start'
          }`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg ${
              message.type === 'user' ? 'message-user' : 
              message.type === 'error' ? 'message-error' : 'message-bot'
            }`}>
              {message.type === 'bot' ? (
                <ReactMarkdown
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={tomorrow}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg mt-2"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <div>{message.content}</div>
              )}
              
              {message.original && message.enhanced && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                    View original response
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <ReactMarkdown className="text-sm italic">
                      {message.original}
                    </ReactMarkdown>
                  </div>
                </details>
              )}
              
              <div className="text-xs opacity-70 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="message-bot">
              <div className="loading-dots flex gap-1">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-gray-50 border-t border-gray-200 p-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about this topic..."
            disabled={isLoading}
            className="flex-1 input-field"
            maxLength={5000}
          />
          <button 
            type="submit" 
            disabled={isLoading || !inputValue.trim()}
            className="btn-primary px-8"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
