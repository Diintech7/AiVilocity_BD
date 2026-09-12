import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  GraduationCap,
  PlayCircle,
  HelpCircle,
  Award,
  CheckCircle2,
  Clock,
  Download,
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import trainingService from '../services/trainingService';
import TrainingDetailModal from '../components/TrainingDetailModal';
import { getFileUrl } from '../services/api';

export const Trainings = () => {
  const location = useLocation();
  const [trainings, setTrainings] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Completed' | 'In Progress' | 'Not Started'

  // Selected training for Detail Modal
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchTrainingsAndProgress = async () => {
    setLoading(true);
    try {
      const res = await trainingService.getTrainings();
      if (res && res.success && Array.isArray(res.data)) {
        const list = res.data;
        setTrainings(list);

        // Fetch progress for each training in parallel
        const progressResults = await Promise.allSettled(
          list.map((t) => trainingService.getProgress(t._id))
        );

        const newProgressMap = {};
        progressResults.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value?.success && result.value?.data) {
            newProgressMap[list[idx]._id] = result.value.data;
          }
        });
        setProgressMap(newProgressMap);

        // Check if a specific training was requested via query param or navigation state
        const queryParams = new URLSearchParams(location.search);
        const targetId = queryParams.get('trainingId') || location.state?.trainingId;
        if (targetId) {
          const target = list.find((t) => t._id === targetId);
          if (target) {
            setSelectedTraining(target);
            setDetailModalOpen(true);
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load training programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingsAndProgress();
  }, []);

  // React to URL or state change to open requested training
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const targetId = queryParams.get('trainingId') || location.state?.trainingId;
    if (targetId && trainings.length > 0) {
      const found = trainings.find((t) => t._id === targetId);
      if (found) {
        setSelectedTraining(found);
        setDetailModalOpen(true);
      }
    }
  }, [location.search, location.state, trainings]);

  const refreshSingleProgress = async (trainingId) => {
    try {
      const pRes = await trainingService.getProgress(trainingId);
      if (pRes && pRes.success && pRes.data) {
        setProgressMap((prev) => ({
          ...prev,
          [trainingId]: pRes.data,
        }));
      }
    } catch (err) {
      console.error('Failed to refresh progress', err);
    }
  };

  const handleOpenTraining = (training) => {
    setSelectedTraining(training);
    setDetailModalOpen(true);
  };

  const handleDownloadCertificate = async (trainingId, title) => {
    try {
      toast.info('Generating certificate PDF...');
      await trainingService.downloadCertificate(trainingId, title);
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to download certificate');
    }
  };

  // Card gradient themes for aesthetic variety
  const cardGradients = [
    'from-blue-600 via-indigo-600 to-blue-700',
    'from-emerald-600 via-teal-600 to-emerald-700',
    'from-orange-500 via-amber-500 to-orange-600',
    'from-purple-600 via-violet-600 to-purple-700',
    'from-rose-600 via-pink-600 to-rose-700',
  ];

  // Calculate statistics
  const totalCount = trainings.length;
  const completedCount = trainings.filter((t) => progressMap[t._id]?.isCompleted).length;
  const inProgressCount = trainings.filter((t) => {
    const p = progressMap[t._id];
    return p && !p.isCompleted && (p.completedModules?.length > 0);
  }).length;
  const certificatesCount = completedCount;

  // Filtered trainings
  const filteredTrainings = trainings.filter((t) => {
    const matchesSearch =
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const p = progressMap[t._id];
    const isCompleted = Boolean(p?.isCompleted);
    const isInProgress = Boolean(p && !p.isCompleted && p.completedModules?.length > 0);
    const isNotStarted = !isCompleted && !isInProgress;

    if (activeFilter === 'Completed') return matchesSearch && isCompleted;
    if (activeFilter === 'In Progress') return matchesSearch && isInProgress;
    if (activeFilter === 'Not Started') return matchesSearch && isNotStarted;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Trainings & Certifications</h1>
          <p className="text-sm text-slate-500">
            Complete interactive video modules, pass field assessments, and earn verifiable certificates to unlock campaigns.
          </p>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
            <GraduationCap size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Courses</span>
            <span className="text-xl font-black text-slate-900">{totalCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
            <span className="text-xl font-black text-emerald-600">{completedCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">In Progress</span>
            <span className="text-xl font-black text-amber-600">{inProgressCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Certificates</span>
            <span className="text-xl font-black text-purple-600">{certificatesCount}</span>
          </div>
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
            placeholder="Search courses, skills, guidelines..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Completed', 'In Progress', 'Not Started'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === filter
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: All Trainings as Cards */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredTrainings.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-xs">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No training courses found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery
              ? `No trainings match "${searchQuery}".`
              : 'There are currently no training programs in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filteredTrainings.map((t, index) => {
            const p = progressMap[t._id];
            const isCompleted = Boolean(p?.isCompleted);
            const totalMods = t.modules?.length || 0;
            const completedModsCount = p?.completedModules?.length || 0;
            const percent = totalMods > 0 ? Math.round((completedModsCount / totalMods) * 100) : 0;
            const isInProgress = !isCompleted && completedModsCount > 0;

            const totalQuestions = (t.modules || []).reduce(
              (sum, m) => sum + (m.quiz ? m.quiz.length : 0),
              0
            );

            const gradient = cardGradients[index % cardGradients.length];
            const imageUrl = t.image ? getFileUrl(t.image) : '';

            return (
              <div
                key={t._id}
                onClick={() => handleOpenTraining(t)}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-orange-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Card Banner */}
                  <div
                    className={`h-36 bg-gradient-to-tr ${gradient} relative overflow-hidden flex items-center justify-center`}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={t.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
                        <GraduationCap size={48} className="text-white/30 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Modules Badge */}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-slate-900/85 text-white text-[10px] font-bold rounded-md backdrop-blur-xs uppercase tracking-wider">
                      {totalMods} {totalMods === 1 ? 'Module' : 'Modules'}
                    </span>

                    {/* Status Badge */}
                    {isCompleted ? (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-md shadow-xs flex items-center gap-1">
                        <CheckCircle2 size={11} /> Certified
                      </span>
                    ) : isInProgress ? (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-amber-400 text-amber-950 text-[10px] font-bold rounded-md shadow-xs flex items-center gap-1">
                        <Clock size={11} /> In Progress
                      </span>
                    ) : (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/20 text-white text-[10px] font-semibold rounded-md backdrop-blur-xs">
                        Pass: {t.passingScore || 80}%
                      </span>
                    )}

                    {/* Bottom Title on Banner for Aesthetic Contrast */}
                    <div className="absolute bottom-2 left-3 right-3 text-white">
                      <span className="text-[10px] font-semibold text-orange-200 tracking-wider uppercase block">
                        Field Training
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {t.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {t.description || 'Comprehensive video training with interactive quiz assessment.'}
                      </p>
                    </div>

                    {/* Meta Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium flex items-center gap-1">
                        <PlayCircle size={12} className="text-orange-500" />
                        {totalMods} Video {totalMods === 1 ? 'Lesson' : 'Lessons'}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium flex items-center gap-1">
                        <HelpCircle size={12} className="text-orange-500" />
                        {totalQuestions} Quiz Qs
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span className="text-[11px] text-slate-500">Progress</span>
                        <span className="font-bold text-slate-800 text-[11px]">
                          {isCompleted ? '100%' : `${percent}%`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-500' : percent > 0 ? 'bg-amber-500' : 'bg-slate-300'
                          }`}
                          style={{ width: `${isCompleted ? 100 : percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                    {t.isCertificateEnabled !== false ? (
                      <span className="flex items-center gap-1 text-orange-600">
                        <Award size={13} />
                        <span>Certificate</span>
                      </span>
                    ) : (
                      <span>Score: {t.passingScore || 80}%</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadCertificate(t._id, t.name);
                        }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                        title="Download Certificate"
                      >
                        <Download size={12} />
                        <span>Cert</span>
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenTraining(t);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Training Detail Modal */}
      {selectedTraining && (
        <TrainingDetailModal
          training={selectedTraining}
          progress={progressMap[selectedTraining._id]}
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          onProgressUpdate={(trainingId) => {
            refreshSingleProgress(trainingId);
          }}
          onDownloadCertificate={handleDownloadCertificate}
        />
      )}
    </div>
  );
};

export default Trainings;
