import { useState, useEffect } from 'react';

// Interface for navigation items
interface NavItem {
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}

// Floating AI Assistant Widget Component
function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', text: string}>>([
    {role: 'assistant', text: 'Hi! I\'m BrahanBot. Ask me about wellbore verification, EU AI Act compliance, or our 128-layer mHC-GNN architecture.'}
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, {role: 'user', text: userMessage}]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `I understand you're asking about "${userMessage}". As WellTegra's AI assistant, I can help you understand our physics-driven verification process, regulatory compliance requirements, or technical architecture. What would you like to explore?`
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 h-[500px] bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/brahanbot.png"
                  alt="BrahanBot"
                  className="w-10 h-10 rounded-full border-2 border-teal-500/50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%230D9488"/%3E%3Ctext x="50" y="55" font-size="30" text-anchor="middle" fill="white" font-family="Arial"%3EB%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-teal-500 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  BrahanBot
                </div>
                <div className="text-xs text-teal-400">WellTegra AI Assistant</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-teal-500/20 border border-teal-500/30 text-white'
                      : 'bg-slate-800/80 border border-white/10 text-slate-300'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 border border-white/10 px-4 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse delay-100" />
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about wellbore verification..."
                className="flex-1 px-4 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </div>
            <div className="text-xs text-slate-600 mt-2">
              Powered by Brahan Engine • Physics-driven responses
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-full shadow-lg hover:shadow-teal-500/50 transition-all duration-300 flex items-center justify-center border-2 border-teal-400/30"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        ) : (
          <div className="relative">
            <img
              src="/brahanbot.png"
              alt="BrahanBot"
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="white"/%3E%3Ctext x="50" y="55" font-size="30" text-anchor="middle" fill="%230D9488" font-family="Arial"%3EB%3C/text%3E%3C/svg%3E';
              }}
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-teal-400 rounded-full border-2 border-slate-900" />
          </div>
        )}
      </button>
    </div>
  );
}

// Main Platform Navigation Component
export default function PlatformNavigation({ currentPage = 'dashboard' }: { currentPage?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { label: 'Platform', href: '#platform' },
    { label: 'Technology', href: '#technology' },
    { label: 'Research', href: '#research', external: true },
    { label: 'Compliance', href: '#compliance' },
    { label: 'Verify', href: '#verify' },
    { label: 'Calculator', href: '#calculator' },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className={`
        fixed top-0 left-0 right-0 z-40 transition-all duration-300
        ${isScrolled
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-white/10 shadow-lg'
          : 'bg-transparent'
        }
      `}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center border border-teal-400/30 shadow-lg shadow-teal-500/20">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white leading-tight" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  WellTegra
                </span>
                <span className="text-xs text-teal-400 leading-tight">Sovereign Industrial AI</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>

            {/* Primary CTA */}
            <div className="hidden lg:block">
              <a
                href="#audit"
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 border border-teal-400/30"
              >
                Request Audit
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-slate-300 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href="#audit"
                  className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg transition-colors text-center"
                >
                  Request Audit
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />

      {/* Spacer for fixed nav */}
      <div className="h-16" />
    </>
  );
}
