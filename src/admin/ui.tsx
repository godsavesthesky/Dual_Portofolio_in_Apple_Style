import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[var(--text-secondary)] mb-1">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        'w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60 ' +
        (props.className ?? '')
      }
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        'w-full px-3 py-2 rounded-lg glass text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60 resize-none ' +
        (props.className ?? '')
      }
    />
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        'px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60 ' +
        (props.className ?? '')
      }
      style={{ background: 'var(--accent)', ...(props.style ?? {}) }}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        'px-4 py-2 rounded-lg text-sm font-medium glass text-[var(--text-primary)] transition-opacity hover:opacity-80 active:scale-[0.98] disabled:opacity-60 ' +
        (props.className ?? '')
      }
    >
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        'px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors disabled:opacity-60 ' +
        (props.className ?? '')
      }
    >
      {children}
    </button>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
        {description && (
          <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
