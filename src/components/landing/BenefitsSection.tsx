import React from 'react';
import {
  CheckCircle2,
  Clock,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Zap,
  FolderCheck,
  Search,
  ThumbsUp,
} from 'lucide-react';

export const BenefitsSection: React.FC = () => {
  const benefitsList = [
    {
      title: 'Reduce Manual Inventory Work',
      description: 'Eliminate tedious manual paper logs and spreadsheets with automated digital cataloging.',
      icon: ThumbsUp,
      color: 'bg-teal-100 text-teal-800',
    },
    {
      title: 'Save Time',
      description: 'Find medicines, generate POS bills, and check shelf locations in seconds.',
      icon: Clock,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Monitor Stock Easily',
      description: 'Get instant visibility into overall store quantities and active batch numbers.',
      icon: Zap,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      title: 'Reduce Medicine Wastage',
      description: 'Prevent losses caused by expired stock with advance notification alerts.',
      icon: TrendingDown,
      color: 'bg-emerald-100 text-emerald-800',
    },
    {
      title: 'Track Expiry Dates',
      description: 'Stay ahead of batch expirations with automated 60-day warning indicators.',
      icon: ShieldCheck,
      color: 'bg-amber-100 text-amber-800',
    },
    {
      title: 'Improve Pharmacy Organization',
      description: 'Map physical storage by Rack Number, Box ID, and Shelf Level for neat counter service.',
      icon: FolderCheck,
      color: 'bg-indigo-100 text-indigo-800',
    },
    {
      title: 'Access Important Information Quickly',
      description: 'Instant search by brand name, generic formulation, code, or box number.',
      icon: Search,
      color: 'bg-rose-100 text-rose-800',
    },
    {
      title: 'Make Inventory Management Simpler',
      description: 'A clean, intuitive interface designed specifically for pharmacy managers and staff.',
      icon: Sparkles,
      color: 'bg-cyan-100 text-cyan-800',
    },
  ];

  return (
    <section id="benefits" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-4 py-1.5 rounded-full text-xs font-bold text-teal-800">
            <span>Proven Advantages</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Choose MedPoint?
          </h2>

          <p className="text-base text-slate-600 leading-relaxed font-normal">
            Designed to address the daily pain points of medical stores and hospital dispensaries, ensuring accuracy, speed, and profitability.
          </p>
        </div>

        {/* Benefits Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefitsList.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-50 hover:bg-white border border-slate-200/90 saas-card-shadow saas-card-hover space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl ${benefit.color} flex items-center justify-center`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{benefit.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{benefit.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-bold text-teal-700">
                  <CheckCircle2 size={15} className="text-teal-600" />
                  <span>Key Advantage</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
