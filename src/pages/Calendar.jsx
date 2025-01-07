import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Card } from '../components/ui/Card';
import EventModal from '../components/calendar/EventModal';
import { calendarService } from '../lib/calendarService';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await calendarService.getEvents();
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Calendrier">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Calendrier</h2>
          <button
            onClick={() => setShowModal(true)}
            className="cosmic-button px-4 py-2 rounded-lg"
          >
            + Nouvel événement
          </button>
        </div>

        <Card>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="cosmic-spinner" />
            </div>
          ) : events.length > 0 ? (
            <div className="p-6">
              {/* Affichage des événements */}
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="cosmic-card p-4 rounded-lg hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium">{event.title}</h3>
                        <p className="text-sm text-gray-400">{event.description}</p>
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(event.start_date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Aucun événement trouvé</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 cosmic-button px-4 py-2 rounded-lg"
              >
                Ajouter votre premier événement
              </button>
            </div>
          )}
        </Card>
      </div>

      {showModal && (
        <EventModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchEvents();
            setShowModal(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}
