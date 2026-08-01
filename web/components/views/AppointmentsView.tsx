"use client";

import { useState } from "react";
import {
  Calendar,
  Plus,
  X,
  Check,
  MapPin,
  User2,
  Trash2,
  ChevronDown,
  Clock,
  Stethoscope,
  Filter,
  CheckCircle,
  Star,
  Award,
  Sparkles
} from "lucide-react";
import {
  APPOINTMENT_TYPE_META,
  todayISO,
  type Appointment,
  type AppointmentType,
  type AppointmentStatus,
} from "@/lib/health-store";
import { t, type SupportedLanguage } from "@/lib/i18n";

interface AppointmentsViewProps {
  appointments: Appointment[];
  onAdd: (appt: Omit<Appointment, "id">) => void;
  onEdit: (id: string, patch: Partial<Appointment>) => void;
  onDelete: (id: string) => void;
  language: SupportedLanguage;
}

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  degree: string;
  experience: string;
  about: string;
  fees: number;
  image: string;
  available: boolean;
}

const PRESET_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Richard James",
    speciality: "General physician",
    degree: "MBBS",
    experience: "4 Years",
    about: "Dr. James has a commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
    fees: 50,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    available: true,
  },
  {
    id: "doc-2",
    name: "Dr. Emily Larson",
    speciality: "Gynecologist",
    degree: "MBBS, MD",
    experience: "3 Years",
    about: "Dr. Larson specializes in women's reproductive health, prenatal care, and modern gynecological procedures with a patient-first empathetic approach.",
    fees: 60,
    image: "https://images.unsplash.com/photo-1594824813566-88855ce78c0b?auto=format&fit=crop&q=80&w=400",
    available: true,
  },
  {
    id: "doc-3",
    name: "Dr. Alison Patel",
    speciality: "Dermatologist",
    degree: "MBBS, DDVL",
    experience: "5 Years",
    about: "Expert in clinical dermatology, skin barrier restoration, aesthetic treatments, and management of chronic skin conditions.",
    fees: 70,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    available: true,
  },
  {
    id: "doc-4",
    name: "Dr. Anne Christopher",
    speciality: "Pediatricians",
    degree: "MBBS, DCH",
    experience: "4 Years",
    about: "Dedicated pediatrician focused on infant growth monitoring, childhood immunization, and pediatric wellness care.",
    fees: 40,
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
    available: true,
  },
  {
    id: "doc-5",
    name: "Dr. Jennifer Garcia",
    speciality: "Neurologist",
    degree: "MBBS, DM Neurology",
    experience: "6 Years",
    about: "Senior neurologist skilled in treating migraines, nerve disorders, memory issues, and neuro-rehabilitation.",
    fees: 80,
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400",
    available: true,
  },
  {
    id: "doc-6",
    name: "Dr. Andrew Williams",
    speciality: "Gastroenterologist",
    degree: "MBBS, MD Gastro",
    experience: "5 Years",
    about: "Specialized in digestive health, endoscopy, liver disorders, and nutritional wellness guidance.",
    fees: 65,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
    available: true,
  },
];

const SPECIALITIES = [
  "All Specialities",
  "General physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist",
];

export function AppointmentsView({
  appointments,
  onAdd,
  onEdit,
  onDelete,
  language,
}: AppointmentsViewProps) {
  const [activeTab, setActiveTab] = useState<"doctors" | "my-appointments">("doctors");
  const [selectedSpeciality, setSelectedSpeciality] = useState("All Specialities");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Booking slot state
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("10:00 AM");
  const [bookingNotes, setBookingNotes] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

  const today = todayISO();

  // Generate 7 upcoming days
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const upcomingDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dayName: daysOfWeek[d.getDay()],
      dateNum: d.getDate(),
      isoDate: d.toISOString().split("T")[0],
    };
  });

  const availableSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM",
    "11:30 AM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM"
  ];

  const filteredDoctors =
    selectedSpeciality === "All Specialities"
      ? PRESET_DOCTORS
      : PRESET_DOCTORS.filter((doc) => doc.speciality === selectedSpeciality);

  const handleBookAppointment = () => {
    if (!selectedDoctor) return;
    const targetDate = upcomingDays[selectedDayIndex].isoDate;

    onAdd({
      title: `${selectedDoctor.name} (${selectedDoctor.speciality})`,
      type: "doctor",
      date: targetDate,
      time: selectedTimeSlot,
      doctor: selectedDoctor.name,
      location: "Prescripto Specialist Clinic",
      notes: bookingNotes || `Consultation Fee: $${selectedDoctor.fees}`,
      status: targetDate >= today ? "upcoming" : "completed",
    });

    setSelectedDoctor(null);
    setBookingNotes("");
    setActiveTab("my-appointments");
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const da = `${a.date}T${a.time}`;
    const db = `${b.date}T${b.time}`;
    return db.localeCompare(da);
  });

  const filteredAppointments =
    filter === "all"
      ? sortedAppointments
      : sortedAppointments.filter((a) =>
          filter === "upcoming" ? a.status === "upcoming" : a.status === "completed"
        );

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-mobile-nav scroll-touch bg-slate-50/50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Tabs Header */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-600 text-white rounded-xl">
                <Stethoscope size={20} />
              </span>
              <h1 className="text-2xl font-extrabold text-slate-800">
                Doctor Appointments
              </h1>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                Prescripto UI
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Find top specialist doctors, choose available slots, and manage your medical consultations.
            </p>
          </div>

          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("doctors")}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === "doctors"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Browse Doctors
            </button>
            <button
              onClick={() => setActiveTab("my-appointments")}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === "my-appointments"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              My Appointments
              {appointments.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-blue-600 font-extrabold text-[10px] flex items-center justify-center">
                  {appointments.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: BROWSE DOCTORS & BOOK SLOT */}
        {activeTab === "doctors" && (
          <div className="space-y-6">
            {/* Speciality Filter Pills */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Filter size={14} className="text-blue-600" /> Filter by Medical Speciality
              </div>
              <div className="flex flex-wrap gap-2">
                {SPECIALITIES.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpeciality(spec)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      selectedSpeciality === spec
                        ? "bg-blue-50 text-blue-700 border-2 border-blue-600"
                        : "bg-slate-100 text-slate-600 border border-transparent hover:bg-slate-200"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctors Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Image Header */}
                    <div className="h-48 bg-blue-50 relative overflow-hidden">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 px-3 py-1 bg-emerald-500 text-white font-extrabold text-[10px] rounded-full flex items-center gap-1 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Available
                      </div>
                    </div>

                    {/* Info Body */}
                    <div className="p-5 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">{doc.name}</h3>
                          <p className="text-xs font-medium text-blue-600">{doc.speciality}</p>
                        </div>
                        <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          ${doc.fees}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Award size={13} className="text-amber-500" /> {doc.degree}
                        </span>
                        <span>•</span>
                        <span>{doc.experience} Exp.</span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 pt-1">{doc.about}</p>
                    </div>
                  </div>

                  {/* Book Button */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => setSelectedDoctor(doc)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-200 transition flex items-center justify-center gap-2"
                    >
                      <Calendar size={14} /> Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MY APPOINTMENTS */}
        {activeTab === "my-appointments" && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Your Booked Appointments</h2>
                <p className="text-xs text-slate-500">Track and manage upcoming doctor consultations</p>
              </div>

              {/* Status Filter */}
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(["all", "upcoming", "completed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize ${
                      filter === f
                        ? "bg-white text-slate-800 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar size={28} />
                </div>
                <h3 className="font-bold text-slate-800 text-base">No appointments booked yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse through our top specialist doctors and pick a suitable time slot for your consultation.
                </p>
                <button
                  onClick={() => setActiveTab("doctors")}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-200 transition"
                >
                  Find a Doctor
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-200 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xs"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                        👨‍⚕️
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 text-sm">{appt.title}</h3>
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase ${
                              appt.status === "upcoming"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {appt.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar size={13} className="text-blue-600" />
                            {appt.date}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Clock size={13} className="text-blue-600" />
                            {appt.time}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin size={13} className="text-blue-600" />
                            {appt.location || "Prescripto Clinic"}
                          </span>
                        </div>

                        {appt.notes && (
                          <p className="text-xs text-slate-500 pt-1 font-mono">{appt.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
                      {appt.status === "upcoming" && (
                        <button
                          onClick={() => onEdit(appt.id, { status: "completed" })}
                          className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-xl transition flex items-center gap-1"
                        >
                          <Check size={14} /> Mark Completed
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(appt.id)}
                        className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs rounded-xl transition flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOOKING MODAL (PRESCRIPTO SLOT SELECTOR) */}
        {selectedDoctor && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    className="w-12 h-12 rounded-2xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{selectedDoctor.name}</h3>
                    <p className="text-xs font-semibold text-blue-600">{selectedDoctor.speciality}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Day Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Date
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {upcomingDays.map((d, idx) => (
                    <button
                      key={d.isoDate}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`flex-shrink-0 w-14 py-3 rounded-2xl font-bold text-center transition ${
                        selectedDayIndex === idx
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <p className="text-[10px] opacity-80 uppercase">{d.dayName}</p>
                      <p className="text-base font-extrabold">{d.dateNum}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Time Slot
                </label>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                  {availableSlots.map((timeSlot) => (
                    <button
                      key={timeSlot}
                      onClick={() => setSelectedTimeSlot(timeSlot)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                        selectedTimeSlot === timeSlot
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {timeSlot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Reason / Symptoms (Optional)
                </label>
                <input
                  type="text"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="e.g. Mild fever, routine checkup..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Confirm Booking */}
              <div className="pt-2">
                <button
                  onClick={handleBookAppointment}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Confirm Appointment (${selectedDoctor.fees})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
