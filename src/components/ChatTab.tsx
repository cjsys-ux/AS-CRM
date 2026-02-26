import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Trash2, User, Paperclip, X, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

interface ChatMessage {
  id: string;
  message: string;
  user: string;
  timestamp: string;
  isCurrentUser: boolean;
  attachment?: {
    name: string;
    type: string;
    size: string;
  };
}

interface ChatTabProps {
  productId?: string;
}

export function ChatTab({ productId = 'PRD-001' }: ChatTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ChatMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [productId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/products/${productId}/chat`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachedFile) || isSending) return;

    setIsSending(true);

    try {
      if (attachedFile) {
        // Send with file attachment
        const formData = new FormData();
        formData.append('message', newMessage || 'Shared a file');
        formData.append('file', attachedFile);

        const response = await fetch(`${API_URL}/products/${productId}/chat`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          await fetchMessages();
          setNewMessage('');
          setAttachedFile(null);
        } else {
          console.error('Error sending message:', data.error);
        }
      } else {
        // Send text-only message
        const response = await fetch(`${API_URL}/products/${productId}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ message: newMessage }),
        });

        const data = await response.json();
        if (data.success) {
          await fetchMessages();
          setNewMessage('');
        } else {
          console.error('Error sending message:', data.error);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleDeleteClick = (message: ChatMessage) => {
    setMessageToDelete(message);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${API_URL}/products/${productId}/chat/${messageToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });

      const data = await response.json();
      if (data.success) {
        await fetchMessages();
        setDeleteModalOpen(false);
        setMessageToDelete(null);
      } else {
        console.error('Error deleting message:', data.error);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  // Calculate dynamic height based on message count
  const calculateHeight = () => {
    if (messages.length === 0) return 'h-[200px]';
    if (messages.length <= 3) return 'h-[300px]';
    if (messages.length <= 6) return 'h-[400px]';
    return 'h-[500px]'; // Max height, then scroll
  };

  return (
    <div className="space-y-6">
      {/* Chat Container */}
      <div className={`bg-white rounded-xl border-2 border-slate-200 overflow-hidden flex flex-col ${calculateHeight()} transition-all duration-300`}>
        {/* Chat Header */}
        <div className="px-6 py-3 border-b border-slate-200 flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 flex-shrink-0">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="font-bold text-slate-900">Team Chat</h3>
            <p className="text-xs text-slate-600">Discuss product details with your team</p>
          </div>
        </div>

        {/* Messages - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${msg.isCurrentUser ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    {!msg.isCurrentUser && (
                      <>
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{msg.user}</span>
                      </>
                    )}
                    {msg.isCurrentUser && (
                      <>
                        <span className="text-xs font-medium text-slate-700">{msg.user}</span>
                        <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-purple-600" />
                        </div>
                      </>
                    )}
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`relative group rounded-xl p-3 shadow-sm ${
                      msg.isCurrentUser
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                        : 'bg-white border-2 border-slate-200 text-slate-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    
                    {/* Attachment Display */}
                    {msg.attachment && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`mt-2 p-2 rounded-lg flex items-center gap-2 ${
                          msg.isCurrentUser 
                            ? 'bg-white/10 border border-white/20' 
                            : 'bg-slate-50 border border-slate-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          msg.isCurrentUser ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {getFileIcon(msg.attachment.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${
                            msg.isCurrentUser ? 'text-white' : 'text-slate-900'
                          }`}>
                            {msg.attachment.name}
                          </p>
                          <p className={`text-xs ${
                            msg.isCurrentUser ? 'text-purple-100' : 'text-slate-500'
                          }`}>
                            {msg.attachment.size}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => console.log('Download:', msg.attachment?.name)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            msg.isCurrentUser 
                              ? 'hover:bg-white/20' 
                              : 'hover:bg-slate-200'
                          }`}
                        >
                          <Download className={`w-3.5 h-3.5 ${
                            msg.isCurrentUser ? 'text-white' : 'text-slate-600'
                          }`} />
                        </motion.button>
                      </motion.div>
                    )}
                    
                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/10">
                      <span className={`text-xs ${msg.isCurrentUser ? 'text-purple-100' : 'text-slate-500'}`}>
                        {msg.timestamp}
                      </span>
                      {msg.isCurrentUser && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteClick(msg)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded-lg"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />

          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">No messages yet</h4>
              <p className="text-sm text-slate-600">
                Start the conversation with your team
              </p>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
          {/* Attached File Preview */}
          {attachedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 p-2 bg-slate-50 rounded-lg flex items-center gap-2 border border-slate-200"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                {getFileIcon(attachedFile.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900 truncate">{attachedFile.name}</p>
                <p className="text-xs text-slate-500">
                  {attachedFile.size > 1024 * 1024 
                    ? `${(attachedFile.size / (1024 * 1024)).toFixed(1)} MB`
                    : `${(attachedFile.size / 1024).toFixed(0)} KB`}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setAttachedFile(null)}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-600" />
              </motion.button>
            </motion.div>
          )}

          <div className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4 text-slate-600" />
            </motion.button>
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                disabled={isSending}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && !attachedFile) || isSending}
              className="px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMessageToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Message"
        message={`Are you sure you want to delete this message? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
