'use client';

import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';
import type { Brief } from '@/types';
import { Loader2, Send } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

export function ApplyModal({ brief, onClose, onApplied }: { brief: Brief | null; onClose: () => void; onApplied?: (b: Brief) => void }) {
  const toast = useToast();
  const [note, setNote] = useState('');
  const [rate, setRate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (brief) {
      setNote('');
      setRate('');
      setError('');
    }
  }, [brief]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!brief) return;
    if (note.trim().length < 20) {
      setError('Tell the brand a little more — at least 20 characters.');
      return;
    }
    setLoading(true);
    try {
      const updated = await api.applyToBrief(brief.id);
      onApplied?.(updated);
      toast.success('Application sent', `${brief.brandName} will review your proposal.`);
      onClose();
    } catch (err) {
      toast.error('Could not apply', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={!!brief} onClose={onClose}>
      {brief && (
        <form onSubmit={submit} className="p-6">
          <p className="text-sm text-muted">{brief.brandName}</p>
          <h3 className="pr-8 text-xl font-semibold">Apply to “{brief.title}”</h3>
          <p className="mt-1 text-xs text-subtle">
            Budget {brief.budget} · {brief.contentType} · {brief.aspectRatio}
          </p>
          <label className="label mt-6" htmlFor="note">
            Cover note
          </label>
          <textarea
            id="note"
            rows={5}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setError('');
            }}
            placeholder="Share your approach, relevant work and which tools you'd use…"
            className={`field resize-none ${error ? 'border-red-500/60' : ''}`}
          />
          {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
          <label className="label mt-4" htmlFor="rate">
            Your quote (optional)
          </label>
          <input id="rate" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g. $4,500" className="field" />
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit application
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
