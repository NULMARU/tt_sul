// ============================================================
// Daily Story 시드 — Day 1–3 풀 본문, Day 4–30 메타데이터
// 30일 주인공 한 명의 일기처럼 연결됨 (스토리 라인)
// ============================================================
import type { Story } from "../types/schema";

export const STORIES: Story[] = [
  // ─── Day 1 (Full) ───
  {
    id: "story-day-1",
    day: 1,
    title: "The 7:00 AM Battle",
    genre: "diary",
    place: "bedroom",
    time: "morning",
    situations: ["alarm_off", "morning_routine"],
    phraseIds: ["wake_up", "snooze_alarm", "rub_eyes", "yawn", "sit_up_in_bed", "stretch", "get_out_of_bed"],
    body: {
      easy: `My alarm goes off at 7. I wake up. I'm tired. I snooze my alarm. I sleep five more minutes. The alarm rings again. I rub my eyes. I yawn. I sit up in bed. I stretch. Finally, I get out of bed. The floor is cold.`,
      natural: `The alarm goes off at seven. I wake up feeling exhausted, so I snooze it for five more minutes. Then it rings again. I rub my eyes, yawn, and finally sit up in bed. After a long stretch, I drag myself out of bed and head to the bathroom. The floor is freezing.`,
      challenge: `Seven AM. Beep beep beep. I'm wiped out, but I peel my eyes open, hit snooze, and burrow back into the blanket — only for the alarm to ambush me five minutes later. I rub my eyes, let out a massive yawn, prop myself up, stretch like a cat, and finally roll out of bed. The floor is icy.`,
    },
    comprehension: {
      summary: { question: "What does the narrator do right after the alarm rings the first time?", answer: "snoozes the alarm" },
      fill:    { sentence: "I ___ in bed before getting out.", answer: "stretch" },
      inference: {
        question: "How does the narrator feel in the morning?",
        choices: ["Energetic", "Tired", "Angry", "Excited"],
        answer: 1,
      },
    },
  },

  // ─── Day 2 (Full) ───
  {
    id: "story-day-2",
    day: 2,
    title: "Mirror Talk",
    genre: "diary",
    place: "bathroom",
    time: "morning",
    situations: ["skincare", "get_dressed"],
    phraseIds: ["wash_face", "put_on_lotion", "apply_sunscreen", "comb_hair", "get_dressed", "check_mirror"],
    body: {
      easy: `I go to the bathroom. I wash my face. The water is cold. I put on lotion. I apply sunscreen. I comb my hair. Then I get dressed. I check myself in the mirror. I look okay.`,
      natural: `In the bathroom, I splash cold water on my face — that always wakes me up. I pat on some lotion, apply sunscreen, and comb my hair. Then I get dressed and check myself in the mirror. Not bad.`,
      challenge: `Cold water shocks me awake at the bathroom sink. I slap on lotion, slather on sunscreen, run a comb through my hair, throw on whatever's clean, and give myself one last once-over in the mirror. Good enough.`,
    },
    comprehension: {
      summary: { question: "What wakes the narrator up in the bathroom?", answer: "cold water on the face" },
      fill:    { sentence: "I ___ myself in the mirror.", answer: "check" },
      inference: {
        question: "What's the narrator's attitude about how they look?",
        choices: ["Vain", "Critical", "Relaxed", "Anxious"],
        answer: 2,
      },
    },
  },

  // ─── Day 3 (Full) ───
  {
    id: "story-day-3",
    day: 3,
    title: "Kitchen, 7:40",
    genre: "diary",
    place: "kitchen",
    time: "morning",
    situations: ["breakfast"],
    phraseIds: ["brew_coffee", "open_fridge", "fry_egg", "pop_bread", "pour_milk", "sit_at_table", "eat_breakfast"],
    body: {
      easy: `I go to the kitchen. I brew some coffee. I open the fridge. There is bread. I pop the bread in the toaster. I fry an egg. I pour the milk. I sit at the table. I eat breakfast. The coffee is hot.`,
      natural: `I walk into the kitchen and brew some coffee — that's non-negotiable. I open the fridge, grab some bread, pop it in the toaster, and fry an egg on the side. I pour myself a glass of milk, sit at the table, and finally have breakfast.`,
      challenge: `Kitchen mode: coffee first, everything else later. I crack the fridge open, toss bread into the toaster, fry an egg with one hand while the milk hits the glass with the other. I plop down at the table and devour breakfast before the coffee even cools.`,
    },
    comprehension: {
      summary: { question: "What does the narrator say is non-negotiable?", answer: "brewing coffee" },
      fill:    { sentence: "I ___ an egg on the side.", answer: "fry" },
      inference: {
        question: "How does the narrator describe their morning kitchen routine?",
        choices: ["Slow and calm", "Rushed and efficient", "Lazy", "Confused"],
        answer: 1,
      },
    },
  },

  // ─── Day 4-30 (Metadata only — 본문은 추후 작성/LLM 생성) ───
  { id: "story-day-4",  day: 4,  title: "The Bus I Almost Missed", genre: "diary",    place: "bus_stop",   time: "morning",   situations: ["commute_bus"],            phraseIds: ["head_out", "wait_for_bus", "tap_card", "miss_subway"], body: {} },
  { id: "story-day-5",  day: 5,  title: "Inbox Zero",              genre: "diary",    place: "office",     time: "morning",   situations: ["work_start", "meeting"],  phraseIds: ["sit_at_desk", "turn_on_computer", "check_emails", "take_notes"], body: {} },
  { id: "story-day-6",  day: 6,  title: "Latte and a Lie",         genre: "dialogue", place: "cafe",       time: "midday",    situations: ["coffee_order", "small_talk"], phraseIds: ["place_order", "wait_in_line", "chat_with_coworkers"], body: {} },
  { id: "story-day-7",  day: 7,  title: "Week 1, In One Page",     genre: "column",   place: "livingroom", time: "evening",   situations: ["winding_down"],            phraseIds: [], body: {} },
  { id: "story-day-8",  day: 8,  title: "Doomscrolling",           genre: "diary",    place: "livingroom", time: "night",     situations: ["winding_down"],            phraseIds: ["pick_up_phone", "unlock_phone", "scroll_feed"], body: {} },
  { id: "story-day-9",  day: 9,  title: "The 6 PM Run",            genre: "diary",    place: "park",       time: "evening",   situations: ["hobby"],                   phraseIds: ["take_a_walk"], body: {} },
  { id: "story-day-10", day: 10, title: "Dishes, Laundry, Repeat", genre: "diary",    place: "kitchen",    time: "evening",   situations: ["evening_chores"],          phraseIds: ["do_dishes", "do_laundry", "vacuum"], body: {} },
  { id: "story-day-11", day: 11, title: "Three Minutes of Nothing",genre: "diary",    place: "livingroom", time: "evening",   situations: ["winding_down"],            phraseIds: ["take_deep_breath", "zone_out", "meditate"], body: {} },
  { id: "story-day-12", day: 12, title: "Lights Out",              genre: "diary",    place: "bedroom",    time: "night",     situations: ["bedtime"],                 phraseIds: ["set_alarm", "lie_down", "fall_asleep"], body: {} },
  { id: "story-day-13", day: 13, title: "Aisle 7",                 genre: "dialogue", place: "store",      time: "afternoon", situations: ["grocery"],                 phraseIds: [], body: {} },
  { id: "story-day-14", day: 14, title: "Week 2 Recap",            genre: "column",   place: "livingroom", time: "evening",   situations: ["winding_down"],            phraseIds: [], body: {} },
  { id: "story-day-15", day: 15, title: "I Think I'm Coming Down", genre: "diary",    place: "bedroom",    time: "afternoon", situations: ["winding_down"],            phraseIds: ["have_headache", "feel_sick"], body: {} },
  { id: "story-day-16", day: 16, title: "Best Morning in a While", genre: "diary",    place: "kitchen",    time: "morning",   situations: ["morning_routine"],         phraseIds: ["feel_great", "good_mood", "motivated"], body: {} },
  { id: "story-day-17", day: 17, title: "Stuck in Traffic",        genre: "diary",    place: "street",     time: "morning",   situations: ["commute_bus"],             phraseIds: ["stressed_out", "annoyed", "cant_focus"], body: {} },
  { id: "story-day-18", day: 18, title: "That New Cafe",           genre: "dialogue", place: "cafe",       time: "afternoon", situations: ["coffee_order", "small_talk"], phraseIds: [], body: {} },
  { id: "story-day-19", day: 19, title: "I'm Sorry, Really",       genre: "dialogue", place: "office",     time: "midday",    situations: ["apology", "meeting"],      phraseIds: [], body: {} },
  { id: "story-day-20", day: 20, title: "Two Lines, Same Bench",   genre: "dialogue", place: "park",       time: "evening",   situations: ["small_talk"],              phraseIds: [], body: {} },
  { id: "story-day-21", day: 21, title: "Week 3 Recap",            genre: "column",   place: "livingroom", time: "evening",   situations: ["winding_down"],            phraseIds: [], body: {} },
  { id: "story-day-22", day: 22, title: "I'm Going to Try",        genre: "diary",    place: "office",     time: "morning",   situations: ["work_start"],              phraseIds: [], body: {} },
  { id: "story-day-23", day: 23, title: "I Used to Hate Mornings", genre: "diary",    place: "kitchen",    time: "morning",   situations: ["morning_routine"],         phraseIds: [], body: {} },
  { id: "story-day-24", day: 24, title: "If It Rains Tomorrow",    genre: "dialogue", place: "livingroom", time: "evening",   situations: ["small_talk"],              phraseIds: [], body: {} },
  { id: "story-day-25", day: 25, title: "What I Should Have Said", genre: "diary",    place: "office",     time: "evening",   situations: ["winding_down"],            phraseIds: [], body: {} },
  { id: "story-day-26", day: 26, title: "It's Been a Day",         genre: "diary",    place: "livingroom", time: "night",     situations: ["winding_down"],            phraseIds: [], body: {} },
  { id: "story-day-27", day: 27, title: "Just in Case",            genre: "dialogue", place: "entrance",   time: "morning",   situations: ["morning_routine"],         phraseIds: [], body: {} },
  { id: "story-day-28", day: 28, title: "Week 4 Recap",            genre: "column",   place: "livingroom", time: "evening",   situations: ["winding_down"],            phraseIds: [], body: {} },
  { id: "story-day-29", day: 29, title: "A Day in the Life",       genre: "diary",    place: "livingroom", time: "evening",   situations: ["winding_down"],            phraseIds: [], body: {} },
  { id: "story-day-30", day: 30, title: "Tomorrow, In English",    genre: "column",   place: "livingroom", time: "night",     situations: ["winding_down"],            phraseIds: [], body: {} },
];

export const STORY_BY_ID: Record<string, Story> = Object.fromEntries(STORIES.map(s => [s.id, s]));
export const STORY_BY_DAY: Record<number, Story> = Object.fromEntries(STORIES.map(s => [s.day, s]));
