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
    type: "streak_30",
    name: "Unstoppable",
    description: "30 day study streak",
    icon: "💎",
  },
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
];
