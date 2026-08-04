"use client";

import React, { useState } from "react";
import {
  Phone,
  AlertTriangle,
  Heart,
  Wind,
  Droplets,
  Brain,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Flame,
  Shield,
  LifeBuoy,
  Stethoscope,
  Smile,
  AlertOctagon,
  Users,
  MapPin,
  Activity,
} from "lucide-react";
import { t, type SupportedLanguage } from "@/lib/i18n";
import { EmergencyMap } from "./EmergencyMap";

interface EmergencyViewProps {
  language: SupportedLanguage;
  emergencyNumber: string;
}

interface FirstAidGuide {
  id: string;
  title: string;
  category: string;
  urgency: "CRITICAL EMERGENCY" | "HIGH EMERGENCY";
  icon: React.ReactNode;
  steps: string[];
  doNot: string[];
}

interface EmergencyContact {
  title: string;
  number: string;
  desc: string;
  category: "medical" | "specialized" | "safety";
  icon: React.ReactNode;
  badgeColor: string;
}

type SectionTab = "map" | "numbers" | "firstaid";

// ─── Data ────────────────────────────────────────────────────────────────────

const emergencyContacts: EmergencyContact[] = [
  {
    title: "National Emergency Ambulance",
    number: "108",
    desc: "Immediate 24x7 Medical Response & Basic/Advanced Life Support Ambulance",
    category: "medical",
    icon: <PhoneCall className="text-danger-500" size={18} />,
    badgeColor: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  },
  {
    title: "All-in-One National Emergency Hotline",
    number: "112",
    desc: "Unified Single Emergency Line (Police, Fire, Ambulance & Rescue)",
    category: "medical",
    icon: <ShieldAlert className="text-danger-500" size={18} />,
    badgeColor: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  },
  {
    title: "Maternal & Child Health Ambulance",
    number: "102",
    desc: "Free Ambulance for Pregnant Women, Newborns & Pediatric Emergencies",
    category: "medical",
    icon: <Heart className="text-rose-500" size={18} />,
    badgeColor: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  },
  {
    title: "National Poison Control Center",
    number: "1800-116-117",
    desc: "24x7 Toxic Exposure, Chemical Ingestion & Poisoning Medical Guidance",
    category: "specialized",
    icon: <AlertOctagon className="text-warning-500" size={18} />,
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  },
  {
    title: "Tele-MANAS Mental Health Line",
    number: "14416",
    desc: "National Suicide Prevention, Crisis Counseling & Psychological First Aid",
    category: "specialized",
    icon: <Smile className="text-purple-500" size={18} />,
    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  },
  {
    title: "National Health Emergency Helpline",
    number: "1075",
    desc: "Health Ministry Outbreak, Epidemic & Medical Consultation Line",
    category: "specialized",
    icon: <Stethoscope className="text-brand-500" size={18} />,
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  },
  {
    title: "Police Response Emergency",
    number: "100",
    desc: "Immediate Police Assistance, Crime Reporting & Public Safety Dispatch",
    category: "safety",
    icon: <Shield className="text-brand-600" size={18} />,
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
  },
  {
    title: "Fire & Rescue Operations",
    number: "101",
    desc: "Fire Emergency, Hazmat Leaks & Building Evacuation Rescue Control Room",
    category: "safety",
    icon: <Flame className="text-warning-500" size={18} />,
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  },
  {
    title: "Women Emergency Helpline",
    number: "1091",
    desc: "24x7 Emergency Assistance & Protection Hotline for Women",
    category: "safety",
    icon: <Users className="text-purple-600" size={18} />,
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-400",
  },
  {
    title: "Childline Protection Helpline",
    number: "1098",
    desc: "Free 24x7 Emergency Phone Outreach for Children in Distress",
    category: "safety",
    icon: <LifeBuoy className="text-emerald-600" size={18} />,
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  {
    title: "National Disaster Relief Control Room",
    number: "1070",
    desc: "Disaster Emergency Management, Flood & Extreme Weather Relief Line",
    category: "safety",
    icon: <AlertTriangle className="text-orange-500" size={18} />,
    badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-400",
  },
];

const guides: FirstAidGuide[] = [
  {
    id: "cpr",
    title: "CPR",
    category: "Heart & Resuscitation",
    urgency: "CRITICAL EMERGENCY",
    icon: <Heart size={15} className="text-danger-500" />,
    steps: [
      "Call emergency services immediately (108 / 112 / 911).",
      "Place person on back on a firm, flat surface.",
      "Place hands in center of chest. Push down 2 inches at 100–120 compressions/min.",
      "Continue compressions without stopping until emergency response arrives.",
    ],
    doNot: [
      "Do NOT interrupt compressions for more than 10 seconds.",
      "Do NOT perform CPR if person is conscious and breathing normally.",
    ],
  },
  {
    id: "stroke",
    title: "Stroke",
    category: "Neurological — FAST Protocol",
    urgency: "CRITICAL EMERGENCY",
    icon: <Brain size={15} className="text-purple-500" />,
    steps: [
      "F — Face Drooping: Ask person to smile. Check for drooping.",
      "A — Arm Weakness: Ask to raise both arms. Does one drift down?",
      "S — Speech Difficulty: Ask to repeat a sentence. Is speech slurred?",
      "T — Time to call 108 / 112 immediately. Note exact time symptoms began.",
    ],
    doNot: [
      "Do NOT give food, drinks, or medications (especially aspirin).",
      "Do NOT let the person sleep or drive themselves to hospital.",
    ],
  },
  {
    id: "burns",
    title: "Burns",
    category: "Trauma & Skin",
    urgency: "HIGH EMERGENCY",
    icon: <AlertTriangle size={15} className="text-warning-500" />,
    steps: [
      "Cool burn under cool running tap water for 10–20 minutes immediately.",
      "Remove jewelry/tight clothing near burn before swelling starts.",
      "Cover loosely with clean non-stick sterile bandage or plastic wrap.",
    ],
    doNot: [
      "Do NOT apply ice, butter, oil, or toothpaste.",
      "Do NOT break or pop blisters.",
    ],
  },
  {
    id: "choking",
    title: "Choking",
    category: "Airway — Heimlich Maneuver",
    urgency: "CRITICAL EMERGENCY",
    icon: <Wind size={15} className="text-brand-500" />,
    steps: [
      "Stand behind person and wrap arms around their waist.",
      "Make a fist above navel and grasp with other hand.",
      "Perform quick upward abdominal thrusts until object is dislodged.",
    ],
    doNot: [
      "Do NOT perform abdominal thrusts on infants under 1 year.",
      "Do NOT slap back if person is coughing effectively on their own.",
    ],
  },
  {
    id: "bleeding",
    title: "Bleeding",
    category: "Trauma",
    urgency: "HIGH EMERGENCY",
    icon: <Droplets size={15} className="text-rose-500" />,
    steps: [
      "Apply direct firm pressure to wound using a clean cloth or bandage.",
      "Keep pressure held continuously for at least 10 minutes.",
      "Elevate injured limb above heart level if possible.",
    ],
    doNot: [
      "Do NOT remove embedded foreign objects from deep wounds.",
      "Do NOT remove soaked bandages — apply new layers over them.",
    ],
  },
];

const SECTION_TABS: { id: SectionTab; label: string; icon: React.ReactNode; shortLabel: string }[] = [
  { id: "map",      label: "Live GPS Map",        shortLabel: "Map",     icon: <MapPin size={15} /> },
  { id: "numbers",  label: "Emergency Numbers",   shortLabel: "Numbers", icon: <PhoneCall size={15} /> },
  { id: "firstaid", label: "First Aid Guide",     shortLabel: "First Aid", icon: <Activity size={15} /> },
];

const CONTACT_FILTERS = ["all", "medical", "specialized", "safety"] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function EmergencyView({ language, emergencyNumber }: EmergencyViewProps) {
  const [activeSection, setActiveSection] = useState<SectionTab>("map");
  const [selectedGuideId, setSelectedGuideId] = useState<string>("cpr");
  const [contactFilter, setContactFilter] = useState<typeof CONTACT_FILTERS[number]>("all");

  const filteredContacts =
    contactFilter === "all"
      ? emergencyContacts
      : emergencyContacts.filter((c) => c.category === contactFilter);

  const currentGuide = guides.find((g) => g.id === selectedGuideId) ?? guides[0];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-mobile-nav scroll-touch">
      <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* ════════════════════════════════════════════════════════════════
            HEADER CARD — branding + SOS pills + section tabs
        ════════════════════════════════════════════════════════════════ */}
        <div className="bg-surface-1 border border-line/60 rounded-2xl shadow-soft overflow-hidden">

          {/* Top row: icon + title/desc + SOS quick-dials */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5">

            {/* Left — branding */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-danger-500 flex items-center justify-center text-xl shadow-danger-glow animate-pulse-soft flex-shrink-0">
                🚑
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-ink-base leading-tight">Emergency Center</h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400 text-xs font-semibold rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5 leading-snug">
                  GPS hospital locator · turn-by-turn navigation · verified national hotlines
                </p>
              </div>
            </div>

            {/* Right — SOS quick-dial pills (horizontal) */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <a
                href="tel:108"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-danger-500 hover:bg-danger-600 text-white font-bold text-xs rounded-xl shadow-danger-glow transition-all active:scale-95"
              >
                <Phone size={13} /> 108 — Ambulance
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-2 hover:bg-surface-3 text-ink-base font-bold text-xs rounded-xl border border-line/60 transition-all active:scale-95"
              >
                <Phone size={13} /> 112 — National
              </a>
              <a
                href="tel:102"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all active:scale-95"
              >
                <Phone size={13} /> 102 — Maternal
              </a>
            </div>
          </div>

          {/* Section navigation tabs (border-top divider) */}
          <div className="border-t border-line/50 px-2 sm:px-4">
            <div className="flex overflow-x-auto scrollbar-hide">
              {SECTION_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 flex-shrink-0 ${
                    activeSection === tab.id
                      ? "border-brand-500 text-brand-600"
                      : "border-transparent text-ink-muted hover:text-ink-base hover:border-line"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            CONTENT — switches by activeSection tab
        ════════════════════════════════════════════════════════════════ */}
        <div className="bg-surface-1 border border-line/60 rounded-2xl shadow-soft overflow-hidden">

          {/* ── TAB 1: Live GPS Map ────────────────────────────────────── */}
          {activeSection === "map" && (
            <div className="p-4 sm:p-5">
              <EmergencyMap />
            </div>
          )}

          {/* ── TAB 2: Emergency Numbers ───────────────────────────────── */}
          {activeSection === "numbers" && (
            <div className="p-4 sm:p-5 space-y-4">

              {/* Section header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-bold text-ink-base flex items-center gap-2 text-base">
                    <PhoneCall size={18} className="text-danger-500" />
                    All National Emergency Numbers
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Verified toll-free helplines — tap any card to dial instantly.
                  </p>
                </div>

                {/* Category filter pills */}
                <div className="flex p-1 bg-surface-2 rounded-xl border border-line/40 text-xs font-semibold w-full sm:w-auto flex-shrink-0">
                  {CONTACT_FILTERS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setContactFilter(cat)}
                      className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg capitalize transition-all ${
                        contactFilter === cat
                          ? "bg-surface-1 text-ink-base shadow-soft"
                          : "text-ink-muted hover:text-ink-base"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards grid — 2 cols on sm, 3 cols on lg */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredContacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-line/50 bg-surface-2/40 hover:bg-surface-1 hover:border-line hover:shadow-soft transition-all duration-200 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="p-2 bg-surface-1 rounded-lg border border-line/50 shadow-soft">
                          {contact.icon}
                        </div>
                        <span className={`px-2.5 py-1 font-bold text-xs rounded-full ${contact.badgeColor}`}>
                          {contact.number}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-ink-base text-sm leading-snug">{contact.title}</h4>
                        <p className="text-xs text-ink-muted line-clamp-2 mt-0.5">{contact.desc}</p>
                      </div>
                    </div>

                    <a
                      href={`tel:${contact.number.split("/")[0].trim()}`}
                      className="w-full py-2 bg-danger-500 hover:bg-danger-600 text-white font-bold text-xs rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Phone size={13} /> Dial {contact.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 3: First Aid Guide ─────────────────────────────────── */}
          {activeSection === "firstaid" && (
            <div className="p-4 sm:p-5 space-y-4">

              {/* Section header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-bold text-ink-base flex items-center gap-2 text-base">
                    <ShieldAlert size={18} className="text-warning-500" />
                    Immediate First Aid & Precautions
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Actionable protocols to follow while the ambulance is en route.
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 text-xs font-semibold rounded-full flex-shrink-0">
                  Clinical Protocol
                </span>
              </div>

              {/* Protocol selector — segmented pill row */}
              <div className="flex flex-wrap gap-2">
                {guides.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGuideId(g.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                      selectedGuideId === g.id
                        ? "bg-brand-gradient text-white shadow-glow"
                        : "bg-surface-2 text-ink-muted hover:text-ink-base hover:bg-surface-3 border border-line/40"
                    }`}
                  >
                    {g.icon}
                    {g.title}
                  </button>
                ))}
              </div>

              {/* Active protocol card */}
              <div className="rounded-xl bg-surface-2/50 border border-line/50 overflow-hidden">
                {/* Protocol header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border-b border-line/40">
                  <div>
                    <div className="flex items-center gap-2">
                      {currentGuide.icon}
                      <h4 className="font-bold text-ink-base text-sm">{currentGuide.title}</h4>
                    </div>
                    <p className="text-xs text-ink-muted mt-0.5 pl-5">{currentGuide.category}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full flex-shrink-0 ${
                    currentGuide.urgency === "CRITICAL EMERGENCY"
                      ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                  }`}>
                    {currentGuide.urgency}
                  </span>
                </div>

                {/* Two-column content */}
                <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-line/40">
                  {/* Required Actions */}
                  <div className="p-4 space-y-2">
                    <h5 className="font-semibold text-xs text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-success-500" />
                      Required Actions
                    </h5>
                    <ol className="space-y-2">
                      {currentGuide.steps.map((step, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-ink-base bg-surface-1 p-3 rounded-xl border border-line/50 shadow-soft"
                        >
                          <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Critical Warnings */}
                  <div className="p-4 space-y-2">
                    <h5 className="font-semibold text-xs text-danger-500 uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle size={13} className="text-danger-500" />
                      Critical Warnings
                    </h5>
                    <ul className="space-y-2">
                      {currentGuide.doNot.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-ink-base bg-red-50 dark:bg-red-500/10 p-3 rounded-xl border border-red-200/60 dark:border-red-500/25"
                        >
                          <span className="text-danger-500 font-bold flex-shrink-0 mt-0.5">✕</span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
