import type { AdvancedArticle } from "../types/schema";

export const ADVANCED_ARTICLES: AdvancedArticle[] = [
  {
    id: "adv-work-ai-meetings",
    languageId: "en",
    levelId: "advanced",
    category: "work",
    interestTags: ["업무", "기술/AI", "workday"],
    trendLabelKo: "최근 업무 도구 이슈",
    sourceNoteKo: "AI 회의록, 업무 자동화, 책임 있는 검토 습관을 다루는 최근 업무 트렌드형 학습 글입니다.",
    title: "AI Notes Are Changing Meetings",
    subtitle: "업무 회의에서 AI 기록 도구를 어떻게 써야 할까?",
    summaryKo: "AI 회의록 도구는 시간을 아껴주지만, 책임감 있는 확인과 맥락 판단이 함께 필요합니다.",
    estimatedMinutes: 8,
    body: `Many teams now use AI tools to summarize meetings, extract action items, and send follow-up notes. The benefit is obvious: people spend less time typing and more time listening. A manager can leave a meeting with a clean list of decisions, owners, and deadlines within seconds.

But convenience creates a new responsibility. AI notes can miss tone, exaggerate certainty, or turn an informal idea into something that sounds like a final decision. If nobody checks the summary, the team may move forward with a version of the meeting that no one actually agreed to.

The best approach is not to reject the tool, but to design a habit around it. At the end of a meeting, one person should confirm the three most important points out loud: what was decided, who owns the next step, and what remains uncertain. Then the AI summary becomes a useful draft, not an invisible authority.

In other words, AI can reduce administrative work, but it cannot replace shared understanding. The more powerful the tool becomes, the more important human confirmation becomes.`,
    keyExpressions: [
      { en: "The benefit is obvious", ko: "장점은 분명하다", usage: "주장을 시작할 때 장점을 인정하는 표현" },
      { en: "move forward with", ko: "~을 바탕으로 진행하다", usage: "업무 계획이나 결정 후속 조치에 사용" },
      { en: "not to reject the tool, but to design a habit around it", ko: "도구를 거부하기보다 사용 습관을 설계하는 것", usage: "균형 잡힌 대안 제시" },
      { en: "replace shared understanding", ko: "공유된 이해를 대체하다", usage: "기술의 한계를 말할 때 사용" },
    ],
    debate: {
      question: "Should teams rely on AI-generated meeting notes?",
      stanceA: "Yes. They save time and make follow-up clearer.",
      stanceB: "No. They can distort decisions and reduce accountability.",
      usefulFrames: [
        "I partly agree, but the main risk is...",
        "The issue is not the tool itself, but...",
        "A practical compromise would be...",
      ],
    },
    writingPrompt: "Write 4-5 sentences explaining how your workplace or team should use AI meeting notes responsibly.",
    speakingPrompt: "Give a one-minute opinion: Should AI meeting notes be trusted? Include one benefit, one risk, and one rule.",
    sampleAnswer: "I think AI meeting notes can be trusted as a draft, but not as the final record. They save time and help people follow up quickly. However, they can miss context or make uncertain ideas sound final. My rule would be simple: the team should confirm key decisions before the AI summary is shared.",
    rubric: [
      { criterion: "clarity", label: "명확성", description: "핵심 입장이 첫 15초 안에 분명하게 드러나는가?" },
      { criterion: "structure", label: "구조", description: "장점, 위험, 규칙이 구분되어 말해지는가?" },
      { criterion: "evidence", label: "근거", description: "업무 상황에 맞는 구체적 예시가 있는가?" },
      { criterion: "delivery", label: "전달", description: "문장 사이가 너무 길게 끊기지 않고 자연스럽게 이어지는가?" },
    ],
  },
  {
    id: "adv-news-local-shops",
    languageId: "en",
    levelId: "advanced",
    category: "news",
    interestTags: ["경제/소비", "음식", "지역사회"],
    trendLabelKo: "플랫폼 경제 이슈",
    sourceNoteKo: "온라인 플랫폼과 동네 상권의 균형을 다루는 사회·경제 이슈형 학습 글입니다.",
    title: "Why Small Shops Still Matter",
    subtitle: "편리한 플랫폼 시대에도 동네 가게가 필요한 이유",
    summaryKo: "온라인 플랫폼은 편리하지만, 동네 가게는 지역 관계와 선택권을 지키는 역할을 합니다.",
    estimatedMinutes: 7,
    body: `Online platforms have made shopping faster than ever. A person can compare prices, read reviews, and receive a product without speaking to anyone. For busy customers, this convenience is hard to give up.

Still, small local shops provide something that large platforms cannot easily copy: local memory. A neighborhood bookstore remembers what children enjoyed last month. A repair shop knows which appliances are common in nearby apartments. A small cafe becomes a place where people recognize each other, not just a place where coffee is sold.

This does not mean every small shop can survive only because it is local. Customers still need fair prices, reliable service, and a reason to return. However, when every purchase moves to a distant platform, neighborhoods lose more than stores. They lose places where trust is built slowly.

The future may not be a choice between platforms and small shops. It may depend on whether local businesses can use digital tools without losing their human advantage.`,
    keyExpressions: [
      { en: "hard to give up", ko: "포기하기 어렵다", usage: "편리함이나 습관을 설명할 때" },
      { en: "local memory", ko: "지역의 기억", usage: "지역사회가 가진 축적된 관계와 맥락을 표현" },
      { en: "lose more than stores", ko: "가게 이상의 것을 잃다", usage: "사회적 의미를 강조" },
      { en: "human advantage", ko: "사람만의 강점", usage: "기술과 인간 서비스 비교" },
    ],
    debate: {
      question: "Should customers pay slightly more to support local shops?",
      stanceA: "Yes. Local shops protect community and diversity.",
      stanceB: "No. Customers should choose the best price and convenience.",
      usefulFrames: [
        "From a customer's point of view...",
        "In the long run, the community may...",
        "Price matters, but it is not the only factor.",
      ],
    },
    writingPrompt: "Write 4-5 sentences about one local shop you think is worth keeping and explain why.",
    speakingPrompt: "Give a one-minute argument for or against supporting local shops even when online prices are lower.",
    sampleAnswer: "I think customers should sometimes support local shops, even if the price is a little higher. Local shops make neighborhoods more personal and diverse. Of course, price matters, especially when people are under financial pressure. But if we only choose the cheapest option, we may lose places that make the community feel alive.",
    rubric: [
      { criterion: "clarity", label: "명확성", description: "찬성 또는 반대 입장이 분명한가?" },
      { criterion: "structure", label: "구조", description: "주장, 이유, 양보, 결론이 있는가?" },
      { criterion: "evidence", label: "근거", description: "동네 가게의 구체적 역할을 언급하는가?" },
      { criterion: "delivery", label: "전달", description: "강조하고 싶은 단어를 또렷하게 말하는가?" },
    ],
  },
  {
    id: "adv-society-digital-rest",
    languageId: "en",
    levelId: "advanced",
    category: "society",
    interestTags: ["업무", "건강", "기술/AI", "evening-recovery"],
    trendLabelKo: "디지털 웰빙 이슈",
    sourceNoteKo: "상시 연결 문화와 퇴근 후 메시지 경계를 다루는 최근 사회 이슈형 학습 글입니다.",
    title: "The Right to Be Offline",
    subtitle: "항상 연결된 사회에서 쉴 권리는 어떻게 지킬까?",
    summaryKo: "디지털 연결은 효율을 높이지만, 개인의 회복 시간과 경계 설정을 제도와 문화가 함께 보호해야 합니다.",
    estimatedMinutes: 9,
    body: `Being reachable used to be a special condition. Now it is the default. Messages arrive after work, group chats continue late at night, and even rest can feel like a delayed response waiting to happen.

The problem is not technology itself. Fast communication can prevent confusion and help people cooperate across distance. The problem begins when availability becomes a measure of responsibility. If the person who answers fastest is seen as the most committed, everyone feels pressure to stay online.

Some companies have introduced rules that limit after-hours messages. Rules can help, but culture matters just as much. A manager who says "no need to reply tonight" but rewards immediate replies sends a mixed message. A healthy digital culture requires visible boundaries from people with power.

The right to be offline is not laziness. It is a condition for better attention. People who can truly disconnect are more likely to return with patience, judgment, and energy.`,
    keyExpressions: [
      { en: "the default", ko: "기본값", usage: "현대 사회의 보편적 상태를 설명" },
      { en: "availability becomes a measure of responsibility", ko: "응답 가능성이 책임감의 척도가 되다", usage: "문제의 핵심을 분석할 때" },
      { en: "sends a mixed message", ko: "엇갈린 메시지를 주다", usage: "말과 행동이 다를 때" },
      { en: "a condition for better attention", ko: "더 나은 집중을 위한 조건", usage: "휴식의 가치를 재정의" },
    ],
    debate: {
      question: "Should workplaces ban non-urgent messages after work?",
      stanceA: "Yes. Clear rules protect people's recovery time.",
      stanceB: "No. Flexible work sometimes requires flexible communication.",
      usefulFrames: [
        "The boundary I would suggest is...",
        "This policy could backfire if...",
        "A fair rule should distinguish between urgent and non-urgent messages.",
      ],
    },
    writingPrompt: "Write 4-5 sentences proposing a fair rule for after-hours messages in a workplace or study group.",
    speakingPrompt: "Give a one-minute proposal: how can people protect rest without damaging teamwork?",
    sampleAnswer: "I would not ban every message after work, but I would create a clear rule. Non-urgent messages should wait until the next workday, while emergencies can use a separate channel. This protects people's rest without blocking real problems. Leaders should follow the rule first, because culture changes when powerful people show boundaries.",
    rubric: [
      { criterion: "clarity", label: "명확성", description: "제안하는 규칙이 구체적인가?" },
      { criterion: "structure", label: "구조", description: "문제, 해결책, 예외, 기대 효과가 이어지는가?" },
      { criterion: "evidence", label: "근거", description: "팀워크와 휴식의 균형을 설명하는가?" },
      { criterion: "delivery", label: "전달", description: "제안문답게 단호하고 침착하게 말하는가?" },
    ],
  },
  {
    id: "adv-work-four-day-week",
    languageId: "en",
    levelId: "advanced",
    category: "work",
    interestTags: ["업무", "건강", "경제/소비", "workday"],
    trendLabelKo: "근무 방식 이슈",
    sourceNoteKo: "근무시간 단축, 생산성, 번아웃을 다루는 최근 업무 문화 이슈형 학습 글입니다.",
    title: "The Promise and Pressure of a Four-Day Week",
    subtitle: "주 4일제는 모두에게 좋은 변화일까?",
    summaryKo: "주 4일제는 회복 시간을 늘릴 수 있지만, 업무량 조정 없이 도입되면 압축 노동이 될 위험도 있습니다.",
    estimatedMinutes: 8,
    body: `The four-day workweek is often described as a simple trade: fewer days, better focus, and happier workers. In some teams, that promise can be real. When meetings are reduced and priorities become clearer, people may finish important work in less time.

However, a shorter week does not automatically create a healthier workplace. If the same amount of work is pushed into fewer days, employees may feel more pressure, not less. A day off can lose its meaning if people spend the other four days rushing, skipping breaks, and answering messages late at night.

The real question is not whether four days are better than five. The question is whether a company is willing to redesign work. That means cutting unnecessary meetings, defining what can wait, and trusting people to protect deep work time.

A four-day week can be a powerful policy, but only when it is paired with honest workload management. Without that, it becomes a nicer label for the same old exhaustion.`,
    keyExpressions: [
      { en: "a simple trade", ko: "단순한 교환", usage: "정책의 표면적 장점을 설명할 때" },
      { en: "does not automatically create", ko: "자동으로 만들지는 않는다", usage: "낙관론을 조심스럽게 제한할 때" },
      { en: "redesign work", ko: "일하는 방식을 재설계하다", usage: "근본적 개선을 말할 때" },
      { en: "a nicer label for the same old exhaustion", ko: "같은 피로에 붙인 더 좋은 이름", usage: "겉만 바뀐 변화를 비판할 때" },
    ],
    debate: {
      question: "Should more companies adopt a four-day workweek?",
      stanceA: "Yes. It can improve focus and give people real recovery time.",
      stanceB: "No. It may create more pressure if workload stays the same.",
      usefulFrames: [
        "The policy would work only if...",
        "The hidden cost is...",
        "I would support it under one condition:",
      ],
    },
    writingPrompt: "Write 4-5 sentences explaining whether a four-day workweek would help your team or daily life.",
    speakingPrompt: "Give a one-minute opinion: Would you prefer a four-day workweek? Include one benefit and one condition.",
    sampleAnswer: "I would prefer a four-day workweek, but only if the workload is redesigned. The biggest benefit is that people can recover more fully and come back with better focus. However, if the same tasks are squeezed into four days, the policy could increase stress. For me, fewer meetings and clearer priorities would be the condition.",
    rubric: [
      { criterion: "clarity", label: "명확성", description: "찬성 또는 조건부 찬성 입장이 분명한가?" },
      { criterion: "structure", label: "구조", description: "장점, 위험, 조건이 순서대로 제시되는가?" },
      { criterion: "evidence", label: "근거", description: "자신의 업무나 생활 패턴과 연결한 예시가 있는가?" },
      { criterion: "delivery", label: "전달", description: "조건을 말할 때 단호하고 자연스럽게 강조하는가?" },
    ],
  },
  {
    id: "adv-work-feedback-data",
    languageId: "en",
    levelId: "advanced",
    category: "work",
    interestTags: ["업무", "기술/AI", "관계"],
    trendLabelKo: "성과관리·데이터 이슈",
    sourceNoteKo: "업무 데이터, 피드백 문화, 직원 신뢰를 다루는 최근 조직 운영 이슈형 학습 글입니다.",
    title: "When Feedback Becomes Data",
    subtitle: "직장 피드백을 데이터로 관리하면 무엇이 좋아지고 무엇이 위험할까?",
    summaryKo: "피드백 데이터는 성장을 돕지만, 맥락 없는 점수화는 신뢰를 약화시킬 수 있습니다.",
    estimatedMinutes: 8,
    body: `Many companies want feedback to be more consistent. Instead of relying on memory, they collect ratings, comments, performance notes, and survey results. In theory, this makes evaluation fairer because decisions can be based on evidence rather than personal impressions.

But feedback changes when people know every comment may become data. Managers may write safer, less honest notes. Employees may focus on improving their numbers rather than improving the actual quality of their work. A useful conversation can become a record that everyone tries to manage.

Data can reveal patterns, but it cannot fully explain context. A low score may reflect poor performance, but it may also reflect an unclear project, a difficult client, or a temporary personal challenge. If leaders treat the number as the whole story, they may make faster decisions and worse decisions at the same time.

The best feedback systems use data as a starting point, not a verdict. They help people ask better questions: What happened? What support was missing? What should change next?`,
    keyExpressions: [
      { en: "based on evidence rather than personal impressions", ko: "개인적 인상보다 근거에 기반한", usage: "공정성을 설명할 때" },
      { en: "a record that everyone tries to manage", ko: "모두가 관리하려 드는 기록", usage: "측정이 행동을 바꾸는 상황" },
      { en: "the number as the whole story", ko: "숫자를 전체 이야기로 보는 것", usage: "정량화의 한계를 설명" },
      { en: "a starting point, not a verdict", ko: "판결이 아니라 출발점", usage: "데이터 활용 원칙을 제시" },
    ],
    debate: {
      question: "Should workplace feedback be turned into measurable data?",
      stanceA: "Yes. Data can reduce bias and reveal patterns.",
      stanceB: "No. It can make people defensive and hide context.",
      usefulFrames: [
        "The data is useful, but it should be interpreted with...",
        "What worries me is the incentive it creates.",
        "A better system would combine numbers with...",
      ],
    },
    writingPrompt: "Write 4-5 sentences proposing one rule for using feedback data fairly.",
    speakingPrompt: "Give a one-minute opinion: Should feedback be measured? Include one advantage, one danger, and one rule.",
    sampleAnswer: "Feedback data can be helpful, but it should not be treated as the final truth. It can reduce bias because leaders can compare patterns over time. The danger is that people may manage the numbers instead of having honest conversations. My rule is that every score should be discussed with context before it affects a major decision.",
    rubric: [
      { criterion: "clarity", label: "명확성", description: "데이터 활용에 대한 입장이 분명한가?" },
      { criterion: "structure", label: "구조", description: "장점, 위험, 규칙이 구분되는가?" },
      { criterion: "evidence", label: "근거", description: "직장 내 피드백 상황을 구체적으로 언급하는가?" },
      { criterion: "delivery", label: "전달", description: "추상적인 단어보다 쉬운 예시로 말하는가?" },
    ],
  },
  {
    id: "adv-news-space-infrastructure",
    languageId: "en",
    levelId: "advanced",
    category: "news",
    interestTags: ["우주산업", "기술/AI", "경제/소비", "travel-ready"],
    trendLabelKo: "최근 우주산업 이슈",
    sourceNoteKo: "재사용 로켓, 위성 인터넷, 달 탐사, 우주쓰레기처럼 최근 우주산업 뉴스에서 반복되는 흐름을 학습용으로 재구성했습니다.",
    title: "Space Is Becoming Infrastructure",
    subtitle: "우주산업은 더 이상 로켓 발사만의 이야기가 아니다",
    summaryKo: "우주산업은 발사 경쟁을 넘어 통신, 관측, 물류, 안전 관리 같은 인프라 산업으로 확장되고 있습니다.",
    estimatedMinutes: 9,
    body: `For a long time, space sounded like a distant dream: astronauts, rockets, and dramatic missions beyond Earth. Today, the space industry is becoming more practical and more connected to everyday life. Satellites support navigation, weather forecasting, disaster response, farming, internet access, and financial timing systems.

This shift changes the business question. The most important question is not simply, "Who can launch a rocket?" It is, "Who can provide reliable services from orbit?" Reusable rockets can lower launch costs, but the larger opportunity may come from what happens after launch: data, communication, maintenance, and long-term operations.

There are also public risks. More satellites can mean more congestion in orbit. A small collision can create debris that threatens other spacecraft. If space becomes infrastructure, then safety rules, international cooperation, and responsible design become as important as speed and ambition.

The next space race may not be about planting a flag. It may be about building systems that people on Earth quietly depend on every day.`,
    keyExpressions: [
      { en: "becoming more connected to everyday life", ko: "일상생활과 더 연결되고 있다", usage: "산업 변화가 개인에게 미치는 영향을 말할 때" },
      { en: "provide reliable services from orbit", ko: "궤도에서 안정적인 서비스를 제공하다", usage: "우주산업의 서비스화를 설명" },
      { en: "congestion in orbit", ko: "궤도 혼잡", usage: "위성 증가와 안전 문제를 설명" },
      { en: "quietly depend on", ko: "조용히 의존하다", usage: "눈에 보이지 않는 인프라를 설명" },
    ],
    debate: {
      question: "Should governments invest more in the space industry?",
      stanceA: "Yes. Space services support communication, safety, and innovation.",
      stanceB: "No. Public money should focus on urgent problems on Earth first.",
      usefulFrames: [
        "Space may sound distant, but it affects...",
        "The strongest argument for investment is...",
        "The public risk we cannot ignore is...",
      ],
    },
    writingPrompt: "Write 4-5 sentences explaining one space-industry service that could affect everyday life.",
    speakingPrompt: "Give a one-minute opinion: Is space infrastructure worth public investment? Include one benefit and one risk.",
    sampleAnswer: "I think space infrastructure is worth public investment because it already supports everyday systems like navigation and weather forecasting. It may sound distant, but people depend on satellite data more than they realize. However, governments should also manage risks such as space debris and unequal access. Investment should come with clear safety rules.",
    rubric: [
      { criterion: "clarity", label: "명확성", description: "우주산업 투자의 입장이 분명한가?" },
      { criterion: "structure", label: "구조", description: "서비스, 이점, 위험, 규칙이 이어지는가?" },
      { criterion: "evidence", label: "근거", description: "위성 통신, 관측, 항법 등 구체 서비스를 언급하는가?" },
      { criterion: "delivery", label: "전달", description: "전문 주제를 쉬운 문장으로 풀어 말하는가?" },
    ],
  },
  {
    id: "adv-news-climate-adaptation",
    languageId: "en",
    levelId: "advanced",
    category: "news",
    interestTags: ["환경", "건강", "도시생활"],
    trendLabelKo: "기후 적응 이슈",
    sourceNoteKo: "폭염, 도시 그늘, 에너지 부담처럼 최근 도시 정책에서 자주 다루는 기후 적응 주제형 학습 글입니다.",
    title: "Cities Are Learning to Live With Heat",
    subtitle: "도시는 폭염에 어떻게 적응해야 할까?",
    summaryKo: "도시 폭염 대응은 에어컨만의 문제가 아니라 그늘, 건축, 노동 시간, 취약계층 보호가 함께 필요한 정책 과제입니다.",
    estimatedMinutes: 8,
    body: `Extreme heat is no longer a temporary inconvenience in many cities. It affects public health, transportation, electricity use, outdoor work, and even the way people spend time in public spaces. When sidewalks, roads, and buildings store heat, the city can remain hot long after sunset.

The easiest response is to tell people to stay indoors and use air conditioning. But that advice assumes everyone has a safe home, affordable electricity, and flexible work. For delivery workers, elderly people, children, and people in small apartments, heat is not just uncomfortable. It can be dangerous.

Cities need adaptation, not only emergency warnings. More trees, shaded bus stops, cool roofs, public cooling centers, and adjusted outdoor work hours can reduce risk. These changes may sound small, but together they decide whether a city remains livable.

Climate adaptation is often less dramatic than climate prevention, but it is deeply practical. It asks a simple question: how can daily life continue safely in a hotter world?`,
    keyExpressions: [
      { en: "no longer a temporary inconvenience", ko: "더 이상 일시적 불편이 아니다", usage: "문제의 심각성을 도입" },
      { en: "assumes everyone has", ko: "모두가 가지고 있다고 가정한다", usage: "정책 조언의 한계를 지적" },
      { en: "remains livable", ko: "살 만한 상태로 남다", usage: "도시 정책의 목표를 말할 때" },
      { en: "deeply practical", ko: "매우 실용적인", usage: "현실적 해결책을 강조" },
    ],
    debate: {
      question: "Should cities spend more money adapting to extreme heat?",
      stanceA: "Yes. Heat affects health, work, and public safety.",
      stanceB: "No. Cities should focus more on reducing emissions first.",
      usefulFrames: [
        "Adaptation and prevention should not be treated as opposites.",
        "The people most affected are...",
        "A practical first step would be...",
      ],
    },
    writingPrompt: "Write 4-5 sentences proposing one practical heat-adaptation policy for your city.",
    speakingPrompt: "Give a one-minute proposal: What should a city do first to protect people from heat?",
    sampleAnswer: "My city should create more shaded public spaces, especially near bus stops and crosswalks. Extreme heat affects people who cannot simply stay indoors, such as delivery workers and elderly people. Trees and shade structures are not dramatic, but they make daily movement safer. This should be combined with cooling centers during heat waves.",
    rubric: [
      { criterion: "clarity", label: "명확성", description: "제안하는 정책이 구체적인가?" },
      { criterion: "structure", label: "구조", description: "문제, 대상, 해결책, 효과가 이어지는가?" },
      { criterion: "evidence", label: "근거", description: "도시 생활의 실제 장면을 예로 드는가?" },
      { criterion: "delivery", label: "전달", description: "정책 제안처럼 차분하게 말하는가?" },
    ],
  },
  {
    id: "adv-society-ai-tutors",
    languageId: "en",
    levelId: "advanced",
    category: "society",
    interestTags: ["교육", "기술/AI", "people"],
    trendLabelKo: "AI 교육 이슈",
    sourceNoteKo: "AI 튜터, 맞춤 학습, 교사의 역할 변화를 다루는 최근 교육 기술 이슈형 학습 글입니다.",
    title: "AI Tutors Need Human Teachers",
    subtitle: "AI 튜터가 늘어날수록 교사의 역할은 어떻게 바뀔까?",
    summaryKo: "AI 튜터는 반복 연습과 즉각 피드백에 강하지만, 동기, 맥락, 관계를 다루는 교사의 역할을 대체하기는 어렵습니다.",
    estimatedMinutes: 8,
    body: `AI tutors can explain grammar, create quizzes, correct writing, and repeat patiently. For language learners, this is a major advantage. A student can practice late at night, ask the same question ten times, and receive feedback without embarrassment.

But learning is not only a problem of information. Students also need motivation, emotional safety, and help choosing what matters. An AI tutor may notice a grammar pattern, but a teacher may notice that a student is losing confidence or avoiding speaking because of one bad experience.

The future of education may not be a fight between AI and teachers. A better model is partnership. AI can handle repetition and immediate practice, while teachers can design goals, build trust, and help students reflect on progress.

In that sense, AI tutors may make human teaching more important, not less. When machines become good at answers, humans become more responsible for asking the right questions.`,
    keyExpressions: [
      { en: "without embarrassment", ko: "부끄러움 없이", usage: "AI 학습의 심리적 장점" },
      { en: "not only a problem of information", ko: "정보만의 문제가 아니다", usage: "학습의 복합성을 설명" },
      { en: "a better model is partnership", ko: "더 나은 모델은 협력이다", usage: "대립 대신 균형안 제시" },
      { en: "asking the right questions", ko: "올바른 질문을 던지는 것", usage: "인간 역할의 핵심을 설명" },
    ],
    debate: {
      question: "Can AI tutors replace human teachers?",
      stanceA: "Yes. They provide cheap, patient, personalized practice.",
      stanceB: "No. Teachers provide motivation, trust, and human judgment.",
      usefulFrames: [
        "AI is strongest when the task is...",
        "A teacher is still needed because...",
        "The best learning environment would combine...",
      ],
    },
    writingPrompt: "Write 4-5 sentences about how you would use an AI tutor and a human teacher differently.",
    speakingPrompt: "Give a one-minute opinion: What should AI do in education, and what should humans keep doing?",
    sampleAnswer: "I would use an AI tutor for repetition, quick correction, and extra speaking practice. It is useful because I can practice without feeling embarrassed. However, I still need a human teacher to help me set goals and stay motivated. The best model is not replacement but partnership.",
    rubric: [
      { criterion: "clarity", label: "명확성", description: "AI와 인간의 역할 구분이 분명한가?" },
      { criterion: "structure", label: "구조", description: "AI 장점, 인간 역할, 결론이 이어지는가?" },
      { criterion: "evidence", label: "근거", description: "본인의 학습 경험과 연결했는가?" },
      { criterion: "delivery", label: "전달", description: "비교 표현을 자연스럽게 말하는가?" },
    ],
  },
  {
    id: "adv-society-robot-care",
    languageId: "en",
    levelId: "advanced",
    category: "society",
    interestTags: ["기술/AI", "건강", "관계", "home"],
    trendLabelKo: "고령화·돌봄 기술 이슈",
    sourceNoteKo: "고령화 사회, 돌봄 인력 부족, 로봇 보조 서비스를 다루는 사회 기술 이슈형 학습 글입니다.",
    title: "Robots in Care Work",
    subtitle: "돌봄 로봇은 사람을 돕는가, 사람을 밀어내는가?",
    summaryKo: "돌봄 로봇은 반복 업무와 안전 확인을 도울 수 있지만, 외로움과 존엄성 문제는 인간 관계와 함께 다뤄야 합니다.",
    estimatedMinutes: 9,
    body: `As societies age, care work becomes one of the most important public challenges. Families need support, hospitals need staff, and older adults need safety, dignity, and connection. Technology companies often suggest robots as part of the solution.

Robots can be genuinely helpful. They can remind people to take medicine, detect falls, carry supplies, or support simple physical exercises. These tasks can reduce pressure on human caregivers and allow them to spend more time on emotional care.

Still, care is not only a list of tasks. A person may need help standing up, but they may also need to feel respected. A robot can monitor movement, but it cannot fully replace the comfort of being seen and understood by another person.

The ethical question is not whether robots should enter care work. They already are. The question is what kind of work we ask them to do, and what kind of human contact we refuse to give up.`,
    keyExpressions: [
      { en: "safety, dignity, and connection", ko: "안전, 존엄, 연결감", usage: "돌봄의 핵심 가치를 나열" },
      { en: "part of the solution", ko: "해결책의 일부", usage: "기술의 역할을 제한적으로 인정" },
      { en: "not only a list of tasks", ko: "단순한 업무 목록이 아니다", usage: "돌봄의 인간적 성격 설명" },
      { en: "refuse to give up", ko: "포기하지 않으려 하다", usage: "지켜야 할 가치를 말할 때" },
    ],
    debate: {
      question: "Should robots be used in elderly care?",
      stanceA: "Yes. They can improve safety and reduce caregiver workload.",
      stanceB: "No. They may reduce human contact and emotional care.",
      usefulFrames: [
        "Robots should handle tasks such as...",
        "The human part of care is...",
        "The line I would draw is...",
      ],
    },
    writingPrompt: "Write 4-5 sentences explaining one task robots should do in care work and one task humans should keep.",
    speakingPrompt: "Give a one-minute opinion: Where should society draw the line between robot care and human care?",
    sampleAnswer: "Robots should be used in elderly care, but only for the right tasks. They can remind people to take medicine or detect falls, which improves safety. However, emotional care should remain human because people need respect and connection. The line I would draw is simple: robots can support care, but they should not replace relationships.",
    rubric: [
      { criterion: "clarity", label: "명확성", description: "로봇이 할 일과 사람이 할 일이 분명한가?" },
      { criterion: "structure", label: "구조", description: "찬성, 제한, 기준이 이어지는가?" },
      { criterion: "evidence", label: "근거", description: "구체적 돌봄 업무 예시가 있는가?" },
      { criterion: "delivery", label: "전달", description: "윤리적 주제를 조심스럽고 명확하게 말하는가?" },
    ],
  },
];

export const ADVANCED_ARTICLE_BY_ID: Record<string, AdvancedArticle> = Object.fromEntries(
  ADVANCED_ARTICLES.map(article => [article.id, article]),
) as Record<string, AdvancedArticle>;
