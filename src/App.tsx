import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  ListTodo, 
  FileText, 
  Lightbulb, 
  Calendar, 
  Share2, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  User, 
  ChevronRight,
  Download,
  Copy,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, subDays, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn, generateId } from './lib/utils';
import { 
  AppState, 
  ChecklistItem, 
  Task, 
  Decision, 
  MeetingInfo, 
  INITIAL_CHECKLIST, 
  MILESTONES,
  Status,
  OWNERS
} from './types';

const STORAGE_KEY = 'eventsync_data';

export default function App() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checklist' | 'tasks' | 'notes' | 'decisions' | 'timeline'>('dashboard');
  const [state, setState] = useState<AppState>(() => {
    const defaultMilestoneProgress = MILESTONES.reduce((acc, m) => ({
      ...acc,
      [m.label]: (m.items || []).map(() => false)
    }), {});

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          milestoneProgress: parsed.milestoneProgress || defaultMilestoneProgress
        };
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    return {
      meetingInfo: {
        title: 'Lancement Événementiel SIRH Digital 2026',
        date: format(addDays(new Date(), 23), 'yyyy-MM-dd'),
        time: '09:00',
        location: 'Salle d\'Innovation - Siège'
      },
      checklist: INITIAL_CHECKLIST.map(item => ({ ...item, id: generateId() })),
      tasks: [],
      notes: '',
      decisions: [],
      milestoneProgress: defaultMilestoneProgress
    };
  });

  const [isSaving, setIsSaving] = useState(false);

  const [notification, setNotification] = useState<string | null>(null);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setIsSaving(true);
    const timer = setTimeout(() => setIsSaving(false), 1000);
    return () => clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- Budget Auto-calculation ---
  useEffect(() => {
    const costLabelsToExclude = ['Budget global', 'Montant Thalès', 'Montant Factorial', 'Montant Sage'];
    const budgetItems = state.checklist.filter(i => 
      i.section === '💰 3. Budget & finance' && 
      i.type === 'currency' && 
      !costLabelsToExclude.includes(i.label || '')
    );
    
    const totalBudget = budgetItems.reduce((acc, item) => {
      const val = parseFloat(item.text) || 0;
      return acc + val;
    }, 0);

    const budgetGlobalItem = state.checklist.find(i => 
      i.section === '💰 3. Budget & finance' && 
      i.label === 'Budget global'
    );

    const updates: Record<string, string> = {};

    if (budgetGlobalItem && Math.abs(parseFloat(budgetGlobalItem.text) - totalBudget) > 0.01) {
      updates[budgetGlobalItem.id] = totalBudget.toString();
    }

    const partners = [
      { pctLabel: 'Part Thalès (%)', amtLabel: 'Montant Thalès' },
      { pctLabel: 'Part Factorial (%)', amtLabel: 'Montant Factorial' },
      { pctLabel: 'Part Sage (%)', amtLabel: 'Montant Sage' }
    ];

    partners.forEach(p => {
      const pctItem = state.checklist.find(i => i.label === p.pctLabel);
      const amtItem = state.checklist.find(i => i.label === p.amtLabel);
      if (pctItem && amtItem) {
        const pct = parseFloat(pctItem.text) || 0;
        const calculatedAmt = (totalBudget * pct) / 100;
        if (Math.abs(parseFloat(amtItem.text) - calculatedAmt) > 0.01) {
          updates[amtItem.id] = calculatedAmt.toFixed(2);
        }
      }
    });

    if (Object.keys(updates).length > 0) {
      setState(prev => ({
        ...prev,
        checklist: prev.checklist.map(item => 
          updates[item.id] !== undefined 
            ? { ...item, text: updates[item.id] } 
            : item
        )
      }));
    }
  }, [state.checklist]);

  // --- Helpers ---
  const dashboardMetrics = useMemo(() => {
    const checklist = state.checklist;
    
    // 1. Overall Metrics
    const totalItems = checklist.length;
    const completedItems = checklist.filter(i => i.completed).length;
    const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // 2. Core Strategic Objectives (The 3 items specifically requested)
    const strategicItems = checklist.filter(i => 
      i.section === '🎯 1. Cadrage stratégique' && (!i.indent || i.indent === 0)
    );
    
    const strategicCompleted = strategicItems.filter(task => {
      // Special logic for Thématique parent
      if (task.text.includes('Thématique')) {
        const subThemes = checklist.filter(i => i.section === task.section && i.indent === 1);
        return subThemes.some(i => i.completed);
      }
      return task.completed;
    });

    const strategicProgress = strategicItems.length > 0 
      ? Math.round((strategicCompleted.length / strategicItems.length) * 100) 
      : 0;

    // 3. Section Breakdown
    const sections = Array.from(new Set(checklist.map(i => i.section)));
    const sectionMetrics = sections.map(name => {
      const items = checklist.filter(i => i.section === name);
      const completed = items.filter(i => i.completed).length;
      return {
        name,
        total: items.length,
        completed,
        progress: Math.round((completed / items.length) * 100)
      };
    });

    return { 
      progress: overallProgress, 
      remainingCount: totalItems - completedItems,
      strategicProgress,
      strategicItems: strategicItems.map(item => ({
        id: item.id,
        text: item.text,
        completed: item.text.includes('Thématique') 
          ? checklist.filter(i => i.section === item.section && i.indent === 1).some(sub => sub.completed)
          : item.completed
      })),
      sectionMetrics
    };
  }, [state.checklist]);

  const { progress, remainingCount, strategicProgress, strategicItems, sectionMetrics } = dashboardMetrics;

  const updateMeetingInfo = (info: Partial<MeetingInfo>) => {
    setState(prev => ({ ...prev, meetingInfo: { ...prev.meetingInfo, ...info } }));
  };

  const toggleChecklistItem = (id: string) => {
    setState(prev => {
      const itemToToggle = prev.checklist.find(i => i.id === id);
      if (!itemToToggle) return prev;

      const willBeCompleted = !itemToToggle.completed;

      return {
        ...prev,
        checklist: prev.checklist.map(item => {
          // If this is the item being toggled correctly
          if (item.id === id) {
            return { 
              ...item, 
              completed: willBeCompleted, 
              status: willBeCompleted ? 'Terminé' : 'Pas commencé' 
            };
          }
          // If the toggled item was exclusive and now completed, uncheck all other exclusive items in the same section
          if (willBeCompleted && itemToToggle.isExclusive && item.section === itemToToggle.section && item.isExclusive) {
            return {
              ...item,
              completed: false,
              status: 'Pas commencé'
            };
          }
          return item;
        })
      };
    });
  };

  const addChecklistItem = (section: string) => {
    const newItem: ChecklistItem = {
      id: generateId(),
      section,
      text: '',
      completed: false,
      status: 'Pas commencé',
      // If adding to the strategy section, make it exclusive and indented
      isExclusive: section.includes('stratégique'),
      indent: section.includes('stratégique') ? 1 : 0
    };
    setState(prev => ({
      ...prev,
      checklist: [...prev.checklist, newItem]
    }));
  };

  const deleteChecklistItem = (id: string) => {
    setState(prev => ({
      ...prev,
      checklist: prev.checklist.filter(item => item.id !== id)
    }));
  };

  const updateChecklistItem = (id: string, updates: Partial<ChecklistItem>) => {
    setState(prev => ({
      ...prev,
      checklist: prev.checklist.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const addTask = () => {
    const newTask: Task = {
      id: generateId(),
      title: 'Nouvelle tâche',
      assignee: '',
      deadline: format(new Date(), 'yyyy-MM-dd'),
      status: 'Pas commencé'
    };
    setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => task.id === id ? { ...task, ...updates } : task)
    }));
  };

  const deleteTask = (id: string) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  };

  const addDecision = (type: 'Décision' | 'Action suivante') => {
    const newDecision: Decision = {
      id: generateId(),
      text: '',
      responsible: '',
      type
    };
    setState(prev => ({ ...prev, decisions: [...prev.decisions, newDecision] }));
  };

  const updateDecision = (id: string, updates: Partial<Decision>) => {
    setState(prev => ({
      ...prev,
      decisions: prev.decisions.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  };

  const deleteDecision = (id: string) => {
    setState(prev => ({ ...prev, decisions: prev.decisions.filter(d => d.id !== id) }));
  };
  
  const toggleMilestoneItem = (label: string, index: number) => {
    setState(prev => {
      const currentProgress = prev.milestoneProgress[label] || [];
      const newProgress = [...currentProgress];
      newProgress[index] = !newProgress[index];
      return {
        ...prev,
        milestoneProgress: {
          ...prev.milestoneProgress,
          [label]: newProgress
        }
      };
    });
  };

  const copySummary = () => {
    const summary = `
Réunion: ${state.meetingInfo.title}
Date: ${state.meetingInfo.date} à ${state.meetingInfo.time}
Progression: ${progress}%

Décisions:
${state.decisions.filter(d => d.type === 'Décision').map(d => `- ${d.text}`).join('\n')}

Actions suivantes:
${state.decisions.filter(d => d.type === 'Action suivante').map(d => `- ${d.text} (Resp: ${d.responsible || 'À définir'})`).join('\n')}
    `.trim();
    navigator.clipboard.writeText(summary);
    setNotification('Résumé copié dans le presse-papier !');
  };

  const exportPDF = () => {
    window.print();
  };

  const resetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  // --- Render Helpers ---
  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  Détails de la réunion
                </h3>
                <div className="space-y-6">
                  <input 
                    className="text-2xl font-bold w-full bg-transparent border-none focus:ring-0 p-0 text-gray-900 placeholder:text-gray-200"
                    value={state.meetingInfo.title}
                    onChange={e => updateMeetingInfo({ title: e.target.value })}
                    placeholder="Titre de la réunion"
                  />
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-gray-600">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-indigo-400" />
                      <input 
                        type="date"
                        className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium"
                        value={state.meetingInfo.date}
                        onChange={e => updateMeetingInfo({ date: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-indigo-400" />
                      <input 
                        type="time"
                        className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium"
                        value={state.meetingInfo.time}
                        onChange={e => updateMeetingInfo({ time: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16" />
                
                <div className="relative z-10">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    Avancement Préparation
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <div className="text-5xl font-black text-gray-900 tracking-tighter">{progress}%</div>
                    <div className="text-sm font-bold text-gray-400">Terminé</div>
                  </div>
                </div>
                <div className="mt-8 relative z-10">
                  <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-tight">
                    <span>Progression</span>
                    <span>{remainingCount} restants</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-indigo-600 h-full shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Strategic Objectives Tile */}
              <section className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                    Objectifs Stratégiques
                  </h3>
                  <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                    {strategicProgress}% Validés
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {strategicItems.map((item) => (
                    <div 
                      key={item.id}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all duration-300",
                        item.completed 
                          ? "bg-emerald-50 border-emerald-100" 
                          : "bg-gray-50 border-gray-100"
                      )}
                    >
                      <div className="flex flex-col gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                          item.completed ? "bg-emerald-500 text-white" : "bg-white text-gray-300 shadow-sm"
                        )}>
                          {item.completed ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />}
                        </div>
                        <div>
                          <p className={cn(
                            "text-xs font-bold uppercase tracking-tight mb-1",
                            item.completed ? "text-emerald-700" : "text-gray-400"
                          )}>
                            {item.completed ? 'Validé' : 'À définir'}
                          </p>
                          <p className={cn(
                            "text-sm font-semibold leading-tight",
                            item.completed ? "text-gray-900" : "text-gray-500"
                          )}>
                            {item.text.replace('🎯 ', '').split(' : ')[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Status Section Progress */}
              <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Statut par Étape
                </h3>
                <div className="space-y-6">
                  {sectionMetrics.map((section) => (
                    <div key={section.name} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-600 uppercase tracking-tight">
                        <span className="truncate max-w-[150px]">{section.name.split('. ')[1] || section.name}</span>
                        <span className="text-indigo-600">{section.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            section.progress === 100 ? "bg-emerald-500" : "bg-indigo-500"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${section.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" />
                Dernières informations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 bg-indigo-50 rounded-[1.5rem] border border-indigo-100">
                  <div className="text-indigo-600 font-black text-3xl tracking-tighter mb-1">{state.tasks.filter(t => t.status !== 'Terminé').length}</div>
                  <div className="text-indigo-800 text-[10px] uppercase tracking-widest font-black">Tâches actives</div>
                </div>
                <div className="p-6 bg-emerald-50 rounded-[1.5rem] border border-emerald-100">
                  <div className="text-emerald-600 font-black text-3xl tracking-tighter mb-1">{state.decisions.length}</div>
                  <div className="text-emerald-800 text-[10px] uppercase tracking-widest font-black">Décisions prises</div>
                </div>
                <div className="p-6 bg-amber-50 rounded-[1.5rem] border border-amber-100">
                  <div className="text-amber-600 font-black text-3xl tracking-tighter mb-1">{remainingCount}</div>
                  <div className="text-amber-800 text-[10px] uppercase tracking-widest font-black">Points de check restants</div>
                </div>
              </div>
            </section>
          </div>
        );

      case 'checklist':
        const sections = Array.from(new Set(state.checklist.map(i => i.section)));
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {sections.map(section => (
              <div key={section} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                  {section}
                </h3>
                <div className="space-y-3">
                  {state.checklist.filter(i => i.section === section).map(item => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "group flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors",
                        item.indent && item.indent > 0 && "ml-8 border-l-2 border-gray-100 pl-6 rounded-l-none"
                      )}
                    >
                      {/* Hide checkbox for parent items that have exclusive children */}
                      {!(item.text.includes('Thématique') && !item.indent) ? (
                        <button 
                          onClick={() => toggleChecklistItem(item.id)}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                            item.completed ? "bg-indigo-500 border-indigo-500 text-white" : "border-gray-300 hover:border-indigo-400",
                            item.isExclusive && !item.completed && "border-dashed"
                          )}
                          title={item.isExclusive ? "Sélectionner ce thème (choix unique)" : "Cocher"}
                        >
                          {item.completed ? <CheckCircle2 className="w-4 h-4" /> : (item.isExclusive && <div className="w-2 h-2 bg-indigo-200 rounded-full" />)}
                        </button>
                      ) : (
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                          {state.checklist.some(i => i.section === item.section && i.indent === 1 && i.completed) ? (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                          ) : (
                            <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                          )}
                        </div>
                      )}
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        {item.indent && item.indent > 0 && <span className="text-gray-300">—</span>}
                        {item.type === 'datetime' ? (
                          <div className="flex items-center gap-2 flex-1">
                            {item.label && <span className="text-sm text-gray-500 whitespace-nowrap">{item.label} :</span>}
                            <input 
                              type="datetime-local"
                              className={cn(
                                "flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-indigo-600",
                                item.completed && "text-gray-400 line-through"
                              )}
                              value={item.text}
                              onChange={e => updateChecklistItem(item.id, { text: e.target.value })}
                            />
                          </div>
                        ) : item.type === 'select' ? (
                          <div className="flex items-center gap-2 flex-1">
                            {item.label && <span className="text-sm text-gray-500 whitespace-nowrap">{item.label} :</span>}
                            <select
                              className={cn(
                                "flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-indigo-600",
                                item.completed && "text-gray-400 line-through"
                              )}
                              value={item.text}
                              onChange={e => updateChecklistItem(item.id, { text: e.target.value })}
                            >
                              {item.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        ) : item.type === 'currency' ? (
                          <div className="flex items-center gap-2 flex-1">
                            {item.label && <span className="text-sm text-gray-500 whitespace-nowrap">{item.label} :</span>}
                            <div className="flex items-center gap-1">
                              <input 
                                type="number"
                                className={cn(
                                  "w-24 bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-indigo-600",
                                  item.completed && "text-gray-400 line-through",
                                  item.readOnly && "cursor-not-allowed text-indigo-400"
                                )}
                                value={item.text}
                                readOnly={item.readOnly}
                                onChange={e => !item.readOnly && updateChecklistItem(item.id, { text: e.target.value })}
                              />
                              <span className="text-sm font-medium text-gray-400">MAD</span>
                            </div>
                          </div>
                        ) : item.type === 'number' ? (
                          <div className="flex items-center gap-2 flex-1">
                            {item.label && <span className="text-sm text-gray-500 whitespace-nowrap">{item.label} :</span>}
                            <input 
                              type="number"
                              className={cn(
                                "w-24 bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-indigo-600",
                                item.completed && "text-gray-400 line-through"
                              )}
                              value={item.text}
                              onChange={e => updateChecklistItem(item.id, { text: e.target.value })}
                            />
                          </div>
                        ) : (
                          <input 
                            className={cn(
                              "flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm",
                              item.completed && "text-gray-400 line-through",
                              item.isExclusive && "font-medium text-indigo-900"
                            )}
                            placeholder={item.isExclusive ? "Nouveau thème proposé..." : "Élément de la liste..."}
                            value={item.text}
                            onChange={e => updateChecklistItem(item.id, { text: e.target.value })}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        <button 
                          onClick={() => deleteChecklistItem(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <select 
                          className="text-xs font-medium text-indigo-600 bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
                          value={item.status}
                          onChange={e => {
                            const newStatus = e.target.value as Status;
                            updateChecklistItem(item.id, { 
                              status: newStatus,
                              completed: newStatus === 'Terminé'
                            });
                          }}
                        >
                          <option value="Pas commencé">Pas commencé</option>
                          <option value="En cours">En cours</option>
                          <option value="Terminé">Terminé</option>
                        </select>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <select 
                            className="text-xs text-gray-500 bg-transparent border-none focus:ring-0 p-0 w-28 cursor-pointer"
                            value={item.owner || ''}
                            onChange={e => updateChecklistItem(item.id, { owner: e.target.value })}
                          >
                            <option value="">Propriétaire</option>
                            {OWNERS.map(owner => (
                              <option key={owner} value={owner}>{owner}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => addChecklistItem(section)}
                    className="flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 p-3 mt-2 rounded-xl border border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all w-full justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" /> 
                    {section.includes('stratégique') ? 'Ajouter une autre thématique ou un point de cadrage' : 'Ajouter un élément'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Gestion des tâches</h2>
              <button 
                onClick={addTask}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Ajouter une tâche
              </button>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-bottom border-gray-100">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tâche</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigné à</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Échéance</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {state.tasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Aucune tâche ajoutée pour le moment.</td>
                    </tr>
                  ) : (
                    state.tasks.map(task => (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <input 
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium"
                            value={task.title}
                            onChange={e => updateTask(task.id, { title: e.target.value })}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            className="bg-transparent border-none focus:ring-0 p-0 text-sm text-gray-600 cursor-pointer w-full"
                            value={task.assignee}
                            onChange={e => updateTask(task.id, { assignee: e.target.value })}
                          >
                            <option value="">Non assigné</option>
                            {OWNERS.map(owner => (
                              <option key={owner} value={owner}>{owner}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="date"
                            className="bg-transparent border-none focus:ring-0 p-0 text-sm text-gray-600"
                            value={task.deadline}
                            onChange={e => updateTask(task.id, { deadline: e.target.value })}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-indigo-600 cursor-pointer"
                            value={task.status}
                            onChange={e => updateTask(task.id, { status: e.target.value as Status })}
                          >
                            <option value="Pas commencé">Pas commencé</option>
                            <option value="En cours">En cours</option>
                            <option value="Terminé">Terminé</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Notes de la réunion</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Save className="w-3 h-3" /> Sauvegarde automatique...
              </div>
            </div>
            <textarea 
              className="flex-1 w-full p-8 bg-white rounded-3xl shadow-sm border border-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-serif text-lg leading-relaxed text-gray-800"
              placeholder="Commencez à saisir vos notes de réunion ici..."
              value={state.notes}
              onChange={e => setState(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        );

      case 'decisions':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Decisions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" /> Décisions
                  </h3>
                  <button 
                    onClick={() => addDecision('Décision')}
                    className="p-1 hover:bg-amber-50 rounded-full text-amber-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {state.decisions.filter(d => d.type === 'Décision').map(decision => (
                    <div key={decision.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group">
                      <div className="flex gap-3">
                        <textarea 
                          className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm resize-none h-12"
                          placeholder="Qu'est-ce qui a été décidé ?"
                          value={decision.text}
                          onChange={e => updateDecision(decision.id, { text: e.target.value })}
                        />
                        <button 
                          onClick={() => deleteDecision(decision.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-indigo-500" /> Actions suivantes
                  </h3>
                  <button 
                    onClick={() => addDecision('Action suivante')}
                    className="p-1 hover:bg-indigo-50 rounded-full text-indigo-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {state.decisions.filter(d => d.type === 'Action suivante').map(step => (
                    <div key={step.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group">
                      <div className="flex gap-3 mb-2">
                        <textarea 
                          className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm resize-none h-12"
                          placeholder="Que faut-il faire ?"
                          value={step.text}
                          onChange={e => updateDecision(step.id, { text: e.target.value })}
                        />
                        <button 
                          onClick={() => deleteDecision(step.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <input 
                          className="text-xs text-indigo-600 font-medium bg-transparent border-none focus:ring-0 p-0"
                          placeholder="Responsable"
                          value={step.responsible || ''}
                          onChange={e => updateDecision(step.id, { responsible: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold text-gray-900 mb-12">Ligne de temps de l'événement</h2>
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-100" />
              
              <div className="space-y-12">
                {MILESTONES.map((milestone, idx) => {
                  const daysMatch = milestone.label.match(/J-(\d+)/);
                  const daysToSub = daysMatch ? parseInt(daysMatch[1], 10) : 0;
                  let milestoneDate = '';
                  try {
                    const eventDate = parseISO(state.meetingInfo.date);
                    milestoneDate = format(subDays(eventDate, daysToSub), 'dd/MM/yyyy');
                  } catch (e) {
                    milestoneDate = '--/--/----';
                  }

                  return (
                    <div key={milestone.label} className="relative flex items-center gap-12 group">
                      <div className="z-10 flex flex-col items-center gap-1">
                        <div className="w-16 h-16 rounded-full bg-white border-4 border-gray-50 shadow-sm flex items-center justify-center text-indigo-600 font-bold text-sm group-hover:border-indigo-100 transition-all">
                          {milestone.label}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 font-mono">{milestoneDate}</span>
                      </div>
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1 hover:shadow-md transition-all cursor-default">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-semibold text-gray-900">{milestone.description}</h4>
                          {milestone.items && milestone.items.length > 0 && (
                            <div className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">
                              {Math.round((( (state.milestoneProgress?.[milestone.label] || []).filter(Boolean).length || 0) / milestone.items.length) * 100)}%
                            </div>
                          )}
                        </div>

                        {/* Progress Bar (Roadmap) */}
                        {milestone.items && milestone.items.length > 0 && (
                          <div className="w-full h-1 bg-gray-50 rounded-full mb-6 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(( (state.milestoneProgress?.[milestone.label] || []).filter(Boolean).length || 0) / milestone.items.length) * 100}%` }}
                              className="h-full bg-indigo-500 rounded-full"
                            />
                          </div>
                        )}

                        {/* Detailed Milestone Items with Checkboxes */}
                        {milestone.items && milestone.items.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mt-4">
                            {milestone.items.map((item, mIdx) => {
                              const isCompleted = state.milestoneProgress?.[milestone.label]?.[mIdx] || false;
                              return (
                                <button
                                  key={mIdx}
                                  onClick={() => toggleMilestoneItem(milestone.label, mIdx)}
                                  className="flex items-start gap-3 text-left group/item"
                                >
                                  <div className={cn(
                                    "mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
                                    isCompleted 
                                      ? "bg-indigo-500 border-indigo-500 text-white" 
                                      : "bg-white border-gray-200 group-hover/item:border-indigo-300"
                                  )}>
                                    {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                                  </div>
                                  <span className={cn(
                                    "text-xs transition-all",
                                    isCompleted ? "text-gray-400 line-through" : "text-gray-600 group-hover/item:text-indigo-600"
                                  )}>
                                    {item}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {!milestone.items && <p className="text-sm text-gray-500">Jalons clés et livrables pour cette phase.</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 md:w-64 bg-white border-r border-gray-100 flex flex-col z-50 print:hidden">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden md:block">EventSync</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label="Tableau de bord" />
          <NavButton active={activeTab === 'checklist'} onClick={() => setActiveTab('checklist')} icon={<CheckSquare />} label="Check-list" />
          <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<ListTodo />} label="Tâches" />
          <NavButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<FileText />} label="Notes" />
          <NavButton active={activeTab === 'decisions'} onClick={() => setActiveTab('decisions')} icon={<Lightbulb />} label="Décisions" />
          <NavButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<Calendar />} label="Timeline" />
        </nav>

        <div className="p-4 border-t border-gray-50 space-y-2">
          <button 
            onClick={copySummary}
            className="w-full flex items-center justify-center md:justify-start gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-2xl transition-all text-sm font-medium"
          >
            <Copy className="w-5 h-5" />
            <span className="hidden md:block">Copier le résumé</span>
          </button>
          <button 
            onClick={exportPDF}
            className="w-full flex items-center justify-center md:justify-start gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-2xl transition-all text-sm font-medium"
          >
            <Download className="w-5 h-5" />
            <span className="hidden md:block">Exporter en PDF</span>
          </button>
          
          <ResetButton onReset={resetData} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-20 md:pl-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-20 px-8 flex items-center justify-between bg-[#F8F9FB]/80 backdrop-blur-md sticky top-0 z-40 print:hidden">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900 capitalize">{activeTab}</h1>
            {isSaving && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-gray-400 flex items-center gap-1"
              >
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                Enregistré
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">{state.meetingInfo.title}</div>
              <div className="text-xs text-gray-500">{format(parseISO(state.meetingInfo.date), 'MMMM do, yyyy')}</div>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-medium">
              TM
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 max-w-5xl mx-auto w-full print:p-0 print:max-w-none relative">
          <AnimatePresence>
            {notification && (
              <motion.div 
                initial={{ opacity: 0, y: 20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 20, x: '-50%' }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-xl z-[100] text-sm font-medium flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {notification}
              </motion.div>
            )}
          </AnimatePresence>
          {renderTab()}
        </div>
      </main>

      {/* Print View (Hidden by default) */}
      <div className="hidden print:block p-12 bg-white min-h-screen text-black">
        <h1 className="text-4xl font-bold mb-2">{state.meetingInfo.title}</h1>
        <p className="text-gray-600 mb-8">{state.meetingInfo.date} à {state.meetingInfo.time}</p>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold border-b-2 border-gray-900 pb-2 mb-4">Décisions</h2>
            <ul className="list-disc pl-5 space-y-2">
              {state.decisions.filter(d => d.type === 'Décision').map(d => (
                <li key={d.id}>{d.text}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b-2 border-gray-900 pb-2 mb-4">Actions suivantes</h2>
            <ul className="list-disc pl-5 space-y-2">
              {state.decisions.filter(d => d.type === 'Action suivante').map(d => (
                <li key={d.id}>{d.text} <span className="text-gray-500 font-medium">({d.responsible || 'À définir'})</span></li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b-2 border-gray-900 pb-2 mb-4">Notes de la réunion</h2>
            <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
              {state.notes || 'Aucune note enregistrée.'}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="p-2 bg-red-50 rounded-2xl space-y-2">
        <p className="text-[10px] text-red-600 font-bold uppercase text-center">Êtes-vous sûr ?</p>
        <div className="flex gap-2">
          <button 
            onClick={onReset}
            className="flex-1 bg-red-500 text-white p-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
          >
            Oui
          </button>
          <button 
            onClick={() => setConfirming(false)}
            className="flex-1 bg-white text-gray-500 p-2 rounded-xl text-xs font-bold border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            Non
          </button>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setConfirming(true)}
      className="w-full flex items-center justify-center md:justify-start gap-3 p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-all text-sm font-medium"
    >
      <Trash2 className="w-5 h-5" />
      <span className="hidden md:block">Réinitialiser</span>
    </button>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-2xl transition-all group relative",
        active ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"
      )}
    >
      <div className={cn(
        "transition-transform w-6 h-6 flex items-center justify-center", 
        active ? "scale-110" : "group-hover:scale-110"
      )}>
        {icon}
      </div>
      <span className={cn("font-medium text-sm hidden md:block", active ? "text-indigo-700" : "text-gray-600")}>{label}</span>
      {active && (
        <motion.div 
          layoutId="activeNav"
          className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full hidden md:block"
        />
      )}
    </button>
  );
}
