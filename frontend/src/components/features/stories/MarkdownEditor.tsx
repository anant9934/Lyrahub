'use client';

import React, { useState } from 'react';
import { Bold, Italic, Heading, List, Code, Quote, Eye, Edit3 } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write the complete story in markdown...',
  minHeight = '320px'
}) => {
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  const insertSnippet = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('story-markdown-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || 'text';
    const replacement = `${prefix}${selected}${suffix}`;
    const nextVal = value.substring(0, start) + replacement + value.substring(end);
    onChange(nextVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  return (
    <div className="border border-[#D6D6D6] rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="bg-[#F2F2F1] border-b border-[#D6D6D6] px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertSnippet('**', '**')}
            title="Bold"
            className="p-1.5 rounded hover:bg-white text-[#1E1E1E]"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('*', '*')}
            title="Italic"
            className="p-1.5 rounded hover:bg-white text-[#1E1E1E]"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('### ')}
            title="Heading"
            className="p-1.5 rounded hover:bg-white text-[#1E1E1E]"
          >
            <Heading className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('> ')}
            title="Quote"
            className="p-1.5 rounded hover:bg-white text-[#1E1E1E]"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('- ')}
            title="Bullet List"
            className="p-1.5 rounded hover:bg-white text-[#1E1E1E]"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('```\n', '\n```')}
            title="Code Block"
            className="p-1.5 rounded hover:bg-white text-[#1E1E1E]"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#D6D6D6]">
          <button
            type="button"
            onClick={() => setTab('write')}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded font-medium transition-colors ${
              tab === 'write' ? 'bg-[#1E1E1E] text-white' : 'text-[#7A7A7A] hover:text-[#1E1E1E]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Write
          </button>
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded font-medium transition-colors ${
              tab === 'preview' ? 'bg-[#1E1E1E] text-white' : 'text-[#7A7A7A] hover:text-[#1E1E1E]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {tab === 'write' ? (
        <textarea
          id="story-markdown-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full p-4 text-sm text-[#1E1E1E] font-mono focus:outline-none resize-y"
        />
      ) : (
        <div
          style={{ minHeight }}
          className="w-full p-4 text-sm text-[#1E1E1E] prose max-w-none bg-white whitespace-pre-wrap"
        >
          {value ? (
            <div className="space-y-3 font-sans">
              {value.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return <h3 key={idx} className="text-lg font-bold text-[#1E1E1E] mt-4">{paragraph.replace('### ', '')}</h3>;
                }
                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote key={idx} className="border-l-4 border-[#94B0B8] pl-3 italic text-[#5C5C5C]">
                      {paragraph.replace('> ', '')}
                    </blockquote>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  return (
                    <ul key={idx} className="list-disc pl-5 space-y-1">
                      {paragraph.split('\n').map((li, i) => (
                        <li key={i}>{li.replace('- ', '')}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={idx} className="leading-relaxed">{paragraph}</p>;
              })}
            </div>
          ) : (
            <div className="text-[#7A7A7A] italic">No content to preview</div>
          )}
        </div>
      )}
    </div>
  );
};
