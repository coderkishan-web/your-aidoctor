"use client";

import { useState } from "react";
import {
  X,
  Heart,
  Shield,
  Globe2,
  Clock4,
  ExternalLink,
  Github,
} from "lucide-react";

export function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface-1 border border-line/60 rounded-2xl shadow-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-line/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-glow">
              <Heart size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-ink-base">YourAIDoctor</h2>
              <p className="text-xs text-ink-muted">v1.0.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-subtle hover:text-ink-base hover:bg-surface-2"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Description */}
          <p className="text-sm text-ink-base leading-relaxed">
            YourAIDoctor is a state-of-the-art AI medical assistant that speaks
            20 languages. It provides general health guidance aligned with
            WHO, CDC, and NHS guidelines — always available, completely
            private, no sign-up required.
          </p>

          {/* Key features */}
          <div className="grid grid-cols-3 gap-3">
            <FeatureChip icon={Shield} label="Private" detail="Zero data retention" />
            <FeatureChip icon={Globe2} label="20 languages" detail="Auto-detected" />
            <FeatureChip icon={Clock4} label="24/7" detail="Always available" />
          </div>

          {/* Tech stack */}
          <div className="bg-surface-2/50 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
              Powered by
            </h3>
            <div className="space-y-1.5 text-sm text-ink-base">
              <InfoRow label="AI Model" value="Google Gemini API (with Groq fallback)" />
              <InfoRow label="Knowledge" value="WHO · CDC · NHS · SIE · SID · ADA" />
              <InfoRow label="Framework" value="Next.js 14 · React 18" />
              <InfoRow label="Backend" value="Node.js Engine" />
              <InfoRow label="License" value="Proprietary / All Rights Reserved" />
            </div>
          </div>

          {/* Links */}
          {/* Ownership */}
          <div className="bg-brand-50 dark:bg-brand-500/10 rounded-xl p-4 text-center border border-brand-100 dark:border-brand-500/20">
            <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
              Created and solely owned by<br/>
              <span className="font-bold text-base">Kishan Shinde (alias CoderKishan)</span>
            </p>
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-ink-subtle leading-relaxed text-center">
            YourAIDoctor provides general health information only. It is NOT a
            substitute for professional medical advice, diagnosis, or
            treatment. Always consult a qualified healthcare provider.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureChip({
  icon: Icon,
  label,
  detail,
}: {
  icon: any;
  label: string;
  detail: string;
}) {
  return (
    <div className="text-center p-3 rounded-xl bg-surface-2/50 border border-line/40">
      <Icon size={18} className="mx-auto text-accent-500 mb-1.5" />
      <p className="text-xs font-bold text-ink-base">{label}</p>
      <p className="text-[10px] text-ink-subtle">{detail}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs font-semibold text-ink-subtle w-20 flex-shrink-0">
        {label}
      </span>
      <span className="text-xs text-ink-base">{value}</span>
    </div>
  );
}
