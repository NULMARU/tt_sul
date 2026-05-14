// ============================================================
// Daily Story 시드 — Day 1–14 풀 본문 + Day 15–30 메타데이터
// 30일 주인공 한 명의 일기처럼 연결되는 스토리 라인
// 각 본문: easy(쉬움) / natural(자연) / challenge(도전) 3난이도
// ============================================================
import type { Story } from "../types/schema";

export const STORIES: Story[] = [
  // ─── Day 1 ───
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
      summary:  { question: "What does the narrator do right after the alarm rings the first time?", answer: "snoozes the alarm" },
      fill:     { sentence: "I ___ in bed before getting out.", answer: "stretch" },
      inference:{ question: "How does the narrator feel in the morning?", choices: ["Energetic", "Tired", "Angry", "Excited"], answer: 1 },
    },
  },

  // ─── Day 2 ───
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
      summary:  { question: "What wakes the narrator up in the bathroom?", answer: "cold water on the face" },
      fill:     { sentence: "I ___ myself in the mirror.", answer: "check" },
      inference:{ question: "What's the narrator's attitude about how they look?", choices: ["Vain", "Critical", "Relaxed", "Anxious"], answer: 2 },
    },
  },

  // ─── Day 3 ───
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
      summary:  { question: "What does the narrator say is non-negotiable?", answer: "brewing coffee" },
      fill:     { sentence: "I ___ an egg on the side.", answer: "fry" },
      inference:{ question: "How does the narrator describe their morning kitchen routine?", choices: ["Slow and calm", "Rushed and efficient", "Lazy", "Confused"], answer: 1 },
    },
  },

  // ─── Day 4 ───
  {
    id: "story-day-4",
    day: 4,
    title: "The Bus I Almost Missed",
    genre: "diary",
    place: "bus_stop",
    time: "morning",
    situations: ["commute_bus"],
    phraseIds: ["head_out", "wait_for_bus", "tap_card", "miss_subway"],
    body: {
      easy: `I head out. I am late. I walk fast. I get to the bus stop. I wait for the bus. The bus comes. I run. I get on. I tap my card. I find a seat. I am tired. But I made it.`,
      natural: `I head out the door five minutes late. I power-walk to the stop and wait for the bus, my heart already racing. I see it coming down the street and run the last twenty meters. I jump on, tap my card, and collapse into a seat. Just made it.`,
      challenge: `I bolt out the door — five minutes behind schedule, which on this line means I might as well call in sick. I speed-walk to the stop, lungs burning, when I spot the bus rounding the corner. I sprint, wave, and somehow the driver waits. Card tapped, seat claimed, dignity barely intact. Yesterday I missed the subway by ten seconds; today the universe owes me one.`,
    },
    comprehension: {
      summary:  { question: "How does the narrator catch the bus?", answer: "by running" },
      fill:     { sentence: "I ___ my card.", answer: "tap" },
      inference:{ question: "How does the narrator feel after catching it?", choices: ["Annoyed", "Relieved", "Embarrassed", "Indifferent"], answer: 1 },
    },
  },

  // ─── Day 5 ───
  {
    id: "story-day-5",
    day: 5,
    title: "Inbox Zero",
    genre: "diary",
    place: "office",
    time: "morning",
    situations: ["work_start", "meeting"],
    phraseIds: ["sit_at_desk", "turn_on_computer", "check_emails", "take_notes"],
    body: {
      easy: `I get to work. I sit down at my desk. I turn on my computer. I log in. I check my emails. There are many. I open one. I read it. I take notes. I reply. I close it. Then the next one. I want inbox zero.`,
      natural: `I get to the office and sit down at my desk. Computer on, coffee placed within reach. I check my emails — 47 unread. I tackle them in order, taking notes on the ones that need action. By the time I look up, the inbox is empty and it's still only 9:30.`,
      challenge: `I drop into my chair, fire up the computer, and crack my knuckles. Inbox: 47 unread, a personal challenge. I plow through them — flagging, filing, replying in one-liners — and jot down notes on the three that actually need brain. Inbox zero before standup. Tiny win, but I'll take it.`,
    },
    comprehension: {
      summary:  { question: "What is the narrator's goal this morning?", answer: "inbox zero" },
      fill:     { sentence: "I ___ down at my desk.", answer: "sit" },
      inference:{ question: "What's the narrator's attitude toward work?", choices: ["Avoidant", "Disciplined and efficient", "Anxious", "Bored"], answer: 1 },
    },
  },

  // ─── Day 6 ───
  {
    id: "story-day-6",
    day: 6,
    title: "Latte and a Lie",
    genre: "dialogue",
    place: "cafe",
    time: "midday",
    situations: ["coffee_order", "small_talk"],
    phraseIds: ["place_order", "wait_in_line", "chat_with_coworkers"],
    body: {
      easy: `Me: Let's grab coffee.
Coworker: Sure. I will wait in line with you.
Me: I want a latte. What about you?
Coworker: Same. Did you finish the report?
Me: Almost. Just one more page.
(That is a lie. I did not start.)
Coworker: You are so fast!`,
      natural: `"Need a coffee?" I ask.
"Always. I'll wait in line with you."
We chat with coworkers near the door before joining the queue. I place an order — two lattes, one with oat milk — and pay.
"Did you finish the report?" she asks.
"Almost. Just polishing it." A lie. I haven't even opened the doc.
She smiles. "You're so fast."`,
      challenge: `"Coffee run?" I say.
"Born ready. I'll wait in line with you."
We chat with coworkers by the entrance — weather, weekend, the usual filler — and shuffle to the counter. I place the order: two lattes, one oat, and tap the card before she can reach for hers.
"Hey, how's the report coming?" she asks, casually, lethally.
"Almost done. Just final polish." A bald-faced lie. The doc is still untitled.
"Wow. You're a machine." If only she knew.`,
    },
    comprehension: {
      summary:  { question: "What does the narrator lie about?", answer: "having finished the report" },
      fill:     { sentence: "We ___ in line.", answer: "wait" },
      inference:{ question: "How does the narrator likely feel about the lie?", choices: ["Proud", "Guilty and uncomfortable", "Indifferent", "Happy"], answer: 1 },
    },
  },

  // ─── Day 7 — Week 1 column ───
  {
    id: "story-day-7",
    day: 7,
    title: "Week 1, In One Page",
    genre: "column",
    place: "livingroom",
    time: "evening",
    situations: ["winding_down"],
    phraseIds: [],
    body: {
      easy: `One week down. Mornings are hard. I learned new words. I can say "I wake up." I can say "I get dressed." I can say "I head out." Small words. But I use them every day. Next week, I will try harder.`,
      natural: `One week in. The mornings still feel like a fight, but the words are starting to stick. I can say what I do — wake up, get dressed, head out, take the bus, sit at my desk — without thinking too hard. That's the trick: not the big speeches, but the boring sentences that fill a day.`,
      challenge: `Week one, in the books. The mornings still ambush me — 5-AM-me is no friend of 7-AM-me — but the basic verbs are starting to feel like furniture: wake up, brush my teeth, head out, tap my card, drop into my chair. Boring sentences. The kind you actually use. The flashy ones can wait.`,
    },
    comprehension: {
      summary:  { question: "What progress has the narrator made?", answer: "daily verbs feel natural" },
      fill:     { sentence: "I can say I ___ out.", answer: "head" },
      inference:{ question: "What's the narrator's strategy?", choices: ["Focus on hard grammar first", "Focus on small everyday phrases", "Memorize long speeches", "Avoid speaking"], answer: 1 },
    },
  },

  // ─── Day 8 ───
  {
    id: "story-day-8",
    day: 8,
    title: "Doomscrolling",
    genre: "diary",
    place: "livingroom",
    time: "night",
    situations: ["winding_down"],
    phraseIds: ["pick_up_phone", "unlock_phone", "scroll_feed"],
    body: {
      easy: `It is late. I should sleep. I pick up my phone. I unlock it. I scroll my feed. I see a video. I see another. Thirty minutes go by. My eyes hurt. I tell myself: one more, then sleep. One more never ends.`,
      natural: `It's 11:47. I should be asleep. I pick up my phone "just for a second," unlock it, and scroll my feed. Three videos in, I tell myself I'll stop. Twelve videos in, I'm watching someone restore a rusty knife and I cannot explain why. My eyes burn but my thumb keeps moving.`,
      challenge: `11:47. Sleep was the plan. I pick up my phone — "just for a sec" — unlock it, and the feed swallows me whole. Three reels in, the dopamine kicks in. Twelve reels later, I'm forty minutes deep in rusty-knife restoration tutorials and questioning my life choices. Eyes stinging, brain mush, thumb on autopilot. One more, I lie. One more, forever.`,
    },
    comprehension: {
      summary:  { question: "What's the narrator's problem at night?", answer: "can't stop scrolling" },
      fill:     { sentence: "I ___ through my feed.", answer: "scroll" },
      inference:{ question: "What's the narrator's tone about this habit?", choices: ["Defensive", "Self-aware and regretful", "Proud", "Confused"], answer: 1 },
    },
  },

  // ─── Day 9 ───
  {
    id: "story-day-9",
    day: 9,
    title: "The 6 PM Run",
    genre: "diary",
    place: "park",
    time: "evening",
    situations: ["hobby", "winding_down"],
    phraseIds: ["take_a_walk"],
    body: {
      easy: `After work, I go to the park. I take a walk. It is cool. The sky is pink. I see a dog. I see kids. I feel better. Forty minutes later, I go home.`,
      natural: `After work I head to the park. The sun is low and the air finally feels alive. I take a walk — not a run, despite what I told myself this morning. Forty minutes of slow loops past dog walkers and joggers, my brain unspooling one knot at a time. By the time I get home, I almost don't recognize the angry version of me from 5 PM.`,
      challenge: `After work I head to the park, telling myself it's a run. It is not a run. I take a walk — long, looping, deliberately aimless. The 6 PM sun goes peach, the dog walkers exchange the universal "we're both out here surviving" nod, and somewhere around minute thirty the work-brain finally shuts up. I go home a different person than the one who clocked out.`,
    },
    comprehension: {
      summary:  { question: "What does the narrator do after work?", answer: "takes a walk in the park" },
      fill:     { sentence: "I ___ a walk.", answer: "take" },
      inference:{ question: "How does the walk affect the narrator?", choices: ["Tires them out", "Calms them down and resets", "Makes them anxious", "Bores them"], answer: 1 },
    },
  },

  // ─── Day 10 ───
  {
    id: "story-day-10",
    day: 10,
    title: "Dishes, Laundry, Repeat",
    genre: "diary",
    place: "kitchen",
    time: "evening",
    situations: ["evening_chores"],
    phraseIds: ["do_dishes", "do_laundry", "vacuum"],
    body: {
      easy: `I arrive home. The sink is full. I do the dishes. The laundry basket is full too. I do the laundry. Then I vacuum the floor. I look around. Everything is clean. I am tired. The cycle starts again tomorrow.`,
      natural: `I arrive home and the apartment is in its usual after-work state — dishes in the sink, a laundry basket by the door, dust I swear wasn't there yesterday. I do the dishes first, throw in a load of laundry, and vacuum the living room. Twenty minutes of low-stakes motion and the place feels human again.`,
      challenge: `I arrive home to the same low-grade chaos as always — sink stacked, laundry basket overflowing, suspicious dust bunnies regrouping under the couch. I do the dishes, start a load of laundry, and vacuum like I have a personal vendetta against the rug. Twenty minutes of small motions, and the apartment exhales. So do I. Tomorrow it'll all be back, of course. That's the deal.`,
    },
    comprehension: {
      summary:  { question: "What chores does the narrator do?", answer: "dishes, laundry, vacuuming" },
      fill:     { sentence: "I ___ the dishes.", answer: "do" },
      inference:{ question: "How does the narrator view housework?", choices: ["Hates it deeply", "Necessary but never-ending", "A fun hobby", "Easy"], answer: 1 },
    },
  },

  // ─── Day 11 ───
  {
    id: "story-day-11",
    day: 11,
    title: "Three Minutes of Nothing",
    genre: "diary",
    place: "livingroom",
    time: "evening",
    situations: ["winding_down"],
    phraseIds: ["take_deep_breath", "zone_out", "meditate"],
    body: {
      easy: `I sit on the couch. I want to meditate. I close my eyes. I take a deep breath. My mind goes everywhere. I think about dinner. I think about work. I zone out. Three minutes is long. But I do it.`,
      natural: `I sit on the couch and decide to meditate for three minutes. Tiny goal, right? I close my eyes, take a deep breath, and within ten seconds my brain is in tomorrow's meeting, then on a beach, then composing a Slack message. I zone out, catch myself, breathe again. Three minutes is way longer than I remember.`,
      challenge: `I plant myself on the couch with the wild ambition of meditating for three whole minutes. I close my eyes, take a deep breath, and my brain immediately filibusters: dinner plans, that thing I forgot to email, a song lyric from 2014. I zone out, drift back, sigh, breathe. Three minutes is apparently a geological era. But I do it. Tiny win.`,
    },
    comprehension: {
      summary:  { question: "What does the narrator try to do?", answer: "meditate for three minutes" },
      fill:     { sentence: "I take a deep ___.", answer: "breath" },
      inference:{ question: "How well does the attempt go?", choices: ["Perfectly focused", "Mind wanders but they finish", "Gives up immediately", "Falls asleep"], answer: 1 },
    },
  },

  // ─── Day 12 ───
  {
    id: "story-day-12",
    day: 12,
    title: "Lights Out",
    genre: "diary",
    place: "bedroom",
    time: "night",
    situations: ["bedtime"],
    phraseIds: ["set_alarm", "plug_in_phone", "lie_down", "pull_up_blanket", "close_eyes", "fall_asleep"],
    body: {
      easy: `I set my alarm for 7. I check it twice. I plug in my phone. I turn off the lights. I lie down in bed. I pull up the blanket. I close my eyes. I fall asleep fast tonight. The day was long.`,
      natural: `I set my alarm for 7 — double-check, because past me has been burned. I plug in my phone, turn off the lights, and lie down. The blanket weight is perfect tonight. I close my eyes, and for once I'm not negotiating with my brain. I fall asleep before I can even replay the day.`,
      challenge: `I set the alarm for seven, then double-check it because past-me is a known liar. Phone on charger, lights off, blanket pulled to chin. The bed accepts me like an apology. Eyes closed. Brain, miraculously, on standby. I drift off before I can do my usual nightly highlight reel of regrets. Tonight, sleep wins early.`,
    },
    comprehension: {
      summary:  { question: "What does the narrator do before falling asleep?", answer: "sets alarm, plugs in phone, turns off lights, lies down" },
      fill:     { sentence: "I ___ down in bed.", answer: "lie" },
      inference:{ question: "How well does the narrator sleep tonight?", choices: ["Can't sleep", "Falls asleep quickly", "Wakes up multiple times", "Dreams a lot"], answer: 1 },
    },
  },

  // ─── Day 13 ───
  {
    id: "story-day-13",
    day: 13,
    title: "Aisle 7",
    genre: "dialogue",
    place: "store",
    time: "afternoon",
    situations: ["grocery"],
    phraseIds: [],
    body: {
      easy: `Me: Excuse me. Where is the milk?
Employee: Aisle 7. On the left.
Me: Thank you.
[At aisle 7]
Me: There are too many kinds.
Me: I will get the oat one.`,
      natural: `"Excuse me, where's the milk?" I ask an employee scrolling his phone.
"Aisle 7, on the left," he says without looking up.
I find it — and a wall of options. Whole, 2%, skim, lactose-free, oat, almond, soy, "barista blend." I stand there too long, like the milk is a math problem. Oat. I'll get oat. I always get oat.`,
      challenge: `"Excuse me — where's the milk?" I ask a guy who's clearly not paid enough to look up from his phone.
"Aisle 7. Left side."
I make it to Aisle 7 and meet a wall of milk. Whole, 2%, skim, lactose-free, oat, almond, soy, "barista blend," and one carton just labeled "milk" like it's trying to be ironic. I stand there reading labels for an embarrassing length of time before grabbing oat. I always grab oat. Why do I even pretend to deliberate.`,
    },
    comprehension: {
      summary:  { question: "What is the narrator looking for?", answer: "milk" },
      fill:     { sentence: "It's on the ___.", answer: "left" },
      inference:{ question: "What kind of milk does the narrator end up with?", choices: ["Whole milk", "Oat milk", "Soy milk", "Almond milk"], answer: 1 },
    },
  },

  // ─── Day 14 — Week 2 column ───
  {
    id: "story-day-14",
    day: 14,
    title: "Week 2 Recap",
    genre: "column",
    place: "livingroom",
    time: "evening",
    situations: ["winding_down"],
    phraseIds: [],
    body: {
      easy: `Two weeks done. I can talk about my day in English. Wake up, eat, work, walk, sleep. I am not fast. But I am steady. Small steps every day. That is enough for now.`,
      natural: `Two weeks in. The day-to-day vocabulary is starting to feel like a worn-in shoe. I can narrate a whole day — wake up, brush my teeth, head out, tap my card, sit at my desk, take a walk, do the dishes, lie down — without stopping to translate. The words don't feel borrowed anymore. They feel mine.`,
      challenge: `Two weeks down, and I notice the shift: I'm not translating, I'm just speaking. The daily verbs — wake up, head out, tap, sit, walk, do the dishes, lie down — slide out without ceremony. I'm not fluent. I'm not even fast. But there's a click somewhere in the engine, and I'm trusting it. Week three: emotions. Already a little terrified.`,
    },
    comprehension: {
      summary:  { question: "What change does the narrator notice?", answer: "not translating anymore, words feel natural" },
      fill:     { sentence: "I am not ___.", answer: "fast" },
      inference:{ question: "How does the narrator feel about progress?", choices: ["Disappointed", "Steady and proud", "Overwhelmed", "Bored"], answer: 1 },
    },
  },

  // ─── Day 15–30 (Metadata only — 본문은 추후 작성/LLM 생성) ───
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
