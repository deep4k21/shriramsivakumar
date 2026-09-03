import { motion } from 'motion/react';
import { useState } from 'react';
import { CONNECT_LINKS } from '../data/content';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { Overlay } from './Overlay';

interface ConnectModalProps {
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  message: string;
}

/** Idle before the first submit; the rest track one submit attempt's outcome. */
type SendStatus = 'idle' | 'sending' | 'sent' | 'error';

export function ConnectModal({ onClose }: ConnectModalProps) {
  useBodyScrollLock(true);
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<SendStatus>('idle');

  const updateField = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (status !== 'sending') setStatus('idle');
  };

  // Posts to the site's own serverless function (`api/send-message.ts`) —
  // the form can't email the site owner directly from the browser, since
  // that needs an API key that can't live in frontend code.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const fieldClass =
    'rounded-[10px] border border-white/10 bg-surface px-3.5 py-3.25 font-body text-[14.5px] text-white outline-none transition-colors duration-180 focus:border-teal';

  return (
    <Overlay
      z="z-70"
      onClose={onClose}
      // Matches the project modal's scrim: visible dimming and a light blur,
      // so the panel actually has a backdrop to sit on rather than floating
      // over a nearly unchanged page.
      scrimClassName="bg-black/30 p-[clamp(24px,5vh,64px)] backdrop-blur-sm"
      // The project modal's own body is even lighter than its outer panel —
      // that panel's opacity is offset by an opaque header sitting on top of
      // it, which this modal has none of. Without that header to compensate,
      // this goes straight to the body's own lighter mix instead.
      className="flex max-h-full w-[min(560px,100%)] flex-col gap-5.5 overflow-y-auto rounded-[20px] border border-white/12 bg-[linear-gradient(158deg,rgba(40,42,48,.72),rgba(20,21,25,.66)_40%,rgba(28,30,35,.70))] px-9 py-8.5 shadow-[0_30px_90px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.14),inset_0_0_0_1px_rgba(255,255,255,.06)] backdrop-blur-2xl backdrop-saturate-150"
    >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="font-body text-[11px] tracking-[0.16em] text-teal">LET&rsquo;S CONNECT</div>
            <div className="font-heading text-[26px]/[1.3] font-semibold tracking-[-0.02em] text-white">
              Hiring, collaborating, or just curious?
            </div>
            <p className="m-0 font-body text-[15px]/[1.7] text-grey">I reply to everything, usually within a day.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-8.5 flex-none cursor-pointer rounded-[9px] bg-surface font-body text-[15px] text-white transition-colors duration-180 hover:bg-white/16"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <label className="flex flex-col gap-1.75">
              <span className="font-body text-[10.5px] tracking-[0.14em] text-grey">NAME</span>
              <input value={form.name} onChange={updateField('name')} placeholder="Your name" className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1.75">
              <span className="font-body text-[10.5px] tracking-[0.14em] text-grey">EMAIL</span>
              <input
                value={form.email}
                onChange={updateField('email')}
                placeholder="you@company.com"
                className={fieldClass}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.75">
            <span className="font-body text-[10.5px] tracking-[0.14em] text-grey">MESSAGE</span>
            <textarea
              value={form.message}
              onChange={updateField('message')}
              rows={4}
              placeholder="What are you working on?"
              className={`${fieldClass} resize-y leading-[1.6]`}
            />
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <motion.button
              type="submit"
              disabled={status === 'sending'}
              // Matches the resume button in Intro — see the note in ProjectPage.
              className="cursor-pointer rounded-xl border border-teal bg-[#005961]/10 px-6 py-3.5 font-heading text-[14.5px] font-bold text-teal disabled:cursor-default disabled:opacity-60"
              whileHover={status === 'sending' ? undefined : { y: -2 }}
              whileTap={status === 'sending' ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.18 }}
            >
              {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent' : 'Send message'}
            </motion.button>
            <motion.span
              className="font-body text-[13px] text-green"
              animate={{ opacity: status === 'sent' ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              Thanks — I&rsquo;ll reply within a day.
            </motion.span>
            <motion.span
              className="font-body text-[13px] text-orange"
              animate={{ opacity: status === 'error' ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              Something went wrong — try again, or email me directly below.
            </motion.span>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 border-t border-white/15 pt-4.5">
          {CONNECT_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              // Real external profiles open in a new tab rather than
              // navigating the reader away from the site entirely — unlike
              // the rest of the site's in-page convention, which is about
              // content the site itself hosts, not third-party profiles. A
              // placeholder (`#`) or `mailto:` link has nowhere else to go,
              // so it's left as a plain same-tab link.
              {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="rounded-[9px] bg-surface px-3.5 py-2.25 font-body text-[13px] text-grey transition-colors duration-180 hover:text-teal"
            >
              {l.label} <span className="text-[#4a4a4a]">{l.value}</span>
            </a>
          ))}
        </div>
    </Overlay>
  );
}
