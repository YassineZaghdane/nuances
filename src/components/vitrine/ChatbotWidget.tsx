"use client"
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const INITIAL: Message = {
  role: 'assistant',
  content: 'Bonjour ! Je suis Nour, votre conseillère parfum ✿\n\nJe suis là pour vous aider à trouver votre fragrance idéale.\n\nCherchez-vous un parfum pour vous-même ou souhaitez-vous offrir un cadeau ?',
}

export function ChatbotWidget() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [pulse, setPulse]       = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chatbot', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: data.message || 'Désolée, réessayez.',
      }])
    } catch {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: 'Une erreur est survenue. Réessayez.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes nourPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(196,150,10,0.5); }
          50%      { box-shadow:0 0 0 14px rgba(196,150,10,0); }
        }
        @keyframes nourSlide {
          from { opacity:0; transform:translateY(16px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes nourDot {
          0%,80%,100% { transform:translateY(0); opacity:0.4; }
          40%         { transform:translateY(-5px); opacity:1; }
        }
        .nd1 { animation:nourDot 1.2s infinite 0s; }
        .nd2 { animation:nourDot 1.2s infinite 0.2s; }
        .nd3 { animation:nourDot 1.2s infinite 0.4s; }
      `}</style>

      {/* Bouton flottant */}
      <div style={{
        position: 'fixed', bottom: '1.8rem', right: '1.8rem', zIndex: 1000,
      }}>
        {!open && pulse && (
          <div style={{
            position: 'absolute', bottom: '68px', right: 0,
            background: 'white', border: '1px solid rgba(196,150,10,0.25)',
            padding: '0.65rem 1rem', fontSize: '0.76rem', color: '#1A1208',
            whiteSpace: 'nowrap', boxShadow: '0 4px 18px rgba(26,18,8,0.1)',
            fontFamily: 'Jost,sans-serif',
          }}>
            ✿ Besoin d'un conseil parfum ?
            <div style={{
              position: 'absolute', bottom: '-6px', right: '18px',
              width: '10px', height: '10px', background: 'white',
              border: '1px solid rgba(196,150,10,0.25)',
              borderTop: 'none', borderLeft: 'none',
              transform: 'rotate(45deg)',
            }}/>
          </div>
        )}

        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: '54px', height: '54px', borderRadius: '50%',
            background: open
              ? '#1A1208'
              : 'linear-gradient(135deg,#C4960A,#A07808)',
            border: 'none', cursor: 'pointer',
            fontSize: open ? '1.6rem' : '1.4rem',
            color: 'white', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: open
              ? '0 4px 18px rgba(26,18,8,0.3)'
              : '0 4px 18px rgba(196,150,10,0.45)',
            animation: pulse && !open ? 'nourPulse 2s infinite' : 'none',
            transition: 'all 0.3s',
          }}
        >
          {open ? '×' : '✿'}
        </button>
      </div>

      {/* Fenêtre */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '5.5rem', right: '1.8rem',
          width: '340px', height: '480px',
          background: 'white', border: '1px solid rgba(196,150,10,0.18)',
          boxShadow: '0 20px 60px rgba(26,18,8,0.14)',
          display: 'flex', flexDirection: 'column',
          zIndex: 999, animation: 'nourSlide 0.3s ease',
          fontFamily: 'Jost,sans-serif',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg,#1A1208,#2C1E10)',
            padding: '0.9rem 1.1rem',
            display: 'flex', alignItems: 'center', gap: '0.7rem',
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#C4960A,#A07808)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '0.9rem',
              color: 'white', flexShrink: 0,
            }}>✿</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>
                Nour
              </div>
              <div style={{ fontSize: '0.62rem', color: '#C4960A', letterSpacing: '0.06em' }}>
                Conseillère parfum IA
              </div>
            </div>
            <button
              onClick={() => { setMessages([INITIAL]); setInput('') }}
              title="Nouvelle conversation"
              style={{
                background: 'rgba(255,255,255,0.08)', border: 'none',
                borderRadius: '50%', width: '26px', height: '26px',
                cursor: 'pointer', fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >↺</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '0.9rem',
            display: 'flex', flexDirection: 'column', gap: '0.7rem',
            background: '#FDFAF5',
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '0.4rem', alignItems: 'flex-start',
              }}>
                {m.role === 'assistant' && (
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: 'linear-gradient(135deg,#C4960A,#A07808)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '0.55rem',
                    color: 'white', flexShrink: 0, marginTop: '2px',
                  }}>✿</div>
                )}
                <div style={{
                  maxWidth: '78%',
                  padding: '0.6rem 0.85rem',
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg,#C4960A,#A07808)'
                    : 'white',
                  color: m.role === 'user' ? 'white' : '#1A1208',
                  fontSize: '0.78rem', lineHeight: 1.6,
                  border: m.role === 'assistant'
                    ? '1px solid rgba(196,150,10,0.12)' : 'none',
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 1px 4px rgba(26,18,8,0.05)',
                }}>{m.content}</div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#C4960A,#A07808)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.55rem',
                  color: 'white', flexShrink: 0,
                }}>✿</div>
                <div style={{
                  padding: '0.6rem 0.85rem', background: 'white',
                  border: '1px solid rgba(196,150,10,0.12)',
                  display: 'flex', gap: '4px', alignItems: 'center',
                }}>
                  <div className="nd1" style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#C4960A' }}/>
                  <div className="nd2" style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#C4960A' }}/>
                  <div className="nd3" style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#C4960A' }}/>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{
            padding: '0.7rem', borderTop: '1px solid rgba(196,150,10,0.12)',
            background: 'white', display: 'flex', gap: '0.4rem',
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Vos préférences..."
              disabled={loading}
              style={{
                flex: 1, padding: '0.55rem 0.8rem',
                border: '1px solid rgba(196,150,10,0.2)',
                background: '#FDFAF5', fontSize: '0.78rem',
                color: '#1A1208', outline: 'none',
                fontFamily: 'Jost,sans-serif',
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                padding: '0.55rem 0.85rem',
                background: loading || !input.trim()
                  ? '#C4B090'
                  : 'linear-gradient(135deg,#C4960A,#A07808)',
                color: 'white', border: 'none',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontSize: '1rem', transition: 'all 0.2s',
              }}
            >→</button>
          </div>

          <div style={{
            padding: '0.35rem', background: '#FAF7F2',
            textAlign: 'center', fontSize: '0.56rem', color: '#C4B090',
            borderTop: '1px solid rgba(196,150,10,0.08)',
          }}>
            Conseils IA · Nuances Parfums
          </div>
        </div>
      )}
    </>
  )
}
