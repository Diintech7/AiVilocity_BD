import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Megaphone,
  Users,
  CheckCircle,
  Clock,
  Building2,
  GraduationCap,
  Sparkles,
  Search
} from 'lucide-react';
import { toast } from 'react-toastify';
import campaignService from '../services/campaignService';
import { getFileUrl } from '../services/api';
import TrainingPromptModal from '../components/TrainingPromptModal';
import CampaignDetailModal from '../components/CampaignDetailModal';

export const Campaigns = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' or 'my-campaigns'
  const [campaigns, setCampaigns] = useState([]);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Detail & Training Modal States
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState(null);
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);
  const [modalCampaign, setModalCampaign] = useState(null);

  const openTrainingModal = (campaign) => {
    setModalCampaign(campaign);
    setTrainingModalOpen(true);
  };

  const handleStartTraining = (trainingId) => {
    setTrainingModalOpen(false);
    if (trainingId) {
      navigate(`/trainings?trainingId=${trainingId}`, { state: { trainingId } });
    } else {
      navigate('/trainings');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.allSettled([
        campaignService.getCampaigns(),
        campaignService.getMyCampaigns(),
      ]);

      if (allRes.status === 'fulfilled') {
        const val = allRes.value;
        if (Array.isArray(val)) {
          setCampaigns(val);
        } else if (val && Array.isArray(val.data)) {
          setCampaigns(val.data);
        }
      }
      if (myRes.status === 'fulfilled') {
        const myVal = myRes.value;
        if (Array.isArray(myVal)) {
          setMyCampaigns(myVal);
        } else if (myVal && Array.isArray(myVal.data)) {
          setMyCampaigns(myVal.data);
        }
      }
    } catch (error) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (campaign) => {
    const campaignId = campaign._id;
    setRegisteringId(campaignId);
    try {
      const res = await campaignService.registerCampaign(campaignId);
      toast.success(res.message || 'Successfully registered for the campaign!');
      fetchData();
    } catch (error) {
      const errMsg = error.message || '';
      // If registration fails because mandatory training is required, show the modal!
      if (
        errMsg.toLowerCase().includes('training') ||
        (campaign.training && errMsg.toLowerCase().includes('mandatory'))
      ) {
        openTrainingModal(campaign);
      } else {
        toast.error(errMsg || 'Failed to register');
      }
    } finally {
      setRegisteringId(null);
    }
  };

  // Check if current BA is registered
  const isRegistered = (cId) => {
    return myCampaigns.some((mc) => (mc._id === cId || mc.campaignId === cId));
  };

  // Filter campaigns
  const filteredCampaigns = (activeTab === 'explore' ? campaigns : myCampaigns).filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Marketing', 'Sales', 'Product Launch', 'Brand Awareness', 'Social Media'];

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Campaign Opportunities</h1>
          <p className="text-sm text-slate-500">Register in brand campaigns to unlock high-paying field tasks</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'explore' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Explore Active ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('my-campaigns')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'my-campaigns' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Campaigns ({myCampaigns.length})
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns, brands..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-xs">
          <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No campaigns found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'my-campaigns'
              ? 'You have not registered for any campaigns yet. Switch to "Explore Active" to join one!'
              : 'No active campaigns matched your search filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 w-full">
          {filteredCampaigns.map((c) => {
            const registered = isRegistered(c._id);
            const total = c.totalSlots || 0;
            const filled = c.filledSlots || 0;
            const percentFilled = total > 0 ? Math.min(Math.round((filled / total) * 100), 100) : 0;
            const slotsFull = filled >= total;

            const imageUrl = c.image ? getFileUrl(c.image) : '';
            const deadlineDate = c.deadline ? new Date(c.deadline).toLocaleDateString() : 'Open';

            return (
              <div
                key={c._id}
                onClick={() => setSelectedCampaignDetail(c)}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-orange-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Banner Image or Gradient */}
                  <div className="h-36 bg-gradient-to-tr from-orange-400 to-amber-500 relative overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40">
                        <Megaphone size={40} />
                      </div>
                    )}
                    {/* Featured / Category Tag */}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-slate-900/85 text-white text-[10px] font-semibold rounded-md backdrop-blur-xs uppercase tracking-wider">
                      {c.category || 'Campaign'}
                    </span>
                    {c.featured && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-amber-400 text-amber-950 text-[10px] font-bold rounded-md shadow-xs flex items-center gap-1">
                        <Sparkles size={11} /> Featured
                      </span>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                      <Building2 size={13} className="text-slate-400" />
                      <span>{c.company || 'Enterprise Client'}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">{c.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{c.description}</p>

                    {/* Attached Training Badge */}
                    {c.training && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTrainingModal(c);
                        }}
                        className="w-full mt-3 p-2.5 rounded-lg bg-orange-50/80 hover:bg-orange-100/80 border border-orange-200 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer"
                        title="Click to view required training"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-orange-500/15 flex items-center justify-center shrink-0">
                            <GraduationCap size={14} className="text-orange-600" />
                          </div>
                          <div className="text-[11px] text-orange-950 truncate">
                            <span className="font-bold text-orange-900 block leading-tight">Training Required:</span>
                            <span className="text-orange-700 font-medium truncate block">
                              {typeof c.training === 'object' ? c.training.name : 'Certification Mandatory'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-orange-700 bg-white px-2 py-0.5 rounded-md border border-orange-200 shrink-0">
                          Start
                        </span>
                      </button>
                    )}

                    {/* Slots Progress Bar */}
                    <div className="mt-3.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Users size={12} className="text-slate-400" /> Slots Filled
                        </span>
                        <span className="font-bold text-slate-800 text-[11px]">
                          {filled} / {total} ({percentFilled}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                          className={`h-full rounded-full ${
                            slotsFull ? 'bg-rose-500' : percentFilled > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentFilled}%` }}
                        />
                      </div>
                    </div>

                    {/* Deadline & Click Hint */}
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>Deadline: {deadlineDate}</span>
                      </div>
                      <span className="text-orange-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                        Details →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Payout & Register Button */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block leading-none">Reward Pool</span>
                    <span className="text-sm font-bold text-emerald-600 leading-tight">
                      ₹{(c.reward || 0).toLocaleString()}
                    </span>
                  </div>

                  {registered ? (
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                        <CheckCircle size={13} /> Registered
                      </span>
                      <Link
                        to="/tasks"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition"
                      >
                        Tasks
                      </Link>
                    </div>
                  ) : slotsFull ? (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed"
                    >
                      Slots Full
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegister(c);
                      }}
                      disabled={registeringId === c._id}
                      className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg shadow-xs disabled:opacity-50 transition cursor-pointer"
                    >
                      {registeringId === c._id ? 'Registering...' : 'Register'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Training Prompt Modal */}
      <TrainingPromptModal
        isOpen={trainingModalOpen}
        onClose={() => setTrainingModalOpen(false)}
        campaign={modalCampaign}
        onStartTraining={handleStartTraining}
      />

      {/* Campaign Detail Modal */}
      {selectedCampaignDetail && (
        <CampaignDetailModal
          campaign={selectedCampaignDetail}
          isRegistered={isRegistered(selectedCampaignDetail._id)}
          onClose={() => setSelectedCampaignDetail(null)}
          onRegister={(camp) => {
            setSelectedCampaignDetail(null);
            handleRegister(camp);
          }}
          onOpenTraining={(camp) => {
            setSelectedCampaignDetail(null);
            openTrainingModal(camp);
          }}
          isRegistering={registeringId === selectedCampaignDetail._id}
        />
      )}
    </div>
  );
};

export default Campaigns;
