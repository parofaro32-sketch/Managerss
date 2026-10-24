import React, { useState, useEffect } from 'react';
import { 
  ClubItem, 
  ServerItem, 
  User, 
  TransferListingItem, 
  TransferOfferItem, 
  ContractProposalItem, 
  Player 
} from '../types.ts';
import { api } from '../api.ts';
import { 
  TrendingUp, 
  Search, 
  Coins, 
  Filter, 
  PlusCircle, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Clock, 
  X, 
  Briefcase, 
  Send, 
  Check, 
  RefreshCw, 
  Building2, 
  Users, 
  ArrowRight,
  Activity,
  Zap,
  Tag
} from 'lucide-react';
import { AnimatedLighting, getRandomLightingColor, LightingColorName } from './AnimatedLighting.tsx';
import { ClubLogo } from './ClubLogo.tsx';
import { ListPlayerForSaleModal } from './ListPlayerForSaleModal.tsx';
import { OfferManagementModal } from './OfferManagementModal.tsx';
import { ContractNegotiationModal } from './ContractNegotiationModal.tsx';
import { PlayerCardModal } from './PlayerCardModal.tsx';

interface TransferMarketTabProps {
  user: User;
  club: ClubItem;
  server: ServerItem;
  onUpdateClub: (updatedClub: ClubItem) => void;
  onOpenContractFromInbox?: string | null;
  onOpenOfferFromInbox?: string | null;
}

export const TransferMarketTab: React.FC<TransferMarketTabProps> = ({
  user,
  club,
  server,
  onUpdateClub,
  onOpenContractFromInbox,
  onOpenOfferFromInbox,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'browse' | 'my-listings' | 'incoming' | 'outgoing'>('browse');

  // Listings state
  const [listings, setListings] = useState<TransferListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('All');
  const [minOvr, setMinOvr] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000000);

  // Offers state
  const [incomingOffers, setIncomingOffers] = useState<TransferOfferItem[]>([]);
  const [outgoingOffers, setOutgoingOffers] = useState<TransferOfferItem[]>([]);
  const [myListings, setMyListings] = useState<TransferListingItem[]>([]);

  // Modals state
  const [listModalOpen, setListModalOpen] = useState(false);
  const [inspectPlayer, setInspectPlayer] = useState<Player | null>(null);

  // Make Offer Modal state
  const [biddingListing, setBiddingListing] = useState<TransferListingItem | null>(null);
  const [offerAmount, setOfferAmount] = useState<number>(10000000);
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  // Review Offer Modal state (seller)
  const [reviewOffer, setReviewOffer] = useState<TransferOfferItem | null>(null);

  // Contract Negotiation Modal state (buyer)
  const [negotiatingContract, setNegotiatingContract] = useState<ContractProposalItem | null>(null);
  const [contractLoading, setContractLoading] = useState(false);

  // Notification / banner
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // 1. Fetch Listings strictly isolated for this server
  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.getTransferListings(server.id, {
        position: positionFilter !== 'All' ? positionFilter : undefined,
        minOvr: minOvr > 0 ? minOvr : undefined,
        maxPrice: maxPrice < 100000000 ? maxPrice : undefined,
        search: search.trim() ? search.trim() : undefined,
      });
      if (res && res.listings) {
        setListings(res.listings);
      }
    } catch (err: any) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch User's offers and listings
  const fetchOffersAndMyListings = async () => {
    try {
      const res = await api.getUserOffers();
      if (res) {
        setIncomingOffers(res.incoming || []);
        setOutgoingOffers(res.outgoing || []);
        if (res.myListings) setMyListings(res.myListings);
      }
    } catch (err: any) {
      console.error('Error fetching offers:', err);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [server.id, positionFilter, minOvr, maxPrice]);

  useEffect(() => {
    fetchOffersAndMyListings();
  }, [user.id]);

  // Handle direct navigation from inbox
  useEffect(() => {
    if (onOpenContractFromInbox) {
      handleOpenContractById(onOpenContractFromInbox);
    }
    if (onOpenOfferFromInbox) {
      const target = incomingOffers.find((o) => o.id === onOpenOfferFromInbox);
      if (target) {
        setReviewOffer(target);
      }
    }
  }, [onOpenContractFromInbox, onOpenOfferFromInbox, incomingOffers]);

  const handleOpenContractById = async (contractId: string) => {
    setContractLoading(true);
    try {
      const res = await api.getContractProposal(contractId);
      if (res && res.contract) {
        setNegotiatingContract(res.contract);
      }
    } catch (err: any) {
      setFeedbackError(err.message || 'Could not load contract negotiation.');
      setTimeout(() => setFeedbackError(null), 4000);
    } finally {
      setContractLoading(false);
    }
  };

  // Handle Initiating Make Offer
  const handleOpenMakeOffer = (listing: TransferListingItem) => {
    setBiddingListing(listing);
    setOfferAmount(listing.askingPrice);
    setOfferError(null);
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingListing) return;

    if (offerAmount <= 0) {
      setOfferError('Offer amount must be greater than €0.');
      return;
    }

    if (club.transferBudget < offerAmount) {
      setOfferError(
        `Insufficient funds: You have ${formatCurrency(club.transferBudget)}, but offer is ${formatCurrency(offerAmount)}.`
      );
      return;
    }

    setOfferSubmitting(true);
    setOfferError(null);

    try {
      const res = await api.makeTransferOffer(biddingListing.id, offerAmount);
      setFeedbackSuccess(res.message);
      setTimeout(() => setFeedbackSuccess(null), 5000);
      setBiddingListing(null);
      fetchListings();
      fetchOffersAndMyListings();

      // If board auto-accepted, open contract negotiation immediately!
      if (res.offer && res.offer.status === 'Accepted' && res.offer.contractId) {
        handleOpenContractById(res.offer.contractId);
      }
    } catch (err: any) {
      setOfferError(err.message || 'Failed to submit transfer offer.');
    } finally {
      setOfferSubmitting(false);
    }
  };

  // Handle Withdraw Listing
  const handleWithdrawListing = async (listingId: string) => {
    try {
      const res = await api.withdrawTransferListing(listingId);
      setFeedbackSuccess(res.message);
      setTimeout(() => setFeedbackSuccess(null), 4000);
      fetchListings();
      fetchOffersAndMyListings();
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to withdraw listing.');
      setTimeout(() => setFeedbackError(null), 4000);
    }
  };

  const pendingIncomingCount = incomingOffers.filter((o) => o.status === 'Pending').length;
  const acceptedOutgoingCount = outgoingOffers.filter((o) => o.status === 'Accepted').length;

  return (
    <AnimatedLighting color="lime" borderWidth={3} rounded="3xl" speed={4} glowIntensity="high" className="w-full shadow-2xl">
      <div className="relative z-10 p-6 sm:p-8 rounded-[1.6rem] bg-gradient-to-b from-[#07130a] via-[#040c06] to-[#020704] text-slate-100 border border-lime-500/30 space-y-6">
        
        {/* Top Header Banner */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-lime-500/20">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-lime-400 bg-lime-950/80 px-3 py-1 rounded-full border border-lime-500/40">
              <TrendingUp className="w-4 h-4 text-lime-400 animate-pulse" />
              <span>Server {server.code} Pro Scouting & Trading Protocol</span>
            </div>
            <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-wide text-animated-silver">
              Transfer Market
            </h2>
            <p className="text-xs sm:text-sm font-mono text-slate-300 max-w-2xl">
              Strictly server-isolated transfer window for <strong className="text-white">{server.name}</strong>. List squad players, submit bids, negotiate contracts, and execute verified atomic transactions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Club Warchest Display */}
            <AnimatedLighting color="emerald" borderWidth={2} rounded="2xl" speed={2.8}>
              <div className="p-4 rounded-2xl bg-black/85 text-right min-w-[210px] font-mono">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-end gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Available Warchest</span>
                </div>
                <div className="font-title text-3xl font-black text-emerald-400 tabular-nums">
                  {formatCurrency(club.transferBudget)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {server.code} Liquid Treasury
                </div>
              </div>
            </AnimatedLighting>

            {/* List Player For Sale Button */}
            <button
              type="button"
              onClick={() => setListModalOpen(true)}
              className="btn-broadcast-gold text-xs py-3.5 px-5 font-title font-black uppercase flex items-center gap-2 cursor-pointer shadow-xl"
            >
              <PlusCircle className="w-4 h-4 text-black stroke-[2.5]" />
              <span>List Player for Sale</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Notifications */}
        {feedbackSuccess && (
          <AnimatedLighting color="emerald" borderWidth={1.8} rounded="xl">
            <div className="p-4 rounded-xl bg-emerald-950/90 text-emerald-200 text-xs font-mono flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedbackSuccess}</span>
            </div>
          </AnimatedLighting>
        )}

        {feedbackError && (
          <AnimatedLighting color="rose" borderWidth={1.8} rounded="xl">
            <div className="p-4 rounded-xl bg-rose-950/90 text-rose-200 text-xs font-mono flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{feedbackError}</span>
            </div>
          </AnimatedLighting>
        )}

        {/* Sub-Tabs Navigation with Animated Lighting */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          {[
            { id: 'browse', label: 'Server Market', count: listings.length },
            { id: 'my-listings', label: "My Club's Listings", count: myListings.length },
            { id: 'incoming', label: 'Incoming Offers (Seller)', count: pendingIncomingCount, highlight: pendingIncomingCount > 0 },
            { id: 'outgoing', label: 'My Outgoing Bids', count: outgoingOffers.length, highlight: acceptedOutgoingCount > 0 },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <AnimatedLighting
                key={tab.id}
                color={isActive ? 'lime' : 'emerald'}
                active={isActive}
                borderWidth={isActive ? 2 : 1}
                rounded="xl"
                speed={3}
                glowIntensity={isActive ? 'standard' : 'subtle'}
                className="shrink-0"
              >
                <button
                  type="button"
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-title font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'bg-lime-500 text-black shadow-lg shadow-lime-500/20'
                      : 'bg-black/50 text-slate-400 hover:text-white hover:bg-black/80 border border-white/10'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold ${
                      isActive
                        ? 'bg-black/30 text-black'
                        : tab.highlight
                        ? 'bg-amber-400 text-black animate-pulse'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              </AnimatedLighting>
            );
          })}

          <button
            type="button"
            onClick={() => {
              fetchListings();
              fetchOffersAndMyListings();
            }}
            className="ml-auto p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh Transfer Market"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* =========================================================================
            VIEW 1: BROWSE ALL MARKET LISTINGS (SERVER-ISOLATED)
            ========================================================================= */}
        {activeSubTab === 'browse' && (
          <div className="space-y-6">
            
            {/* Filter Bar with Animated Lighting */}
            <AnimatedLighting color="lime" borderWidth={1.8} rounded="2xl" speed={4.2} glowIntensity="subtle" className="w-full">
              <div className="stadium-panel rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Search Box */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchListings()}
                    placeholder="Search player, club, nation..."
                    className="stadium-input w-full pl-9 text-xs"
                  />
                </div>

                {/* Position Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                  {['All', 'Goalkeeper', 'Defender', 'Midfielder', 'Attacker'].map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setPositionFilter(pos)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-title font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                        positionFilter === pos
                          ? 'bg-lime-400 text-black font-black'
                          : 'bg-black/50 text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>

                {/* Min OVR Filter */}
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0">
                  <span>Min OVR:</span>
                  <select
                    value={minOvr}
                    onChange={(e) => setMinOvr(Number(e.target.value))}
                    className="bg-black/80 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                  >
                    <option value={0}>Any OVR</option>
                    <option value={75}>75+ OVR</option>
                    <option value={80}>80+ OVR</option>
                    <option value={85}>85+ Elite</option>
                    <option value={90}>90+ Worldclass</option>
                  </select>
                </div>
              </div>
            </AnimatedLighting>

            {/* Listings Grid */}
            {loading ? (
              <div className="py-16 text-center text-xs font-mono text-slate-400 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-lime-400" />
                <span>Scanning {server.name} Transfer Market...</span>
              </div>
            ) : listings.length === 0 ? (
              <div className="py-16 text-center text-xs font-mono text-slate-400 p-8 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <TrendingUp className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="font-title text-xl font-bold uppercase text-white">No Active Listings Found</div>
                <p>No players currently match your filters on {server.name}. Try adjusting search filters or list one of your own players.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((item, idx) => {
                  const p = item.player;
                  const ovr = Math.round(
                    (p.pace + p.shooting + p.passing + p.dribbling + p.defending + p.physical) / 6
                  );
                  const isMyClub = item.sellerUserId === user.id || item.sellerClubId === club.id;
                  const isUnderOffer = item.status === 'UnderOffer';

                  return (
                    <AnimatedLighting
                      key={item.id}
                      color={isMyClub ? 'amber' : isUnderOffer ? 'violet' : idx % 2 === 0 ? 'lime' : 'cyan'}
                      borderWidth={2}
                      rounded="2xl"
                      speed={3.6}
                      className="transition-transform hover:-translate-y-1"
                    >
                      <div className="stadium-card rounded-[1.2rem] p-5 flex flex-col justify-between h-full bg-[#071309] space-y-4">
                        
                        <div>
                          {/* Top Row: Seller Club Logo + Player OVR & Position */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5">
                              {/* Seller Club SVG Logo */}
                              <div className="w-10 h-10 rounded-xl bg-black/85 border border-white/15 flex items-center justify-center p-1 shadow">
                                {item.sellerClubLogo ? (
                                  <div
                                    className="w-full h-full flex items-center justify-center"
                                    dangerouslySetInnerHTML={{ __html: item.sellerClubLogo }}
                                  />
                                ) : (
                                  <Building2 className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <span className="font-mono text-[10px] text-slate-400 uppercase font-bold block">
                                  {item.sellerClubName}
                                </span>
                                <span className="text-[11px] font-mono text-emerald-400">
                                  @{item.sellerUsername}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2.5 py-0.5 rounded-md bg-lime-400/20 text-lime-300 font-mono font-black border border-lime-400/40">
                                {p.position}
                              </span>
                              <span className="font-title text-2xl font-black text-white">
                                {ovr} <span className="text-xs text-lime-400 font-mono">OVR</span>
                              </span>
                            </div>
                          </div>

                          {/* Full Player Name without clipping */}
                          <h4 className="font-title text-2xl font-black uppercase text-white break-words leading-tight">
                            {p.name}
                          </h4>

                          <div className="text-xs font-mono text-slate-400 mt-1">
                            {p.nationality} · {p.age} Yrs · {p.preferredFoot} Foot · {p.rank}
                          </div>

                          {/* Attributes Strip */}
                          <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-white/10 text-xs font-mono text-slate-300">
                            <div>PAC: <strong className="text-cyan-400">{p.pace}</strong></div>
                            <div>SHO: <strong className="text-amber-400">{p.shooting}</strong></div>
                            <div>PAS: <strong className="text-emerald-400">{p.passing}</strong></div>
                            <div>DRI: <strong className="text-purple-400">{p.dribbling}</strong></div>
                            <div>DEF: <strong className="text-blue-400">{p.defending}</strong></div>
                            <div>PHY: <strong className="text-rose-400">{p.physical}</strong></div>
                          </div>

                          {/* Market Valuation & Asking Price Box */}
                          <div className="mt-3.5 p-3 rounded-xl bg-black/85 border border-white/10 space-y-1 font-mono text-xs">
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Market Valuation:</span>
                              <span className="text-amber-300 font-bold">{formatCurrency(item.marketValuation)}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-white/10">
                              <span className="text-slate-300 font-bold uppercase">Asking Price:</span>
                              <span className="text-white font-title text-lg font-black text-lime-300">
                                {formatCurrency(item.askingPrice)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectPlayer(p)}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Inspect Player Attributes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isMyClub ? (
                            <button
                              type="button"
                              onClick={() => handleWithdrawListing(item.id)}
                              disabled={isUnderOffer}
                              className="btn-broadcast-secondary w-full text-xs py-2.5 cursor-pointer disabled:opacity-50"
                            >
                              {isUnderOffer ? 'Locked Under Negotiation' : 'Withdraw My Listing'}
                            </button>
                          ) : isUnderOffer ? (
                            <div className="w-full text-center py-2 px-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
                              Under Contract Negotiation
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenMakeOffer(item)}
                              className="btn-broadcast-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Coins className="w-4 h-4 text-black" />
                              <span>Make Transfer Offer</span>
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
        )}

        {/* =========================================================================
            VIEW 2: MY CLUB'S ACTIVE LISTINGS
            ========================================================================= */}
        {activeSubTab === 'my-listings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-title text-2xl font-black uppercase text-white">
                  Players Listed by {club.name}
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Manage active sale listings on server {server.code}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setListModalOpen(true)}
                className="btn-broadcast-gold text-xs py-2.5 px-4 font-title font-black uppercase flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-black stroke-[2.5]" />
                <span>List New Player</span>
              </button>
            </div>

            {myListings.length === 0 ? (
              <div className="py-16 text-center text-xs font-mono text-slate-400 p-8 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <Tag className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="font-title text-xl font-bold uppercase text-white">No Squad Players Currently Listed</div>
                <p>Click "List Player for Sale" to make senior players available to rival managers on {server.code}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myListings.map((item) => (
                  <AnimatedLighting key={item.id} color="amber" borderWidth={2} rounded="2xl" speed={3.5}>
                    <div className="stadium-card rounded-[1.2rem] p-5 flex flex-col justify-between h-full bg-[#120f05] space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono font-bold">
                            {item.player.position}
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-black text-slate-300">
                            Status: <strong className="text-amber-400">{item.status}</strong>
                          </span>
                        </div>

                        <h4 className="font-title text-2xl font-black uppercase text-white break-words leading-tight">
                          {item.player.name}
                        </h4>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">
                          Valuation: {formatCurrency(item.marketValuation)}
                        </div>

                        <div className="mt-3 p-3 rounded-xl bg-black/70 border border-amber-500/30 text-xs font-mono flex items-center justify-between">
                          <span className="text-slate-400 uppercase">Asking Price:</span>
                          <span className="text-amber-300 font-title text-xl font-black">
                            {formatCurrency(item.askingPrice)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleWithdrawListing(item.id)}
                        disabled={item.status === 'UnderOffer'}
                        className="btn-broadcast-secondary w-full text-xs py-2 cursor-pointer disabled:opacity-50"
                      >
                        {item.status === 'UnderOffer' ? 'Locked Under Negotiation' : 'Withdraw from Market'}
                      </button>
                    </div>
                  </AnimatedLighting>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW 3: INCOMING OFFERS (SELLER OFFER MANAGEMENT)
            ========================================================================= */}
        {activeSubTab === 'incoming' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-title text-2xl font-black uppercase text-white">
                Incoming Transfer Offers
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Official bids submitted by other clubs for your squad players on server {server.code}
              </p>
            </div>

            {incomingOffers.length === 0 ? (
              <div className="py-16 text-center text-xs font-mono text-slate-400 p-8 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <Coins className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="font-title text-xl font-bold uppercase text-white">No Incoming Offers Received</div>
                <p>When another club submits an offer for your listed players, it will appear here immediately.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomingOffers.map((off) => (
                  <AnimatedLighting
                    key={off.id}
                    color={off.status === 'Accepted' ? 'emerald' : off.status === 'Rejected' ? 'rose' : 'amber'}
                    borderWidth={1.8}
                    rounded="2xl"
                    speed={3.5}
                  >
                    <div className="p-4 sm:p-5 rounded-2xl bg-black/85 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-black uppercase ${
                              off.status === 'Accepted'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : off.status === 'Rejected'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {off.status}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {new Date(off.createdAt).toLocaleDateString()} at {new Date(off.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="font-title text-xl font-black uppercase text-white break-words leading-tight">
                          {off.buyerClubName} (@{off.buyerUsername}) bid on {off.playerName}
                        </div>

                        <div className="text-xs font-mono text-slate-400">
                          Player: <strong className="text-white">{off.playerName}</strong> ({off.playerPosition} · OVR {off.playerOvr})
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right font-mono">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Bid Amount:</span>
                          <span className="font-title text-2xl font-black text-emerald-400">
                            {formatCurrency(off.offerAmount)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setReviewOffer(off)}
                          className="btn-broadcast-primary text-xs py-2.5 px-4 cursor-pointer"
                        >
                          Review Bid
                        </button>
                      </div>
                    </div>
                  </AnimatedLighting>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW 4: OUTGOING BIDS (BUYER CONTRACT STATUS)
            ========================================================================= */}
        {activeSubTab === 'outgoing' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-title text-2xl font-black uppercase text-white">
                My Submitted Bids
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Track status of your transfer proposals across server {server.code}
              </p>
            </div>

            {outgoingOffers.length === 0 ? (
              <div className="py-16 text-center text-xs font-mono text-slate-400 p-8 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <Send className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="font-title text-xl font-bold uppercase text-white">No Outgoing Bids Submitted</div>
                <p>Browse the Transfer Market and submit bids to recruit top talent for {club.name}.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {outgoingOffers.map((off) => (
                  <AnimatedLighting
                    key={off.id}
                    color={off.status === 'Accepted' ? 'emerald' : off.status === 'Rejected' ? 'rose' : 'cyan'}
                    borderWidth={1.8}
                    rounded="2xl"
                    speed={3.5}
                  >
                    <div className="p-4 sm:p-5 rounded-2xl bg-black/85 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-black uppercase ${
                              off.status === 'Accepted'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                                : off.status === 'Rejected'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            }`}
                          >
                            {off.status}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            Sent {new Date(off.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="font-title text-xl font-black uppercase text-white break-words leading-tight">
                          Offer for {off.playerName} ({off.sellerClubName})
                        </div>

                        <div className="text-xs font-mono text-slate-400">
                          {off.playerPosition} · OVR {off.playerOvr} · Seller: @{off.sellerClubName}
                        </div>

                        {off.rejectionReason && (
                          <div className="text-xs font-mono text-rose-300 mt-1">
                            Rejection Note: {off.rejectionReason}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right font-mono">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Your Offer:</span>
                          <span className="font-title text-2xl font-black text-amber-300">
                            {formatCurrency(off.offerAmount)}
                          </span>
                        </div>

                        {off.status === 'Accepted' && off.contractId && (
                          <button
                            type="button"
                            onClick={() => handleOpenContractById(off.contractId!)}
                            className="btn-broadcast-primary text-xs py-2.5 px-4 cursor-pointer animate-pulse"
                          >
                            Negotiate Contract
                          </button>
                        )}
                      </div>
                    </div>
                  </AnimatedLighting>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MAKE OFFER MODAL */}
        {biddingListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-2xl overflow-y-auto">
            <div className="relative w-full max-w-lg my-auto animate-in fade-in zoom-in-95 duration-200">
              <AnimatedLighting color="lime" borderWidth={2.5} rounded="3xl" speed={3} glowIntensity="high">
                <div className="p-6 sm:p-7 rounded-[1.6rem] bg-gradient-to-b from-[#0e1a10] via-[#08120a] to-[#040905] text-slate-100 shadow-2xl space-y-6">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center text-lime-400">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-title text-2xl font-black uppercase text-white tracking-wide text-animated-silver">
                          Submit Transfer Offer
                        </h3>
                        <p className="text-xs font-mono text-slate-400">
                          {biddingListing.sellerClubName} · Server {server.code}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBiddingListing(null)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {offerError && (
                    <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{offerError}</span>
                    </div>
                  )}

                  {/* Target Player Card */}
                  <div className="p-4 rounded-2xl bg-black/80 border border-white/10 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-title text-2xl font-black uppercase text-white break-words leading-tight">
                        {biddingListing.player.name}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-lime-400/20 text-lime-300 font-bold border border-lime-400/30">
                        {biddingListing.player.position}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Seller Asking Price:</span>
                      <span className="text-white font-bold">{formatCurrency(biddingListing.askingPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Market Valuation:</span>
                      <span className="text-amber-300 font-bold">{formatCurrency(biddingListing.marketValuation)}</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitOffer} className="space-y-5">
                    {/* Offer Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <label className="uppercase text-slate-300 font-bold tracking-wider">
                          Your Transfer Bid (€)
                        </label>
                        <span className="text-emerald-400">
                          Available: {formatCurrency(club.transferBudget)}
                        </span>
                      </div>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-emerald-400 font-bold text-base">
                          €
                        </span>
                        <input
                          type="number"
                          min={500000}
                          step={100000}
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(Number(e.target.value))}
                          className="stadium-input w-full pl-9 font-mono text-base font-bold text-emerald-300"
                        />
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => setOfferAmount(biddingListing.askingPrice)}
                          className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 text-lime-300 cursor-pointer"
                        >
                          Match Asking Price ({formatCurrency(biddingListing.askingPrice)})
                        </button>
                        <button
                          type="button"
                          onClick={() => setOfferAmount(biddingListing.marketValuation)}
                          className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 text-amber-300 cursor-pointer"
                        >
                          Match Valuation ({formatCurrency(biddingListing.marketValuation)})
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-slate-400">
                      The bid will be submitted directly to {biddingListing.sellerClubName}. Upon seller acceptance, personal contract negotiation will unlock.
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setBiddingListing(null)}
                        disabled={offerSubmitting}
                        className="btn-broadcast-secondary text-xs py-2.5 px-4 cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={offerSubmitting}
                        className="btn-broadcast-primary text-xs py-2.5 px-6 font-title font-black uppercase cursor-pointer disabled:opacity-50"
                      >
                        {offerSubmitting ? 'Submitting Bid...' : `Submit Bid (${formatCurrency(offerAmount)})`}
                      </button>
                    </div>
                  </form>
                </div>
              </AnimatedLighting>
            </div>
          </div>
        )}

        {/* MODAL 1: LIST SQUAD PLAYER FOR SALE */}
        <ListPlayerForSaleModal
          club={club}
          isOpen={listModalOpen}
          onClose={() => setListModalOpen(false)}
          onSuccess={(msg) => {
            setFeedbackSuccess(msg);
            setTimeout(() => setFeedbackSuccess(null), 4000);
            fetchListings();
            fetchOffersAndMyListings();
          }}
        />

        {/* MODAL 2: SELLER OFFER MANAGEMENT (REVIEW BID) */}
        <OfferManagementModal
          offer={reviewOffer}
          isOpen={Boolean(reviewOffer)}
          onClose={() => setReviewOffer(null)}
          onOfferResolved={(updated, msg) => {
            setFeedbackSuccess(msg);
            setTimeout(() => setFeedbackSuccess(null), 4000);
            fetchListings();
            fetchOffersAndMyListings();
          }}
        />

        {/* MODAL 3: BUYER CONTRACT NEGOTIATION */}
        <ContractNegotiationModal
          contract={negotiatingContract}
          buyerClub={club}
          isOpen={Boolean(negotiatingContract)}
          onClose={() => setNegotiatingContract(null)}
          onTransferCompleted={(res) => {
            setFeedbackSuccess(res.message);
            setTimeout(() => setFeedbackSuccess(null), 5000);
            onUpdateClub(res.buyerClub);
            fetchListings();
            fetchOffersAndMyListings();
          }}
        />

        {/* MODAL 4: PLAYER CARD INSPECTION */}
        {inspectPlayer && (
          <PlayerCardModal
            player={inspectPlayer}
            onClose={() => setInspectPlayer(null)}
          />
        )}
      </div>
    </AnimatedLighting>
  );
};
