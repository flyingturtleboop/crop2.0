// src/components/Dashboard/Calendar.tsx

import React, { useState, useEffect } from "react";
import Calendar, { CalendarProps } from "react-calendar";
import axios from "axios";
import "../../app.css";
import "react-calendar/dist/Calendar.css";

interface Reminder {
  id: string;
  date: string;        // "YYYY-MM-DD"
  title: string;
  description: string;
}

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [remindersMap, setRemindersMap] = useState<Record<string, Reminder[]>>({});
  const [inputTitle, setInputTitle] = useState("");
  const [inputDesc, setInputDesc] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [origTitle, setOrigTitle] = useState("");
  const [origDesc, setOrigDesc] = useState("");

  const token = localStorage.getItem("token") || "";

  // Fetch reminders
  const fetchReminders = async () => {
    try {
      const resp = await axios.get<Reminder[]>(
        "http://127.0.0.1:5000/api/reminders",
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const map: Record<string, Reminder[]> = {};
      resp.data.forEach(r => {
        (map[r.date] = map[r.date] || []).push(r);
      });
      setRemindersMap(map);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { fetchReminders(); }, []);

  const keyFor = (d: Date) => d.toISOString().slice(0, 10);

  // Load a date/reminder
  const loadForDate = (date: Date, rem?: Reminder) => {
    setSelectedDate(date);
    if (rem) {
      setInputTitle(rem.title);
      setInputDesc(rem.description);
      setEditId(rem.id);
    } else {
      const day = remindersMap[keyFor(date)] || [];
      if (day.length) {
        setInputTitle(day[0].title);
        setInputDesc(day[0].description);
        setEditId(day[0].id);
      } else {
        setInputTitle("");
        setInputDesc("");
        setEditId(null);
      }
    }
  };

  const handleDateChange: CalendarProps["onChange"] = (v) => {
    if (!v || Array.isArray(v)) return;
    loadForDate(v);
  };

  const handleTileClick = (date: Date, rem: Reminder) => {
    loadForDate(date, rem);
  };

  // Create new
  const handleCreate = async () => {
    const date = keyFor(selectedDate);
    if (!inputTitle.trim() || !inputDesc.trim()) {
      alert("Both title and description are required.");
      return;
    }
    try {
      await axios.post(
        "http://127.0.0.1:5000/api/reminders",
        { date, title: inputTitle, description: inputDesc },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setInputTitle("");
      setInputDesc("");
      fetchReminders();
    } catch {
      alert("Could not create reminder.");
    }
  };

  // Open edit modal
  const openEditModal = () => {
    setOrigTitle(inputTitle);
    setOrigDesc(inputDesc);
    setShowModal(true);
  };

  // Update existing
  const handleUpdate = async () => {
    if (!editId) return;
    if (!inputTitle.trim() || !inputDesc.trim()) {
      alert("Both title and description are required.");
      return;
    }
    try {
      await axios.put(
        `http://127.0.0.1:5000/api/reminders/${editId}`,
        { title: inputTitle, description: inputDesc },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setShowModal(false);
      fetchReminders();
    } catch {
      alert("Could not update reminder.");
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!editId) return;
    try {
      await axios.delete(
        `http://127.0.0.1:5000/api/reminders/${editId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setInputTitle("");
      setInputDesc("");
      setEditId(null);
      fetchReminders();
    } catch {
      alert("Could not delete reminder.");
    }
  };

  // Cancel within modal
  const handleCancelModal = () => {
    setInputTitle(origTitle);
    setInputDesc(origDesc);
    setShowModal(false);
  };

  // Prepare for new
  const handleAddAnother = () => {
    setInputTitle("");
    setInputDesc("");
    setEditId(null);
    setShowModal(false);
  };

  const selectedKey = keyFor(selectedDate);

  return (
    <div className="calendar-container">
      <div className="calendar-pane">
        <div className="calendar-header">Personal Crop-AI Calendar</div>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          className="my-calendar"
          tileContent={({ date }) => {
            const dayRems = remindersMap[keyFor(date)] || [];
            if (!dayRems.length) return null;
            return (
              <div className="tile-reminders">
                {dayRems.slice(0, 3).map(r => (
                  <div
                    key={r.id}
                    onClick={e => { e.stopPropagation(); handleTileClick(date, r); }}
                    className="tile-reminder"
                    title={r.title}
                  >
                    {r.title}
                  </div>
                ))}
                {dayRems.length > 3 && (
                  <div className="tile-more">+{dayRems.length - 3} more</div>
                )}
              </div>
            );
          }}
        />
      </div>

      <div className="form-pane">
        <h3>Reminders for <strong>{selectedDate.toDateString()}</strong></h3>

        <div className="existing-reminders">
          {(remindersMap[selectedKey] || []).map(r => (
            <div
              key={r.id}
              onClick={() => handleTileClick(selectedDate, r)}
              className={`existing-reminder ${editId === r.id ? "selected" : ""}`}
            >
              {r.title}
            </div>
          ))}
        </div>

        {editId === null ? (
          <>
            {/* New reminder */}
            <input
              type="text"
              placeholder="Reminder title"
              className="reminder-title-input"
              value={inputTitle}
              onChange={e => setInputTitle(e.target.value)}
            />
            <textarea
              placeholder="Reminder description"
              className="reminder-input"
              value={inputDesc}
              onChange={e => setInputDesc(e.target.value)}
            />
            <div className="form-buttons">
              <button onClick={handleCreate} className="btn success">
                Add Reminder
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Existing reminder shown in disabled inputs */}
            <input
              type="text"
              className="reminder-title-input"
              value={inputTitle}
              disabled
            />
            <textarea
              className="reminder-input"
              value={inputDesc}
              disabled
            />
            <div className="form-buttons">
              <button onClick={openEditModal} className="btn update">
                Change Reminder
              </button>
              <button onClick={handleDelete} className="btn danger">
                Delete
              </button>
              <button onClick={handleAddAnother} className="btn success">
                Add Another
              </button>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Reminder</h3>
            <input
              type="text"
              placeholder="Reminder title"
              className="reminder-title-input"
              value={inputTitle}
              onChange={e => setInputTitle(e.target.value)}
            />
            <textarea
              placeholder="Reminder description"
              className="reminder-input"
              value={inputDesc}
              onChange={e => setInputDesc(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleUpdate} className="btn success">
                Save
              </button>
              <button onClick={handleCancelModal} className="btn danger">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
