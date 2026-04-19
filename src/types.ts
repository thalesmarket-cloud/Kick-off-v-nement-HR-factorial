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
  milestoneProgress: Record<string, boolean[]>;
}

export const INITIAL_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  { section: '🎯 1. Cadrage stratégique', text: 'Objectif de l\'événement : Génération de leads', completed: false, status: 'Pas commencé' },
  { section: '🎯 1. Cadrage stratégique', text: 'Cible : Clients existants, prospects, partenaires', completed: false, status: 'Pas commencé' },
  { section: '🎯 1. Cadrage stratégique', text: 'Thématique de l\'événement', completed: false, status: 'Pas commencé' },
  { 
    section: '🎯 1. Cadrage stratégique', 
    text: 'Digitaliser ses RH : de la gestion administrative à la performance', 
    completed: false, 
    status: 'Pas commencé',
    isExclusive: true,
    indent: 1
  },
  { 
    section: '🎯 1. Cadrage stratégique', 
    text: 'Expérience collaborateur : le nouveau levier de fidélisation en 2026', 
    completed: false, 
    status: 'Pas commencé',
    isExclusive: true,
    indent: 1
  },
  { 
    section: '🎯 1. Cadrage stratégique', 
    text: 'Pilotage RH par la data : prendre de meilleures décisions grâce à son SIRH', 
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
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', type: 'currency', label: 'Budget global', readOnly: true },
  { section: '💰 3. Budget & finance', text: 'Répartition des coûts :', completed: false, status: 'Pas commencé' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', indent: 1, type: 'currency', label: 'Location salle' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', indent: 1, type: 'currency', label: 'Restauration' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', indent: 1, type: 'currency', label: 'Goodies' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', indent: 1, type: 'currency', label: 'Give away tombola' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', indent: 1, type: 'currency', label: 'Communication' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', indent: 1, type: 'currency', label: 'Prestataires' },
  { section: '💰 3. Budget & finance', text: 'Cofinancement des partenaires', completed: false, status: 'Pas commencé' },
  { section: '💰 3. Budget & finance', text: '50', completed: false, status: 'Pas commencé', indent: 1, type: 'number', label: 'Part Thalès (%)' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', indent: 1, type: 'currency', label: 'Montant Thalès', readOnly: true },
  { section: '💰 3. Budget & finance', text: '25', completed: false, status: 'Pas commencé', indent: 1, type: 'number', label: 'Part Factorial (%)' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', indent: 1, type: 'currency', label: 'Montant Factorial', readOnly: true },
  { section: '💰 3. Budget & finance', text: '25', completed: false, status: 'Pas commencé', indent: 1, type: 'number', label: 'Part Sage (%)' },
  { section: '💰 3. Budget & finance', text: '0', completed: false, status: 'Pas commencé', indent: 1, type: 'currency', label: 'Montant Sage', readOnly: true },
  { section: '📍 4. Logistique', text: 'Réservation du lieu', completed: false, status: 'Pas commencé' },
  { section: '📍 4. Logistique', text: 'Aménagement (tables, chaises, scène…)', completed: false, status: 'Pas commencé' },
  { section: '📍 4. Logistique', text: 'Signalétique (roll-up, affiches…)', completed: false, status: 'Pas commencé' },
  { section: '📍 4. Logistique', text: 'Accueil / check-in', completed: false, status: 'Pas commencé' },
  { section: '📍 4. Logistique', text: 'Badges / listes invités', completed: false, status: 'Pas commencé' },
  { section: '📍 4. Logistique', text: 'Parking / accès', completed: false, status: 'Pas commencé' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: '⏰ 09:00 – 09:30 | Accueil & petit-déjeuner ☕', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Accueil des participants & check-in', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Petit-déjeuner & networking informel', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Diffusion de contenu (slides / vidéo branding)', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: '⏰ 09:30 – 09:40 | Mot d’ouverture 🎤', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Mot de bienvenue', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Présentation des objectifs', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Introduction Factorial', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: '⏰ 09:40 – 10:00 | Présentation – Enjeux RH & introduction à la solution 📊', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Tendances RH & digitalisation', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Problématiques des entreprises', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Introduction à Factorial', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Bénéfices clés', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: '⏰ 10:00 – 10:15 | Pause networking ☕', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Échanges entre participants', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Discussions avec les équipes', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: '⏰ 10:15 – 10:45 | Démo Factorial 💻', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Démo de la plateforme', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Cas d’usage concrets', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: '⏰ 10:45 – 11:05 | Session Q&A interactive 💬', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Questions / réponses', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Interaction avec le public', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: '⏰ 11:05 – 11:20 | Tombola & animation 🎁', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Tirage au sort', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Annonce des gagnants', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: '⏰ 11:20 – 11:30 | Closing & Call-to-action 🚀', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Remerciements', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Synthèse', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Invitation à prendre RDV', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: '⏰ 11:30 – 12:00 | Déjeuner & networking 🍽️', completed: false, status: 'Pas commencé', type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Déjeuner sur place', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Échanges informels', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '🎤 5. Agenda détaillé – Événement Factorial (09h00 – 12h00)', text: 'Opportunités business', completed: false, status: 'Pas commencé', indent: 1, type: 'text' },
  { section: '📢 6. Communication & marketing', text: '1. Invitations & Diffusion (Email / LinkedIn)', completed: false, status: 'Pas commencé' },
  { section: '📢 6. Communication & marketing', text: 'Séquence emailing (J-15) & Ciblage (DRH, DAF, DIR)', completed: false, status: 'Pas commencé', indent: 1 },
  { section: '📢 6. Communication & marketing', text: 'Planning LinkedIn (Annonce J-15, Rappel J-7, Last Call J-2)', completed: false, status: 'Pas commencé', indent: 1 },
  { section: '📢 6. Communication & marketing', text: 'Focus Message : Valeur & Networking (plutôt que l’événement seul)', completed: false, status: 'Pas commencé', indent: 1 },
  { section: '📢 6. Communication & marketing', text: '2. Landing page & Formulaire d’inscription', completed: false, status: 'Pas commencé' },
  { section: '📢 6. Communication & marketing', text: 'Contenu LP : Agenda, Speakers, Bénéfices & CTA visible', completed: false, status: 'Pas commencé', indent: 1 },
  { section: '📢 6. Communication & marketing', text: 'Formulaire optimisé (Nom, Email, Tel, Entreprise, Fonction)', completed: false, status: 'Pas commencé', indent: 1 },
  { section: '📢 6. Communication & marketing', text: '3. Relances & Taux de participation', completed: false, status: 'Pas commencé' },
  { section: '📢 6. Communication & marketing', text: 'Rappels Email (J-7, J-2, J-1 Logistique)', completed: false, status: 'Pas commencé', indent: 1 },
  { section: '📢 6. Communication & marketing', text: 'Relances personnalisées (Leads chauds) & Rappel Jour J', completed: false, status: 'Pas commencé', indent: 1 },
  { section: '📢 6. Communication & marketing', text: '4. Kit Visuel & Graphisme', completed: false, status: 'Pas commencé' },
  { section: '📢 6. Communication & marketing', text: 'Pack Bannières (LinkedIn, Email, Stories, Landing Page)', completed: false, status: 'Pas commencé', indent: 1 },
  { section: '📢 6. Communication & marketing', text: 'Charte & Logos (Organisateur + Factorial)', completed: false, status: 'Pas commencé', indent: 1 },
  { section: '📢 6. Communication & marketing', text: '5. Visibilité & Hashtags (#FactorialEvent #RHdigitalMaroc)', completed: false, status: 'Pas commencé' },
  { section: '📢 6. Communication & marketing', text: '6. Couverture Live & Aftermovie', completed: false, status: 'Pas commencé' },
  { section: '📢 6. Communication & marketing', text: 'Pendant : Photos ambiance, extraits vidéos & Stories LinkedIn', completed: false, status: 'Pas commencé', indent: 1 },
  { section: '📢 6. Communication & marketing', text: 'Après : Vidéo récap (Aftermovie), Post remerciement & Album', completed: false, status: 'Pas commencé', indent: 1 },
];

export const MILESTONES = [
  { 
    label: 'J-23', 
    description: 'Cadrage + lancement express (AUJOURD’HUI)',
    items: [
      'Définir objectifs (leads, notoriété…)',
      'Valider cible (clients / prospects)',
      'Choisir thématique + format',
      'Fixer date & heure (verrouillé)',
      'Réserver lieu (URGENT)',
      'Définir budget global (estimatif)',
      'Identifier + contacter speakers',
      'Créer liste initiale d’invités'
    ]
  },
  { 
    label: 'J-18', 
    description: 'Structuration rapide',
    items: [
      'Confirmer speakers (au moins 70%)',
      'Définir agenda (version draft)',
      'Créer invitation (email + visuels simples)',
      'Créer formulaire d’inscription',
      'Lancer campagne d’invitations',
      'Préparer plan de communication'
    ]
  },
  { 
    label: 'J-14', 
    description: 'Mise en vitesse',
    items: [
      'Suivre inscriptions & 1ère relance',
      'Finaliser logistique principale (Matériel, Salle)',
      'Valider catering',
      'Lancer commande goodies',
      'Commencer préparation des présentations'
    ]
  },
  { 
    label: 'J-10', 
    description: 'Sécurisation intermédiaire',
    items: [
      'Vérifier taux d’inscription',
      'Ajuster communication (Boost LinkedIn)',
      'Confirmer définitivement speakers',
      'Avancer fortement sur les slides',
      'Vérifier besoins techniques'
    ]
  },
  { 
    label: 'J-7', 
    description: 'Finalisation',
    items: [
      'Relance finale & confirmer RSVP',
      'Finaliser présentations & déroulé détaillé',
      'Affecter rôles (Accueil, Animation, Tech)',
      'Préparer badges / liste'
    ]
  },
  { 
    label: 'J-3', 
    description: 'Sécurisation finale',
    items: [
      'Tester matériel & présentations',
      'Confirmer prestataires (Catering)',
      'Finaliser goodies',
      'Vérifier liste finale participants'
    ]
  },
  { 
    label: 'J-1', 
    description: 'Readiness',
    items: [
      'Envoyer rappel participants',
      'Préparer kit équipe',
      'Répétition rapide',
      'Vérifier checklist complète'
    ]
  },
];

export const OWNERS = ['Thalès Informatique', 'Sage', 'Factorial'];
