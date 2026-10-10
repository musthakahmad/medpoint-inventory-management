import React from 'react';
import { PlusCircle, Sliders, AlertCircle, BarChart, ArrowRight, Check } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Add Medicines',
      description: 'Add and organize medicine information, dosage forms, prices, and rack storage locations.',
      icon: PlusCircle,
      badge: 'Step 1',
    },
    {
      number: '02',
      title: 'Manage Inventory',
      description: 'Monitor stock quantities, batch numbers, manufacturer details, and inventory details.',
      icon: Sliders,
      badge: 'Step 2',
    },
    {
      number: '03',
      title: 'Monitor Stock',
      description: 'Identify low-stock and important inventory conditions with automated color-coded alerts.',
      icon: AlertCircle,
      badge: 'Step 3',
    },
    {
      number: '04',
      title: 'Manage Efficiently',
      description: 'Use the dashboard and insights to make pharmacy management easier and billing faster.',
      icon: BarChart,
      badge: 'Step 4',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-4 py-1.5 rounded-full text-xs font-bold text-teal-800">
            <span>Streamlined Workflow</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How MedPoint Works
          </h2>

          <p className="text-base text-slate-600 leading-relaxed font-normal">
            Four simple steps to digitize your pharmacy, streamline stock audits, and take complete control of your dispensary inventory.
          </p>
        </div>

        {/* 4-Step Connected Card Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-200 via-teal-400 to-teal-200 -translate-y-8 z-0"></div>

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-slate-50 hover:bg-white rounded-3xl p-6 border border-slate-200/90 saas-card-shadow saas-card-hover relative z-10 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black font-mono text-teal-600 tracking-tight">
                      {step.number}
                    </span>
                    <div className="p-3 rounded-2xl bg-teal-100 text-teal-700 shadow-2xs">
                      <Icon size={22} />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">{step.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-teal-700">
                  <span className="bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/80">{step.badge}</span>
                  <Check size={14} className="text-teal-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
