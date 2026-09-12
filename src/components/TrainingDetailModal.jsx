import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  PlayCircle,
  BookOpen,
  HelpCircle,
  Award,
  CheckCircle2,
  Download,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Video,
  FileText,
  Clock,
  ShieldCheck,
  Check,
  Eye,
  Layers
} from 'lucide-react';
import { getFileUrl } from '../services/api';
import QuizModal from './QuizModal';

export const TrainingDetailModal = ({
  training,
  progress,
  isOpen,
  onClose,
  onProgressUpdate,
  onDownloadCertificate,
}) => {
  if (!isOpen || !training) return null;

  // Selected module index to take the quiz
  const [selectedQuizModuleIdx, setSelectedQuizModuleIdx] = useState(null);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [activeVideoPlayerIdx, setActiveVideoPlayerIdx] = useState(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Accordion state: exactly one module open at a time
  const [expandedModuleIdx, setExpandedModuleIdx] = useState(0);

  const toggleModule = (idx) => {
    setExpandedModuleIdx((prev) => (prev === idx ? null : idx));
  };

  const modules = training.modules || [];
  const completedModules = progress?.completedModules || [];
  const quizScores = progress?.quizScores || {};
  const isTrainingCompleted = Boolean(progress?.isCompleted);

  const passingScore = training.passingScore || 80;
  const trainingImage = training.image ? getFileUrl(training.image) : '';
  const certificateTemplateUrl = training.certificateTemplate
    ? getFileUrl(training.certificateTemplate)
    : '';

  const totalQuestions = (modules || []).reduce(
    (sum, m) => sum + (m.quiz ? m.quiz.length : 0),
    0
  );
  const totalFaqs = (modules || []).reduce(
    (sum, m) => sum + (m.qna ? m.qna.length : 0),
    0
  );

  // Helper to extract YouTube video ID if URL is from YouTube
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const handleStartQuiz = (moduleIdx) => {
    setSelectedQuizModuleIdx(moduleIdx);
    setQuizModalOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-2 sm:p-4 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-2xl border border-slate-200 max-w-6xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
          
          {/* Top Bar with Title and Close Button */}
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                <GraduationCap size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                    Training Course Overview
                  </span>
                  {isTrainingCompleted && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <CheckCircle2 size={11} /> Certified
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white truncate">{training.name}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isTrainingCompleted && (
                <button
                  type="button"
                  onClick={() => onDownloadCertificate && onDownloadCertificate(training._id, training.name)}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download size={13} />
                  <span className="hidden sm:inline">Download Certificate</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Main Body: 2-Column Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            
            {/* ============================================================ */}
            {/* LEFT COLUMN: Training Info, Image, Description, Certificate */}
            {/* ============================================================ */}
            <div className="lg:col-span-5 p-5 sm:p-6 overflow-y-auto max-h-[40vh] lg:max-h-[calc(94vh-60px)] space-y-5 bg-slate-50/50">
              
              {/* Training Main Poster Image */}
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-900 aspect-video relative group">
                {trainingImage ? (
                  <img
                    src={trainingImage}
                    alt={training.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 flex flex-col items-center justify-center text-white/40">
                    <GraduationCap size={48} className="text-white/30 mb-2" />
                    <span className="text-xs text-slate-400 font-semibold">Field Training Certification</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-2.5 left-3 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                  {modules.length} {modules.length === 1 ? 'Module' : 'Modules'}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block mb-1">
                  About Course
                </span>
                <h2 className="text-lg font-black text-slate-900 leading-snug">
                  {training.name}
                </h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80">
                  {training.description || 'Comprehensive training curriculum designed to prepare Brand Ambassadors for retail execution, customer engagement, and compliance verification.'}
                </p>
              </div>

              {/* Key Highlights / Badges */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Passing Score</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">
                    {passingScore}%
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Assessments</span>
                  <span className="text-base font-black text-orange-600 mt-0.5 block">
                    {totalQuestions} Questions
                  </span>
                </div>
              </div>

              {/* Overall Progress Tracker */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Course Completion</span>
                  <span className={isTrainingCompleted ? 'text-emerald-600' : 'text-orange-600'}>
                    {completedModules.length} of {modules.length} Modules ({modules.length > 0 ? Math.round((completedModules.length / modules.length) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isTrainingCompleted ? 'bg-emerald-500' : 'bg-orange-500'
                    }`}
                    style={{
                      width: `${modules.length > 0 ? (completedModules.length / modules.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* ============================================================ */}
              {/* CERTIFICATE & TEMPLATE SECTION */}
              {/* ============================================================ */}
              {training.isCertificateEnabled !== false && (
                <div className="p-4 bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-xl border border-amber-200/90 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Award size={14} className="text-orange-600" />
                      Official Certificate
                    </span>
                    {isTrainingCompleted ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                        <CheckCircle2 size={11} /> Ready
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded-md">
                        Pass {passingScore}% to Earn
                      </span>
                    )}
                  </div>

                  {/* Certificate Template Preview */}
                  {certificateTemplateUrl ? (
                    <div className="space-y-1.5">
                      <div className="relative rounded-lg overflow-hidden border border-amber-300/80 shadow-xs group bg-white">
                        <img
                          src={certificateTemplateUrl}
                          alt="Certificate Template"
                          className="w-full h-28 sm:h-32 object-contain bg-slate-100 p-1 group-hover:scale-102 transition-transform cursor-pointer"
                          onClick={() => setTemplateModalOpen(true)}
                        />
                        <button
                          type="button"
                          onClick={() => setTemplateModalOpen(true)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 cursor-pointer"
                        >
                          <Eye size={14} />
                          <span>Preview Certificate Template</span>
                        </button>
                      </div>
                      <span className="text-[10px] text-amber-800 font-medium block text-center">
                        Verified digital certificate generated upon course completion
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-white/70 rounded-lg border border-amber-200/60 text-center text-xs text-amber-900">
                      Standard verified completion certificate awarded upon passing all quizzes.
                    </div>
                  )}

                  {/* Certificate Download Action */}
                  {isTrainingCompleted ? (
                    <button
                      type="button"
                      onClick={() => onDownloadCertificate && onDownloadCertificate(training._id, training.name)}
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download Your Certificate (PDF)</span>
                    </button>
                  ) : (
                    <div className="text-[11px] text-amber-800/80 text-center font-medium">
                      Complete all module quizzes to download your certificate
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* ============================================================ */}
            {/* RIGHT COLUMN: Scrollable Modules (Video, Description, FAQs, Quiz) */}
            {/* ============================================================ */}
            <div className="lg:col-span-7 p-5 sm:p-6 overflow-y-auto max-h-[60vh] lg:max-h-[calc(94vh-60px)] space-y-6 bg-white">
              
              {/* Right Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Layers size={18} className="text-orange-500" />
                    <span>Course Modules & Curriculum</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Follow all modules step-by-step: Watch video, review FAQs, and take assessment quizzes.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg shrink-0">
                  {modules.length} Modules
                </span>
              </div>

              {/* Modules List: Rendered one after another ("sab ek ke baad ek") */}
              {modules.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No modules found in this training.
                </div>
              ) : (
                <div className="space-y-8">
                  {modules.map((m, mIdx) => {
                    const isPassed = completedModules.includes(mIdx);
                    const score = quizScores[String(mIdx)];
                    const youtubeEmbed = getYouTubeEmbedUrl(m.videoUrl);
                    const isDirectVideo =
                      m.videoUrl &&
                      (m.videoUrl.endsWith('.mp4') ||
                        m.videoUrl.endsWith('.webm') ||
                        m.videoUrl.startsWith('uploads') ||
                        m.videoUrl.startsWith('/uploads') ||
                        m.videoUrl.includes('/uploads/'));

                    const questions = m.quiz || [];
                    const faqs = m.qna || [];
                    const isExpanded = expandedModuleIdx === mIdx;

                    return (
                      <div
                        key={mIdx}
                        className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                          isExpanded
                            ? 'border-orange-500 shadow-md ring-2 ring-orange-500/15'
                            : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        {/* Module Top Bar / Clickable Accordion Header */}
                        <button
                          type="button"
                          onClick={() => toggleModule(mIdx)}
                          className="w-full text-left px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase tracking-wider shrink-0 transition-colors ${
                                isExpanded ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-300'
                              }`}
                            >
                              Module {mIdx + 1}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-white truncate">
                                {m.moduleName || `Lesson ${mIdx + 1}`}
                              </h4>
                              {!isExpanded && (
                                <span className="text-[11px] text-slate-400 block sm:hidden">
                                  {questions.length} Quiz Qs • {faqs.length} FAQs
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 ml-3">
                            {!isExpanded && (
                              <span className="text-[11px] text-slate-400 hidden sm:inline">
                                {questions.length} Quiz Qs
                              </span>
                            )}

                            <div>
                              {isPassed ? (
                                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-lg flex items-center gap-1">
                                  <CheckCircle2 size={13} /> Passed {score ? `(${score}%)` : ''}
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg flex items-center gap-1">
                                  <Clock size={12} /> Pending Quiz
                                </span>
                              )}
                            </div>

                            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-slate-300">
                              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </div>
                          </div>
                        </button>

                        {/* Module Content Body: Only visible when isExpanded is true */}
                        {isExpanded && (
                          <div className="p-5 space-y-5 bg-white border-t border-slate-200 animate-fadeIn">
                            
                            {/* 1. Video Lesson & Video Description */}
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <Video size={13} className="text-orange-500" />
                                Video Instruction
                              </span>

                              {youtubeEmbed ? (
                                <div className="rounded-xl overflow-hidden bg-black aspect-video relative border border-slate-200 shadow-xs">
                                  <iframe
                                    src={youtubeEmbed}
                                    title={m.moduleName}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                  />
                                </div>
                              ) : isDirectVideo ? (
                                <div className="rounded-xl overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-slate-200 shadow-xs">
                                  <video
                                    src={getFileUrl(m.videoUrl)}
                                    controls
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="rounded-xl p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between gap-4 border border-slate-700 shadow-xs">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                                      <PlayCircle size={22} />
                                    </div>
                                    <div>
                                      <h5 className="text-xs font-bold text-white">Interactive Field Video & Guide</h5>
                                      <p className="text-[11px] text-slate-300 mt-0.5">
                                        Detailed visual procedure prepared by field trainers.
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-semibold bg-white/10 px-2.5 py-1 rounded-md text-slate-300 shrink-0">
                                    Standard Lesson
                                  </span>
                                </div>
                              )}

                              {/* Video Description */}
                              {m.videoDescription && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                                  <span className="font-bold text-slate-900 block mb-0.5">Description & Scope:</span>
                                  {m.videoDescription}
                                </div>
                              )}
                            </div>

                            {/* 2. FAQs & Study Notes */}
                            {faqs.length > 0 && (
                              <div className="space-y-2.5 pt-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                  <BookOpen size={13} className="text-orange-500" />
                                  FAQs & Study Notes ({faqs.length})
                                </span>

                                <div className="space-y-2">
                                  {faqs.map((f, fIdx) => (
                                    <div
                                      key={fIdx}
                                      className="p-3 bg-orange-50/40 rounded-xl border border-orange-100 text-xs space-y-1"
                                    >
                                      <p className="font-bold text-slate-900 flex items-start gap-1.5">
                                        <span className="text-orange-600 font-black">Q:</span>
                                        <span>{f.question}</span>
                                      </p>
                                      <p className="text-slate-600 pl-4 leading-relaxed">
                                        <span className="text-emerald-700 font-bold mr-1">Ans:</span>
                                        {f.answer}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 3. Quiz Questions & Options (Assessment Preview & Start Button) */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1">
                                    <HelpCircle size={13} />
                                    Module Assessment Quiz
                                  </span>
                                  <h5 className="text-xs font-bold text-slate-800 mt-0.5">
                                    {questions.length} Questions • Passing: {passingScore}%
                                  </h5>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleStartQuiz(mIdx)}
                                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                                >
                                  <Sparkles size={13} />
                                  <span>{isPassed ? 'Retake Quiz' : 'Start Module Quiz'}</span>
                                  <ChevronRight size={13} />
                                </button>
                              </div>

                              {/* List of Questions with Options ("otyttion Question") */}
                              {questions.length > 0 && (
                                <div className="space-y-3 pt-2 border-t border-slate-200/80">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Quiz Questions Preview:
                                  </span>

                                  {questions.map((qItem, qIdx) => (
                                    <div
                                      key={qIdx}
                                      className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-2"
                                    >
                                      <p className="font-bold text-slate-800 flex items-start gap-1.5">
                                        <span className="text-orange-500 font-black">{qIdx + 1}.</span>
                                        <span>{qItem.question}</span>
                                      </p>

                                      {/* Options List */}
                                      {qItem.options && qItem.options.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4">
                                          {qItem.options.map((opt, oIdx) => (
                                            <div
                                              key={oIdx}
                                              className="px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 flex items-center gap-2"
                                            >
                                              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[9px] shrink-0">
                                                {String.fromCharCode(65 + oIdx)}
                                              </span>
                                              <span className="truncate">{opt}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

          {/* Modal Bottom Bar */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Complete all modules and achieve {passingScore}% in each quiz to qualify.
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-lg transition cursor-pointer"
              >
                Close
              </button>

              {isTrainingCompleted && (
                <button
                  type="button"
                  onClick={() => onDownloadCertificate && onDownloadCertificate(training._id, training.name)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Award size={14} />
                  <span>Download Certificate</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Quiz Modal */}
      {quizModalOpen && selectedQuizModuleIdx !== null && (
        <QuizModal
          training={training}
          moduleIndex={selectedQuizModuleIdx}
          onClose={() => setQuizModalOpen(false)}
          onSuccess={(res) => {
            if (onProgressUpdate) onProgressUpdate(training._id);
          }}
        />
      )}

      {/* Certificate Template Preview Full Modal */}
      {templateModalOpen && certificateTemplateUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-4 overflow-hidden space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="text-orange-500" size={16} />
                Certificate Template Sample
              </h4>
              <button
                onClick={() => setTemplateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-100 rounded-xl p-2">
              <img
                src={certificateTemplateUrl}
                alt="Certificate Template Preview"
                className="max-h-[70vh] object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrainingDetailModal;
