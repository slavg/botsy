import React, { useState, useEffect, useRef } from 'react';
import { Send, Edit2, Trash2, MessageSquare, X, Maximize2, Minimize2 } from 'lucide-react';
import { Message } from '../types';
import * as api from '../services/api';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [inputError, setInputError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('token');

  const WELCOME_MESSAGE: Message = {
    id: 'welcome-message',
    content: "Hi there! I'm Lucy, your AI assistant. How can I help you today?",
    user_id: 'bot',
    created_at: new Date(0).toISOString(), // Set to earliest date to always be first
    updated_at: null,
    is_bot: true
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (token && isOpen) {
        try {
          const fetchedMessages = await api.getMessages(token);
          const sortedMessages = fetchedMessages
            .sort((a, b) =>
              new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
            );
          setMessages([WELCOME_MESSAGE, ...sortedMessages]);
        } catch (error) {
          setMessages([WELCOME_MESSAGE]);
          console.error('Error fetching messages:', error);
        }
      } else if (isOpen) {
        setMessages([WELCOME_MESSAGE]);
      }
    }
    fetchMessages();
  }, [token, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (value: string, isEditing: boolean = false) => {
    if (value.length > 2000) {
      setInputError('Maximum message length is 2000 characters');
      if (isEditing) {
        setEditContent(value.slice(0, 2000));
      } else {
        setNewMessage(value.slice(0, 2000));
      }
      setTimeout(() => setInputError(''), 3000);
    } else {
      setInputError('');
      if (isEditing) {
        setEditContent(value);
      } else {
        setNewMessage(value);
      }
    }
  };

  const handleSend = async () => {
      setInputError('');
      if (!newMessage.trim() || !token) return;

      if (newMessage.length > 2000) {
        setInputError('Maximum message length is 2000 characters');
        return;
      }

      try {

        const newMessages = await api.sendMessage(newMessage, token);

        setMessages(prev => {
          // Keep welcome message separate
          const currentMessages = prev.filter(msg => msg.id !== 'welcome-message');

          // Combine existing messages with new ones
          const allMessages = [...currentMessages, ...newMessages];

          // Sort all messages by creation date
          const sortedMessages = allMessages.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateA - dateB;
          });

          // Return with welcome message at the start
          return [WELCOME_MESSAGE, ...sortedMessages];
        });

        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        setInputError('Failed to send message');
      }
    };

  const handleEdit = async (messageId: string) => {
    if (!editContent.trim() || !token) return;

    if (editContent.length > 2000) {
      setInputError('Maximum message length is 2000 characters');
      return;
    }

    try {
      const updatedMessage = await api.updateMessage(messageId, editContent, token);

      setMessages(prev => {
        const currentMessages = prev.filter(msg => msg.id !== messageId);
        return [...currentMessages, updatedMessage]
          .sort((a, b) =>
            new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
          );
      });

      // Reset editing state
      setEditingId(null);
      setEditContent('');

      // Fetch messages to get the updated bot response
      const fetchedMessages = await api.getMessages(token);
      const sortedMessages = fetchedMessages
        .sort((a, b) =>
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );
      setMessages([WELCOME_MESSAGE, ...sortedMessages]);
    } catch (error) {
      console.error('Error editing message:', error);
      setInputError('Failed to update message');
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!token) return;
    try {
      await api.deleteMessage(messageId, token);

      // Remove both the user message and the next bot message
      setMessages(prev => {
        const currentMessages = [...prev];
        const userMsgIndex = currentMessages.findIndex(msg => msg.id === messageId);

        if (userMsgIndex !== -1) {
          const nextBotMsgIndex = userMsgIndex + 1;
          if (nextBotMsgIndex < currentMessages.length && currentMessages[nextBotMsgIndex].is_bot) {
            currentMessages.splice(userMsgIndex, 2); // Remove both messages
          } else {
            currentMessages.splice(userMsgIndex, 1); // Remove only user message
          }
        }

        return currentMessages;
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Get latest user message ID for edit/delete buttons
  const latestUserMessageId = messages
    .filter(msg => msg && msg.id !== 'welcome-message' && !msg.is_bot)
    .sort((a, b) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    )[0]?.id;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-primary-600 text-white rounded-full p-4 shadow-lg"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  const baseWidth = 384;
  const baseHeight = 600;
  const expandedWidth = Math.min(baseWidth * 2, window.innerWidth - 48);
  const expandedHeight = Math.min(baseHeight * 2, window.innerHeight - 48);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div
        style={{
          width: isExpanded ? expandedWidth : baseWidth,
          height: isExpanded ? expandedHeight : baseHeight,
          transition: 'width 0.3s, height 0.3s'
        }}
        className="flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden relative"
      >
        <div className="p-4 flex justify-between items-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center mb-6">
            <img src="/static/lucy.png" alt="Lucy" className="w-12 h-12 rounded-full" />
            <h1 className="text-xl font-bold mt-2 text-gray-800">Hey, I'm Lucy</h1>
            <p className="text-sm text-gray-600 mt-1">Ask me anything you need help with</p>
          </div>

          <div className="space-y-4 px-4">
            {messages.map(message => {
                if (!message) return null; // Skip if message is undefined

                const timestamp = message.created_at
                  ? new Date(message.updated_at || message.created_at)
                  : message.id === 'welcome-message'
                    ? new Date()
                    : new Date();

                const isToday = new Date().toDateString() === timestamp.toDateString();
                const timeStr = message.id === 'welcome-message'
                  ? ''
                  : (isToday
                    ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
                      timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

                return (
                  <div key={message.id} className="flex items-start space-x-2">
                    {message.is_bot && (
                      <div className="flex-shrink-0">
                        <img src="/static/lucy.png" alt="Lucy" className="w-6 h-6 rounded-full" />
                      </div>
                    )}
                    <div className={`flex flex-1 ${message.is_bot ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3 ${
                        message.is_bot ? 'bg-blue-50 text-gray-800' : 'bg-primary text-white'
                      }`}>
                        <div>
                          {editingId === message.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editContent}
                                onChange={(e) => handleInputChange(e.target.value, true)}
                                className="w-full p-1 text-black rounded border"
                              />
                              {inputError && (
                                <div className="text-red-500 text-sm">
                                  {inputError}
                                </div>
                              )}
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleEdit(message.id)}
                                  className="text-white bg-green-500 px-2 py-1 rounded text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditContent('');
                                  }}
                                  className="text-white bg-gray-500 px-2 py-1 rounded text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p>{message.content}</p>
                              {timeStr && <p className="text-xs mt-1 opacity-70">{timeStr}</p>}
                              {!message.is_bot && message.id === latestUserMessageId && (
                                <div className="flex justify-end space-x-2 mt-2">
                                  <button
                                    onClick={() => {
                                      setEditingId(message.id);
                                      setEditContent(message.content);
                                    }}
                                    className="text-white hover:text-gray-200"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(message.id)}
                                    className="text-white hover:text-gray-200"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 border-t">
          {inputError && (
            <div className="text-red-500 text-sm mb-2 text-center">
              {inputError}
            </div>
          )}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-full"
            />
            <button
              onClick={handleSend}
              className="p-2 bg-primary text-white rounded-full hover:bg-primary-600"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;