import React, { useState, useEffect } from 'react';
import { Bell, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import notificationService from '../services/notificationService';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      setLoading(true);
      try {
        const res = await notificationService.getNotifications();
        if (res && res.success && Array.isArray(res.data)) {
          setNotifications(res.data);
        }
      } catch (error) {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifs();
  }, []);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications & Broadcasts</h1>
        <p className="text-sm text-slate-500">Official updates, guidelines, and announcements from Ailocity HQ</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl shadow-xs">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No new notifications</h3>
          <p className="text-xs text-slate-500 mt-1">You are all caught up with recent updates.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const date = n.createdAt ? new Date(n.createdAt).toLocaleString() : '';
            return (
              <div
                key={n._id}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell size={18} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                      <Clock size={12} /> {date}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
                      From {n.senderRole || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
