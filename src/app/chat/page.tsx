'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Send, MessageCircle } from 'lucide-react'
import { addMessage } from '@/lib/realtimeProducts'
import { useAuth } from '@/context/AuthContext'

interface Message {
  id: string
  text: string
  isUser: boolean
  time: string
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Pozdrav! Kako vam možemo pomoći? Slobodno postavite pitanje.',
    isUser: false,
    time: new Date().toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' }),
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [formSent, setFormSent] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, userProfile } = useAuth()

  // Pre-fill contact form with user data
  useEffect(() => {
    if (user) {
      setContactForm(prev => ({
        ...prev,
        name: userProfile?.displayName || prev.name,
        email: user.email || prev.email,
      }))
    }
  }, [user, userProfile])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      time: new Date().toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Hvala na poruci! Za brži odgovor, molimo ostavite vaše kontakt podatke.',
        isUser: false,
        time: new Date().toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, botResponse])
      setShowContactForm(true)
    }, 1500)
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const userMessages = messages.filter(m => m.isUser).map(m => m.text).join('\n')
      
      await addMessage({
        name: contactForm.name,
        email: contactForm.email,
        message: userMessages + '\n---\n' + contactForm.message
      })

      setFormSent(true)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Hvala! Vaša poruka je poslana. Odgovorit ćemo vam u najkraćem roku.',
        isUser: false,
        time: new Date().toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' }),
      }])
      setShowContactForm(false)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] px-4 py-6 lg:px-8 lg:max-w-2xl lg:mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
          <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg lg:text-xl font-bold text-text">Podrška</h1>
          <p className="text-xs text-muted">Razgovarajte s nama</p>
        </div>
        <div className="flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
          <span className="text-xs text-accent font-medium">Online</span>
        </div>
      </div>

      {/* Support Agent Card */}
      <div className="flex items-center gap-3 bg-surface p-3 rounded-2xl mb-4 border border-white/5">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <span className="text-2xl">👩‍💼</span>
        </div>
        <div>
          <p className="text-sm font-medium text-text">EasyGo Podrška</p>
          <p className="text-xs text-muted">Obično odgovaramo za par minuta</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-surface rounded-2xl border border-white/5 p-4 space-y-4">
        {messages.map((message, index) => {
          const showAvatar = !message.isUser && (index === 0 || messages[index - 1]?.isUser)

          return (
            <div key={message.id}>
              <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                {!message.isUser && showAvatar && (
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <span className="text-sm">👩‍💼</span>
                  </div>
                )}
                {!message.isUser && !showAvatar && <div className="w-10 flex-shrink-0" />}
                
                <div className="max-w-[80%]">
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm ${
                      message.isUser
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-background text-text rounded-bl-md'
                    }`}
                  >
                    {message.text}
                  </div>
                  <p className={`text-xs text-muted mt-1.5 ${message.isUser ? 'text-right' : 'ml-2'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-sm">👩‍💼</span>
            </div>
            <div className="bg-background px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        {/* Contact Form */}
        {showContactForm && !formSent && (
          <div className="bg-background rounded-2xl p-4 ml-10">
            <p className="text-sm text-text font-medium mb-3">Ostavite vaše podatke:</p>
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Vaše ime"
                value={contactForm.name}
                onChange={e => setContactForm({...contactForm, name: e.target.value})}
                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                required
              />
              <input
                type="email"
                placeholder="Email adresa"
                value={contactForm.email}
                onChange={e => setContactForm({...contactForm, email: e.target.value})}
                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                required
              />
              <textarea
                placeholder="Dodatna poruka (opcionalno)"
                value={contactForm.message}
                onChange={e => setContactForm({...contactForm, message: e.target.value})}
                rows={2}
                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-primary resize-none transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25"
              >
                <Send className="w-4 h-4" />
                Pošalji
              </button>
            </form>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 bg-surface rounded-2xl border border-white/5 p-3">
        <div className="flex items-center gap-3">
          <button 
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted hover:text-text hover:bg-white/10 transition-colors"
            aria-label="Dodaj privitak"
          >
            <Plus className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Napišite poruku..."
            className="flex-1 bg-transparent text-text placeholder:text-muted text-sm focus:outline-none"
          />
          
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Pošalji poruku"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
