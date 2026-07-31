export type Badge = {
  id: string;
  user_id: string;
  badge_type: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
};

export const BADGE_DEFINITIONS = [
  // Notes milestones
  {
    type: "first_note",
    name: "First Steps",
    description: "Create your first note",
    icon: "📝",
  },
  {
    type: "note_5",
    name: "Note Taker",
    description: "Create 5 notes",
    icon: "📚",
  },
  {
    type: "note_10",
    name: "Scholar",
    description: "Create 10 notes",
    icon: "🎓",
  },
  {
    type: "note_25",
    name: "Knowledge Master",
    description: "Create 25 notes",
    icon: "👑",
  },
  {
    type: "note_50",
    name: "Encyclopedia",
    description: "Create 50 notes",
    icon: "📖",
  },
  {
    type: "note_100",
    name: "Living Library",
    description: "Create 100 notes",
    icon: "🏛️",
  },

  // Study streaks
  {
    type: "streak_3",
    name: "On Fire",
    description: "3 day study streak",
    icon: "🔥",
  },
  {
    type: "streak_7",
    name: "Week Warrior",
    description: "7 day study streak",
    icon: "⚡",
  },
  {
    type: "streak_14",
    name: "Fortnight Fighter",
    description: "14 day study streak",
    icon: "🛡️",
  },
  {
    type: "streak_30",
    name: "Unstoppable",
    description: "30 day study streak",
    icon: "💎",
  },
  {
    type: "streak_60",
    name: "Iron Will",
    description: "60 day study streak",
    icon: "⚔️",
  },
  {
    type: "streak_100",
    name: "Legendary",
    description: "100 day study streak",
    icon: "🌟",
  },

  // Study time milestones
  {
    type: "time_1h",
    name: "Getting Started",
    description: "Study for 1 hour total",
    icon: "⏰",
  },
  {
    type: "time_5h",
    name: "Dedicated Learner",
    description: "Study for 5 hours total",
    icon: "📊",
  },
  {
    type: "time_10h",
    name: "Committed Student",
    description: "Study for 10 hours total",
    icon: "🎯",
  },
  {
    type: "time_25h",
    name: "Study Champion",
    description: "Study for 25 hours total",
    icon: "🏆",
  },
  {
    type: "time_50h",
    name: "Knowledge Seeker",
    description: "Study for 50 hours total",
    icon: "🚀",
  },
  {
    type: "time_100h",
    name: "Centurion",
    description: "Study for 100 hours total",
    icon: "💯",
  },

  // Study sessions
  {
    type: "session_1",
    name: "First Session",
    description: "Complete your first study session",
    icon: "🎬",
  },
  {
    type: "session_10",
    name: "Regular Studier",
    description: "Complete 10 study sessions",
    icon: "📈",
  },
  {
    type: "session_50",
    name: "Session Master",
    description: "Complete 50 study sessions",
    icon: "⭐",
  },
  {
    type: "session_100",
    name: "Century Club",
    description: "Complete 100 study sessions",
    icon: "💫",
  },

  // Long sessions
  {
    type: "long_session_2h",
    name: "Deep Focus",
    description: "Study for 2+ hours in one session",
    icon: "🧘",
  },
  {
    type: "long_session_4h",
    name: "Marathon Studier",
    description: "Study for 4+ hours in one session",
    icon: "🏃",
  },

  // Flashcards
  {
    type: "deck_1",
    name: "Card Collector",
    description: "Create your first flashcard deck",
    icon: "🃏",
  },
  {
    type: "deck_5",
    name: "Deck Builder",
    description: "Create 5 flashcard decks",
    icon: "🎴",
  },
  {
    type: "deck_10",
    name: "Flashcard Master",
    description: "Create 10 flashcard decks",
    icon: "🎰",
  },
  {
    type: "cards_10",
    name: "Card Sharp",
    description: "Create 10 flashcards total",
    icon: "♠️",
  },
  {
    type: "cards_50",
    name: "Card Shark",
    description: "Create 50 flashcards total",
    icon: "♦️",
  },
  {
    type: "cards_100",
    name: "Card Wizard",
    description: "Create 100 flashcards total",
    icon: "♣️",
  },

  // Subject diversity
  {
    type: "subject_3",
    name: "Multi-Tasker",
    description: "Study 3 different subjects",
    icon: "🎨",
  },
  {
    type: "subject_5",
    name: "Well-Rounded",
    description: "Study 5 different subjects",
    icon: "🌈",
  },
  {
    type: "subject_10",
    name: "Polymath",
    description: "Study 10 different subjects",
    icon: "🧠",
  },

  // Time-based achievements
  {
    type: "early_bird",
    name: "Early Bird",
    description: "Study before 7 AM",
    icon: "🌅",
  },
  {
    type: "night_owl",
    name: "Night Owl",
    description: "Study after 10 PM",
    icon: "🦉",
  },
  {
    type: "weekend_warrior",
    name: "Weekend Warrior",
    description: "Study on a weekend",
    icon: "🏖️",
  },
];
