import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Trash2, Paperclip, X, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { uploadFileViaApi } from '../utils/uploadViaApi';
import { useAuth } from '../context/AuthContext';


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

interface TeamMember {
  name: string;
  color: string;
}

interface ChatTabProps {
  productId?: string;
}

const MENTION_COLORS = [
  'bg-blue-100 text-blue-600',
  'bg-orange-100 text-orange-600',
  'bg-purple-100 text-purple-600',
  'bg-green-100 text-green-600',
  'bg-pink-100 text-pink-600',
  'bg-cyan-100 text-cyan-600',
];

function colorForName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return MENTION_COLORS[h % MENTION_COLORS.length];
}

export function ChatTab({ productId = 'PRD-001' }: ChatTabProps) {
  const { user } = useAuth();
  const currentUserName = user?.name ?? 'You';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ChatMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [productId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/users/list');
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const members: TeamMember[] = (data.users ?? [])
          .map((u: any) => ({ name: u.name ?? '', color: colorForName(u.name ?? '') }))
          .filter((m: TeamMember) => m.name.length > 0);
        setTeamMembers(members);
      } catch {
        // silent — mentions just stay empty
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/pipeline/chat/list?productId=${encodeURIComponent(productId)}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      const msgs: ChatMessage[] = (data.messages ?? []).map((m: ChatMessage) => ({
        ...m,
        isCurrentUser: m.user === currentUserName,
      }));
      setMessages(msgs);
    } catch {
      setMessages([]);
    }
  };

  const filteredMembers = useMemo(
    () => teamMembers.filter(m =>
      m.name.toLowerCase().includes(mentionFilter) && m.name !== currentUserName
    ),
    [teamMembers, mentionFilter, currentUserName]
  );

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachedFile) || isSending) return;

    setIsSending(true);
    try {
      let attachmentKey: string | undefined;
      let attachmentName: string | undefined;
      let attachmentType: string | undefined;
      let attachmentSize: string | undefined;

      if (attachedFile) {
        try {
          const { key } = await uploadFileViaApi(attachedFile, 'pipeline-chat', productId);
          attachmentKey = key;
          attachmentName = attachedFile.name;
          attachmentType = attachedFile.type;
          attachmentSize = attachedFile.size > 1024 * 1024
            ? `${(attachedFile.size / (1024 * 1024)).toFixed(1)} MB`
            : `${(attachedFile.size / 1024).toFixed(0)} KB`;
        } catch (err) {
          console.error('Chat attachment upload error:', err);
        }
      }

      const res = await fetch('/api/pipeline/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          message: newMessage.trim() || '',
          user: currentUserName,
          attachmentKey,
          attachmentName,
          attachmentType,
          attachmentSize,
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');
      const data = await res.json();
      const sent: ChatMessage = { ...data.message, isCurrentUser: data.message?.user === currentUserName };
      setMessages((prev) => [...prev, sent]);
      setNewMessage('');
      setAttachedFile(null);
    } catch {
      toast.error('Failed to send message');
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
      const res = await fetch('/api/pipeline/chat/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: messageToDelete.id }),
      });
      if (!res.ok) throw new Error('Failed to delete message');
      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete.id));
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete message');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setMessageToDelete(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewMessage(val);
    const cursorPos = e.target.selectionStart ?? val.length;
    const textBeforeCursor = val.substring(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);
    if (atMatch) {
      setMentionFilter(atMatch[1].toLowerCase());
      setShowMentionDropdown(true);
      setMentionIndex(0);
    } else {
      setShowMentionDropdown(false);
    }
  };

  const insertMention = (name: string) => {
    const cursorPos = textareaRef.current?.selectionStart ?? newMessage.length;
    const textBeforeCursor = newMessage.substring(0, cursorPos);
    const textAfterCursor = newMessage.substring(cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    const head = atIndex >= 0 ? textBeforeCursor.substring(0, atIndex) : textBeforeCursor;
    const newText = `${head}@${name} ${textAfterCursor}`;
    setNewMessage(newText);
    setShowMentionDropdown(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentionDropdown && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % filteredMembers.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + filteredMembers.length) % filteredMembers.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredMembers[mentionIndex].name);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentionDropdown(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMentions = (text: string, dark: boolean) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const name = part.substring(1);
        const member = teamMembers.find(m => m.name.toLowerCase() === name.toLowerCase());
        if (member) {
          return (
            <span
              key={i}
              className={`rounded px-1 font-semibold ${
                dark ? 'bg-blue-500/20 text-blue-200' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {part}
            </span>
          );
        }
      }
      return <span key={i}>{part}</span>;
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Chat Container */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden flex flex-col min-h-[320px] sm:min-h-[420px] max-h-[600px]">
        {/* Chat Header */}
        <div className="px-6 py-3 border-b border-slate-200 flex items-center gap-3 flex-shrink-0">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <h3 className="font-bold text-slate-900">Team Chat</h3>
            <p className="text-xs text-slate-500">Discuss product details with your team</p>
          </div>
        </div>

        {/* Messages - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-slate-50">
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
                  <div className={`flex items-center gap-2 mb-1.5 ${msg.isCurrentUser ? 'justify-end' : ''}`}>
                    {!msg.isCurrentUser && (
                      <>
                        <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                          <span className="text-[10px] font-bold text-orange-600">{msg.user?.[0] || 'U'}</span>
                        </div>
                        <span className="text-xs font-medium text-slate-700">{msg.user}</span>
                      </>
                    )}
                    {msg.isCurrentUser && (
                      <>
                        <span className="text-xs font-medium text-slate-700">{msg.user}</span>
                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-[10px] font-bold text-blue-600">{msg.user?.[0] || 'U'}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`relative group rounded-xl p-3 shadow-sm ${
                      msg.isCurrentUser
                        ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white'
                        : 'bg-white border-2 border-slate-200 text-slate-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{renderMentions(msg.message, msg.isCurrentUser)}</p>
                    
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
                            msg.isCurrentUser ? 'text-slate-300' : 'text-slate-500'
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
                    
                    <div className={`flex items-center justify-between mt-1.5 pt-1.5 border-t ${
                      msg.isCurrentUser ? 'border-white/10' : 'border-slate-100'
                    }`}>
                      <span className={`text-xs ${msg.isCurrentUser ? 'text-slate-400' : 'text-slate-500'}`}>
                        {msg.timestamp}
                      </span>
                      {msg.isCurrentUser && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteClick(msg)}
                          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-white/60 hover:text-white" />
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
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">No messages yet</h4>
              <p className="text-sm text-slate-500">
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

          <div className="relative flex items-end gap-2">
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
            <div className="flex-1 relative">
              <AnimatePresence>
                {showMentionDropdown && filteredMembers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-1 left-0 w-48 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50"
                  >
                    <div className="px-3 py-1.5 text-xs font-medium text-slate-400 border-b border-slate-100">
                      Mention a team member
                    </div>
                    {filteredMembers.map((member, i) => (
                      <button
                        key={member.name}
                        type="button"
                        onClick={() => insertMention(member.name)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors ${
                          i === mentionIndex ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${member.color}`}>
                          {member.name[0]}
                        </div>
                        <span className="font-medium text-slate-900">{member.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (use @ to mention)"
                rows={1}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                disabled={isSending}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && !attachedFile) || isSending}
              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
