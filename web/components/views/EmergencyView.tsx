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
  Users
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
  urgency: string;
  icon: React.ReactNode;
  color: string;
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

export function EmergencyView({ language, emergencyNumber }: EmergencyViewProps) {
  const [selectedGuideId, setSelectedGuideId] = useState<string>("cpr");
  const [contactFilter, setContactFilter] = useState<"all" | "medical" | "specialized" | "safety">("all");

  const emergencyContacts: EmergencyContact[] = [
    {
      title: "National Emergency Ambulance",
      number: "108",
      desc: "Immediate 24x7 Medical Response & Basic/Advanced Life Support Ambulance",
      category: "medical",
      icon: <PhoneCall className="text-red-600" size={20} />,
      badgeColor: "bg-red-100 text-red-700",
    },
    {
      title: "All-in-One National Emergency Hotline",
      number: "112",
      desc: "Unified Single Emergency Line (Police, Fire, Ambulance & Rescue)",
      category: "medical",
      icon: <ShieldAlert className="text-red-600" size={20} />,
      badgeColor: "bg-red-100 text-red-700",
    },
    {
      title: "Maternal & Child Health Ambulance",
      number: "102",
      desc: "Free Ambulance Service for Pregnant Women, Newborns & Pediatric Emergencies",
      category: "medical",
      icon: <Heart className="text-rose-600" size={20} />,
      badgeColor: "bg-rose-100 text-rose-700",
    },
    {
      title: "National Poison Control Center",
      number: "1800-116-117",
      desc: "24x7 Toxic Exposure, Chemical Ingestion & Poisoning Medical Guidance",
      category: "specialized",
      icon: <AlertOctagon className="text-amber-600" size={20} />,
      badgeColor: "bg-amber-100 text-amber-700",
    },
    {
      title: "Tele-MANAS Mental Health Line",
      number: "14416",
      desc: "National Suicide Prevention, Crisis Counseling & Psychological First Aid (1800-891-4416)",
      category: "specialized",
      icon: <Smile className="text-purple-600" size={20} />,
      badgeColor: "bg-purple-100 text-purple-700",
    },
    {
      title: "National Health Emergency Helpline",
      number: "1075",
      desc: "Health Ministry Outbreak, Epidemic & General Medical Consultation Line",
      category: "specialized",
      icon: <Stethoscope className="text-blue-600" size={20} />,
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      title: "Police Response Emergency",
      number: "100",
      desc: "Immediate Police Assistance, Crime Reporting & Public Safety Dispatch",
      category: "safety",
      icon: <Shield className="text-blue-700" size={20} />,
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      title: "Fire & Rescue Operations",
      number: "101",
      desc: "Fire Emergency, Hazmat Leaks & Building Evacuation Rescue Control Room",
      category: "safety",
      icon: <Flame className="text-amber-600" size={20} />,
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      title: "Women Emergency Helpline",
      number: "1091",
      desc: "24x7 Emergency Assistance & Protection Hotline for Women",
      category: "safety",
      icon: <Users className="text-purple-700" size={20} />,
      badgeColor: "bg-purple-100 text-purple-800",
    },
    {
      title: "Childline Protection Helpline",
      number: "1098",
      desc: "Free 24x7 Emergency Phone Outreach Service for Children in Distress",
      category: "safety",
      icon: <LifeBuoy className="text-emerald-700" size={20} />,
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      title: "National Disaster Relief Control Room",
      number: "1070",
      desc: "Disaster Emergency Management, Flood & Extreme Weather Relief Line",
      category: "safety",
      icon: <AlertTriangle className="text-orange-600" size={20} />,
      badgeColor: "bg-orange-100 text-orange-800",
    },
  ];

  const filteredContacts =
    contactFilter === "all"
      ? emergencyContacts
      : emergencyContacts.filter((c) => c.category === contactFilter);

  const guides: FirstAidGuide[] = [
    {
      id: "cpr",
      title: "CPR (Cardiopulmonary Resuscitation)",
      category: "Heart & Resuscitation",
      urgency: "CRITICAL EMERGENCY",
      icon: <Heart size={20} className="text-red-600" />,
      color: "red",
      steps: [
        "Call emergency medical services immediately (108 / 112 / 911).",
        "Place person on back on a firm, flat surface.",
        "Place hands in center of chest and push down 2 inches deep at 100-120 compressions per minute.",
        "Continue compressions without stopping until emergency response arrives.",
      ],
      doNot: [
        "Do NOT interrupt compressions for more than 10 seconds.",
        "Do NOT perform CPR if person is conscious and breathing normally.",
      ],
    },
    {
      id: "stroke",
      title: "Stroke (FAST Protocol)",
      category: "Neurological",
      urgency: "CRITICAL EMERGENCY",
      icon: <Brain size={20} className="text-purple-600" />,
      color: "purple",
      steps: [
        "F - Face Drooping: Ask person to smile and check for face drooping.",
        "A - Arm Weakness: Ask person to raise both arms. Does one drift downward?",
        "S - Speech Difficulty: Ask person to repeat a simple sentence. Is speech slurred?",
        "T - Time to call 108 / 112 immediately! Note exact time symptoms began.",
      ],
      doNot: [
        "Do NOT give food, drinks, or medications (especially aspirin).",
        "Do NOT let the person sleep or drive themselves to the hospital.",
      ],
    },
    {
      id: "burns",
      title: "Thermal & Heat Burns",
      category: "Trauma & Skin",
      urgency: "HIGH EMERGENCY",
      icon: <AlertTriangle size={20} className="text-amber-600" />,
      color: "amber",
      steps: [
        "Cool burn under cool running tap water for 10-20 minutes immediately.",
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
      title: "Choking (Heimlich Maneuver)",
      category: "Airway",
      urgency: "CRITICAL EMERGENCY",
      icon: <Wind size={20} className="text-blue-600" />,
      color: "blue",
      steps: [
        "Stand behind person and wrap arms around waist.",
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
      title: "Severe Bleeding Control",
      category: "Trauma",
      urgency: "HIGH EMERGENCY",
      icon: <Droplets size={20} className="text-rose-600" />,
      color: "rose",
      steps: [
        "Apply direct firm pressure to wound using a clean cloth or bandage.",
        "Keep pressure held continuously for at least 10 minutes.",
        "Elevate injured limb above heart level if possible.",
      ],
      doNot: [
        "Do NOT remove embedded foreign objects from deep wounds.",
        "Do NOT remove soaked bandages — apply new layers directly over them.",
      ],
    },
  ];

  const currentGuide = guides.find((g) => g.id === selectedGuideId) || guides[0];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-mobile-nav scroll-touch bg-slate-50/50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Primary SOS Action Banner */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-red-200 flex-shrink-0">
              🚑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-800">Emergency Center & Helplines</h1>
                <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                  Prescripto Care
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Real-time GPS emergency hospital locator, turn-by-turn navigation, and verified national emergency hotlines.
              </p>
            </div>
          </div>

          {/* Primary Quick SOS Action Buttons */}
          <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
            <a
              href="tel:108"
              className="flex-1 md:flex-initial px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-red-200 transition flex items-center justify-center gap-2"
            >
              <Phone size={16} /> SOS Ambulance (108)
            </a>

            <a
              href="tel:112"
              className="flex-1 md:flex-initial px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Phone size={16} /> National Line (112)
            </a>

            <a
              href="tel:102"
              className="flex-1 md:flex-initial px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-rose-200 transition flex items-center justify-center gap-2"
            >
              <Phone size={16} /> Maternal & Child (102)
            </a>
          </div>
        </div>

        {/* Live GPS Hospital & Pharmacy Navigation Map */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
          <EmergencyMap />
        </div>

        {/* PRESCRIPTO COMPLETE EMERGENCY NUMBERS DIRECTORY */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <PhoneCall size={20} className="text-red-600" />
                All National Emergency Numbers & Helplines
              </h2>
              <p className="text-xs text-slate-500">
                Verified emergency phone numbers from Prescripto for instant toll-free dialing.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold w-full sm:w-auto">
              {(["all", "medical", "specialized", "safety"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setContactFilter(cat)}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg capitalize transition ${
                    contactFilter === cat
                      ? "bg-white text-slate-800 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-red-200 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      {contact.icon}
                    </div>
                    <span className={`px-2.5 py-1 font-extrabold text-xs rounded-full ${contact.badgeColor}`}>
                      {contact.number}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{contact.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{contact.desc}</p>
                  </div>
                </div>

                <a
                  href={`tel:${contact.number.split("/")[0].trim()}`}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Phone size={14} /> Dial {contact.number} (Toll-Free)
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* First Aid & Precaution Knowledge Base */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShieldAlert size={20} className="text-amber-600" />
                Immediate First Aid & Precautions
              </h2>
              <p className="text-xs text-slate-500">
                Actionable medical emergency precautions while ambulance is en route.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full">
              Standard Clinical Protocol
            </span>
          </div>

          {/* Protocol Selection Tabs */}
          <div className="flex flex-wrap gap-2">
            {guides.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGuideId(g.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  selectedGuideId === g.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {g.icon}
                {g.title.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Active Protocol Card */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-200/60">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  {currentGuide.icon}
                  {currentGuide.title}
                </h3>
                <p className="text-xs text-slate-500">{currentGuide.category}</p>
              </div>

              <span className="px-3 py-1 bg-red-100 text-red-700 font-extrabold text-xs rounded-full">
                {currentGuide.urgency}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-2">
              {/* Immediate Steps */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Immediate Required Actions
                </h4>
                <ol className="space-y-2">
                  {currentGuide.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Critical Precautions / DO NOT */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle size={16} className="text-red-600" />
                  Critical Warnings & "DO NOT"
                </h4>
                <ul className="space-y-2">
                  {currentGuide.doNot.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-red-800 bg-red-50 p-3 rounded-xl border border-red-200/60 shadow-2xs">
                      <span className="text-red-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
