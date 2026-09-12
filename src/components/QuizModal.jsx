import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Award, ChevronRight, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import trainingService from '../services/trainingService';

export const QuizModal = ({ training, moduleIndex, onClose, onSuccess }) => {
  const mod = training?.modules?.[moduleIndex];
  const questions = mod?.quiz || [];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (!mod || questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-2xl text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Quiz Available</h3>
          <p className="text-sm text-slate-600 mt-1">This module does not contain any quiz questions.</p>
          <button
            onClick={onClose}
            className="mt-5 px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSelect = (qIdx, optIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleSubmit = async () => {
    // Format answers array: array of selected option indices [0, 1, ...]
    const answers = questions.map((_, idx) =>
      selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
    );

    setSubmitting(true);
    try {
      const res = await trainingService.submitQuiz(training._id, moduleIndex, answers);
      const data = res?.data || res || {};
      const score = data.scorePercent !== undefined ? data.scorePercent : (data.score !== undefined ? data.score : 0);
      const passingScore = data.passingScore || training.passingScore || 80;
      const passed = Boolean(data.passed);

      const normalizedResult = {
        ...data,
        score,
        passingScore,
        passed,
      };

      setResult(normalizedResult);
      if (passed) {
        toast.success(`Congratulations! You passed with ${score}%!`);
        if (onSuccess) onSuccess(normalizedResult);
      } else {
        toast.error(`Score: ${score}%. Minimum required is ${passingScore}%. Try again!`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setResult(null);
  };

  const q = questions[currentIdx];
  const allAnswered = questions.every((_, idx) => selectedAnswers[idx] !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-90">Module {moduleIndex + 1} Quiz</span>
            <h3 className="text-lg font-bold truncate max-w-md">{mod.moduleName}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {result ? (
            /* Result Screen */
            <div className="text-center py-6">
              {result.passed ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <Award size={44} />
                  </div>
                  <h4 className="text-2xl font-black text-slate-800">Module Completed!</h4>
                  <p className="text-sm text-slate-600 mt-2">
                    You scored <strong className="text-emerald-600 text-lg font-bold">{result.score ?? 100}%</strong> (Passing: {result.passingScore ?? 80}%)
                  </p>
                  {result.isTrainingCompleted && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold">
                      🎉 Full Training Completed! Your Certificate is ready to download.
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    Done & Return
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle size={44} />
                  </div>
                  <h4 className="text-2xl font-black text-slate-800">Needs Improvement</h4>
                  <p className="text-sm text-slate-600 mt-2">
                    You scored <strong className="text-rose-600 text-lg font-bold">{result.score ?? 0}%</strong>. Passing score is <strong>{result.passingScore ?? 80}%</strong>.
                  </p>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={resetQuiz}
                      className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-all"
                    >
                      <RotateCcw size={15} /> Try Again
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Question Screen */
            <div>
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <span>Question {currentIdx + 1} of {questions.length}</span>
                <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-orange-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                ></div>
              </div>

              {/* Question Text */}
              <h4 className="text-base font-bold text-slate-800 mb-4 leading-relaxed">
                {q.question}
              </h4>

              {/* Options */}
              <div className="space-y-2.5">
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentIdx] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => handleSelect(currentIdx, oIdx)}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between text-xs sm:text-sm ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/70 text-orange-950 font-medium'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{opt}</span>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center text-xs ${
                          isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle size={10} />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => i - 1)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-100 rounded-lg transition"
                >
                  Previous
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((i) => i + 1)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!allAnswered || submitting}
                    onClick={handleSubmit}
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {submitting ? 'Evaluating...' : 'Submit Answers'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
