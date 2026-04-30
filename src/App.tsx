/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileJson, 
  Music, 
  Type, 
  Hash, 
  Activity, 
  Clock, 
  FileText,
  Upload,
  ChevronDown,
  ChevronUp,
  Search,
  Copy,
  Check,
  Tag
} from 'lucide-react';
import { DatasetJson, MusicSample } from './types';

export default function App() {
  const [dataset, setDataset] = useState<DatasetJson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copyNotification, setCopyNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notifyCopy = (text: string) => {
    setCopyNotification(`Copied: ${text.length > 30 ? text.substring(0, 30) + '...' : text}`);
    setTimeout(() => setCopyNotification(null), 2000);
  };

  const handleJsonInput = (text: string) => {
    try {
      const parsed = JSON.parse(text) as DatasetJson;
      if (!parsed.samples || !Array.isArray(parsed.samples)) {
        throw new Error('Invalid format: Could not find "samples" array.');
      }
      setDataset(parsed);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON format');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleJsonInput(content);
    };
    reader.readAsText(file);
  };

  const filteredSamples = dataset?.samples.filter(sample => 
    sample.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sample.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sample.genre.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-[#E2E8F0]">
      {/* Copy Notification Toast */}
      <AnimatePresence>
        {copyNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-[#1A1A1A] text-white rounded-full shadow-2xl flex items-center gap-3 font-medium text-sm"
          >
            <Check className="w-4 h-4 text-green-400" />
            {copyNotification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1A1A1A] rounded-lg">
              <FileJson className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg tracking-tight line-clamp-1">Dataset Viewer</h1>
              <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider">
                {dataset ? `${dataset.metadata.name} • ${dataset.samples.length} Samples` : 'Load your JSON'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {dataset && (
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input 
                  type="text"
                  placeholder="Search samples..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-[#F3F4F6] border border-transparent focus:border-[#E5E7EB] focus:bg-white rounded-full text-sm outline-none transition-all w-64"
                />
              </div>
            )}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] hover:border-[#1A1A1A] rounded-full text-sm font-medium transition-colors whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Load JSON</span>
              <span className="sm:hidden">Load</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".json" 
              className="hidden" 
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {!dataset ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <div className="w-16 h-16 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-6">
              <Upload className="w-8 h-8 text-[#9CA3AF]" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Ready to explore</h2>
            <p className="text-[#6B7280] max-w-md mb-8 px-4">
              Upload your song metadata JSON file to visualize captions, lyrics, and musical attributes in a clean interface. Click any value to copy to clipboard.
            </p>
            
            <div className="w-full max-w-xl">
              <textarea 
                placeholder="Or paste your JSON here..."
                onChange={(e) => handleJsonInput(e.target.value)}
                className="w-full h-40 p-4 bg-white border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#1A1A1A] focus:border-transparent outline-none font-mono text-xs resize-none shadow-sm"
              />
              {error && (
                <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredSamples.map((sample, index) => (
                <SampleCard 
                  key={sample.id} 
                  sample={sample} 
                  index={index}
                  isExpanded={expandedId === sample.id}
                  onToggle={() => setExpandedId(expandedId === sample.id ? null : sample.id)}
                  onCopy={notifyCopy}
                />
              ))}
            </AnimatePresence>
            
            {filteredSamples.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#E5E7EB]">
                <p className="text-[#6B7280]">No samples found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-[#E5E7EB] text-center text-xs text-[#9CA3AF] uppercase tracking-widest">
        Dataset Viewer • Built for Clarity
      </footer>
    </div>
  );
}

interface SampleCardProps {
  sample: MusicSample;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onCopy: (text: string) => void;
  key?: React.Key;
}

function SampleCard({ 
  sample, 
  index, 
  isExpanded, 
  onToggle,
  onCopy
}: SampleCardProps) {
  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    onCopy(text);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white border border-[#E5E7EB] rounded-3xl overflow-hidden shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] transition-all"
    >
      <div 
        onClick={onToggle}
        className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-[#F3F4F6] rounded-2xl flex items-center justify-center shrink-0">
            <Music className="w-6 h-6 text-[#1A1A1A]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1A1A1A] leading-tight mb-2 group flex items-center gap-2">
              {sample.filename}
              <button 
                onClick={(e) => handleCopy(e, sample.filename)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#F3F4F6] rounded transition-all"
                title="Copy Filename"
              >
                <Copy className="w-3 h-3 text-[#9CA3AF]" />
              </button>
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge 
                icon={<Tag className="w-3 h-3" />} 
                label={sample.custom_tag || 'No Tag'} 
                onClick={(e) => handleCopy(e, sample.custom_tag)}
                highlight
              />
              <Badge 
                icon={<Activity className="w-3 h-3" />} 
                label={`${sample.bpm} BPM`} 
                onClick={(e) => handleCopy(e, sample.bpm.toString())}
              />
              <Badge 
                icon={<Hash className="w-3 h-3" />} 
                label={sample.keyscale} 
                onClick={(e) => handleCopy(e, sample.keyscale)}
              />
              <Badge 
                icon={<Type className="w-3 h-3" />} 
                label={`${sample.timesignature}/4`} 
                onClick={(e) => handleCopy(e, sample.timesignature)}
              />
              <Badge 
                icon={<Clock className="w-3 h-3" />} 
                label={`${Math.floor(sample.duration / 60)}:${(sample.duration % 60).toString().padStart(2, '0')}`} 
                onClick={(e) => handleCopy(e, `${Math.floor(sample.duration / 60)}:${(sample.duration % 60).toString().padStart(2, '0')}`)}
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[#9CA3AF]">
          <button 
            onClick={(e) => handleCopy(e, sample.id)}
            className="text-xs font-mono bg-[#F9FAFB] hover:bg-[#F3F4F6] px-2 py-1 rounded transition-colors"
          >
            ID: {sample.id}
          </button>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#F3F4F6] bg-[#FAFBFC]"
          >
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Caption Section */}
              <section>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#6B7280]" />
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[#6B7280]">Caption</h4>
                  </div>
                  <button 
                    onClick={(e) => handleCopy(e, sample.caption)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E5E7EB] hover:border-[#1A1A1A] rounded-full text-xs font-medium transition-all"
                  >
                    <Copy className="w-3 h-3" />
                    Copy All
                  </button>
                </div>
                <div 
                  onClick={(e) => handleCopy(e, sample.caption)}
                  className="group relative p-6 bg-white border border-[#E5E7EB] rounded-2xl cursor-pointer hover:border-[#1A1A1A] transition-all"
                >
                  <p className="text-sm leading-relaxed text-[#4B5563] italic">
                    {sample.caption}
                  </p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy className="w-4 h-4 text-[#9CA3AF]" />
                  </div>
                </div>
              </section>

              {/* Lyrics Section */}
              <section>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-[#6B7280]" />
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[#6B7280]">Lyrics</h4>
                  </div>
                  <button 
                    onClick={(e) => handleCopy(e, sample.raw_lyrics || sample.lyrics)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E5E7EB] hover:border-[#1A1A1A] rounded-full text-xs font-medium transition-all"
                  >
                    <Copy className="w-3 h-3" />
                    Copy All
                  </button>
                </div>
                <div 
                  onClick={(e) => handleCopy(e, sample.raw_lyrics || sample.lyrics)}
                  className="group relative p-6 bg-white border border-[#E5E7EB] rounded-2xl max-h-[400px] overflow-y-auto custom-scrollbar cursor-pointer hover:border-[#1A1A1A] transition-all"
                >
                  <pre className="text-sm font-serif leading-relaxed text-[#1F2937] whitespace-pre-wrap">
                    {sample.raw_lyrics || sample.lyrics}
                  </pre>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy className="w-4 h-4 text-[#9CA3AF]" />
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface BadgeProps {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  highlight?: boolean;
}

function Badge({ icon, label, onClick, highlight }: BadgeProps) {
  return (
    <button 
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all
        ${highlight 
          ? 'bg-[#1A1A1A] text-white hover:bg-black ring-2 ring-transparent hover:ring-offset-1 hover:ring-[#1A1A1A]/30' 
          : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]'}
      `}
    >
      {icon}
      {label}
      <Copy className={`w-2.5 h-2.5 ${highlight ? 'text-white/50' : 'text-[#9CA3AF]'}`} />
    </button>
  );
}
