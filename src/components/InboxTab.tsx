import React, { useState, useEffect } from 'react';
import { InboxMessageItem, ClubItem, ServerItem } from '../types.ts';
import { api } from '../api.ts';
import { 
  Mail, 
  MailOpen, 
  CheckCheck, 
  Coins, 
  Clock, 
  Briefcase, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Bell, 
  Shield 
} from 'lucide-react';
import { AnimatedLighting, LightingColorName } from './AnimatedLighting.tsx';

interface InboxTabProps {
  server: ServerItem;
  club: ClubItem;
  onOpenOffer: (offerId: string) => void;
  onOpenContract: (contractId: string) => void;
}

export const InboxTab: React.FC<InboxTabProps> = ({
  server,
  club,
  onOpenOffer,
  onOpenContract,
}) => {
  const [messages, setMessages] = useState<InboxMessageItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'transfers'>('all');

  const fetchInbox = async () => {
    try {
      setLoading(true);
      const res = await api.getInbox();
      if (res && res.messages) {
        setMessages(res.messages);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, [server.id]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await api.markInboxRead(messageId);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadMsgs = messages.filter((m) => !m.read);
    for (const m of unreadMsgs) {
      await api.markInboxRead(m.id).catch(() => {});
    }
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
    setUnreadCount(0);
  };

  const filteredMessages = messages.filter((m) => {
    if (filter === 'unread') return !m.read;
    if (filter === 'transfers') {
      return (
        m.type === 'incoming_offer' ||
        m.type === 'offer_accepted' ||
        m.type === 'offer_rejected' ||
        m.type === 'transfer_completed'
      );
    }
    return true;
  });

  const getMessageLighting = (type: string, isRead: boolean): LightingColorName => {
    if (!isRead) return 'amber';
    switch (type) {
      case 'offer_accepted':
      case 'transfer_completed':
        return 'emerald';
      case 'offer_rejected':
        return 'rose';
      case 'incoming_offer':
        return 'solar';
      default:
        return 'azure';
    }
  };

  return (
    <AnimatedLighting color="amber" borderWidth={3} rounded="3xl" speed={4} glowIntensity="high" className="w-full shadow-2xl">
      <div className="relative z-10 p-6 sm:p-8 rounded-[1.6rem] bg-gradient-to-b from-[#141005] via-[#0d0a03] to-[#050401] text-slate-100 border border-amber-500/30 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-amber-500/20">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Manager Private Communications & Alerts</span>
            </div>
            <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-wide text-animated-gold">
              Manager Mailbox
            </h2>
            <p className="text-xs sm:text-sm font-mono text-slate-300 max-w-2xl">
              Confidential inbox for <strong className="text-white">{club.name}</strong>. Receive incoming transfer bids, contract agreement authorizations, and transaction settlements.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="btn-broadcast-secondary text-xs py-2.5 px-4 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchInbox}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh Mailbox"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Unread Alert Banner with Animated Lighting */}
        {unreadCount > 0 && (
          <AnimatedLighting color="amber" borderWidth={2} rounded="2xl" speed={2.5} glowIntensity="high">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#1c1204] border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black animate-pulse shadow-lg shadow-amber-400/30 shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-title text-base sm:text-lg font-black uppercase text-white leading-tight">
                    {unreadCount} Urgent Dispatch{unreadCount > 1 ? 'es' : ''} Awaiting Gaffer Review
                  </h4>
                  <p className="text-xs font-mono text-amber-200/80">
                    Incoming transfer bids, counter-proposals, and contract terms require board authorization.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="btn-broadcast-primary text-xs py-2 px-3.5 shrink-0 whitespace-nowrap cursor-pointer"
              >
                Mark All Read
              </button>
            </div>
          </AnimatedLighting>
        )}

        {/* Filter Pills with Animated Lighting on Active */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          {[
            { id: 'all', label: 'All Dispatches', count: messages.length },
            { id: 'unread', label: 'Unread Only', count: unreadCount, highlight: unreadCount > 0 },
            { id: 'transfers', label: 'Transfers & Offers', count: messages.filter((m) => m.type.includes('transfer') || m.type.includes('offer')).length },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <AnimatedLighting
                key={tab.id}
                color={isActive ? 'solar' : 'amber'}
                active={isActive}
                borderWidth={isActive ? 2 : 1}
                rounded="xl"
                speed={3}
                glowIntensity={isActive ? 'standard' : 'subtle'}
                className="shrink-0"
              >
                <button
                  type="button"
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-title font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'bg-amber-400 text-black font-black shadow-md shadow-amber-400/20'
                      : 'bg-black/50 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isActive
                        ? 'bg-black/30 text-black'
                        : tab.highlight
                        ? 'bg-amber-400 text-black'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              </AnimatedLighting>
            );
          })}
        </div>

        {/* Messages List */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-slate-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <span>Decrypting Mailbox Records...</span>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-16 text-center text-xs font-mono text-slate-400 p-8 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <Mail className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="font-title text-xl font-bold uppercase text-white">Mailbox Empty</div>
            <p>You have no communications under this filter. Transfer bids and contract notices will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredMessages.map((item) => {
              const lightingCol = getMessageLighting(item.type, item.read);

              return (
                <AnimatedLighting
                  key={item.id}
                  color={lightingCol}
                  borderWidth={item.read ? 1.5 : 2.5}
                  rounded="2xl"
                  speed={item.read ? 5 : 2.8}
                  glowIntensity={item.read ? 'subtle' : 'high'}
                  className="transition-transform hover:-translate-y-0.5"
                >
                  <div
                    className={`p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                      item.read
                        ? 'bg-[#080703] opacity-85'
                        : 'bg-[#151004]'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {!item.read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                        )}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-black uppercase ${
                            item.read
                              ? 'bg-white/10 text-slate-400'
                              : 'bg-amber-400 text-black font-black'
                          }`}
                        >
                          {item.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {new Date(item.timestamp).toLocaleDateString()} at{' '}
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Full readable Title */}
                      <h4 className="font-title text-xl font-bold uppercase text-white break-words leading-tight">
                        {item.title}
                      </h4>

                      {/* Full readable Summary */}
                      <p className="text-xs font-mono text-slate-300 leading-relaxed break-words">
                        {item.summary}
                      </p>

                      {item.details && (
                        <div className="text-[11px] font-mono text-amber-300/90 pt-1">
                          {item.details}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                      {!item.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(item.id)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Mark as Read"
                        >
                          <MailOpen className="w-4 h-4" />
                        </button>
                      )}

                      {/* Actionable button if offer or contract */}
                      {item.actionType === 'view_offer' && item.relatedOfferId && (
                        <button
                          type="button"
                          onClick={() => {
                            handleMarkAsRead(item.id);
                            onOpenOffer(item.relatedOfferId!);
                          }}
                          className="btn-broadcast-gold text-xs py-2 px-4 font-title font-black uppercase cursor-pointer"
                        >
                          Review Bid
                        </button>
                      )}

                      {item.actionType === 'negotiate_contract' && item.relatedContractId && (
                        <button
                          type="button"
                          onClick={() => {
                            handleMarkAsRead(item.id);
                            onOpenContract(item.relatedContractId!);
                          }}
                          className="btn-broadcast-primary text-xs py-2 px-4 font-title font-black uppercase cursor-pointer animate-pulse"
                        >
                          Negotiate Terms
                        </button>
                      )}
                    </div>
                  </div>
                </AnimatedLighting>
              );
            })}
          </div>
        )}
      </div>
    </AnimatedLighting>
  );
};
