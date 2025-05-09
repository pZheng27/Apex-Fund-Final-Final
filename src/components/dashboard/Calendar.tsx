import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNotesForMonth, saveNote } from '@/lib/calendarNotesService';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['SUN', 'MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT'];

  useEffect(() => {
    async function fetchNotes() {
      setLoadingNotes(true);
      try {
        const notesFromDb = await getNotesForMonth(currentDate.getFullYear(), currentDate.getMonth() + 1);
        setNotes(notesFromDb);
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoadingNotes(false);
      }
    }
    fetchNotes();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setEditing(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setEditing(null);
  };

  const getDateKey = (day: number) => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleCellClick = (day: number) => {
    const key = getDateKey(day);
    setEditing(key);
    setInputValue(notes[key] || '');
  };

  const handleInputBlur = async (key: string) => {
    await saveNote(key, inputValue.trim());
    setNotes(prev => ({ ...prev, [key]: inputValue.trim() }));
    setEditing(null);
  };

  const handleInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, key: string) => {
    if (e.key === 'Enter') {
      const { selectionStart } = e.currentTarget;
      const before = inputValue.slice(0, selectionStart ?? 0);
      if (before.endsWith('\n')) {
        e.preventDefault();
        await saveNote(key, inputValue.trim());
        setNotes(prev => ({ ...prev, [key]: inputValue.trim() }));
        setEditing(null);
      }
    } else if (e.key === 'Escape') {
      setEditing(null);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = 42; // 6 rows of 7 days

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[7rem] border border-gray-300 flex-1 bg-white"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = new Date().getDate() === day && 
                     new Date().getMonth() === currentDate.getMonth() &&
                     new Date().getFullYear() === currentDate.getFullYear();
      const key = getDateKey(day);
      const isEditing = editing === key;
      const note = notes[key];

      days.push(
        <div
          key={day}
          className={`min-h-[7rem] border border-gray-300 flex flex-col p-2 text-black text-base font-bold select-none bg-white flex-1 cursor-pointer ${isToday ? 'bg-gray-200' : ''}`}
          onClick={() => handleCellClick(day)}
        >
          <div className="flex justify-end items-start w-full">
            <span className="text-lg font-bold text-gray-700">{day}</span>
          </div>
          <div className="flex-1 overflow-y-auto text-xs text-gray-600 mt-1 w-full">
            {isEditing ? (
              <textarea
                autoFocus
                className="w-full h-20 resize-none text-xs border border-gray-300 rounded p-2 mt-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onBlur={() => handleInputBlur(key)}
                onKeyDown={e => handleInputKeyDown(e, key)}
                placeholder="Add note..."
                style={{ minHeight: '3.5rem', maxHeight: '5rem' }}
              />
            ) : (
              note && <div className="whitespace-pre-line break-words">{note}</div>
            )}
          </div>
        </div>
      );
    }

    const remainingDays = totalDays - (firstDayOfMonth + daysInMonth);
    for (let i = 0; i < remainingDays; i++) {
      days.push(
        <div key={`empty-end-${i}`} className="min-h-[7rem] border border-gray-300 flex-1 bg-white"></div>
      );
    }

    return days;
  };

  return (
    <Card className="p-0 bg-white border-none shadow-none max-w-3xl mx-auto">
      <div className="flex flex-col items-center justify-center pt-8 pb-4">
        <div className="flex items-center justify-center w-full mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="h-12 w-12"
          >
            <ChevronLeft className="h-8 w-8 text-black" />
          </Button>
          <h2 className="flex-1 text-center text-4xl font-extrabold tracking-wide text-black uppercase">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-12 w-12"
          >
            <ChevronRight className="h-8 w-8 text-black" />
          </Button>
        </div>
        <div className="grid grid-cols-7 w-full border-b border-gray-400">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center text-lg font-extrabold text-black py-4 tracking-widest uppercase border-gray-300 border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 w-full min-w-0">
        {loadingNotes ? (
          <div className="col-span-7 text-center py-8 text-muted-foreground">Loading notes...</div>
        ) : renderCalendarDays()}
      </div>
    </Card>
  );
};

export default Calendar; 