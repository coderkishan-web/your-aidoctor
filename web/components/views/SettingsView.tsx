"use client";

import { useState } from "react";
import {
  Globe,
  Volume2,
  Type,
  Moon,
  Phone,
  Shield,
  ChevronDown,
  Activity,
  Mic,
  Sparkles,
  Zap,
} from "lucide-react";
import { Toggle } from "../chat/Toggle";
import {
  t,
  LANGUAGE_NAMES,
  getCountryName,
  type SupportedLanguage,
} from "@/lib/i18n";
import type { TextSize } from "@/lib/hooks/useSettings";

interface SettingsViewProps {
  language: SupportedLanguage;
  setLanguage: (v: SupportedLanguage) => void;
  country: string;
  setCountry: (v: string) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (v: boolean) => void;
  readAloud: boolean;
  setReadAloud: (v: boolean) => void;
  textSize: TextSize;
  setTextSize: (v: TextSize) => void;
  simpleLanguage: boolean;
  setSimpleLanguage: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  emergencyNumber: string;
}

const COUNTRIES = [
  "US", "CA", "GB", "AU", "NZ", "IT", "DE", "FR", "ES", "PT", "NL", "PL",
  "IN", "CN", "JP", "KR", "BR", "MX", "AR", "CO", "ZA", "NG", "KE", "TZ",
  "EG", "MA", "TR", "RU", "SA", "AE", "PK", "BD", "VN", "TH", "PH", "ID", "MY",
];

export function SettingsView({
  language,
  setLanguage,
  country,
  setCountry,
  voiceEnabled,
  setVoiceEnabled,
  readAloud,
  setReadAloud,
  textSize,
  setTextSize,
  simpleLanguage,
  setSimpleLanguage,
  darkMode,
  setDarkMode,
  emergencyNumber,
}: SettingsViewProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    latencyMs?: number;
    answer?: string;
    error?: string;
  } | null>(null);

  // Test backend connection by sending a quick probe to the backend
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const started = Date.now();
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Reply with exactly: OK" }],
          language,
          countryCode: country,
        }),
      });
      const latencyMs = Date.now() - started;
      if (!response.ok) {
        setTestResult({ success: false, latencyMs, error: `HTTP ${response.status}` });
        return;
      }
      const text = await response.text();
      setTestResult({
        success: true,
        latencyMs,
        answer: (text || "").slice(0, 200),
      });
    } catch (error: any) {
      const latencyMs = Date.now() - started;
      setTestResult({
        success: false,
        latencyMs,
        error: error?.message || "Network error",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-mobile-nav scroll-touch">
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold text-ink-base mb-6">
          {t("settings_title", language)}
        </h2>

        {/* ============================================ */}
        {/* AI MODEL INFO — read-only, no user config    */}
        {/* ============================================ */}
        <SettingsSection icon={Sparkles} title="AI Model">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-brand-500/5 border border-brand-500/20 rounded-xl">
              <Sparkles size={18} className="text-brand-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-ink-base">Google Gemini API</div>
                <p className="text-xs text-ink-muted mt-0.5">
                  Powered by Google Gemini — handled securely on the YourAIDoctor backend. No configuration needed.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success-500/10 text-success-600 shrink-0">
                ACTIVE
              </span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-surface-0 border border-line/60 rounded-xl">
              <Zap size={14} className="text-ink-muted mt-0.5 flex-shrink-0" />
              <p className="text-xs text-ink-muted">
                AI responses are generated server-side using our medical reasoning pipeline with 3,100+ clinical records. Your chats are private and never shared.
              </p>
            </div>

            {/* Backend connection test */}
            <div className="pt-2 border-t border-line/60">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <div className="text-sm font-semibold text-ink-base">Test connection</div>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Verify that the AI backend is reachable and responding.
                  </p>
                </div>
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/40 text-white text-sm font-semibold transition-colors disabled:cursor-not-allowed shrink-0"
                >
                  {isTesting ? (
                    <>
                      <Activity size={14} className="animate-pulse" />
                      Testing…
                    </>
                  ) : (
                    <>
                      <Activity size={14} />
                      Test
                    </>
                  )}
                </button>
              </div>

              {testResult && (
                <div
                  className={`rounded-xl border p-3 text-xs space-y-1.5 ${
                    testResult.success
                      ? "bg-success-500/5 border-success-500/40 text-success-700 dark:text-success-300"
                      : "bg-danger-500/5 border-danger-500/40 text-danger-700 dark:text-danger-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {testResult.success ? "✓ Connected" : "✗ Failed"}
                    {testResult.latencyMs != null && (
                      <span className="font-mono opacity-75">
                        · {testResult.latencyMs} ms
                      </span>
                    )}
                  </div>
                  {testResult.success && testResult.answer && (
                    <div className="opacity-80 pt-1 border-t border-current/20">
                      Response:{" "}
                      <span className="font-mono">
                        {testResult.answer.replace(/\n+/g, " ").slice(0, 120)}
                      </span>
                    </div>
                  )}
                  {!testResult.success && (
                    <div className="opacity-90 break-words">
                      {testResult.error || "Unknown error"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </SettingsSection>

        {/* ============================================ */}
        {/* LANGUAGE & REGION                            */}
        {/* ============================================ */}
        <SettingsSection icon={Globe} title={t("settings_language", language)}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                {t("settings_language", language)}
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="w-full appearance-none bg-surface-0 border border-line/60 text-ink-base rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-base"
                >
                  {(Object.entries(LANGUAGE_NAMES) as [SupportedLanguage, string][]).map(
                    ([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    )
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                {t("settings_country", language)}
              </label>
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full appearance-none bg-surface-0 border border-line/60 text-ink-base rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-base"
                >
                  {COUNTRIES.map((code) => (
                    <option key={code} value={code}>{getCountryName(code)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* ============================================ */}
        {/* VOICE & ACCESSIBILITY                        */}
        {/* ============================================ */}
        <SettingsSection icon={Mic} title={t("settings_voice", language)}>
          <Toggle label={t("settings_voice", language)} enabled={voiceEnabled} setEnabled={setVoiceEnabled} />
          <Toggle label={t("settings_read_aloud", language)} enabled={readAloud} setEnabled={setReadAloud} />
        </SettingsSection>

        {/* ============================================ */}
        {/* DISPLAY                                      */}
        {/* ============================================ */}
        <SettingsSection icon={Type} title={t("settings_text_size", language)}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                {t("settings_text_size", language)}
              </label>
              <div className="flex gap-2">
                {(["small", "medium", "large"] as TextSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setTextSize(size)}
                    className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all border-2 ${
                      textSize === size
                        ? "bg-brand-500/5 border-brand-500 text-brand-600"
                        : "bg-surface-0 border-line/60 text-ink-muted hover:border-brand-500/40"
                    }`}
                  >
                    {t(`settings_text_${size}`, language)}
                  </button>
                ))}
              </div>
            </div>
            <Toggle label={t("settings_dark_mode", language)} enabled={darkMode} setEnabled={setDarkMode} />
            <Toggle
              label={t("settings_simple_language", language)}
              description={t("settings_simple_language_desc", language)}
              enabled={simpleLanguage}
              setEnabled={setSimpleLanguage}
            />
          </div>
        </SettingsSection>

        {/* ============================================ */}
        {/* EMERGENCY & PRIVACY                          */}
        {/* ============================================ */}
        <SettingsSection icon={Phone} title={t("settings_emergency_number", language)}>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-ink-base font-medium">
              {t("settings_emergency_number", language)}
            </span>
            <a
              href={`tel:${emergencyNumber}`}
              className="text-lg font-black text-danger-500 hover:underline"
            >
              {emergencyNumber}
            </a>
          </div>
        </SettingsSection>

        <SettingsSection icon={Shield} title={t("settings_privacy", language)}>
          <div className="flex items-center gap-2 py-2">
            <Shield size={16} className="text-success-500 flex-shrink-0" />
            <span className="text-sm text-ink-base font-medium">
              {t("settings_privacy_desc", language)}
            </span>
          </div>
        </SettingsSection>

        <div className="h-8" />
      </div>
    </div>
  );
}

/* ============================================================
 * Sub-components
 * ============================================================ */

function SettingsSection({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-1 rounded-2xl shadow-soft border border-line/40 overflow-hidden mb-4">
      <div className="p-4 bg-surface-2/50 border-b border-line/40 flex items-center gap-2">
        <Icon size={18} className="text-brand-500" />
        <h3 className="font-semibold text-ink-base">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
