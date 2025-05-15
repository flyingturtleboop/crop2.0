// src/components/Dashboard/Calendar.tsx

import React, { useState, useEffect } from "react";
import Calendar, { CalendarProps } from "react-calendar";
import axios from "axios";
import "react-calendar/dist/Calendar.css";

interface Reminder {
  id: string;
  date: string;    // "YYYY-MM-DD"
  content: string;
}

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [remindersMap, setRemindersMap] = useState<Record<string, Reminder[]>>({});
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const token = localStorage.getItem("token") || "";

  const fetchReminders = async () => {
    try {
      const resp = await axios.get<Reminder[]>(
        "http://127.0.0.1:5000/api/reminders",
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const map: Record<string, Reminder[]> = {};
      resp.data.forEach(r => {
        map[r.date] = map[r.date] || [];
        map[r.date].push(r);
      });
      setRemindersMap(map);
    } catch (err) {
      console.error("Error fetching reminders:", err);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleDateChange: CalendarProps["onChange"] = (value, _event) => {
    if (!value || Array.isArray(value)) return;
    setSelectedDate(value);
    const key = value.toISOString().slice(0, 10);
    const dayRems = remindersMap[key] || [];
    if (dayRems.length > 0) {
      setInputValue(dayRems[0].content);
      setIsEditing(true);
      setEditId(dayRems[0].id);
    } else {
      setInputValue("");
      setIsEditing(false);
      setEditId(null);
    }
  };

  const handleReminderSave = async () => {
    const date = selectedDate.toISOString().slice(0, 10);
    try {
      if (isEditing && editId) {
        await axios.put(
          `http://127.0.0.1:5000/api/reminders/${editId}`,
          { content: inputValue },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
      } else {
        await axios.post(
          "http://127.0.0.1:5000/api/reminders",
          { date, content: inputValue },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
      }
      setInputValue("");
      setIsEditing(false);
      setEditId(null);
      await fetchReminders();
      alert("Reminder saved!");
    } catch (err) {
      console.error("Error saving reminder:", err);
      alert("Could not save reminder.");
    }
  };

  const handleReminderDelete = async () => {
    if (!editId) return;
    try {
      await axios.delete(
        `http://127.0.0.1:5000/api/reminders/${editId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setInputValue("");
      setIsEditing(false);
      setEditId(null);
      await fetchReminders();
      alert("Reminder deleted!");
    } catch (err) {
      console.error("Error deleting reminder:", err);
      alert("Could not delete reminder.");
    }
  };

  const handleAddAnother = () => {
    setInputValue("");
    setIsEditing(false);
    setEditId(null);
  };

  const handleTileClick = (date: Date, rem: Reminder) => {
    setSelectedDate(date);
    setInputValue(rem.content);
    setIsEditing(true);
    setEditId(rem.id);
  };

  return (
    <div className="calendar-container">
      {/* ── LEFT: Calendar ── */}
      <div className="calendar-pane">
        <div className="calendar-wrapper">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileContent={({ date }) => {
              const key = date.toISOString().slice(0, 10);
              const dayRems = remindersMap[key] || [];
              if (!dayRems.length) return null;
              return (
                <div className="tile-reminders">
                  {dayRems.slice(0, 3).map(r => (
                    <div
                      key={r.id}
                      onClick={e => { e.stopPropagation(); handleTileClick(date, r); }}
                      className="tile-reminder"
                      title={r.content}
                    >
                      {r.content}
                    </div>
                  ))}
                  {dayRems.length > 3 && (
                    <div className="tile-more">+{dayRems.length - 3} more</div>
                  )}
                </div>
              );
            }}
            className="my-calendar"
          />
        </div>
      </div>

      {/* ── RIGHT: Reminder List & Form ── */}
      <div className="form-pane">
        <h3>
          Reminders for <strong>{selectedDate.toDateString()}</strong>
        </h3>
        <div className="existing-reminders">
          {(remindersMap[selectedDate.toISOString().slice(0, 10)] || []).map(r => (
            <div
              key={r.id}
              onClick={() => { setInputValue(r.content); setIsEditing(true); setEditId(r.id); }}
              className={`existing-reminder ${editId === r.id ? "selected" : ""}`}
            >
              {r.content}
            </div>
          ))}
        </div>
        <textarea
          rows={3}
          placeholder="New or edit reminder..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className="reminder-input"
        />

        <div className="form-buttons">
          <button onClick={handleReminderSave} className={isEditing ? "btn update" : "btn success"}>
            {isEditing ? "Update Reminder" : "Add Reminder"}
          </button>
          {isEditing && (
            <>
              <button onClick={handleReminderDelete} className="btn danger">
                Delete
              </button>
              <button onClick={handleAddAnother} className="btn success">
                Add Another
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
