// ============================================================
// 학습 표현 시드 — Week 1~2 풀, Week 3~5 골격 일부
// ============================================================
import type { Phrase } from "../types/schema";

export const PHRASES: Phrase[] = [
  // ─── Day 1 · 아침 기상 & 화장실 ───
  { id: "wake_up",          ko: "잠이 깬다",         en: "I wake up",                past: "woke",   coords: { days: [1], stages: ["stage-1"], places: ["bedroom"],   situations: ["alarm_off", "morning_routine"], times: ["morning"] } },
  { id: "snooze_alarm",     ko: "알람을 미루다",     en: "I snooze my alarm",                        coords: { days: [1], stages: ["stage-1"], places: ["bedroom"],   situations: ["alarm_off"],                    times: ["morning"] } },
  { id: "go_back_to_sleep", ko: "다시 잔다",         en: "I go back to sleep",        past: "went",  coords: { days: [1], stages: ["stage-1"], places: ["bedroom"],   situations: ["alarm_off"],                    times: ["morning"] } },
  { id: "rub_eyes",         ko: "눈을 비빈다",       en: "I rub my eyes",                            coords: { days: [1], stages: ["stage-1"], places: ["bedroom"],   situations: ["morning_routine"],              times: ["morning"] } },
  { id: "yawn",             ko: "하품을 한다",       en: "I yawn",                                   coords: { days: [1], stages: ["stage-1"], places: ["bedroom"],   situations: ["morning_routine"],              times: ["morning"] } },
  { id: "sit_up_in_bed",    ko: "몸을 일으킨다",     en: "I sit up in bed",           past: "sat",   coords: { days: [1], stages: ["stage-1"], places: ["bedroom"],   situations: ["morning_routine"],              times: ["morning"] } },
  { id: "throw_off_blanket",ko: "이불을 걷어낸다",   en: "I throw off the blanket",   past: "threw", coords: { days: [1], stages: ["stage-1"], places: ["bedroom"],   situations: ["morning_routine"],              times: ["morning"] } },
  { id: "get_out_of_bed",   ko: "침대에서 나온다",   en: "I get out of bed",          past: "got",   coords: { days: [1], stages: ["stage-1"], places: ["bedroom"],   situations: ["morning_routine"],              times: ["morning"] } },
  { id: "stretch",          ko: "스트레칭을 한다",   en: "I stretch",                                coords: { days: [1], stages: ["stage-1"], places: ["bedroom"],   situations: ["morning_routine"],              times: ["morning"] } },
  { id: "go_to_bathroom",   ko: "화장실로 간다",     en: "I go to the bathroom",      past: "went",  coords: { days: [1], stages: ["stage-1"], places: ["bathroom"],  situations: ["morning_routine"],              times: ["morning"] } },
  { id: "look_in_mirror",   ko: "거울을 본다",       en: "I look in the mirror",                     coords: { days: [1, 2], stages: ["stage-1"], places: ["bathroom"], situations: ["skincare", "get_dressed"],     times: ["morning"] } },
  { id: "turn_on_water",    ko: "물을 튼다",         en: "I turn on the water",                      coords: { days: [1], stages: ["stage-1"], places: ["bathroom"],  situations: ["morning_routine"],              times: ["morning"] } },
  { id: "wash_hands",       ko: "손을 씻는다",       en: "I wash my hands",                          coords: { days: [1], stages: ["stage-1"], places: ["bathroom", "kitchen"], situations: ["morning_routine"], times: ["morning"] } },
  { id: "squeeze_toothpaste",ko: "치약을 짠다",       en: "I squeeze toothpaste",                     coords: { days: [1], stages: ["stage-1"], places: ["bathroom"],  situations: ["morning_routine"],              times: ["morning"] } },
  { id: "brush_teeth",      ko: "양치를 한다",       en: "I brush my teeth",                         coords: { days: [1], stages: ["stage-1"], places: ["bathroom"],  situations: ["morning_routine"],              times: ["morning", "night"] } },

  // ─── Day 2 · 스킨케어 & 외출 준비 ───
  { id: "wash_face",        ko: "세수를 한다",       en: "I wash my face",                           coords: { days: [2], stages: ["stage-1"], places: ["bathroom"], situations: ["skincare"],                     times: ["morning"] } },
  { id: "put_on_lotion",    ko: "로션을 바른다",     en: "I put on lotion",           past: "put",   coords: { days: [2], stages: ["stage-1"], places: ["bathroom"], situations: ["skincare"],                     times: ["morning"] } },
  { id: "apply_sunscreen",  ko: "선크림을 바른다",   en: "I apply sunscreen",                        coords: { days: [2], stages: ["stage-1"], places: ["bathroom"], situations: ["skincare"],                     times: ["morning"] } },
  { id: "wash_hair",        ko: "머리를 감는다",     en: "I wash my hair",                           coords: { days: [2], stages: ["stage-1"], places: ["bathroom"], situations: ["skincare"],                     times: ["morning"] } },
  { id: "dry_hair",         ko: "머리를 말린다",     en: "I dry my hair",                            coords: { days: [2], stages: ["stage-1"], places: ["bathroom"], situations: ["skincare"],                     times: ["morning"] } },
  { id: "comb_hair",        ko: "머리를 빗는다",     en: "I comb my hair",                           coords: { days: [2], stages: ["stage-1"], places: ["bathroom"], situations: ["skincare"],                     times: ["morning"] } },
  { id: "get_dressed",      ko: "옷을 입는다",       en: "I get dressed",             past: "got",   coords: { days: [2], stages: ["stage-1"], places: ["bedroom"],  situations: ["get_dressed"],                  times: ["morning"] } },
  { id: "pick_out_clothes", ko: "옷을 고른다",       en: "I pick out my clothes",                    coords: { days: [2], stages: ["stage-1"], places: ["bedroom"],  situations: ["get_dressed"],                  times: ["morning"] } },
  { id: "check_mirror",     ko: "거울로 확인한다",   en: "I check myself in the mirror",             coords: { days: [2], stages: ["stage-1"], places: ["bedroom", "bathroom"], situations: ["get_dressed"],     times: ["morning"] } },
  { id: "put_on_shoes",     ko: "신발을 신는다",     en: "I put on my shoes",         past: "put",   coords: { days: [2], stages: ["stage-1"], places: ["entrance"], situations: ["get_dressed"],                  times: ["morning"] } },
  { id: "grab_bag",         ko: "가방을 챙긴다",     en: "I grab my bag",                            coords: { days: [2], stages: ["stage-1"], places: ["entrance"], situations: ["get_dressed"],                  times: ["morning"] } },
  { id: "grab_keys",        ko: "열쇠를 챙긴다",     en: "I grab my keys",                           coords: { days: [2], stages: ["stage-1"], places: ["entrance"], situations: ["get_dressed"],                  times: ["morning"] } },
  { id: "grab_phone",       ko: "휴대폰을 챙긴다",   en: "I grab my phone",                          coords: { days: [2], stages: ["stage-1"], places: ["entrance"], situations: ["get_dressed"],                  times: ["morning"] } },
  { id: "check_weather",    ko: "날씨를 확인한다",   en: "I check the weather",                      coords: { days: [2], stages: ["stage-1"], places: ["livingroom"], situations: ["get_dressed"],                times: ["morning"] } },
  { id: "check_notifications",ko: "알림을 확인한다", en: "I check my notifications",                 coords: { days: [2], stages: ["stage-1"], places: ["livingroom"], situations: ["get_dressed"],                times: ["morning"] } },

  // ─── Day 3 · 주방 & 아침 식사 ───
  { id: "sip_water",        ko: "물을 한 모금 마신다", en: "I take a sip of water",   past: "took",  coords: { days: [3], stages: ["stage-1"], places: ["kitchen"], situations: ["breakfast"], times: ["morning"] } },
  { id: "brew_coffee",      ko: "커피를 내린다",     en: "I brew some coffee",                       coords: { days: [3], stages: ["stage-1"], places: ["kitchen"], situations: ["breakfast"], times: ["morning"] } },
  { id: "open_fridge",      ko: "냉장고를 연다",     en: "I open the fridge",                        coords: { days: [3], stages: ["stage-1"], places: ["kitchen"], situations: ["breakfast"], times: ["morning"] } },
  { id: "check_expiration", ko: "유통기한을 확인한다", en: "I check the expiration date",             coords: { days: [3], stages: ["stage-1"], places: ["kitchen"], situations: ["breakfast"], times: ["morning"] } },
  { id: "take_out_fridge",  ko: "냉장고에서 꺼낸다", en: "I take it out of the fridge", past: "took", coords: { days: [3], stages: ["stage-1"], places: ["kitchen"], situations: ["breakfast"], times: ["morning"] } },
  { id: "fry_egg",          ko: "계란을 굽는다",     en: "I fry an egg",                             coords: { days: [3], stages: ["stage-1"], places: ["kitchen"], situations: ["breakfast"], times: ["morning"] } },
  { id: "pop_bread",        ko: "토스트기에 빵을 넣는다", en: "I pop some bread in the toaster",      coords: { days: [3], stages: ["stage-1"], places: ["kitchen"], situations: ["breakfast"], times: ["morning"] } },
  { id: "pour_cereal",      ko: "시리얼을 그릇에 담는다", en: "I pour some cereal into a bowl",       coords: { days: [3], stages: ["stage-1"], places: ["kitchen"], situations: ["breakfast"], times: ["morning"] } },
  { id: "pour_milk",        ko: "우유를 붓는다",     en: "I pour the milk",                          coords: { days: [3], stages: ["stage-1"], places: ["kitchen"], situations: ["breakfast"], times: ["morning"] } },
  { id: "microwave_it",     ko: "전자레인지에 데운다", en: "I microwave it",                          coords: { days: [3], stages: ["stage-1"], places: ["kitchen"], situations: ["breakfast"], times: ["morning"] } },
  { id: "heat_up_food",     ko: "음식을 데운다",     en: "I heat up the food",                       coords: { days: [3], stages: ["stage-1"], places: ["kitchen"], situations: ["breakfast", "dinner"], times: ["morning", "evening"] } },
  { id: "make_breakfast",   ko: "아침을 만든다",     en: "I make breakfast",          past: "made",  coords: { days: [3], stages: ["stage-1"], places: ["kitchen"], situations: ["breakfast"], times: ["morning"] } },
  { id: "sit_at_table",     ko: "식탁에 앉는다",     en: "I sit at the table",        past: "sat",   coords: { days: [3], stages: ["stage-1"], places: ["kitchen"], situations: ["breakfast", "dinner"], times: ["morning", "evening"] } },
  { id: "eat_breakfast",    ko: "아침을 먹는다",     en: "I eat breakfast",           past: "ate",   coords: { days: [3], stages: ["stage-1"], places: ["kitchen"], situations: ["breakfast"], times: ["morning"] } },
  { id: "set_table",        ko: "식탁을 차린다",     en: "I set the table",           past: "set",   coords: { days: [3], stages: ["stage-1"], places: ["kitchen"], situations: ["breakfast", "dinner"], times: ["morning", "evening"] } },

  // ─── Day 4 · 이동 & 출퇴근 ───
  { id: "head_out",         ko: "집을 나선다",       en: "I head out",                               coords: { days: [4], stages: ["stage-1"], places: ["entrance"],   situations: ["commute_bus"],     times: ["morning"] } },
  { id: "lock_door",        ko: "문을 잠근다",       en: "I lock the door",                          coords: { days: [4], stages: ["stage-1"], places: ["entrance"],   situations: ["commute_bus"],     times: ["morning"] } },
  { id: "take_elevator",    ko: "엘리베이터를 탄다", en: "I take the elevator",       past: "took",  coords: { days: [4], stages: ["stage-1"], places: ["elevator"],   situations: ["commute_bus"],     times: ["morning"] } },
  { id: "play_music",       ko: "음악을 튼다",       en: "I play music",                             coords: { days: [4], stages: ["stage-1"], places: ["street"],     situations: ["commute_bus"],     times: ["morning"] } },
  { id: "walk_down_street", ko: "길을 따라 걷는다",  en: "I walk down the street",                   coords: { days: [4], stages: ["stage-1"], places: ["street"],     situations: ["commute_bus"],     times: ["morning"] } },
  { id: "wait_for_signal",  ko: "신호를 기다린다",   en: "I wait for the signal",                    coords: { days: [4], stages: ["stage-1"], places: ["street"],     situations: ["commute_bus"],     times: ["morning"] } },
  { id: "cross_street",     ko: "길을 건넌다",       en: "I cross the street",                       coords: { days: [4], stages: ["stage-1"], places: ["street"],     situations: ["commute_bus"],     times: ["morning"] } },
  { id: "wait_for_bus",     ko: "버스를 기다린다",   en: "I wait for the bus",                       coords: { days: [4], stages: ["stage-1"], places: ["bus_stop"],   situations: ["commute_bus"],     times: ["morning"] } },
  { id: "take_bus",         ko: "버스를 탄다",       en: "I take the bus",            past: "took",  coords: { days: [4], stages: ["stage-1"], places: ["bus_stop"],   situations: ["commute_bus"],     times: ["morning"] } },
  { id: "tap_card",         ko: "교통카드를 찍는다", en: "I tap my card",                            coords: { days: [4], stages: ["stage-1"], places: ["bus_stop", "subway"], situations: ["commute_bus", "commute_subway"], times: ["morning"] } },
  { id: "find_a_seat",      ko: "자리를 잡는다",     en: "I find a seat",             past: "found", coords: { days: [4], stages: ["stage-1"], places: ["bus_stop", "subway"], situations: ["commute_bus", "commute_subway"], times: ["morning"] } },
  { id: "transfer_line",    ko: "다른 노선으로 환승한다", en: "I transfer to another line",          coords: { days: [4], stages: ["stage-1"], places: ["subway"], situations: ["commute_subway"], times: ["morning"] } },
  { id: "miss_subway",      ko: "지하철을 놓친다",   en: "I miss the subway",         past: "missed",coords: { days: [4], stages: ["stage-1"], places: ["subway"], situations: ["commute_subway"], times: ["morning"] } },
  { id: "get_off_bus",      ko: "버스에서 내린다",   en: "I get off the bus",         past: "got",   coords: { days: [4], stages: ["stage-1"], places: ["bus_stop"], situations: ["commute_bus"],   times: ["morning"] } },
  { id: "get_to_work",      ko: "회사에 도착한다",   en: "I get to work",             past: "got",   coords: { days: [4], stages: ["stage-1"], places: ["office"], situations: ["arrive_office"],   times: ["morning"] } },

  // ─── Day 5 · 일 & 업무 ───
  { id: "sit_at_desk",      ko: "자리에 앉는다",     en: "I sit down at my desk",     past: "sat",   coords: { days: [5], stages: ["stage-1"], places: ["office"], situations: ["work_start"],    times: ["morning"] } },
  { id: "turn_on_computer", ko: "컴퓨터를 켠다",     en: "I turn on my computer",                    coords: { days: [5], stages: ["stage-1"], places: ["office"], situations: ["work_start"],    times: ["morning"] } },
  { id: "log_in",           ko: "로그인한다",         en: "I log in to my computer",                  coords: { days: [5], stages: ["stage-1"], places: ["office"], situations: ["work_start"],    times: ["morning"] } },
  { id: "check_emails",     ko: "이메일을 확인한다", en: "I check my emails",                        coords: { days: [5], stages: ["stage-1"], places: ["office"], situations: ["email"],         times: ["morning"] } },
  { id: "check_tasks",      ko: "업무를 확인한다",   en: "I check my tasks",                         coords: { days: [5], stages: ["stage-1"], places: ["office"], situations: ["work_start"],    times: ["morning"] } },
  { id: "start_work",       ko: "일을 시작한다",     en: "I start work",                             coords: { days: [5], stages: ["stage-1"], places: ["office"], situations: ["work_start"],    times: ["morning"] } },
  { id: "write_report",     ko: "보고서를 작성한다", en: "I write a report",          past: "wrote", coords: { days: [5], stages: ["stage-1"], places: ["office"], situations: ["work_start"],    times: ["midday"] } },
  { id: "take_notes",       ko: "메모를 한다",       en: "I take notes",              past: "took",  coords: { days: [5], stages: ["stage-1"], places: ["office"], situations: ["meeting"],       times: ["midday"] } },
  { id: "schedule_meeting", ko: "회의 일정을 잡는다", en: "I schedule a meeting",                     coords: { days: [5], stages: ["stage-1"], places: ["office"], situations: ["meeting"],       times: ["midday"] } },
  { id: "attend_meeting",   ko: "회의에 참석한다",   en: "I attend a meeting",                       coords: { days: [5], stages: ["stage-1"], places: ["office"], situations: ["meeting"],       times: ["midday"] } },
  { id: "make_call",        ko: "전화를 한다",       en: "I make a call",             past: "made",  coords: { days: [5], stages: ["stage-1"], places: ["office"], situations: ["phone_call"],    times: ["midday"] } },
  { id: "pick_up_phone",    ko: "전화를 받는다",     en: "I pick up the phone",                      coords: { days: [5, 8], stages: ["stage-1"], places: ["office"], situations: ["phone_call"],  times: ["midday"] } },
  { id: "take_a_break",     ko: "잠깐 쉰다",         en: "I take a break",            past: "took",  coords: { days: [5], stages: ["stage-1"], places: ["office"], situations: ["afternoon_break"], times: ["afternoon"] } },
  { id: "wrap_up_work",     ko: "일을 마무리한다",   en: "I wrap up my work",                        coords: { days: [5], stages: ["stage-1"], places: ["office"], situations: ["leave_work"],    times: ["evening"] } },
  { id: "turn_off_computer",ko: "컴퓨터를 끈다",     en: "I turn off my computer",                   coords: { days: [5], stages: ["stage-1"], places: ["office"], situations: ["leave_work"],    times: ["evening"] } },

  // ─── Day 6 · 점심시간 & 카페 ───
  { id: "go_out_for_lunch", ko: "점심을 먹으러 간다", en: "I go out for lunch",       past: "went",  coords: { days: [6], stages: ["stage-1"], places: ["restaurant"], situations: ["lunch"],          times: ["midday"] } },
  { id: "decide_what_eat",  ko: "뭐 먹을지 고른다", en: "I decide what to eat",       past: "decided",coords:{ days: [6], stages: ["stage-1"], places: ["restaurant"], situations: ["lunch"],          times: ["midday"] } },
  { id: "place_order",      ko: "주문을 한다",       en: "I place an order",                         coords: { days: [6], stages: ["stage-1"], places: ["restaurant", "cafe"], situations: ["lunch", "coffee_order"], times: ["midday"] } },
  { id: "wait_in_line",     ko: "줄을 서서 기다린다", en: "I wait in line",                          coords: { days: [6], stages: ["stage-1"], places: ["cafe", "store"], situations: ["coffee_order", "grocery"], times: ["midday"] } },
  { id: "get_food",         ko: "음식을 받는다",     en: "I get my food",             past: "got",   coords: { days: [6], stages: ["stage-1"], places: ["restaurant"], situations: ["lunch"],          times: ["midday"] } },
  { id: "grab_snack",       ko: "간식을 먹는다",     en: "I grab a snack",                           coords: { days: [6, 11], stages: ["stage-1"], places: ["livingroom", "office"], situations: ["afternoon_break"], times: ["afternoon"] } },
  { id: "chat_with_coworkers",ko: "동료들과 이야기한다", en: "I chat with my coworkers",             coords: { days: [6], stages: ["stage-1"], places: ["office", "cafe"], situations: ["small_talk", "lunch"], times: ["midday"] } },
  { id: "settle_at_cafe",   ko: "카페에 자리를 잡는다", en: "I settle down at a cafe",               coords: { days: [6], stages: ["stage-1"], places: ["cafe"], situations: ["coffee_order"],     times: ["midday", "afternoon"] } },
  { id: "come_out_cafe",    ko: "카페에서 나온다",   en: "I come out of the cafe",    past: "came",  coords: { days: [6], stages: ["stage-1"], places: ["cafe"], situations: ["coffee_order"],     times: ["midday", "afternoon"] } },
  { id: "take_a_walk",      ko: "산책을 한다",       en: "I take a walk",             past: "took",  coords: { days: [6, 9], stages: ["stage-1", "stage-2"], places: ["park", "street"], situations: ["hobby"], times: ["evening"] } },
  { id: "scroll_while_eat", ko: "핸드폰을 보면서 먹는다", en: "I scroll through my phone while eating",coords: { days: [6], stages: ["stage-1"], places: ["restaurant", "livingroom"], situations: ["lunch", "dinner"], times: ["midday"] } },
  { id: "continue_working", ko: "일을 계속한다",     en: "I continue working",                       coords: { days: [6], stages: ["stage-1"], places: ["office"], situations: ["work_start"],     times: ["afternoon"] } },
  { id: "get_some_coffee",  ko: "커피를 사온다",     en: "I get some coffee",         past: "got",   coords: { days: [6], stages: ["stage-1"], places: ["cafe"], situations: ["coffee_order"],     times: ["morning", "afternoon"] } },
  { id: "taste_food",       ko: "맛을 본다",         en: "I taste the food",                         coords: { days: [6], stages: ["stage-1"], places: ["kitchen", "restaurant"], situations: ["lunch"],  times: ["midday"] } },
  { id: "put_on_plate",     ko: "접시에 담는다",     en: "I put it on a plate",       past: "put",   coords: { days: [6], stages: ["stage-1"], places: ["kitchen"], situations: ["dinner"],         times: ["evening"] } },

  // ─── Day 8 · 전자기기 & 핸드폰 ───
  { id: "unlock_phone",     ko: "잠금을 푼다",       en: "I unlock my phone",                        coords: { days: [8], stages: ["stage-2"], places: ["livingroom"], situations: ["hobby"], times: ["evening", "night"] } },
  { id: "check_messages",   ko: "메시지를 확인한다", en: "I check my messages",                      coords: { days: [8], stages: ["stage-2"], places: ["livingroom"], situations: ["hobby"], times: ["evening", "night"] } },
  { id: "send_message",     ko: "메시지를 보낸다",   en: "I send a message",          past: "sent",  coords: { days: [8], stages: ["stage-2"], places: ["livingroom"], situations: ["hobby"], times: ["evening", "night"] } },
  { id: "open_app",         ko: "앱을 연다",         en: "I open an app",                            coords: { days: [8], stages: ["stage-2"], places: ["livingroom"], situations: ["hobby"], times: ["evening", "night"] } },
  { id: "search_online",    ko: "검색한다",          en: "I search online",                          coords: { days: [8], stages: ["stage-2"], places: ["livingroom"], situations: ["hobby"], times: ["evening", "night"] } },
  { id: "scroll_feed",      ko: "피드를 넘겨본다",   en: "I scroll through my feed",                 coords: { days: [8], stages: ["stage-2"], places: ["livingroom"], situations: ["hobby"], times: ["evening", "night"] } },
  { id: "take_picture",     ko: "사진을 찍는다",     en: "I take a picture",          past: "took",  coords: { days: [8], stages: ["stage-2"], places: ["park", "street"], situations: ["hobby"], times: ["evening"] } },
  { id: "film_video",       ko: "영상을 찍는다",     en: "I film a video",                           coords: { days: [8], stages: ["stage-2"], places: ["livingroom"], situations: ["hobby"], times: ["evening"] } },
  { id: "call_someone",     ko: "전화를 건다",       en: "I call someone",                           coords: { days: [8], stages: ["stage-2"], places: ["livingroom"], situations: ["phone_call"], times: ["evening"] } },
  { id: "hang_up",          ko: "전화를 끊는다",     en: "I hang up",                 past: "hung",  coords: { days: [8], stages: ["stage-2"], places: ["livingroom"], situations: ["phone_call"], times: ["evening"] } },

  // ─── Day 10 · 저녁시간 & 집안일 ───
  { id: "go_home",          ko: "집에 간다",         en: "I go home",                 past: "went",  coords: { days: [10], stages: ["stage-2"], places: ["street"], situations: ["leave_work"], times: ["evening"] } },
  { id: "arrive_home",      ko: "집에 도착한다",     en: "I arrive home",                            coords: { days: [10], stages: ["stage-2"], places: ["entrance"], situations: ["leave_work"], times: ["evening"] } },
  { id: "turn_on_lights",   ko: "불을 켠다",         en: "I turn on the lights",                     coords: { days: [10], stages: ["stage-2"], places: ["livingroom"], situations: ["winding_down"], times: ["evening", "night"] } },
  { id: "sit_on_couch",     ko: "소파에 앉는다",     en: "I sit on the couch",        past: "sat",   coords: { days: [10, 11], stages: ["stage-2"], places: ["livingroom"], situations: ["winding_down"], times: ["evening"] } },
  { id: "do_dishes",        ko: "설거지를 한다",     en: "I do the dishes",           past: "did",   coords: { days: [10], stages: ["stage-2"], places: ["kitchen"], situations: ["evening_chores"], times: ["evening"] } },
  { id: "do_laundry",       ko: "빨래를 한다",       en: "I do the laundry",          past: "did",   coords: { days: [10], stages: ["stage-2"], places: ["bathroom"], situations: ["evening_chores"], times: ["evening"] } },
  { id: "vacuum",           ko: "청소기를 돌린다",   en: "I vacuum the floor",                       coords: { days: [10], stages: ["stage-2"], places: ["livingroom"], situations: ["evening_chores"], times: ["evening"] } },
  { id: "take_out_trash",   ko: "쓰레기를 내놓는다", en: "I take out the trash",      past: "took",  coords: { days: [10], stages: ["stage-2"], places: ["entrance"], situations: ["evening_chores"], times: ["evening"] } },
  { id: "turn_off_lights",  ko: "불을 끈다",         en: "I turn off the lights",                    coords: { days: [10, 12], stages: ["stage-2"], places: ["livingroom", "bedroom"], situations: ["bedtime"], times: ["night"] } },

  // ─── Day 11 · 휴식 & 감정 ───
  { id: "take_deep_breath", ko: "깊게 숨을 쉰다",   en: "I take a deep breath",      past: "took",  coords: { days: [11], stages: ["stage-2"], places: ["livingroom", "bedroom"], situations: ["winding_down"], times: ["evening"] } },
  { id: "zone_out",         ko: "멍 때린다",         en: "I zone out",                               coords: { days: [11], stages: ["stage-2"], places: ["livingroom"], situations: ["winding_down"], times: ["evening", "night"] } },
  { id: "meditate",         ko: "명상한다",          en: "I meditate",                               coords: { days: [11], stages: ["stage-2"], places: ["livingroom", "bedroom"], situations: ["winding_down"], times: ["evening", "night"] } },
  { id: "take_nap",         ko: "낮잠을 잔다",       en: "I take a nap",              past: "took",  coords: { days: [11], stages: ["stage-2"], places: ["livingroom", "bedroom"], situations: ["afternoon_break"], times: ["afternoon"] } },
  { id: "journal_write",    ko: "일기를 쓴다",       en: "I write in my journal",     past: "wrote", coords: { days: [11], stages: ["stage-2"], places: ["bedroom"], situations: ["bedtime"], times: ["night"] } },

  // ─── Day 12 · 취침 루틴 ───
  { id: "set_alarm",        ko: "알람을 맞춘다",     en: "I set my alarm",            past: "set",   coords: { days: [12], stages: ["stage-2"], places: ["bedroom"], situations: ["bedtime"], times: ["night"] } },
  { id: "plug_in_phone",    ko: "폰을 충전기에 꽂는다", en: "I plug in my phone",                     coords: { days: [12], stages: ["stage-2"], places: ["bedroom"], situations: ["bedtime"], times: ["night"] } },
  { id: "lie_down",         ko: "침대에 눕는다",     en: "I lie down in bed",         past: "lay",   coords: { days: [12], stages: ["stage-2"], places: ["bedroom"], situations: ["bedtime"], times: ["night"] } },
  { id: "pull_up_blanket",  ko: "이불을 덮는다",     en: "I pull up the blanket",                    coords: { days: [12], stages: ["stage-2"], places: ["bedroom"], situations: ["bedtime"], times: ["night"] } },
  { id: "close_eyes",       ko: "눈을 감는다",       en: "I close my eyes",                          coords: { days: [12], stages: ["stage-2"], places: ["bedroom"], situations: ["bedtime"], times: ["night"] } },
  { id: "fall_asleep",      ko: "잠이 든다",         en: "I fall asleep",             past: "fell",  coords: { days: [12], stages: ["stage-2"], places: ["bedroom"], situations: ["bedtime"], times: ["night"] } },

  // ─── Day 15 · 상태 표현 (Stage 3) ───
  { id: "im_hungry",        ko: "배고파",            en: "I'm hungry",                               coords: { days: [15], stages: ["stage-3"], places: ["kitchen"], situations: ["lunch"], times: ["midday"] }, tags: ["state"] },
  { id: "im_starving",      ko: "배고파 죽겠어",     en: "I'm starving",                             coords: { days: [15], stages: ["stage-3"], places: ["kitchen"], situations: ["lunch"], times: ["midday"] }, tags: ["state"] },
  { id: "im_full",          ko: "배불러",            en: "I'm full",                                 coords: { days: [15], stages: ["stage-3"], places: ["restaurant"], situations: ["lunch", "dinner"], times: ["evening"] }, tags: ["state"] },
  { id: "im_thirsty",       ko: "목말라",            en: "I'm thirsty",                              coords: { days: [15], stages: ["stage-3"], places: ["livingroom"], situations: ["winding_down"], times: ["evening"] }, tags: ["state"] },
  { id: "im_exhausted",     ko: "완전 지쳤어",       en: "I'm exhausted",                            coords: { days: [15], stages: ["stage-3"], places: ["livingroom"], situations: ["winding_down"], times: ["evening", "night"] }, tags: ["state"] },
  { id: "im_sleepy",        ko: "졸려",              en: "I'm sleepy",                               coords: { days: [15], stages: ["stage-3"], places: ["bedroom"], situations: ["bedtime"], times: ["night"] }, tags: ["state"] },
  { id: "have_headache",    ko: "머리 아파",         en: "I have a headache",         past: "had",   coords: { days: [15], stages: ["stage-3"], places: ["bedroom"], situations: ["winding_down"], times: ["afternoon", "evening"] }, tags: ["state"] },
  { id: "feel_sick",        ko: "속 안 좋아",        en: "I feel sick",                              coords: { days: [15], stages: ["stage-3"], places: ["bedroom"], situations: ["winding_down"], times: ["evening"] }, tags: ["state"] },

  { id: "feel_great",       ko: "기분 최고야",       en: "I feel great",                             coords: { days: [16], stages: ["stage-3"], places: ["kitchen"], situations: ["morning_routine"], times: ["morning"] }, tags: ["emotion-positive"] },
  { id: "good_mood",        ko: "기분이 좋아",       en: "I'm in a good mood",                       coords: { days: [16], stages: ["stage-3"], places: ["kitchen"], situations: ["morning_routine"], times: ["morning"] }, tags: ["emotion-positive"] },
  { id: "excited",          ko: "설레/기대돼",       en: "I'm excited",                              coords: { days: [16], stages: ["stage-3"], places: ["livingroom"], situations: ["hobby"], times: ["evening"] }, tags: ["emotion-positive"] },
  { id: "motivated",        ko: "의욕이 넘쳐",       en: "I'm motivated",                            coords: { days: [16], stages: ["stage-3"], places: ["office"], situations: ["work_start"], times: ["morning"] }, tags: ["emotion-positive"] },
  { id: "grateful",         ko: "감사해",            en: "I'm grateful",                             coords: { days: [16], stages: ["stage-3"], places: ["livingroom"], situations: ["winding_down"], times: ["evening"] }, tags: ["emotion-positive"] },

  { id: "stressed_out",     ko: "스트레스 받아",     en: "I'm stressed out",                         coords: { days: [17], stages: ["stage-3"], places: ["office"], situations: ["work_start"], times: ["afternoon"] }, tags: ["emotion-negative"] },
  { id: "annoyed",          ko: "짜증 나",           en: "I'm annoyed",                              coords: { days: [17], stages: ["stage-3"], places: ["office"], situations: ["meeting"], times: ["afternoon"] }, tags: ["emotion-negative"] },
  { id: "worried",          ko: "걱정돼",            en: "I'm worried",                              coords: { days: [17], stages: ["stage-3"], places: ["bedroom"], situations: ["winding_down"], times: ["night"] }, tags: ["emotion-negative"] },
  { id: "nervous",          ko: "긴장돼",            en: "I'm nervous",                              coords: { days: [17], stages: ["stage-3"], places: ["office"], situations: ["meeting"], times: ["morning"] }, tags: ["emotion-negative"] },
  { id: "cant_focus",       ko: "집중이 안 돼",      en: "I can't focus",                            coords: { days: [17], stages: ["stage-3"], places: ["office"], situations: ["work_start"], times: ["afternoon"] }, tags: ["emotion-negative"] },

  // ─── Stage 4 · 문장 패턴 ───
  // Day 22 · I'm going to (계획)
  { id: "going_to_try",     ko: "해볼 거야",           en: "I'm going to try",                          coords: { days: [22], stages: ["stage-4"], places: ["office"], situations: ["work_start"], times: ["morning"] }, tags: ["pattern-going-to"] },
  { id: "going_to_start",   ko: "시작할 거야",         en: "I'm going to start",                        coords: { days: [22], stages: ["stage-4"], places: ["office"], situations: ["work_start"], times: ["morning"] }, tags: ["pattern-going-to"] },
  { id: "going_to_ask",     ko: "물어볼 거야",         en: "I'm going to ask for help",                 coords: { days: [22], stages: ["stage-4"], places: ["office"], situations: ["work_start"], times: ["morning"] }, tags: ["pattern-going-to"] },
  { id: "not_going_to_wait",ko: "기다리지 않을 거야",  en: "I'm not going to wait",                     coords: { days: [22], stages: ["stage-4"], places: ["office"], situations: ["work_start"], times: ["morning"] }, tags: ["pattern-going-to"] },

  // Day 23 · I used to (과거 습관)
  { id: "used_to_hate",     ko: "예전에는 싫어했어",   en: "I used to hate it",                         coords: { days: [23], stages: ["stage-4"], places: ["kitchen"], situations: ["morning_routine"], times: ["morning"] }, tags: ["pattern-used-to"] },
  { id: "used_to_snooze",   ko: "예전에는 알람을 미뤘어", en: "I used to snooze",                       coords: { days: [23], stages: ["stage-4"], places: ["bedroom"], situations: ["alarm_off"], times: ["morning"] }, tags: ["pattern-used-to"] },
  { id: "used_to_skip",     ko: "예전에는 거르곤 했어", en: "I used to skip breakfast",                 coords: { days: [23], stages: ["stage-4"], places: ["kitchen"], situations: ["breakfast"], times: ["morning"] }, tags: ["pattern-used-to"] },

  // Day 24 · If (조건문)
  { id: "if_rains_stay",    ko: "비 오면 집에 있어",   en: "If it rains, we stay home",                 coords: { days: [24], stages: ["stage-4"], places: ["livingroom"], situations: ["small_talk"], times: ["evening"] }, tags: ["pattern-if"] },
  { id: "if_sunny_hike",    ko: "날씨 좋으면 등산",    en: "If it's sunny, we hike",                    coords: { days: [24], stages: ["stage-4"], places: ["livingroom"], situations: ["small_talk"], times: ["evening"] }, tags: ["pattern-if"] },

  // Day 25 · I should have (후회)
  { id: "should_have_said", ko: "말했어야 했어",       en: "I should have said something",              coords: { days: [25], stages: ["stage-4"], places: ["office"], situations: ["winding_down"], times: ["evening"] }, tags: ["pattern-should-have"] },
  { id: "should_have_spoken",ko: "목소리를 냈어야 했어",en: "I should have spoken up",                  coords: { days: [25], stages: ["stage-4"], places: ["office"], situations: ["meeting"], times: ["evening"] }, tags: ["pattern-should-have"] },

  // Day 26 · It's been (소요·경험)
  { id: "its_been_a_day",   ko: "오늘 하루 길었어",    en: "It's been a day",                           coords: { days: [26], stages: ["stage-4"], places: ["livingroom"], situations: ["winding_down"], times: ["night"] }, tags: ["pattern-its-been"] },
  { id: "its_been_one_of",  ko: "그런 날이었어",       en: "It's been one of those days",               coords: { days: [26], stages: ["stage-4"], places: ["livingroom"], situations: ["winding_down"], times: ["night"] }, tags: ["pattern-its-been"] },

  // Day 27 · Just in case (대비)
  { id: "just_in_case",     ko: "혹시 모르니까",       en: "just in case",                              coords: { days: [27], stages: ["stage-4"], places: ["entrance"], situations: ["morning_routine"], times: ["morning"] }, tags: ["pattern-just-in-case"] },
  { id: "take_umbrella",    ko: "우산을 챙겨",         en: "I'll take an umbrella",                     coords: { days: [27], stages: ["stage-4"], places: ["entrance"], situations: ["morning_routine"], times: ["morning"] }, tags: ["pattern-just-in-case"] },
];

export const PHRASE_BY_ID: Record<string, Phrase> = Object.fromEntries(PHRASES.map(p => [p.id, p]));
