import { useState } from 'react';
import { SeoHead } from '../components/SeoHead';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { Copy, Check, Sparkles, MapPin, UserSquare2, Phone, Hash, Globe, Loader2, FileCode2, Database, Shield } from 'lucide-react';

const LOCALE_NAMES: Record<string, string> = {
  af_ZA: "Afrikaans (South Africa)", ar: "Arabic", az: "Azerbaijani", bn_BD: "Bengali (Bangladesh)",
  cs_CZ: "Czech (Czechia)", cy: "Welsh", da: "Danish", de: "German", de_AT: "German (Austria)",
  de_CH: "German (Switzerland)", dv: "Maldivian", el: "Greek", en: "English", en_AU: "English (Australia)",
  en_US: "English (United States)", en_GB: "English (Great Britain)", en_CA: "English (Canada)",
  es: "Spanish", es_MX: "Spanish (Mexico)", fr: "French", fr_CA: "French (Canada)",
  it: "Italian", ja: "Japanese", ko: "Korean", nl: "Dutch", pt_BR: "Portuguese (Brazil)",
  ru: "Russian", zh_CN: "Chinese (China)"
  // Truncated list for cleaner UI, full list preserved in previous iterations
};

type Identity = {
  fullName: string; phone: string; idNumber: string; street: string;
  city: string; state: string; zip: string;
};

const FAQ_DATA = [
  { question: "What is a fake address generator used for?", answer: "A mock identity or fake address generator is utilized by developers, QA testers, and designers to populate databases, prototype applications, and perform form validation without exposing real PII (Personally Identifiable Information)." },
  { question: "Are these identities real people?", answer: "No. The data is entirely synthesized algorithmically using common regional name patterns and realistic (but dummy) street formats. It prevents privacy leaks in development environments." },
  { question: "How many regional locales are supported?", answer: "Our engine supports over 70 global locales. It generates culturally accurate names, appropriate state/province abbreviations, and correct postal code formats for regions ranging from the United States to Japan." }
];

export default function FakeAddress() {
  const [selectedLocale, setSelectedLocale] = useState('en_US');
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { copiedText, copy } = useCopyToClipboard();

  const generateIdentity = async () => {
    setIsGenerating(true);
    try {
      const { allFakers } = await import('@faker-js/faker');
      const faker = allFakers[selectedLocale as keyof typeof allFakers] || allFakers['en_US'];

      const safeCall = (fn: () => string, fallback: string = 'N/A') => {
        try { const res = fn(); return res === null || res === undefined || res.trim() === '' ? fallback : res; } 
        catch { return fallback; }
      };

      setIdentity({
        fullName: safeCall(() => faker.person.fullName()),
        phone: safeCall(() => faker.phone.number()),
        idNumber: safeCall(() => faker.string.alphanumeric({ length: 10, casing: 'upper' })),
        street: safeCall(() => faker.location.streetAddress()),
        city: safeCall(() => faker.location.city()),
        state: safeCall(() => faker.location.state()),
        zip: safeCall(() => faker.location.zipCode()),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formattedOutput = identity ? 
    `${identity.fullName}\n${identity.street}\n${identity.city}, ${identity.state !== 'N/A' ? identity.state + ' ' : ''}${identity.zip}\nPhone: ${identity.phone}\nID Vector: ${identity.idNumber}` : '';

  return (
    <div className="max-w-4xl mx-auto md:py-8 animation-fade-in">
      <SeoHead 
        title="Fake Address Generator | Mock Identity & Dummy Data API" 
        description="Generate localized fake addresses, random names, and dummy profiles for over 70 global regions. Best mock identity generator for QA testing and database seeding." 
        keywords="fake address generator, random address generator, mock identity generator, dummy data generator, test user profile generator, random name generator"
        isTool={true}
        faqData={FAQ_DATA}
      />
      
      {/* Header */}
      <div className="mb-8 md:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-[11px] font-bold uppercase tracking-widest mb-4">
          <UserSquare2 className="size-3.5 fill-current" /> Identity Engine
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Global Identity Generator</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">Instantly generate structurally valid identity vectors and localized addresses across global regions for software testing.</p>
      </div>

      {/* Main Tool UI */}
      <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/20 dark:shadow-black/20 p-6 md:p-10 mb-16">
        
        <div className="mb-8">
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
            <Globe className="size-4" /> Localization Profile
          </label>
          <div className="relative">
            <select value={selectedLocale} onChange={(e) => setSelectedLocale(e.target.value)} className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-4 pr-10 py-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer shadow-sm appearance-none">
              {Object.entries(LOCALE_NAMES).sort((a, b) => a[1].localeCompare(b[1])).map(([code, name]) => (
                <option key={code} value={code}>{name} ({code})</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"><Globe className="size-5" /></div>
          </div>
        </div>

        {identity ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
            <div className="space-y-4">
              <div><label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-1"><UserSquare2 className="size-3.5" /> Full Name</label><div className="text-lg font-medium text-zinc-900 dark:text-white">{identity.fullName}</div></div>
              <div><label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-1"><Phone className="size-3.5" /> Phone Number</label><div className="text-lg font-medium text-zinc-900 dark:text-white font-mono">{identity.phone}</div></div>
              <div><label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-1"><Hash className="size-3.5" /> ID Vector</label><div className="text-lg font-medium text-zinc-900 dark:text-white font-mono">{identity.idNumber}</div></div>
            </div>
            <div className="space-y-4 md:border-l border-zinc-200 dark:border-zinc-800 md:pl-6">
              <div><label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase mb-1"><MapPin className="size-3.5" /> Street Address</label><div className="text-lg font-medium text-zinc-900 dark:text-white">{identity.street}</div></div>
              <div><label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">City & State</label><div className="text-lg font-medium text-zinc-900 dark:text-white">{identity.city}{identity.state !== 'N/A' ? `, ${identity.state}` : ''}</div></div>
              <div><label className="text-xs font-bold text-zinc-400 uppercase mb-1 block">Postal Code</label><div className="text-lg font-medium text-zinc-900 dark:text-white font-mono">{identity.zip}</div></div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl border border-zinc-200 dark:border-zinc-800 border-dashed mb-8 transition-colors">
            <UserSquare2 className="size-16 text-zinc-300 dark:text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-medium">Click generate to create a localized identity vector.</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={generateIdentity} disabled={isGenerating} className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-base font-bold rounded-2xl hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-70">
            {isGenerating ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
            {isGenerating ? 'Synthesizing...' : 'Generate Vector'}
          </button>
          <button onClick={() => copy(formattedOutput)} disabled={!identity || isGenerating} className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${copiedText ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'}`}>
            {copiedText ? <Check className="size-5" /> : <Copy className="size-5" />}
            {copiedText ? 'Copied Data' : 'Copy All'}
          </button>
        </div>
      </div>

      {/* Deep SEO Content Section */}
      <article className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 md:p-12 shadow-sm">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Why Use a Random Identity Generator?</h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="space-y-3">
            <div className="size-10 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500 border border-orange-500/20 mb-4"><Database className="size-5" /></div>
            <h3 className="font-bold text-lg">Database Seeding</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Instantly populate pre-production databases with thousands of records. Ensures that pagination, sorting, and search algorithms can be tested comprehensively before launch.</p>
          </div>
          <div className="space-y-3">
            <div className="size-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 border border-blue-500/20 mb-4"><FileCode2 className="size-5" /></div>
            <h3 className="font-bold text-lg">Form Validation</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">QA teams require accurately formatted edge-case addresses to stress-test UI inputs. Generate complex international postal codes and regional phone formatting.</p>
          </div>
          <div className="space-y-3">
            <div className="size-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 border border-emerald-500/20 mb-4"><Shield className="size-5" /></div>
            <h3 className="font-bold text-lg">Maintain Privacy</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Prevent data leaks and GDPR violations. By using synthesized mock identities, you guarantee that no real PII (Personally Identifiable Information) ever enters your staging environments.</p>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-10">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2"><Globe className="size-6 text-orange-500" /> Frequently Asked Questions</h2>
          <div className="grid gap-6">
            {FAQ_DATA.map((faq, i) => (
              <div key={i} className="bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-zinc-100">{faq.question}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </article>

    </div>
  );
}
