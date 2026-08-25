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

export function ConnectModal({ onClose }: ConnectModalProps) {
  useBodyScrollLock(true);
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const updateField = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSent(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const fieldClass =
    'rounded-[10px] border border-white/10 bg-surface px-3.5 py-3.25 font-body text-[14.5px] text-white outline-none transition-colors duration-180 focus:border-teal';

  return (
    <Overlay
      z="z-70"
      onClose={onClose}
      scrimClassName="bg-black/60 p-[clamp(24px,5vh,64px)] backdrop-blur-md"
      className="flex max-h-full w-[min(560px,100%)] flex-col gap-5.5 overflow-y-auto rounded-[20px] bg-[linear-gradient(155deg,rgba(40,42,48,.97),rgba(20,21,25,.95)_40%,rgba(28,30,35,.96))] px-9 py-8.5 shadow-[0_30px_90px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.14),inset_0_0_0_1px_rgba(255,255,255,.06)] backdrop-blur-3xl backdrop-saturate-150"
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
              className="cursor-pointer rounded-[10px] border-none bg-orange px-6 py-3.5 font-heading text-[14.5px] font-medium text-bg"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.18 }}
            >
              {sent ? 'Sent' : 'Send message'}
            </motion.button>
            <motion.span
              className="font-body text-[13px] text-green"
              animate={{ opacity: sent ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              Thanks — I&rsquo;ll reply within a day.
            </motion.span>
          </div>
        </form>

        <div className="flex flex-wrap gap-2 border-t border-white/15 pt-4.5">
          {CONNECT_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-[9px] bg-surface px-3.5 py-2.25 font-body text-[13px] text-grey transition-colors duration-180 hover:text-teal"
            >
              {l.label} <span className="text-[#4a4a4a]">{l.value}</span>
            </a>
          ))}
        </div>
    </Overlay>
  );
}
