"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const faqs = [
    {
      question: "Who is Uni Dale platform built for?",
      answer: "It is built for modern learning institutions, including universities, colleges, and large-scale educational academies that require structured governance and an intuitive learning experience."
    },
    {
      question: "Can I try this platform before paying?",
      answer: "Yes, we offer a comprehensive demo environment and a guided pilot phase for institutions to evaluate the platform before full implementation."
    },
    {
      question: "How do institutions get started?",
      answer: "Institutions begin with a consultation call, followed by a technical architecture review, data migration planning, and finally a staged rollout to faculty and students."
    },
    {
      question: "How is AI managed within the system?",
      answer: "AI features are deeply integrated but heavily governed. Institutions can control which AI models are used, who has access to them, and what data they can process."
    },
    {
      question: "Is institutional data secure?",
      answer: "Absolutely. We employ enterprise-grade encryption, strict role-based access controls, and comply with major educational data privacy regulations."
    },
    {
      question: "Does it support role-based permissions?",
      answer: "Yes, our advanced RBAC system allows for incredibly granular permissions, ensuring users only see and interact with data they are authorized to access."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full bg-canvas py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-ink">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-surface border border-border rounded-card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="text-lg font-medium text-ink">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-ink-500 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-ink-500 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
