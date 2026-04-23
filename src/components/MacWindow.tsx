import React from 'react';

interface MacWindowProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function MacWindow({ title, children, className = '' }: MacWindowProps) {
  return (
    <div className={`glass rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
        <span className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-sm cursor-default hover:brightness-90 transition-all" />
        <span className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm cursor-default hover:brightness-90 transition-all" />
        <span className="w-3 h-3 rounded-full bg-[#28CA41] shadow-sm cursor-default hover:brightness-90 transition-all" />
        {title && (
          <span className="flex-1 text-center text-xs font-medium text-[var(--text-secondary)] select-none">
            {title}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
