import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import clsx from 'clsx';

const ChatPanel = ({ onSendCommand, mcpStatus }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: '🤖 Sales MCP Chat - Enter commands like "find 15 no code platforms" or "research 20 CRM companies". Powered by OpenAI API.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await onSendCommand(inputValue);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response || 'Command executed successfully!',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Failed to execute command. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4 text-primary-600" />;
      case 'bot':
        return <Bot className="w-4 h-4 text-success-600" />;
      case 'system':
        return <Bot className="w-4 h-4 text-gray-600" />;
      case 'error':
        return <Bot className="w-4 h-4 text-danger-600" />;
      default:
        return <Bot className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMessageStyle = (type) => {
    switch (type) {
      case 'user':
        return 'bg-primary-100 text-primary-900 ml-auto';
      case 'bot':
        return 'bg-gray-100 text-gray-900';
      case 'system':
        return 'bg-blue-50 text-blue-900 border border-blue-200';
      case 'error':
        return 'bg-danger-50 text-danger-900 border border-danger-200';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-primary-600" />
          <div>
            <div className="font-medium text-gray-900">MCP Chat</div>
            <div className="text-xs text-gray-500">
              Status: {mcpStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-2">
            <div className="flex-shrink-0 mt-1">
              {getMessageIcon(message.type)}
            </div>
            <div className={clsx(
              "px-3 py-2 rounded-lg text-sm max-w-xs break-words",
              getMessageStyle(message.type)
            )}>
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 mt-1">
              <Loader className="w-4 h-4 text-primary-600 animate-spin" />
            </div>
            <div className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-900">
              Processing command...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your command..."
            className="flex-1 resize-none input-field text-sm"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="btn-primary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatPanel; 