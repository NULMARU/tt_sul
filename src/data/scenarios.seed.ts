// ============================================================
// tt의 3단계 누적 작문 시나리오 (Day 1~14)
// ============================================================
import type { Scenario } from "../types/schema";

export const SCENARIOS: Scenario[] = [
  {
    id: "sc-1-1",
    emoji: "⏰",
    situation: "alarm_off",
    prompt: "알람이 울려서 일어나는 상황",
    steps: [
      { label: "1단계 — 동작",    instruction: "아침에 일어나는 동작을 영어로!",       answer: "I wake up.",                                                  answerKo: "나는 잠에서 깬다" },
      { label: "2단계 — 상태",    instruction: "일어났는데 피곤한 상태를 붙여보세요.",   answer: "I wake up and I'm tired.",                                    answerKo: "잠에서 깨고 피곤하다" },
      { label: "3단계 — 이유",    instruction: "피곤하니까 알람을 끈다고 이어보세요.",   answer: "I wake up and I'm tired, so I snooze my alarm.",              answerKo: "잠에서 깨고 피곤해서 알람을 끈다" },
    ],
  },
  {
    id: "sc-1-2",
    emoji: "🪥",
    situation: "morning_routine",
    prompt: "화장실에서 양치하는 상황",
    steps: [
      { label: "1단계 — 동작",    instruction: "화장실에 가는 동작을 영어로!",          answer: "I go to the bathroom.",                                       answerKo: "화장실에 간다" },
      { label: "2단계 — 상태",    instruction: "거울을 보는 것까지 말해보세요.",         answer: "I go to the bathroom and I look in the mirror.",              answerKo: "화장실에 가서 거울을 본다" },
      { label: "3단계 — 이유",    instruction: "양치를 한다고 이어보세요.",             answer: "I go to the bathroom, I look in the mirror, then I brush my teeth.", answerKo: "거울을 보고 양치를 한다" },
    ],
  },
  {
    id: "sc-2-1",
    emoji: "👔",
    situation: "get_dressed",
    prompt: "아침에 외출 준비하는 상황",
    steps: [
      { label: "1단계 — 동작",    instruction: "옷을 입는 동작을 영어로!",              answer: "I get dressed.",                                              answerKo: "옷을 입는다" },
      { label: "2단계 — 상태",    instruction: "옷을 입고 거울로 확인하는 것을 말해보세요.", answer: "I get dressed and I check myself in the mirror.",         answerKo: "옷을 입고 거울로 확인한다" },
      { label: "3단계 — 이유",    instruction: "확인했으니 가방을 챙긴다고 이어보세요.",  answer: "I get dressed, I check myself in the mirror, then I grab my bag.", answerKo: "옷을 입고 거울 확인 후 가방을 챙긴다" },
    ],
  },
  {
    id: "sc-3-1",
    emoji: "☕",
    situation: "breakfast",
    prompt: "아침에 커피 내리고 식사하는 상황",
    steps: [
      { label: "1단계 — 동작",    instruction: "커피를 내리는 동작을 영어로!",          answer: "I brew some coffee.",                                         answerKo: "커피를 내린다" },
      { label: "2단계 — 상태",    instruction: "커피를 내리고 아침을 만드는 것을 말해보세요.", answer: "I brew some coffee and I make breakfast.",                answerKo: "커피를 내리고 아침을 만든다" },
      { label: "3단계 — 이유",    instruction: "배고프니까 아침을 먹는다고 이어보세요.",  answer: "I brew some coffee and I make breakfast because I'm hungry.", answerKo: "커피를 내리고 배고파서 아침을 먹는다" },
    ],
  },
  {
    id: "sc-4-1",
    emoji: "🚌",
    situation: "commute_bus",
    prompt: "버스 타고 출근하는 상황",
    steps: [
      { label: "1단계 — 동작",    instruction: "집을 나서는 동작을 영어로!",            answer: "I head out.",                                                 answerKo: "집을 나선다" },
      { label: "2단계 — 상태",    instruction: "집을 나서고 버스를 기다린다고 말해보세요.", answer: "I head out and I wait for the bus.",                          answerKo: "집을 나서고 버스를 기다린다" },
      { label: "3단계 — 이유",    instruction: "버스를 타고 교통카드를 찍는다고 이어보세요.", answer: "I head out, I wait for the bus, then I tap my card.",        answerKo: "나서서 버스 기다리고 카드를 찍는다" },
    ],
  },
  {
    id: "sc-5-1",
    emoji: "💼",
    situation: "work_start",
    prompt: "사무실에서 하루를 시작하는 상황",
    steps: [
      { label: "1단계 — 동작",    instruction: "자리에 앉는 동작을 영어로!",            answer: "I sit down at my desk.",                                      answerKo: "자리에 앉는다" },
      { label: "2단계 — 상태",    instruction: "앉아서 컴퓨터를 켠다고 말해보세요.",     answer: "I sit down at my desk and I turn on my computer.",            answerKo: "앉아서 컴퓨터를 켠다" },
      { label: "3단계 — 이유",    instruction: "이메일부터 확인한다고 이어보세요.",      answer: "I sit down at my desk, I turn on my computer, then I check my emails.", answerKo: "앉아서 컴퓨터 켜고 이메일 확인" },
    ],
  },
  {
    id: "sc-6-1",
    emoji: "🍱",
    situation: "lunch",
    prompt: "점심시간에 동료와 식사하는 상황",
    steps: [
      { label: "1단계 — 동작",    instruction: "점심 먹으러 가는 동작을 영어로!",       answer: "I go out for lunch.",                                         answerKo: "점심 먹으러 간다" },
      { label: "2단계 — 상태",    instruction: "점심 먹으러 가서 뭐 먹을지 고른다고 말해보세요.", answer: "I go out for lunch and I decide what to eat.",         answerKo: "점심 먹으러 가서 뭐 먹을지 고른다" },
      { label: "3단계 — 이유",    instruction: "배고프니까 빨리 주문한다고 이어보세요.",  answer: "I go out for lunch and I decide what to eat because I'm hungry.", answerKo: "배고파서 빨리 뭐 먹을지 고른다" },
    ],
  },
  {
    id: "sc-7-1",
    emoji: "🔄",
    situation: "morning_routine",
    prompt: "아침부터 점심까지 하루를 말하는 상황",
    steps: [
      { label: "1단계",          instruction: "하루의 시작을 영어로!",                  answer: "I wake up.",                                                  answerKo: "잠에서 깬다" },
      { label: "2단계",          instruction: "일어나서 준비하는 흐름을 말해보세요.",    answer: "I wake up, I brush my teeth, and I get dressed.",             answerKo: "일어나서 양치하고 옷을 입는다" },
      { label: "3단계",          instruction: "준비를 마치고 출근한다고 이어보세요.",   answer: "I wake up, I get dressed, then I head out because I have to go to work.", answerKo: "일어나 준비하고 출근해야 하니까 나간다" },
    ],
  },
  {
    id: "sc-8-1",
    emoji: "📱",
    situation: "hobby",
    prompt: "아침에 핸드폰을 확인하는 상황",
    steps: [
      { label: "1단계",          instruction: "핸드폰을 집는 동작을 영어로!",           answer: "I pick up my phone.",                                         answerKo: "핸드폰을 집어 든다" },
      { label: "2단계",          instruction: "잠금을 풀고 메시지를 확인하는 것을 말해보세요.", answer: "I pick up my phone, I unlock it, and I check my messages.",   answerKo: "폰을 들고 잠금 풀고 메시지 확인" },
      { label: "3단계",          instruction: "메시지를 확인하고 답장을 보낸다고 이어보세요.", answer: "I pick up my phone, I check my messages, then I send a message.", answerKo: "폰 들고 메시지 확인 후 답장을 보낸다" },
    ],
  },
  {
    id: "sc-10-1",
    emoji: "🏠",
    situation: "evening_chores",
    prompt: "퇴근하고 집안일하는 상황",
    steps: [
      { label: "1단계",          instruction: "집에 도착하는 동작을 영어로!",           answer: "I arrive home.",                                              answerKo: "집에 도착한다" },
      { label: "2단계",          instruction: "도착해서 피곤하다고 말해보세요.",        answer: "I arrive home and I'm tired.",                                answerKo: "집에 도착하고 피곤하다" },
      { label: "3단계",          instruction: "피곤하지만 설거지를 한다고 이어보세요.",  answer: "I arrive home and I'm tired, but I do the dishes.",           answerKo: "피곤하지만 설거지를 한다" },
    ],
  },
  {
    id: "sc-11-1",
    emoji: "😌",
    situation: "winding_down",
    prompt: "피곤해서 쉬는 상황",
    steps: [
      { label: "1단계",          instruction: "소파에 앉는 동작을 영어로!",             answer: "I sit on the couch.",                                         answerKo: "소파에 앉는다" },
      { label: "2단계",          instruction: "앉아서 눈을 감고 쉰다고 말해보세요.",     answer: "I sit on the couch and I close my eyes and rest.",            answerKo: "소파에 앉아 눈을 감고 쉰다" },
      { label: "3단계",          instruction: "피곤하니까 명상한다고 이어보세요.",       answer: "I sit on the couch and I'm tired, so I meditate.",            answerKo: "피곤해서 명상한다" },
    ],
  },
  {
    id: "sc-12-1",
    emoji: "🌙",
    situation: "bedtime",
    prompt: "잠자리에 드는 상황",
    steps: [
      { label: "1단계",          instruction: "침대에 눕는 동작을 영어로!",             answer: "I lie down in bed.",                                          answerKo: "침대에 눕는다" },
      { label: "2단계",          instruction: "누워서 이불을 덮는다고 말해보세요.",      answer: "I lie down in bed and I pull up the blanket.",                answerKo: "침대에 누워 이불을 덮는다" },
      { label: "3단계",          instruction: "피곤하니까 바로 잠든다고 이어보세요.",   answer: "I lie down in bed, I pull up the blanket, and I fall asleep because I'm exhausted.", answerKo: "누워서 이불 덮고 피곤해서 바로 잠든다" },
    ],
  },
];

export const SCENARIO_BY_ID: Record<string, Scenario> = Object.fromEntries(SCENARIOS.map(s => [s.id, s]));
