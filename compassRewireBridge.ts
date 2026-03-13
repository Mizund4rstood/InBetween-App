import { useRewireStore, UrgeType, UrgeEntry } from '@/stores/rewireStore';
import { CompassTrigger, CompassChoice } from '@/stores/compassStore';

/**
 * Maps compass urge text / category to a rewire UrgeType.
 * Falls back to 'other' if no match.
 */
function mapUrgeType(trigger: CompassTrigger): UrgeType {
  const text = `${trigger.urge || ''} ${trigger.category || ''} ${trigger.trigger_text || ''} ${trigger.emotion || ''}`.toLowerCase();

  if (/drink|alcohol|beer|wine|liquor|sober|bottle/.test(text)) return 'drinking';
  if (/spiral|overwhelm|panic|loop|racing|rumnat|obsess/.test(text)) return 'spiral';
  if (/avoid|procrastinat|put off|ignore|skip|hide|withdraw/.test(text)) return 'avoidance';
  if (/anger|angry|rage|snap|yell|punch|explod|react|lash/.test(text)) return 'anger';

  return 'other';
}

/**
 * Bridges a compass trigger+choice into the rewire urge store.
 * Only fires if the rewire program is active.
 */
export function bridgeCompassToRewire(
  trigger: CompassTrigger,
  choice?: CompassChoice | null,
) {
  const store = useRewireStore.getState();
  if (!store.startDate) return; // program not active

  const urgeType = mapUrgeType(trigger);

  // Compass intensity is 1–10, rewire is 1–5
  const intensity = Math.max(1, Math.min(5, Math.round((trigger.intensity || 5) / 2)));

  // If they paused, credit 30s of delay (we don't have exact timing from compass)
  const delaySec = choice?.pause_used ? 30 : 0;

  // "Acted on urge" = they did NOT choose differently
  const actedOnUrge = choice ? !(choice.chose_differently ?? false) : true;

  // If they chose differently, the choice text is the replacement
  const replacementUsed = choice?.chose_differently ? (choice.choice_text || null) : null;

  const entry: UrgeEntry = {
    id: `compass-${trigger.id}`,
    createdAt: trigger.created_at,
    urgeType,
    trigger: trigger.trigger_text,
    intensity,
    delaySec,
    actedOnUrge,
    replacementUsed,
    notes: `From Compass${trigger.emotion ? ` — ${trigger.emotion}` : ''}`,
  };

  // Avoid duplicates
  const existing = store.urges.find(u => u.id === entry.id);
  if (!existing) {
    store.addUrge(entry);
  }
}
