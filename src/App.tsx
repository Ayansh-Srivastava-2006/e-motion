import { useState, useMemo, useEffect } from 'react';
import { ChassisParameters, ComponentLoad } from './types/chassis';
import { solveChassisLoadDistribution } from './physics/calculator';
import { Sidebar, ViewTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ProjectInputsView } from './components/inputs/ProjectInputsView';
import { SimulationView } from './components/simulation/SimulationView';
import { AnalysisView } from './components/analysis/AnalysisView';
import { ReportsView } from './components/reports/ReportsView';
import { ViewPlaceholder } from './components/views/Placeholders';
import { ResetModal } from './components/common/ResetModal';

export const DEFAULT_DEMO_CHASSIS: ChassisParameters = {
  length: 4200,
  width: 1900,
  wheelbase: 2650,
  trackF: 1580,
  trackR: 1580,
  ohF: 850,
  ohR: 700,
};

export const DEFAULT_DEMO_COMPONENTS: ComponentLoad[] = [
  { id: 'driver', name: 'Driver', mass: 70, x: 850, y: 350, color: '#ff7849' },
  { id: 'motor', name: 'Motor', mass: 45, x: 1550, y: -200, color: '#ff7849' },
  { id: 'seat', name: 'Driver Seat', mass: 15, x: 900, y: 200, color: '#ff7849' },
  { id: 'suspension', name: 'Suspension Assembly', mass: 30, x: 1100, y: 0, color: '#ff7849' },
  { id: 'other', name: 'Other Load', mass: 50, x: 1200, y: 0, color: '#ff7849' },
];

export default function App() {
  const getInitialTab = (): ViewTab => {
    const hash = window.location.hash.replace('#', '') as ViewTab;
    if (['inputs', 'simulation', 'dashboard', 'analysis', 'reports'].includes(hash)) {
      return hash;
    }
    return 'simulation'; // Open directly on 3D Simulation
  };

  const [activeView, setActiveView] = useState<ViewTab>(getInitialTab);
  const [chassis, setChassis] = useState<ChassisParameters>(DEFAULT_DEMO_CHASSIS);
  const [components, setComponents] = useState<ComponentLoad[]>(DEFAULT_DEMO_COMPONENTS);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    window.location.hash = activeView;
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ViewTab;
      if (['inputs', 'simulation', 'dashboard', 'analysis', 'reports'].includes(hash)) {
        setActiveView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeView]);

  // Single source of truth calculation results
  const results = useMemo(() => {
    return solveChassisLoadDistribution(chassis, components);
  }, [chassis, components]);

  const handleUpdateChassis = (updated: ChassisParameters) => {
    setChassis(updated);
  };

  const handleUpdateComponent = (id: string, updated: Partial<ComponentLoad>) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  };

  const handleAddComponent = () => {
    const newId = `comp_${Date.now()}`;
    setComponents((prev) => [
      ...prev,
      {
        id: newId,
        name: 'New Component',
        mass: 20,
        x: 1000,
        y: 0,
        color: '#ff7849',
      },
    ]);
  };

  const handleRemoveComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const handleResetProject = () => {
    setChassis(DEFAULT_DEMO_CHASSIS);
    setComponents(DEFAULT_DEMO_COMPONENTS);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans">
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenResetModal={() => setIsResetModalOpen(true)}
      />

      <Header activeView={activeView} />

      <main className="pl-72 pt-24 pb-12 px-8 min-h-screen bg-surface">
        {activeView === 'inputs' && (
          <ProjectInputsView
            chassis={chassis}
            components={components}
            results={results}
            onUpdateChassis={handleUpdateChassis}
            onUpdateComponent={handleUpdateComponent}
            onAddComponent={handleAddComponent}
            onRemoveComponent={handleRemoveComponent}
            onNavigateToSimulation={() => setActiveView('simulation')}
          />
        )}

        {activeView === 'dashboard' && (
          <ViewPlaceholder
            title="Dashboard Overview"
            phase="Unlocked in Phase 4"
            description="Overall summary dashboard metrics will render here."
            onGoToInputs={() => setActiveView('inputs')}
          />
        )}

        {activeView === 'simulation' && (
          <SimulationView
            chassis={chassis}
            components={components}
            results={results}
            onUpdateComponent={handleUpdateComponent}
            onResetProject={handleResetProject}
          />
        )}

        {activeView === 'analysis' && (
          <AnalysisView
            chassis={chassis}
            components={components}
            results={results}
            onNavigateToSimulation={() => setActiveView('simulation')}
            onNavigateToReports={() => setActiveView('reports')}
            onNavigateToInputs={() => setActiveView('inputs')}
          />
        )}

        {activeView === 'reports' && (
          <ReportsView
            chassis={chassis}
            components={components}
            results={results}
            onNavigateToInputs={() => setActiveView('inputs')}
            onNavigateToSimulation={() => setActiveView('simulation')}
            onNavigateToAnalysis={() => setActiveView('analysis')}
          />
        )}
      </main>

      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetProject}
      />
    </div>
  );
}
