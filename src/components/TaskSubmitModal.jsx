import React, { useState, useEffect } from 'react';
import { X, MapPin, UploadCloud, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import taskService from '../services/taskService';

const INTEREST_LEVELS = ['Very Interested', 'Interested', 'Neutral', 'Not Interested'];

export const TaskSubmitModal = ({ task, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [interestLevel, setInterestLevel] = useState('Interested');
  const [feedback, setFeedback] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Auto-fetch location on modal open
  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setGettingLocation(false);
        toast.info('GPS coordinates detected successfully');
      },
      (error) => {
        setGettingLocation(false);
        toast.warn(`Could not get GPS coordinates: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please upload a proof photo');
      return;
    }

    if (!latitude || !longitude) {
      toast.error('Location coordinates (Latitude & Longitude) are mandatory');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('interestLevel', interestLevel);
    formData.append('feedback', feedback);

    setSubmitting(true);
    try {
      const targetId = task.taskId?._id || task._id;
      const res = await taskService.submitTaskProof(targetId, formData);
      toast.success(res.message || 'Task submitted successfully for verification!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to submit task proof');
    } finally {
      setSubmitting(false);
    }
  };

  const taskTitle = task?.taskId?.name || task?.name || 'Task Proof Submission';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider opacity-90">Ground Task Proof</span>
            <h3 className="text-lg font-bold truncate max-w-sm">{taskTitle}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Photo Upload Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Proof Photo *
            </label>
            <div className="relative border border-dashed border-slate-300 hover:border-orange-500 rounded-lg p-4 text-center cursor-pointer transition-colors bg-slate-50/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {preview ? (
                <div className="flex flex-col items-center">
                  <img src={preview} alt="Proof Preview" className="h-36 object-contain rounded-lg shadow-xs mb-2" />
                  <span className="text-xs font-semibold text-orange-600">Click to change photo</span>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <UploadCloud size={36} className="text-orange-500 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Click or Drag & Drop photo here</p>
                  <span className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG up to 10MB</span>
                </div>
              )}
            </div>
          </div>

          {/* GPS Coordinates Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <MapPin size={14} className="text-rose-500" /> GPS Location (Mandatory) *
              </label>
              <button
                type="button"
                onClick={fetchLocation}
                disabled={gettingLocation}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw size={12} className={gettingLocation ? 'animate-spin' : ''} />
                {gettingLocation ? 'Detecting...' : 'Re-detect GPS'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Latitude</span>
                <input
                  type="text"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 28.613939"
                  className="w-full mt-0.5 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Longitude</span>
                <input
                  type="text"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 77.209021"
                  className="w-full mt-0.5 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
            {latitude && longitude && (
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle size={12} /> GPS coordinates captured
              </p>
            )}
          </div>

          {/* Customer Interest Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Customer / Ground Interest Level
            </label>
            <select
              value={interestLevel}
              onChange={(e) => setInterestLevel(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 font-medium text-slate-700"
            >
              {INTEREST_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Feedback & Observations */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Notes / Feedback
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add key insights, interaction remarks, or client comments..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 text-slate-700"
            ></textarea>
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-sm disabled:opacity-50 transition flex items-center gap-2"
            >
              {submitting ? 'Submitting Proof...' : 'Submit Proof'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskSubmitModal;
