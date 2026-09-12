import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Save,
  Camera,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { getFileUrl } from '../services/api';

export const Profile = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [place, setPlace] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDob(user.dob || '');
      setPlace(user.place || '');
      setPincode(user.pincode || '');
      setLatitude(user.latitude ? user.latitude.toString() : '');
      setLongitude(user.longitude ? user.longitude.toString() : '');
      setEducation(user.education || '');
      setExperience(user.experience || '');
      if (user.photo) {
        setPhotoPreview(getFileUrl(user.photo));
      }
    }
  }, [user]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setDetectingGps(false);
        toast.success('Current GPS location detected');
      },
      (err) => {
        setDetectingGps(false);
        toast.warn(`GPS error: ${err.message}`);
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('dob', dob);
    formData.append('place', place);
    formData.append('pincode', pincode);
    if (latitude) formData.append('latitude', latitude);
    if (longitude) formData.append('longitude', longitude);
    formData.append('education', education);
    formData.append('experience', experience);
    if (photo) formData.append('photo', photo);

    setSaving(true);
    try {
      const res = await authService.updateProfile(formData);
      if (res && res.success) {
        toast.success('Profile updated successfully!');
        await refreshUser();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Associate Profile</h1>
        <p className="text-sm text-slate-500">Manage your credentials, ground location, and KYC details</p>
      </div>

      {/* Top Profile Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex items-center justify-center">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Avatar"
                onError={() => setPhotoPreview('')}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={40} className="text-slate-400" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-900 text-white cursor-pointer hover:bg-orange-600 transition-colors shadow-xs">
            <Camera size={13} />
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Business Associate'}</h2>
              <p className="text-xs text-slate-500">{user?.email || 'No email set'}</p>
            </div>

            <div className="flex items-center gap-2 justify-center sm:justify-end">
              <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-md flex items-center gap-1">
                <CheckCircle2 size={13} /> Active Associate
              </span>
            </div>
          </div>

          {/* Verification Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-3.5 justify-center sm:justify-start">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
              <Mail size={13} className="text-orange-500" />
              <span>Email: {user?.isEmailVerified ? 'Verified ✓' : 'Unverified'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
              <Phone size={13} className="text-emerald-500" />
              <span>Phone: {user?.isPhoneVerified ? 'Verified ✓' : 'Unverified'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              <Wallet size={13} className="text-emerald-600" />
              <span>Wallet: ₹{user?.walletBalance || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-3 border-b border-slate-200">
          Personal & Geographical Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">City / Region</label>
            <input
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="e.g. Mumbai, New Delhi"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Postal Pincode</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="e.g. 110001"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* GPS Coordinates */}
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={13} className="text-rose-500" /> Operational Base Location
            </span>
            <button
              type="button"
              onClick={detectLocation}
              disabled={detectingGps}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} className={detectingGps ? 'animate-spin' : ''} />
              {detectingGps ? 'Detecting...' : 'Detect Current GPS'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Latitude"
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:border-orange-500 focus:outline-none"
            />
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Longitude"
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Education</label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. Graduate / B.Com"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Field Experience</label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 2 Years in Direct Sales"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
          >
            <Save size={14} />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
