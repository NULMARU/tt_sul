import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DIALOGUE_BY_ID } from "@shared/data/dialogues.seed";
import type { DialogueTurn } from "@shared/types/schema";
import { llmAvailable, streamRoleplay, type RoleplayChatMessage } from "../lib/llm";
import { speak, waitForTtsIdle } from "../lib/tts";

type SpeakerRole = "A" | "B";

export function DialogueRoleplay() {
  const { id } = useParams();
  const nav = useNavigate();
  const dialogue = id ? DIALOGUE_BY_ID[id] : undefined;
  const [myRole, setMyRole] = useState<SpeakerRole>("A");
  const [messages, setMessages] = useState<RoleplayChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const assistantRole = myRole === "A" ? "B" : "A";
  const targetPhrases = useMemo(() => dialogue ? dialogue.turns.slice(0, 4).map(turn => turn.en) : [], [dialogue]);

  if (!dialogue) {
    return <div className="px-6 py-12 text-center text-text-muted">롤플레잉 대화를 찾을 수 없어요.</div>;
  }

  const currentDialogue = dialogue;

  function resetRole(nextRole: SpeakerRole) {
    setMyRole(nextRole);
    setMessages([]);
    setInput("");
    setUsedFallback(false);
  }

  function startWithAssistant() {
    const opening = currentDialogue.turns.find(turn => turn.speaker === assistantRole) ?? currentDialogue.turns[0];
    setMessages([{ role: "assistant", content: opening.en }]);
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    const nextMessages: RoleplayChatMessage[] = [...messages, { role: "user", content: text }];
    const placeholder: RoleplayChatMessage = { role: "assistant", content: "" };
    setInput("");
    setBusy(true);
    setMessages([...nextMessages, placeholder]);

    let streamed = "";
    const reply = await streamRoleplay(
      {
        scene: `${currentDialogue.situation} Keep the exchange close to this intermediate lesson: ${currentDialogue.subtitle}.`,
        role: `Speaker ${assistantRole}, a friendly conversation partner`,
        phrases: targetPhrases,
        messages: normalizeForProxy(nextMessages),
      },
      delta => {
        streamed += delta;
        setMessages([...nextMessages, { role: "assistant", content: streamed }]);
      },
    );

    const finalReply = reply ?? fallbackReply(currentDialogue.turns, assistantRole, messages);
    if (!reply) setUsedFallback(true);
    setMessages([...nextMessages, { role: "assistant", content: finalReply }]);
    setBusy(false);
  }

  return (
    <div className="px-5 pt-4 pb-4 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <button onClick={async () => { await waitForTtsIdle(); nav(`/dialogue/${currentDialogue.id}`); }} className="w-9 h-9 rounded-full hover:bg-surface-2">←</button>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-text-muted">Stage 2 · AI 롤플레잉</div>
          <h1 className="text-xl font-bold truncate">{currentDialogue.emoji} {currentDialogue.title}</h1>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold">즉흥 대화 미션</div>
            <p className="mt-1 text-sm text-text-muted">{currentDialogue.situation}</p>
          </div>
          <span className={`rounded-full px-2 py-1 text-[11px] ${llmAvailable() ? "bg-success/10 text-success" : "bg-surface-2 text-text-muted"}`}>
            {llmAvailable() ? "LLM 연결" : "로컬 연습"}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["A", "B"] as SpeakerRole[]).map(role => (
            <button
              key={role}
              onClick={() => resetRole(role)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium ${myRole === role ? "border-accent bg-accent/20" : "border-border bg-surface-2 text-text-muted"}`}
            >
              내가 {role}
            </button>
          ))}
        </div>
        {usedFallback && (
          <p className="mt-2 text-xs text-text-muted">
            LLM 응답을 받을 수 없어 원본 대화 기반 예시 응답으로 연습 중입니다.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4 flex min-h-[280px] flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-sm text-text-muted">
            <div className="text-4xl">🎲</div>
            <p>역할을 고르고 영어로 한 문장을 보내면 상대가 이어서 답합니다.</p>
            <button onClick={startWithAssistant} className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium text-text">
              상대가 먼저 말하게 하기
            </button>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${message.role === "user" ? "bg-accent text-[#2A2522]" : "bg-surface-2"}`}>
                <div className="mb-1 text-[10px] opacity-70">{message.role === "user" ? `나 · ${myRole}` : `상대 · ${assistantRole}`}</div>
                <div className="en whitespace-pre-wrap">{message.content || "..."}</div>
                {message.role === "assistant" && message.content && (
                  <button onClick={() => speak(message.content, { rate: 0.95 })} className="mt-2 text-[11px] underline underline-offset-2">
                    듣기
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      <div className="rounded-2xl border border-border bg-surface p-3">
        <textarea
          value={input}
          onChange={event => setInput(event.target.value)}
          rows={3}
          placeholder={myRole === "A" ? "Do you have any plans this weekend?" : "That sounds good. What time should we meet?"}
          className="w-full resize-none rounded-xl border border-border bg-surface-2 p-3 en outline-none focus:border-accent"
        />
        <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
          <button
            onClick={() => nav(`/dialogue-quiz/${currentDialogue.id}`)}
            className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium"
          >
            퀴즈로 확인
          </button>
          <button
            onClick={send}
            disabled={!input.trim() || busy}
            className="rounded-xl bg-accent text-[#2A2522] px-5 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {busy ? "응답 중..." : "보내기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function normalizeForProxy(messages: RoleplayChatMessage[]): RoleplayChatMessage[] {
  if (messages[0]?.role !== "assistant") return messages;
  const opening = messages[0].content;
  const rest = messages.slice(1);
  if (rest[0]?.role !== "user") {
    return [{ role: "user", content: `The other speaker opened with: "${opening}". Continue the roleplay.` }];
  }
  return [
    { role: "user", content: `The other speaker opened with: "${opening}"\nMy reply: ${rest[0].content}` },
    ...rest.slice(1),
  ];
}

function fallbackReply(turns: DialogueTurn[], assistantRole: SpeakerRole, currentMessages: RoleplayChatMessage[]): string {
  const usedAssistantTurns = currentMessages.filter(message => message.role === "assistant").length;
  const candidates = turns.filter(turn => turn.speaker === assistantRole);
  return candidates[Math.min(usedAssistantTurns, candidates.length - 1)]?.en ?? "That sounds good. Tell me a little more.";
}
