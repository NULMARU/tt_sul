// ============================================================
// Daily Story 시드 — Day 1–30 모두 풀 본문
// 30일 주인공 한 명의 일기처럼 연결되는 연속극
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

  // ─── Day 15 ───
  {
    id: "story-day-15",
    day: 15,
    title: "I Think I'm Coming Down",
    genre: "diary",
    place: "bedroom",
    time: "afternoon",
    situations: ["winding_down"],
    phraseIds: ["have_headache", "feel_sick", "im_exhausted", "cant_focus"],
    body: {
      easy: `My head hurts. I have a headache. I feel sick. I have no energy. I can't focus. I tell my boss. I go home. I lie down. Tomorrow I hope I am better.`,
      natural: `I have a headache. The kind that builds slowly and then takes over. By 2 PM, I feel sick and I can't focus on anything. I tell my boss I'm going to head home, and she nods — she's seen this version of me before. I lie down on the couch with a glass of water and a quiet prayer for tomorrow-me.`,
      challenge: `Headache. The slow-build kind that announces itself politely at 11 AM and is running the show by 2. I feel sick, I'm exhausted, my brain has filed for resignation. I tell my boss I'm coming down with something — she doesn't ask twice — and somehow drag myself home. Couch, water, blanket. The day is officially canceled. I send a quiet apology to tomorrow-me and hope the universe is feeling lenient.`,
    },
    comprehension: {
      summary:  { question: "Why does the narrator go home early?", answer: "feeling sick / has a headache" },
      fill:     { sentence: "I have a ___.", answer: "headache" },
      inference:{ question: "How will the narrator likely spend the evening?", choices: ["Going out", "Resting at home", "Working from home", "Cleaning"], answer: 1 },
    },
  },

  // ─── Day 16 ───
  {
    id: "story-day-16",
    day: 16,
    title: "Best Morning in a While",
    genre: "diary",
    place: "kitchen",
    time: "morning",
    situations: ["morning_routine"],
    phraseIds: ["feel_great", "good_mood", "motivated", "brew_coffee"],
    body: {
      easy: `I wake up. I feel great. I am in a good mood. The sun is bright. I brew some coffee. I feel motivated. I will have a good day. I want to start work right away.`,
      natural: `I wake up and — for once — I feel great. I'm in a good mood before my feet even hit the floor, which is rare. The kitchen smells like coffee I haven't made yet. I'm motivated. Like, dangerously motivated. I might actually finish that thing today.`,
      challenge: `I wake up feeling great, which is so out of character I almost don't trust it. Good mood, full battery, the sunrise looking like a Hallmark card. I'm motivated — not the fake productive-Instagram kind, but the real kind, where the to-do list looks like a fun puzzle. Coffee tastes like a five-star review. Today is going to be one of those days. I'll pay for it tomorrow, but today is mine.`,
    },
    comprehension: {
      summary:  { question: "How does the narrator feel this morning?", answer: "great / motivated" },
      fill:     { sentence: "I'm in a ___ mood.", answer: "good" },
      inference:{ question: "How does the narrator react to feeling so good?", choices: ["Suspicious of it", "Ready to take advantage", "Both — wary but happy", "Anxious it won't last"], answer: 2 },
    },
  },

  // ─── Day 17 ───
  {
    id: "story-day-17",
    day: 17,
    title: "Stuck in Traffic",
    genre: "diary",
    place: "street",
    time: "morning",
    situations: ["commute_bus"],
    phraseIds: ["stressed_out", "annoyed", "cant_focus", "take_deep_breath"],
    body: {
      easy: `The bus is slow. There is too much traffic. I am stressed out. I am annoyed. I check my watch. I can't focus on my book. I will be late. I close my eyes. I take a deep breath.`,
      natural: `The bus has been stuck on the same block for ten minutes. I'm stressed out, annoyed, and I can't focus on the article I'm pretending to read. I check the time. I'll be twenty minutes late, easy. I close my eyes, take a deep breath, and try to remember it's not personal — just traffic.`,
      challenge: `Bus. Frozen on the same block for the past eleven minutes. I'm stressed out and annoyed, and the article on my phone might as well be in cuneiform — I can't focus. Twenty minutes late, minimum. I draft three increasingly passive-aggressive Slack messages, delete all of them, and close my eyes. Deep breath. It's not personal. It's just a city. Breathe.`,
    },
    comprehension: {
      summary:  { question: "Why is the narrator stressed?", answer: "stuck in traffic, will be late" },
      fill:     { sentence: "I'm ___ out.", answer: "stressed" },
      inference:{ question: "How does the narrator try to cope?", choices: ["Calls boss", "Closes eyes and breathes", "Gets off the bus", "Sends angry Slack messages"], answer: 1 },
    },
  },

  // ─── Day 18 ───
  {
    id: "story-day-18",
    day: 18,
    title: "That New Cafe",
    genre: "dialogue",
    place: "cafe",
    time: "afternoon",
    situations: ["coffee_order", "small_talk"],
    phraseIds: ["place_order", "wait_in_line"],
    body: {
      easy: `Me: This is the new cafe.
Friend: It is small.
Me: But it is cute.
Friend: The coffee is expensive.
Me: I will get a latte.
Friend: It is too expensive.
Me: But it is good. Let's wait in line.`,
      natural: `"Welcome to The New Cafe That Everyone's Talking About," I say, opening the door.
"Wow. Smaller than I expected."
"Smaller and twice the price."
"Is it good though?"
"It's great. But it's too expensive."
We wait in line and place an order: one latte, one cortado. She winces at the total.
"Then why are we here?"
"Because that's how cafes work in this city."`,
      challenge: `"Welcome to The New Cafe That Everyone Is Talking About," I say, pushing the door open with theatrical flair.
"Wow. It's tiny."
"Tiny and four-dollars-too-expensive."
"Is it good, at least?"
"It's great. Annoyingly great. The kind of great where you can't even complain about the price with conviction."
We wait in line. I place the order — latte and a cortado — and her face does a small math equation when the total appears.
"So why are we here?"
"Because in this city, suffering quietly in line for an eight-dollar latte is what we call a 'lifestyle.'"`,
    },
    comprehension: {
      summary:  { question: "What's the friend's first impression?", answer: "small" },
      fill:     { sentence: "It is too ___.", answer: "expensive" },
      inference:{ question: "Why do they go anyway?", choices: ["The narrator works there", "It's the trendy thing to do", "It's free", "Closest to the office"], answer: 1 },
    },
  },

  // ─── Day 19 ───
  {
    id: "story-day-19",
    day: 19,
    title: "I'm Sorry, Really",
    genre: "dialogue",
    place: "office",
    time: "midday",
    situations: ["apology", "meeting"],
    phraseIds: [],
    body: {
      easy: `Me: I am sorry. I missed the deadline.
Boss: I know. What happened?
Me: I had too much work. I am sorry, really.
Boss: It is okay. But please tell me earlier next time.
Me: I will. Thank you.`,
      natural: `"I'm sorry," I say, and I mean it. "I missed the deadline."
"I noticed." His tone is flat, not angry, which is somehow worse.
"It got buried. I should have flagged it earlier."
"You should have. Will it be done today?"
"By end of day. I'm sorry, really."
"Apologies are cheap. Just send the file."`,
      challenge: `"I'm sorry," I say, standing in his doorway like a kid in front of the principal. "I missed the deadline."
"I noticed." Flat, not angry, which is somehow ten times worse than angry.
"It got buried. I should have flagged it earlier."
"You should have. Will it be done today?"
"By end of day. I'm sorry — really, this time."
"Apologies are cheap. Send the file by five." A pause. "And next time? Raise your hand before it's on fire, not after."`,
    },
    comprehension: {
      summary:  { question: "Why is the narrator apologizing?", answer: "missed a deadline" },
      fill:     { sentence: "I'm ___, really.", answer: "sorry" },
      inference:{ question: "What does the boss prioritize?", choices: ["Long apologies", "Action over apologies", "Punishment", "Avoiding the conversation"], answer: 1 },
    },
  },

  // ─── Day 20 ───
  {
    id: "story-day-20",
    day: 20,
    title: "Two Lines, Same Bench",
    genre: "dialogue",
    place: "park",
    time: "evening",
    situations: ["small_talk"],
    phraseIds: ["take_a_walk"],
    body: {
      easy: `Stranger: Beautiful sunset.
Me: Yes. It is nice.
Stranger: Do you come here often?
Me: Sometimes. After work.
Stranger: I come to take a walk. It helps.
Me: Same. The park is good for that.`,
      natural: `"Beautiful sunset, huh?"
"Yeah. It really is."
"You come here often?"
"After work, sometimes. You?"
"Lately, more than I'd like to admit. I take a walk, clears my head."
"Same. Hard to find quiet in this city."
"Even the quiet here isn't quiet. But it'll do."`,
      challenge: `"Beautiful sunset, huh?" the stranger says, not looking at me.
"Yeah. Really is."
"You come here often?"
"After work, when the apartment feels too small."
"Same. I come to take a walk. Lately more than I'd like to admit. Clears the head."
"Same. Hard to find quiet in this city."
"Even the quiet here isn't quiet." He laughs at his own line, soft. "But it beats the alternative."
We sit in the not-quiet for a while. That's all the conversation we have. It's enough.`,
    },
    comprehension: {
      summary:  { question: "Why does the stranger come to the park?", answer: "to clear their head" },
      fill:     { sentence: "It clears my ___.", answer: "head" },
      inference:{ question: "What's the mood of the conversation?", choices: ["Awkward and forced", "Quietly companionable", "Intense", "Romantic"], answer: 1 },
    },
  },

  // ─── Day 21 — Week 3 column ───
  {
    id: "story-day-21",
    day: 21,
    title: "Week 3 Recap",
    genre: "column",
    place: "livingroom",
    time: "evening",
    situations: ["winding_down"],
    phraseIds: [],
    body: {
      easy: `Three weeks done. This week was emotions. Happy, sad, tired, sick, stressed. So many feelings. So many words. I learned "I'm stressed out." I used it three times. It is useful. But I want a better week next week.`,
      natural: `Three weeks in. This week was emotions, which means I spent five days saying "I'm tired," "I'm stressed," "I'm sleepy," "I have a headache" — and once, gloriously, "I feel great." Feelings have a lot of vocabulary, it turns out. I'm slowly learning to put a name on the thing inside me before it turns into a mood.`,
      challenge: `Week three: emotions. Which, in practice, meant five days of saying "I'm stressed out," "I'm exhausted," "I have a headache," and — on one shining Tuesday — "I feel great." Turns out the inside of a person has its own vocabulary. I'm learning to name the thing before it takes the wheel. Slow progress. But there's a real difference between "I feel weird" and "I'm overwhelmed," and apparently English is going to be the first language where I notice it. Weird.`,
    },
    comprehension: {
      summary:  { question: "What was this week's theme?", answer: "emotions" },
      fill:     { sentence: "I'm stressed ___.", answer: "out" },
      inference:{ question: "What did the narrator learn?", choices: ["More verbs", "Naming feelings precisely", "How to memorize", "Grammar rules"], answer: 1 },
    },
  },

  // ─── Day 22 ───
  {
    id: "story-day-22",
    day: 22,
    title: "I'm Going to Try",
    genre: "diary",
    place: "office",
    time: "morning",
    situations: ["work_start"],
    phraseIds: ["start_work", "write_report", "take_notes"],
    body: {
      easy: `Today is Monday. I'm going to start the new project. I'm going to write a plan. I'm going to ask for help. I'm not going to wait until the last minute. I'm going to try.`,
      natural: `Monday again. I'm going to start the new project today. I'm going to write a proper plan instead of winging it. I'm going to ask for help when I need it — which past-me never did. I'm not going to wait until Thursday to panic. I'm going to try. Try is the operative word.`,
      challenge: `Monday, again, somehow. I'm going to start the new project today — not "soon," not "after lunch," today. I'm going to write a plan like an adult. I'm going to ask for help before the wheels come off, instead of two days after, like usual. I'm going to try. "Try" is doing a lot of heavy lifting in that sentence, but it's honest, and that's a start.`,
    },
    comprehension: {
      summary:  { question: "What's the narrator planning to do differently?", answer: "ask for help early, write a plan, not procrastinate" },
      fill:     { sentence: "I'm ___ to try.", answer: "going" },
      inference:{ question: "How does the narrator feel about this commitment?", choices: ["Overconfident", "Cautiously hopeful", "Despairing", "Bored"], answer: 1 },
    },
  },

  // ─── Day 23 ───
  {
    id: "story-day-23",
    day: 23,
    title: "I Used to Hate Mornings",
    genre: "diary",
    place: "kitchen",
    time: "morning",
    situations: ["morning_routine"],
    phraseIds: ["wake_up", "snooze_alarm", "get_dressed", "brew_coffee"],
    body: {
      easy: `I used to hate mornings. I used to snooze five times. I used to skip breakfast. Now I wake up faster. Now I eat something small. I am not a morning person yet. But I used to be worse.`,
      natural: `I used to hate mornings. Capital-H Hate. I used to snooze five times, skip breakfast, and stumble out the door with my shirt half-buttoned. Lately I'm up after one snooze. I get dressed properly. I brew coffee. I eat something — not a full breakfast, but something. I'm not a morning person. But I used to be much worse.`,
      challenge: `I used to hate mornings with the kind of fervor people usually reserve for tax season. I used to snooze five times, skip breakfast, stumble out half-dressed. These days? One snooze, max. Coffee brewed, not pleaded for. Something resembling food. A face that doesn't terrify strangers. I'm still not a morning person — let's not get carried away — but the version of me from three months ago wouldn't recognize the version brewing coffee at 7:15 like it's a personality trait. Progress is sneaky.`,
    },
    comprehension: {
      summary:  { question: "How has the narrator changed?", answer: "mornings used to be chaotic, now manageable" },
      fill:     { sentence: "I ___ to hate mornings.", answer: "used" },
      inference:{ question: "What's the narrator's attitude toward their progress?", choices: ["Disappointed", "Quietly proud and amused", "Confused", "Indifferent"], answer: 1 },
    },
  },

  // ─── Day 24 ───
  {
    id: "story-day-24",
    day: 24,
    title: "If It Rains Tomorrow",
    genre: "dialogue",
    place: "livingroom",
    time: "evening",
    situations: ["small_talk"],
    phraseIds: [],
    body: {
      easy: `Friend: If it rains tomorrow, what will we do?
Me: If it rains, we will stay home.
Friend: If it is sunny, we can hike.
Me: Yes. If it is sunny, we hike. If not, we watch a movie.
Friend: Okay. If we hike, you bring snacks.`,
      natural: `"If it rains tomorrow, what's the plan?" she asks.
"If it rains, we stay home and order pizza."
"And if it doesn't?"
"If it doesn't, we hike. The short trail. I am not doing the long one."
"Deal. If we go, you bring the snacks."
"If we go, I bring the snacks. If we don't, you owe me a movie."`,
      challenge: `"If it rains tomorrow, what's the plan?" she asks, scrolling through the weather app for the fourth time.
"If it rains, we stay home, order pizza, and pretend we wanted to."
"And if it doesn't?"
"If it doesn't, we hike. The short trail. The long trail is not happening — I'm twenty-eight, not twenty."
"Deal. If we go, you bring snacks."
"If we go, I bring snacks. If we don't, you owe me a movie of your choosing, which I reserve the right to complain about."
"Fair."`,
    },
    comprehension: {
      summary:  { question: "What are they planning?", answer: "tomorrow's activity, depending on weather" },
      fill:     { sentence: "___ it rains, we stay home.", answer: "If" },
      inference:{ question: "What's the dynamic between the two?", choices: ["Strangers being polite", "Comfortable old friends", "Co-workers", "First date"], answer: 1 },
    },
  },

  // ─── Day 25 ───
  {
    id: "story-day-25",
    day: 25,
    title: "What I Should Have Said",
    genre: "diary",
    place: "office",
    time: "evening",
    situations: ["winding_down"],
    phraseIds: [],
    body: {
      easy: `Today, my coworker took my idea. He spoke first in the meeting. I should have spoken up. I should have said it was my idea. I didn't. Tonight, I am replaying it. I should have said something.`,
      natural: `My coworker took my idea today. Casual as anything — opened the meeting with it like it was a fresh thought. I should have spoken up. I should have said, "Actually, we discussed this last week — that's my framing." I didn't. Now it's 10 PM and I'm replaying the moment, perfecting the version of me who said something.`,
      challenge: `He took my idea. Walked into the meeting and used it like it was something he thought of in the shower. I should have said something. I should have said, "I appreciate the build, but that framing is from our 1:1 last week" — calm, professional, lethal. I didn't. So now I'm at 10 PM, doing the great human pastime: rehearsing yesterday's argument in tonight's kitchen. I should have. I should have. The two most useless words in any language.`,
    },
    comprehension: {
      summary:  { question: "What is the narrator regretting?", answer: "not speaking up when coworker took their idea" },
      fill:     { sentence: "I ___ have said something.", answer: "should" },
      inference:{ question: "What is the narrator's mood?", choices: ["Calm and forgiving", "Frustrated with themselves", "Angry at coworker", "Indifferent"], answer: 1 },
    },
  },

  // ─── Day 26 ───
  {
    id: "story-day-26",
    day: 26,
    title: "It's Been a Day",
    genre: "diary",
    place: "livingroom",
    time: "night",
    situations: ["winding_down"],
    phraseIds: ["sit_on_couch", "im_exhausted"],
    body: {
      easy: `It's been a day. Long. Hard. Many meetings. Many problems. It's been one of those days. I sit on the couch. I do nothing. It's been too much. I am okay. Just exhausted.`,
      natural: `It's been a day. The kind where you sit on the couch at 9 PM and realize you haven't actually sat in twelve hours. It's been one of those days. Meetings, fires, more meetings. I'm not upset. I'm exhausted. Tomorrow I'll be fine. Tonight I'm just going to be a person on a couch.`,
      challenge: `It's been a day. Not bad, not great — just a lot. The kind where 9 PM hits and you realize you've been vertical and verbal since 7 AM and you have one functional brain cell left, and it's currently watching the ceiling. It's been one of those days. Meetings, fires, more meetings, a Slack ping at 8:47 that I am choosing to ignore until morning. I'm exhausted. Not sad, not angry. Just emptied. Tomorrow's problem.`,
    },
    comprehension: {
      summary:  { question: "What kind of day did the narrator have?", answer: "long, busy, exhausting" },
      fill:     { sentence: "___ been a day.", answer: "It's" },
      inference:{ question: "How is the narrator coping right now?", choices: ["Resting and accepting it", "Angry venting", "Working through it", "Calling someone"], answer: 0 },
    },
  },

  // ─── Day 27 ───
  {
    id: "story-day-27",
    day: 27,
    title: "Just in Case",
    genre: "dialogue",
    place: "entrance",
    time: "morning",
    situations: ["morning_routine"],
    phraseIds: ["head_out", "grab_keys", "grab_phone", "check_weather"],
    body: {
      easy: `Roommate: It looks cloudy.
Me: Yes. I will take my umbrella.
Roommate: Just in case?
Me: Just in case.
Roommate: Smart.
Me: I always forget. Then it rains. Then I am wet.`,
      natural: `"Looks like it might rain," my roommate says, peering out the window.
"I'll grab an umbrella."
"Just in case?"
"Just in case. I always forget, and then it rains exactly twenty minutes after I leave."
I check the weather one more time, grab my keys, grab my phone.
"You're learning."
"Took me twenty-eight years."`,
      challenge: `"Looks like it might rain," my roommate says, peering out the window with the gravitas of a meteorologist.
"I'm taking an umbrella."
"Just in case?"
"Just in case. History has shown that the precise moment I head out without one, the sky takes it personally."
I check the weather, grab my keys, grab my phone, grab the umbrella. The full adult checklist.
"Look at you. Adulting."
"Took me twenty-eight years and approximately fourteen ruined shirts."
"Worth it."`,
    },
    comprehension: {
      summary:  { question: "Why is the narrator taking an umbrella?", answer: "just in case it rains" },
      fill:     { sentence: "___ in case.", answer: "Just" },
      inference:{ question: "What does this say about the narrator?", choices: ["Always overprepared", "Finally learning from past mistakes", "Worried", "Doesn't trust weather"], answer: 1 },
    },
  },

  // ─── Day 28 — Week 4 column ───
  {
    id: "story-day-28",
    day: 28,
    title: "Week 4 Recap",
    genre: "column",
    place: "livingroom",
    time: "evening",
    situations: ["winding_down"],
    phraseIds: [],
    body: {
      easy: `Four weeks. One month. I can now say "I'm going to," "I used to," "if," "should have," "just in case." Five sentence patterns. They open many doors. Next week is the last week. I will use everything.`,
      natural: `Four weeks. One month down. The big sentence patterns clicked this week — "I'm going to," "I used to," "if," "should have," "just in case." Five tiny shapes that, together, let me talk about plans, regrets, and what-ifs. The grammar suddenly has rooms in it. I want to live in them.`,
      challenge: `Four weeks. One month, somehow. The big patterns landed this week: I'm going to, I used to, if, I should have, just in case. Five small molds, but together they unlock something — I can finally talk about plans, regrets, hypotheticals, what-ifs. The grammar opened up like a house. I keep finding new rooms. One more week. The thing I was scared of last month feels weirdly like home now.`,
    },
    comprehension: {
      summary:  { question: "What did the narrator master this week?", answer: "five sentence patterns" },
      fill:     { sentence: "I'm ___ to.", answer: "going" },
      inference:{ question: "How does the narrator feel after a month?", choices: ["Overwhelmed", "At home and confident", "Lost", "Bored"], answer: 1 },
    },
  },

  // ─── Day 29 ───
  {
    id: "story-day-29",
    day: 29,
    title: "A Day in the Life",
    genre: "diary",
    place: "livingroom",
    time: "evening",
    situations: ["winding_down"],
    phraseIds: ["wake_up", "brush_teeth", "head_out", "tap_card", "sit_at_desk", "check_emails", "take_a_break", "take_a_walk", "do_dishes", "lie_down", "fall_asleep"],
    body: {
      easy: `Today is a normal day. I wake up. I get dressed. I head out. I take the bus. I sit at my desk. I check my emails. I take a break. I do the dishes. I take a walk. I lie down. I fall asleep. In English, the whole day. I did it.`,
      natural: `Today, just to see, I tried to live the whole day in English in my head. I wake up. I brush my teeth. I head out. I tap my card. I sit down at my desk. I check my emails. I take a break. I get some coffee. I wrap up my work. I go home. I do the dishes. I take a walk. I lie down. I fall asleep. The day, narrated from inside. It worked. It felt — boringly, beautifully — normal.`,
      challenge: `Today I ran an experiment: live the entire day in English, in my head. Wake up. Brush my teeth. Head out. Tap my card. Drop into my chair. Check my emails. Wrap up the report. Take a break. Take a walk. Do the dishes. Lie down. Fall asleep. No translation, no panic, just the steady internal monologue of a person doing the small things that fill a life. It worked. It also revealed something embarrassing: most of my day, in any language, is unremarkable verbs. Which, somehow, is exactly the point.`,
    },
    comprehension: {
      summary:  { question: "What experiment did the narrator try?", answer: "narrate the whole day in English" },
      fill:     { sentence: "I ___ my emails.", answer: "check" },
      inference:{ question: "What does the narrator realize?", choices: ["Days are exciting", "Most of life is small repeating actions", "English is hard", "Verbs are useless"], answer: 1 },
    },
  },

  // ─── Day 30 — Graduation column ───
  {
    id: "story-day-30",
    day: 30,
    title: "Tomorrow, In English",
    genre: "column",
    place: "livingroom",
    time: "night",
    situations: ["winding_down"],
    phraseIds: [],
    body: {
      easy: `Thirty days. I started with "I wake up." I end with "I fall asleep." Now I can talk about my day. I can ask, I can answer, I can apologize, I can plan. I am not perfect. I am not fast. But I started. And I kept going. Tomorrow, again.`,
      natural: `Thirty days. I started with "I wake up" and somehow ended up able to narrate a full day, hold a small dialogue, apologize, plan, say what I used to do and what I should have said. I'm not fluent. I'm not fast. But I'm in the language now, not outside it pressing my nose against the glass. Tomorrow, again.`,
      challenge: `Thirty days. Started with "I wake up," a sentence I could've said with my eyes closed in any language. Ended up able to narrate a day, hold a small dialogue, apologize without melting, plan without flinching, say "I used to" and "I should have" like they belong to me — because, somehow, they do now. I'm not fluent. I'm not fast. But I'm not standing outside the language anymore with my nose to the glass. I'm in. Just barely, but I'm in. Tomorrow, again. That's the whole secret.`,
    },
    comprehension: {
      summary:  { question: "What has the narrator achieved?", answer: "can narrate a full day in English, hold dialogues, plan, apologize" },
      fill:     { sentence: "___, again.", answer: "Tomorrow" },
      inference:{ question: "What's the narrator's tone at the end?", choices: ["Disappointed", "Grateful, humble, ready to continue", "Done with English", "Overconfident"], answer: 1 },
    },
  },
];

export const STORY_BY_ID: Record<string, Story> = Object.fromEntries(STORIES.map(s => [s.id, s]));
export const STORY_BY_DAY: Record<number, Story> = Object.fromEntries(STORIES.map(s => [s.day, s]));
