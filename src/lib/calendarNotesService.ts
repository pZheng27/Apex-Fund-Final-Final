import { supabase } from './supabase/client';

// Fetch all notes for a given month (YYYY-MM)
export async function getNotesForMonth(year: number, month: number): Promise<{ [date: string]: string }> {
  const monthStr = String(month).padStart(2, '0');
  const from = `${year}-${monthStr}-01`;
  const to = `${year}-${monthStr}-31`;
  const { data, error } = await supabase
    .from('calendar_notes')
    .select('date, note')
    .gte('date', from)
    .lte('date', to);
  if (error) throw error;
  const notes: { [date: string]: string } = {};
  data?.forEach((row: { date: string; note: string }) => {
    notes[row.date] = row.note;
  });
  return notes;
}

// Upsert a note for a specific date (YYYY-MM-DD)
export async function saveNote(date: string, note: string): Promise<void> {
  const { error } = await supabase
    .from('calendar_notes')
    .upsert([{ date, note, updated_at: new Date().toISOString() }], { onConflict: 'date' });
  if (error) throw error;
} 