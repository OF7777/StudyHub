import { createClient } from "@/lib/supabase";
import { BADGE_DEFINITIONS } from "./badges";

export async function checkAndAwardBadges(userId: string) {
  const supabase = createClient();

  // Get user's existing badges
  const { data: existingBadges } = await supabase
    .from("badges")
    .select("badge_type")
    .eq("user_id", userId);

  const earnedTypes = new Set(existingBadges?.map((b) => b.badge_type) || []);

  // Helper function to award a badge
  async function awardBadge(type: string) {
    if (earnedTypes.has(type)) return;
    const definition = BADGE_DEFINITIONS.find((d) => d.type === type);
    if (definition) {
      await supabase.from("badges").insert({
        user_id: userId,
        badge_type: type,
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
      });
      earnedTypes.add(type);
    }
  }

  // Get all data we need
  const [
    { count: noteCount },
    { data: studySessions },
    { data: flashcardDecks },
    { data: notes },
  ] = await Promise.all([
    supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("study_sessions").select("*").eq("user_id", userId).order("started_at", { ascending: false }),
    supabase.from("flashcard_decks").select("*").eq("user_id", userId),
    supabase.from("notes").select("subject").eq("user_id", userId),
  ]);

  // Get flashcards after we have deck IDs
  const deckIds = flashcardDecks?.map(d => d.id) || [];
  const { data: flashcards } = deckIds.length > 0
    ? await supabase.from("flashcards").select("id, deck_id").in("deck_id", deckIds)
    : { data: [] };

  // Note milestones
  const noteMilestones = [1, 5, 10, 25, 50, 100];
  const noteTypes = ["first_note", "note_5", "note_10", "note_25", "note_50", "note_100"];
  for (let i = 0; i < noteMilestones.length; i++) {
    if (noteCount && noteCount >= noteMilestones[i]) {
      await awardBadge(noteTypes[i]);
    }
  }

  // Study sessions data
  const sessions = studySessions || [];
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const totalHours = totalMinutes / 60;

  // Study time milestones
  const timeMilestones = [
    { hours: 1, type: "time_1h" },
    { hours: 5, type: "time_5h" },
    { hours: 10, type: "time_10h" },
    { hours: 25, type: "time_25h" },
    { hours: 50, type: "time_50h" },
    { hours: 100, type: "time_100h" },
  ];
  for (const milestone of timeMilestones) {
    if (totalHours >= milestone.hours) {
      await awardBadge(milestone.type);
    }
  }

  // Session count milestones
  const sessionMilestones = [
    { count: 1, type: "session_1" },
    { count: 10, type: "session_10" },
    { count: 50, type: "session_50" },
    { count: 100, type: "session_100" },
  ];
  for (const milestone of sessionMilestones) {
    if (sessions.length >= milestone.count) {
      await awardBadge(milestone.type);
    }
  }

  // Long session badges
  for (const session of sessions) {
    const minutes = session.duration_minutes || 0;
    if (minutes >= 240) {
      await awardBadge("long_session_4h");
    }
    if (minutes >= 120) {
      await awardBadge("long_session_2h");
    }
  }

  // Study streak calculation
  if (sessions.length > 0) {
    const uniqueDays = new Set<string>();
    sessions.forEach(s => {
      const date = new Date(s.started_at).toDateString();
      uniqueDays.add(date);
    });

    const sortedDays = Array.from(uniqueDays).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDays.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      if (sortedDays.includes(checkDate.toDateString())) {
        streak++;
      } else {
        break;
      }
    }

    // Streak milestones
    const streakMilestones = [
      { days: 3, type: "streak_3" },
      { days: 7, type: "streak_7" },
      { days: 14, type: "streak_14" },
      { days: 30, type: "streak_30" },
      { days: 60, type: "streak_60" },
      { days: 100, type: "streak_100" },
    ];
    for (const milestone of streakMilestones) {
      if (streak >= milestone.days) {
        await awardBadge(milestone.type);
      }
    }
  }

  // Flashcard deck milestones
  const decks = flashcardDecks || [];
  const deckMilestones = [
    { count: 1, type: "deck_1" },
    { count: 5, type: "deck_5" },
    { count: 10, type: "deck_10" },
  ];
  for (const milestone of deckMilestones) {
    if (decks.length >= milestone.count) {
      await awardBadge(milestone.type);
    }
  }

  // Flashcard cards milestones
  const cards = flashcards || [];
  const cardMilestones = [
    { count: 10, type: "cards_10" },
    { count: 50, type: "cards_50" },
    { count: 100, type: "cards_100" },
  ];
  for (const milestone of cardMilestones) {
    if (cards.length >= milestone.count) {
      await awardBadge(milestone.type);
    }
  }

  // Subject diversity
  const subjects = new Set(notes?.map(n => n.subject).filter(Boolean) || []);
  const subjectMilestones = [
    { count: 3, type: "subject_3" },
    { count: 5, type: "subject_5" },
    { count: 10, type: "subject_10" },
  ];
  for (const milestone of subjectMilestones) {
    if (subjects.size >= milestone.count) {
      await awardBadge(milestone.type);
    }
  }

  // Time-based badges
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

  if (hour < 7) {
    await awardBadge("early_bird");
  }

  if (hour >= 22) {
    await awardBadge("night_owl");
  }

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    await awardBadge("weekend_warrior");
  }
}
