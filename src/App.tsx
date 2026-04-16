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
import { format, parseISO } from 'date-fns';
import { cn, generateId } from './lib/utils';
import { 
  AppState, 
  ChecklistItem, 
  Task, 
  Decision, 
  MeetingInfo, 
  INITIAL_CHECKLIST, 
  MILESTONES,
  Status
} from './types';

const STORAGE_KEY = 'eventsync_data';

export default function App() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checklist' | 'tasks' | 'notes' | 'decisions' | 'timeline'>('dashboard');
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    return {
      meetingInfo: {
        title: 'Corporate Annual Event 2026',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '10:00',
        location: 'Main Conference Room'
      },
      checklist: INITIAL_CHECKLIST.map(item => ({ ...item, id: generateId() })),
      tasks: [],
      notes: '',
      decisions: []
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

  // --- Helpers ---
  const progress = useMemo(() => {
    const total = state.checklist.length;
    const completed = state.checklist.filter(item => item.completed).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [state.checklist]);

  const updateMeetingInfo = (info: Partial<MeetingInfo>) => {
    setState(prev => ({ ...prev, meetingInfo: { ...prev.meetingInfo, ...info } }));
  };

  const toggleChecklistItem = (id: string) => {
    setState(prev => ({
      ...prev,
      checklist: prev.checklist.map(item => 
        item.id === id ? { ...item, completed: !item.completed, status: !item.completed ? 'Done' : 'Not started' } : item
      )
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
      title: 'New Task',
      assignee: '',
      deadline: format(new Date(), 'yyyy-MM-dd'),
      status: 'Not started'
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

  const addDecision = (type: 'Decision' | 'Next Step') => {
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

  const copySummary = () => {
    const summary = `
Meeting: ${state.meetingInfo.title}
Date: ${state.meetingInfo.date} at ${state.meetingInfo.time}
Progress: ${progress}%

Decisions:
${state.decisions.filter(d => d.type === 'Decision').map(d => `- ${d.text}`).join('\n')}

Next Steps:
${state.decisions.filter(d => d.type === 'Next Step').map(d => `- ${d.text} (Resp: ${d.responsible || 'TBD'})`).join('\n')}
    `.trim();
    navigator.clipboard.writeText(summary);
    setNotification('Summary copied to clipboard!');
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
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Meeting Details</h3>
                <div className="space-y-4">
                  <input 
                    className="text-2xl font-semibold w-full bg-transparent border-none focus:ring-0 p-0"
                    value={state.meetingInfo.title}
                    onChange={e => updateMeetingInfo({ title: e.target.value })}
                    placeholder="Meeting Title"
                  />
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <input 
                        type="date"
                        className="bg-transparent border-none focus:ring-0 p-0 text-sm"
                        value={state.meetingInfo.date}
                        onChange={e => updateMeetingInfo({ date: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <input 
                        type="time"
                        className="bg-transparent border-none focus:ring-0 p-0 text-sm"
                        value={state.meetingInfo.time}
                        onChange={e => updateMeetingInfo({ time: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Overall Progress</h3>
                  <div className="text-4xl font-light text-gray-900">{progress}%</div>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                  <motion.div 
                    className="bg-indigo-500 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">Quick Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-4 bg-indigo-50 rounded-2xl">
                  <div className="text-indigo-600 font-semibold text-xl">{state.checklist.filter(i => !i.completed).length}</div>
                  <div className="text-indigo-800 text-xs uppercase tracking-wide font-medium">Checklist Items Left</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl">
                  <div className="text-emerald-600 font-semibold text-xl">{state.tasks.filter(t => t.status !== 'Done').length}</div>
                  <div className="text-emerald-800 text-xs uppercase tracking-wide font-medium">Active Tasks</div>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl">
                  <div className="text-amber-600 font-semibold text-xl">{state.decisions.length}</div>
                  <div className="text-amber-800 text-xs uppercase tracking-wide font-medium">Decisions Made</div>
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
                    <div key={item.id} className="group flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <button 
                        onClick={() => toggleChecklistItem(item.id)}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                          item.completed ? "bg-indigo-500 border-indigo-500 text-white" : "border-gray-300 hover:border-indigo-400"
                        )}
                      >
                        {item.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <input 
                        className={cn(
                          "flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm",
                          item.completed && "text-gray-400 line-through"
                        )}
                        value={item.text}
                        onChange={e => updateChecklistItem(item.id, { text: e.target.value })}
                      />
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <select 
                          className="text-xs font-medium text-indigo-600 bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
                          value={item.status}
                          onChange={e => {
                            const newStatus = e.target.value as Status;
                            updateChecklistItem(item.id, { 
                              status: newStatus,
                              completed: newStatus === 'Done'
                            });
                          }}
                        >
                          <option value="Not started">Not started</option>
                          <option value="In progress">In progress</option>
                          <option value="Done">Done</option>
                        </select>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <input 
                            className="text-xs text-gray-500 bg-transparent border-none focus:ring-0 p-0 w-20"
                            placeholder="Owner"
                            value={item.owner || ''}
                            onChange={e => updateChecklistItem(item.id, { owner: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Task Management</h2>
              <button 
                onClick={addTask}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-bottom border-gray-100">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignee</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deadline</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {state.tasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No tasks added yet.</td>
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
                          <input 
                            className="bg-transparent border-none focus:ring-0 p-0 text-sm text-gray-600"
                            placeholder="Unassigned"
                            value={task.assignee}
                            onChange={e => updateTask(task.id, { assignee: e.target.value })}
                          />
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
                            <option value="Not started">Not started</option>
                            <option value="In progress">In progress</option>
                            <option value="Done">Done</option>
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
              <h2 className="text-xl font-semibold text-gray-900">Meeting Notes</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Save className="w-3 h-3" /> Auto-saving...
              </div>
            </div>
            <textarea 
              className="flex-1 w-full p-8 bg-white rounded-3xl shadow-sm border border-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-serif text-lg leading-relaxed text-gray-800"
              placeholder="Start typing your meeting notes here..."
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
                    <Lightbulb className="w-5 h-5 text-amber-500" /> Decisions
                  </h3>
                  <button 
                    onClick={() => addDecision('Decision')}
                    className="p-1 hover:bg-amber-50 rounded-full text-amber-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {state.decisions.filter(d => d.type === 'Decision').map(decision => (
                    <div key={decision.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group">
                      <div className="flex gap-3">
                        <textarea 
                          className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm resize-none h-12"
                          placeholder="What was decided?"
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
                    <ChevronRight className="w-5 h-5 text-indigo-500" /> Next Steps
                  </h3>
                  <button 
                    onClick={() => addDecision('Next Step')}
                    className="p-1 hover:bg-indigo-50 rounded-full text-indigo-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {state.decisions.filter(d => d.type === 'Next Step').map(step => (
                    <div key={step.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 group">
                      <div className="flex gap-3 mb-2">
                        <textarea 
                          className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm resize-none h-12"
                          placeholder="What needs to be done?"
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
                          placeholder="Responsible"
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
            <h2 className="text-xl font-semibold text-gray-900 mb-12">Event Timeline</h2>
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-100" />
              
              <div className="space-y-12">
                {MILESTONES.map((milestone, idx) => (
                  <div key={milestone.label} className="relative flex items-center gap-12 group">
                    <div className="z-10 w-16 h-16 rounded-full bg-white border-4 border-gray-50 shadow-sm flex items-center justify-center text-indigo-600 font-bold text-sm group-hover:border-indigo-100 transition-all">
                      {milestone.label}
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1 hover:shadow-md transition-all cursor-default">
                      <h4 className="font-semibold text-gray-900 mb-1">{milestone.description}</h4>
                      <p className="text-sm text-gray-500">Key milestones and deliverables for this phase.</p>
                    </div>
                  </div>
                ))}
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
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label="Dashboard" />
          <NavButton active={activeTab === 'checklist'} onClick={() => setActiveTab('checklist')} icon={<CheckSquare />} label="Checklist" />
          <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<ListTodo />} label="Tasks" />
          <NavButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon={<FileText />} label="Notes" />
          <NavButton active={activeTab === 'decisions'} onClick={() => setActiveTab('decisions')} icon={<Lightbulb />} label="Decisions" />
          <NavButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<Calendar />} label="Timeline" />
        </nav>

        <div className="p-4 border-t border-gray-50 space-y-2">
          <button 
            onClick={copySummary}
            className="w-full flex items-center justify-center md:justify-start gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-2xl transition-all text-sm font-medium"
          >
            <Copy className="w-5 h-5" />
            <span className="hidden md:block">Copy Summary</span>
          </button>
          <button 
            onClick={exportPDF}
            className="w-full flex items-center justify-center md:justify-start gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-2xl transition-all text-sm font-medium"
          >
            <Download className="w-5 h-5" />
            <span className="hidden md:block">Export PDF</span>
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
                Saved
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
        <p className="text-gray-600 mb-8">{format(parseISO(state.meetingInfo.date), 'MMMM do, yyyy')} at {state.meetingInfo.time}</p>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold border-b-2 border-gray-900 pb-2 mb-4">Decisions</h2>
            <ul className="list-disc pl-5 space-y-2">
              {state.decisions.filter(d => d.type === 'Decision').map(d => (
                <li key={d.id}>{d.text}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b-2 border-gray-900 pb-2 mb-4">Next Steps</h2>
            <ul className="list-disc pl-5 space-y-2">
              {state.decisions.filter(d => d.type === 'Next Step').map(d => (
                <li key={d.id}>{d.text} <span className="text-gray-500 font-medium">({d.responsible || 'TBD'})</span></li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b-2 border-gray-900 pb-2 mb-4">Meeting Notes</h2>
            <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
              {state.notes || 'No notes recorded.'}
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
        <p className="text-[10px] text-red-600 font-bold uppercase text-center">Are you sure?</p>
        <div className="flex gap-2">
          <button 
            onClick={onReset}
            className="flex-1 bg-red-500 text-white p-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
          >
            Yes
          </button>
          <button 
            onClick={() => setConfirming(false)}
            className="flex-1 bg-white text-gray-500 p-2 rounded-xl text-xs font-bold border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            No
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
      <span className="hidden md:block">Reset Data</span>
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
