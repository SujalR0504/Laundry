import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, X, Send } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { businessSettings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const sendWhatsApp = (msgText?: string) => {
    const textToSend = encodeURIComponent(
      msgText || customMsg || businessSettings.whatsappMessageTemplate
    );
    const url = `https://wa.me/${businessSettings.whatsappNumber}?text=${textToSend}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const quickPrompts = [
    '👋 Need pickup today in my area',
    '👗 Inquiring about bridal lehenga / gown dry clean',
    '📦 Track my current laundry order',
    '👔 Corporate bulk laundry enquiry',
  ];

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40">
      {/* Chat Popover */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-xs sm:w-80 max-h-[80vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="p-4 bg-emerald-600 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">The Laundry Lounge Care</h4>
                <p className="text-[11px] text-emerald-100 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  <span>Rewa • 9329838804</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-emerald-700 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 bg-slate-50 space-y-3 overflow-y-auto">
            <div className="p-3 bg-white rounded-2xl rounded-tl-none shadow-soft-sm border border-slate-100 text-xs text-slate-700 leading-relaxed">
              👋 Namaste! How can we help you today with your garments or doorstep pickup?
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Questions
              </p>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => sendWhatsApp(q)}
                  className="w-full text-left text-xs bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 p-2 rounded-xl border border-slate-200 text-slate-700 transition-all font-medium"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center space-x-1.5">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendWhatsApp()}
                placeholder="Type your question..."
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={() => sendWhatsApp()}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 group font-bold text-xs"
        aria-label="WhatsApp Support"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline">Chat with Care</span>
      </button>
    </div>
  );
};
