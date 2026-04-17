/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Status = 'Pas commencé' | 'En cours' | 'Terminé';

export interface ChecklistItem {
  id: string;
  section: string;
  text: string;
  completed: boolean;
  owner?: string;
  status: Status;
  isExclusive?: boolean; // If true, only one item in section can be completed
  indent?: number; // Indentation level for sub-items
  type?: 'text' | 'datetime' | 'select' | 'date' | 'currency' | 'number'; // Content type
  options?: string[]; // Options for select type
  label?: string; // Label displayed next to input
  readOnly?: boolean; // If true, the field cannot be edited manually
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  status: Status;
}

export interface Decision {
  id: string;
  text: string;
  responsible?: string;
  type: 'Décision' | 'Action suivante';
}

export interface MeetingInfo {
  title: string;
  date: string;
  time: string;
  location: string;
}

export interface AppState {
  meetingInfo: MeetingInfo;
  checklist: ChecklistItem[];
  tasks: Task[];
  notes: string;
  decisions: Decision[];
}

export const INITIAL_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  { section: '🎯 1. Cadrage stratégique', text: 'Objectif de l\'événement : Génération de leads', completed: false, status: 'Pas commencé' },
  { section: '🎯 1. Cadrage stratégique', text: 'Cible : Clients existants, prospects, partenaires', completed: false, status: 'Pas commencé' },
  { section: '🎯 1. Cadrage stratégique', text: 'Thématique de l\'événement', completed: false, status: 'Pas commencé' },
  { 
    section: '🎯 1. Cadrage stratégique', 
    text: 'Thème Factorial : Productivité & Automatisation (Gain de temps RH)', 
    completed: false, 
    status: 'Pas commencé',
    isExclusive: true,
    indent: 1
  },
  { 
    section: '🎯 1. Cadrage stratégique', 
    text: 'Thème Factorial : Culture & Engagement (Gestion des Talents)', 
    completed: false, 
    status: 'Pas commencé',
    isExclusive: true,
    indent: 1
  },
  { 
    section: '🎯 1. Cadrage stratégique', 
    text: 'Thème Factorial : Pilotage RH 360° (Données & Décisions)', 
    completed: false, 
    status: 'Pas commencé',
    isExclusive: true,
    indent: 1
  },
  { section: '📅 2. Organisation générale', text: '', completed: false, status: 'Pas commencé', type: 'datetime', label: 'Date et horaire' },
  { 
    section: '📅 2. Organisation générale', 
    text: '1 heure', 
    completed: false, 
    status: 'Pas commencé', 
    type: 'select', 
    label: 'Durée',
    options: ['1 heure', '2 heures', '3 heures'] 
  },
  { section: '📅 2. Organisation générale', text: 'Lieu (présentiel / hybride / en ligne)', completed: false, status: 'Pas commencé' },
  { section: '📅 2. Organisation générale', text: '50', completed: false, status: 'Pas commencé', type: 'number', label: 'Capacité d’accueil' },
  { section: '📅 2. Organisation générale', text: 'Planning détaillé (agenda)', completed: false, status: 'Pas commencé' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', type: 'currency', label: 'Budget global', readOnly: true },
  { section: '💰 3. Budget & finance', text: 'Répartition des coûts :', completed: false, status: 'Pas commencé' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', indent: 1, type: 'currency', label: 'Location salle' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', indent: 1, type: 'currency', label: 'Restauration' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', indent: 1, type: 'currency', label: 'Goodies' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', indent: 1, type: 'currency', label: 'Give away tombola' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', indent: 1, type: 'currency', label: 'Communication' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', indent: 1, type: 'currency', label: 'Prestataires' },
  { section: '💰 3. Budget & finance', text: 'Suivi des dépenses', completed: false, status: 'Pas commencé' },
  { section: '📍 4. Logistique', text: 'Réservation du lieu', completed: false, status: 'Pas commencé' },
  { section: '📍 4. Logistique', text: 'Aménagement (tables, chaises, scène…)', completed: false, status: 'Pas commencé' },
  { section: '📍 4. Logistique', text: 'Signalétique (roll-up, affiches…)', completed: false, status: 'Pas commencé' },
  { section: '📍 4. Logistique', text: 'Accueil / check-in', completed: false, status: 'Pas commencé' },
  { section: '📍 4. Logistique', text: 'Badges / listes invités', completed: false, status: 'Pas commencé' },
  { section: '📍 4. Logistique', text: 'Parking / accès', completed: false, status: 'Pas commencé' },
  { section: '🎤 5. Contenu & intervenants', text: '⏰ 09:00 – 09:30 | Accueil & petit-déjeuner ☕', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Accueil des participants & check-in', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Petit-déjeuner & networking informel', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Diffusion d’une vidéo ou slides en boucle (branding / messages clés)', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: '⏰ 09:30 – 09:40 | Mot d’ouverture 🎤', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Mot de bienvenue', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Présentation rapide de l’événement & des objectifs', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Introduction du partenaire Factorial', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: '⏰ 09:40 – 10:10 | Présentation – Enjeux RH & introduction à Factorial 📊', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Contexte & enjeux RH actuels (digitalisation, productivité…)', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Limites des outils traditionnels', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Introduction à Factorial comme solution', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Vue d’ensemble des bénéfices', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: '⏰ 10:10 – 10:25 | Pause networking ☕', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Échanges entre participants', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Discussions avec les équipes', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Activation soft (QR code, prise de contacts…)', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: '⏰ 10:25 – 10:55 | Démo Factorial 💻', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Démo live ou guidée de la plateforme', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Cas d’usage : gestion RH quotidienne', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Cas d’usage : automatisation', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Cas d’usage : suivi des collaborateurs', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: '⏰ 10:55 – 11:20 | Session Q&A interactive 💬', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Questions ouvertes du public', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Réponses des experts', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Interaction dynamique', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: '⏰ 11:20 – 11:40 | Tombola & animation 🎁', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Tirage au sort', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Annonce du/des gagnant(s)', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Remise du lot', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Moment convivial & photos', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: '⏰ 11:40 – 12:00 | Closing & Call-to-action 🚀', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Remerciements', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Récap des points clés', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Contenu & intervenants', text: 'Call-to-action : prise de RDV / démo personnalisée / échange', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
];

export const MILESTONES = [
  { label: 'J-30', description: 'Stratégie & Lieu' },
  { label: 'J-15', description: 'Communication & Intervenants' },
  { label: 'J-7', description: 'Logistique finale' },
  { label: 'J-1', description: 'Répétition technique' },
  { label: 'Jour J', description: 'Exécution' },
];

export const OWNERS = ['Thalès Informatique', 'Sage', 'Factorial'];
