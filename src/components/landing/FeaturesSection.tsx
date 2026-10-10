import React from 'react';
import {
  PackageCheck,
  Search,
  AlertTriangle,
  Clock,
  BarChart3,
  Filter,
  ShieldCheck,
  Layout,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface FeaturesSectionProps {
  onSelectFeature?: (featureId: string) => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onSelectFeature }) => {
  const featuresList = [
    {
      id: 'smart-inventory',
      icon: PackageCheck,
      title: 'Smart Inventory Management',
      description: 'Manage medicines and pharmacy inventory from one place. Track available stock easily.',
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      id: 'medicine-tracking',
      icon: Search,
      title: 'Medicine Tracking',
      description: 'View medicine details, quantities, categories, and other inventory information.',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'low-stock',
      icon: AlertTriangle,
      title: 'Low Stock Alerts',
      description: 'Quickly identify medicines that are running low. Help prevent unexpected stock shortages.',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      id: 'expiry-monitoring',
      icon: Clock,
      title: 'Expiry Date Monitoring',
      description: 'Track medicine expiry dates. Make it easier to identify medicines approaching expiry.',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'dashboard-analytics',
      icon: BarChart3,
      title: 'Dashboard & Analytics',
      description: 'Display important inventory information through a clean dashboard. Show useful statistics and visual summaries.',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 'search-filter',
      icon: Filter,
      title: 'Search & Filter',
      description: 'Quickly find medicines using search and filtering options.',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      id: 'pharmacy-management',
      icon: ShieldCheck,
      title: 'Pharmacy Management',
      description: 'Organize pharmacy inventory and daily management tasks efficiently.',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'modern-ui',
      icon: Layout,
      title: 'Modern User Interface',
      description: 'Clean, responsive, easy-to-use interface designed for pharmacy users.',
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
  ];

  return (
    <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 bg-teal-100/80 border border-teal-200 px-4 py-1.5 rounded-full text-xs font-bold text-teal-800">
            <Sparkles size={14} className="text-teal-600" />
            <span>Complete Inventory Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Powerful Features. Simple Management.
          </h2>

          <p className="text-base text-slate-600 leading-relaxed font-normal">
            Everything your medical store or pharmacy needs to streamline cataloging, track stock movement, prevent stockouts, and safeguard patient care.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresList.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 saas-card-shadow saas-card-hover flex flex-col justify-between group cursor-pointer"
                onClick={() => onSelectFeature && onSelectFeature(item.id)}
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl ${item.color} border flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <IconComponent size={22} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600 group-hover:text-teal-700">
                  <span>Learn details</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
