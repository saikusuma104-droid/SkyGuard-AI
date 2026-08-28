import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface AccordionItemData {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant: 'sky' | 'rose' | 'amber' | 'emerald' | 'slate';
  };
  content: React.ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItemData[];
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  className = '',
}) => {
  const [openIds, setOpenIds] = useState<string[]>(() => {
    return items.filter((item) => item.defaultOpen).map((item) => item.id);
  });

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      if (allowMultiple) {
        return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      } else {
        return prev.includes(id) ? [] : [id];
      }
    });
  };

  const getBadgeStyle = (variant: AccordionItemData['badge']['variant']) => {
    switch (variant) {
      case 'rose':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'amber':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'emerald':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'sky':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'slate':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);

        return (
          <div
            key={item.id}
            className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? 'bg-[#111A2E] border-slate-700/90 shadow-lg shadow-black/20'
                : 'bg-[#131E32] border-slate-800/80 hover:border-slate-700/60 hover:bg-[#152238]'
            }`}
          >
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="w-full p-4 sm:p-4.5 flex items-center justify-between text-left focus:outline-none focus:ring-1 focus:ring-sky-500/50 rounded-xl transition-colors"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                {item.icon && (
                  <div className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                    isOpen ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800/80 text-slate-400'
                  }`}>
                    {item.icon}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                      {item.title}
                    </span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${getBadgeStyle(item.badge.variant)}`}>
                        {item.badge.text}
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-1 rounded-md bg-slate-800/60 text-slate-400 group-hover:text-white transition-transform">
                {isOpen ? <ChevronUp className="w-4 h-4 text-sky-400" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {/* Accordion Content */}
            {isOpen && (
              <div className="px-4 pb-4 sm:px-4.5 sm:pb-4.5 pt-0 text-xs text-slate-300 border-t border-slate-800/80 mt-1 animate-fade-in">
                <div className="pt-3.5 space-y-3">
                  {item.content}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
