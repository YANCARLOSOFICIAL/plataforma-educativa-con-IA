'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, Button } from '@/components/ui';
import {
  Bot,
  Send,
  ArrowLeft,
  Trash2,
  User,
  Loader2
} from 'lucide-react';
import { chatbotAPI } from '@/lib/api';
import type { Chatbot, ChatConversation, ChatMessage } from '@/types';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = parseInt(params.id as string);

  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chatbot details
  const { data: chatbot, isLoading: chatbotLoading } = useQuery({
    queryKey: ['chatbot', chatbotId],
    queryFn: () => chatbotAPI.getById(chatbotId),
  });

  // Fetch conversations for this chatbot
  const { data: conversations, refetch: refetchConversations } = useQuery({
    queryKey: ['chatbot-conversations', chatbotId],
    queryFn: () => chatbotAPI.getConversations(chatbotId),
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { message: string; conversation_id?: number }) =>
      chatbotAPI.chat(chatbotId, data),
    onSuccess: (response) => {
      // Add user message
      const userMsg: ChatMessage = {
        id: Date.now(),
        content: message,
        role: 'user',
        created_at: new Date().toISOString(),
      };

      // Add assistant response
      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        content: response.message,
        role: 'assistant',
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setConversationId(response.conversation_id);
      setMessage('');
      refetchConversations();
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      message: message.trim(),
      conversation_id: conversationId || undefined,
    });
  };

  const handleLoadConversation = async (conv: ChatConversation) => {
    setConversationId(conv.id);
    setMessages(conv.messages || []);
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (convId: number) => {
    if (confirm('¿Eliminar esta conversación?')) {
      try {
        await chatbotAPI.deleteConversation(convId);
        refetchConversations();
        if (conversationId === convId) {
          handleNewConversation();
        }
      } catch (error) {
        alert('Error al eliminar la conversación');
      }
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (chatbotLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!chatbot) {
    return (
      <DashboardLayout>
        <Card variant="glass" padding="lg" className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Chatbot no encontrado
          </h2>
          <Button onClick={() => router.push('/chatbots')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Chatbots
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex gap-4">
        {/* Conversations Sidebar */}
        <div className="w-80 flex flex-col">
          <Card variant="glass" className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/chatbots')}
                className="w-full mb-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleNewConversation}
                className="w-full !bg-gradient-to-r !from-purple-600 !to-pink-600"
              >
                Nueva Conversación
              </Button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                Conversaciones
              </h3>
              {conversations && conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all group ${
                      conversationId === conv.id
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500'
                        : 'bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleLoadConversation(conv)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conv.title || 'Conversación sin título'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(conv.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No hay conversaciones
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <Card variant="glass" className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {chatbot.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {chatbot.description || 'Chatbot IA'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bot className="w-20 h-20 text-gray-400 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Inicia una conversación
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    {chatbot.personality || 'Hola! Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?'}
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-gray-300 dark:bg-gray-600 rounded-lg">
                          <User className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              {sendMessageMutation.isPending && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  disabled={sendMessageMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 px-6"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
