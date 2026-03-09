'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Event, EventType } from '@/lib/types';
import { getEvents, createEvent, deleteEvent } from '@/lib/firebase/events';
import { toast } from 'react-hot-toast';

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    collegeName: '',
    type: 'hackathon' as EventType,
    eventName: '',
    address: '',
    eventSite: '',
    description: '',
    date: '',
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await createEvent({
        ...formData,
        postedBy: {
          uid: user.uid,
          name: user.name,
          role: user.role,
        },
      });
      toast.success('Event posted successfully!');
      setIsModalOpen(false);
      setFormData({
        collegeName: '',
        type: 'hackathon',
        eventName: '',
        address: '',
        eventSite: '',
        description: '',
        date: '',
      });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to post event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteEvent(id);
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'hackathon': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'symposium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'conference': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'tech_event': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatEventType = (type: string) => {
    return type.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-none">
            Campus Events Hub
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Discover and share hackathons, symposiums, and technical conferences.
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-2xl font-black uppercase text-xs tracking-widest px-8 py-6 shadow-xl shadow-indigo-200"
        >
          + Post New Event
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading events...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card key={event.id} hover className="border-none shadow-indigo-100 group flex flex-col h-full">
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${getEventBadgeColor(event.type)}`}>
                    {formatEventType(event.type)}
                  </span>
                  {(user?.role === 'admin' || user?.uid === event.postedBy.uid) && (
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                  {event.eventName}
                </h3>
                
                <div className="space-y-4 mt-auto">
                  <div className="flex items-start space-x-3 text-sm text-slate-500 font-medium">
                    <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{event.collegeName}</span>
                  </div>

                  <div className="flex items-start space-x-3 text-sm text-slate-500 font-medium">
                    <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-2">{event.address}</span>
                  </div>

                  {event.date && (
                    <div className="flex items-center space-x-3 text-sm text-slate-500 font-medium">
                      <svg className="w-5 h-5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col gap-4">
                  <a href={event.eventSite} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" className="w-full rounded-xl border-slate-200 group-hover:border-indigo-600 group-hover:text-indigo-600 font-black uppercase tracking-widest text-[10px] py-4">
                      Visit Event Site
                    </Button>
                  </a>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      By {event.postedBy.name}
                    </span>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {events.length === 0 && !loading && (
        <div className="py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-slate-200/50">🎉</div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">No Events Found</h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">Be the first to share an upcoming hackathon or symposium with the community.</p>
          <Button onClick={() => setIsModalOpen(true)} variant="outline" className="rounded-xl font-black uppercase text-[10px] tracking-widest px-8">
            Create Exploration
          </Button>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Post New Campus Event"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Name</label>
              <Input 
                required
                placeholder="e.g. MSEC Hackathon 2024"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                className="rounded-xl border-slate-200 p-4 focus:ring-indigo-600"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Type</label>
              <select 
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                className="w-full rounded-xl border-slate-200 p-4 focus:ring-indigo-600 bg-white text-sm font-medium h-[54px]"
              >
                <option value="hackathon">HACKATHON</option>
                <option value="symposium">SYMPOSIUM</option>
                <option value="conference">CONFERENCE</option>
                <option value="tech_event">TECH EVENT</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">College Name</label>
              <Input 
                required
                placeholder="e.g. Meenakshi Sundararajan Engineering College"
                value={formData.collegeName}
                onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                className="rounded-xl border-slate-200 p-4"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Date (Optional)</label>
              <Input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="rounded-xl border-slate-200 p-4"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address / Venue</label>
            <Input 
              required
              placeholder="Full address or specific department block"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="rounded-xl border-slate-200 p-4"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Website URL</label>
            <Input 
              required
              type="url"
              placeholder="https://event-site.com"
              value={formData.eventSite}
              onChange={(e) => setFormData({ ...formData, eventSite: e.target.value })}
              className="rounded-xl border-slate-200 p-4"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Description (Optional)</label>
            <textarea 
              placeholder="Quick overview of the event highlights..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border-slate-200 p-4 min-h-[100px] text-sm font-medium focus:ring-indigo-600 focus:border-indigo-600"
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl px-8 border-slate-200 font-black uppercase text-[10px] tracking-widest"
            >
              Discard
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="rounded-xl px-12 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100"
            >
              {isSubmitting ? 'Posting...' : 'Post Event Now'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
