import { createClient } from "@/lib/supabase";
import { BADGE_DEFINITIONS } from "./badges";

export async function checkAndAwardBadges(userId: string) {
  const supabase = createClient();

  // Get user's note count
  const { count: noteCount } = await supabase
    .from("notes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Get user's existing badges
  const { data: existingBadges } = await supabase
    .from("badges")
    .select("badge_type")
    .eq("user_id", userId);

  const earnedTypes = new Set(existingBadges?.map((b) => b.badge_type) || []);

  // Check note-based badges
  const noteBadges = [
    { count: 1, type: "first_note" },
    { count: 5, type: "note_5" },
    { count: 10, type: "note_10" },
    { count: 25, type: "note_25" },
  ];

  for (const badge of noteBadges) {
    if (noteCount && noteCount >= badge.count && !earnedTypes.has(badge.type)) {
      const definition = BADGE_DEFINITIONS.find((d) => d.type === badge.type);
      if (definition) {
        await supabase.from("badges").insert({
          user_id: userId,
          badge_type: badge.type,
          name: definition.name,
          description: definition.description,
          icon: definition.icon,
        });
      }
    }
  }

  // Check time-based badges
  const hour = new Date().getHours();
  if (hour < 7 && !earnedTypes.has("early_bird")) {
    const definition = BADGE_DEFINITIONS.find((d) => d.type === "early_bird");
    if (definition) {
      await supabase.from("badges").insert({
        user_id: userId,
        badge_type: "early_bird",
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
      });
    }
  }

  if (hour >= 22 && !earnedTypes.has("night_owl")) {
    const definition = BADGE_DEFINITIONS.find((d) => d.type === "night_owl");
    if (definition) {
      await supabase.from("badges").insert({
        user_id: userId,
        badge_type: "night_owl",
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
      });
    }
  }
}
