import { useEffect, useState } from "react";
import * as recorder from "../lib/recorder";
import { speak, waitForTtsIdle } from "../lib/tts";
import { useStore } from "../lib/store";

export function ShadowingRecorder({ text, title = "쉐도잉" }: { text: string; title?: string }) {
  const [supported] = useState(() => recorder.recordingSupported());
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const recordRecordingMade = useStore(s => s.recordRecordingMade);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (!supported) {
    return <div className="text-xs text-text-muted">이 브라우저는 녹음을 지원하지 않아요.</div>;
  }

  async function toggleRecording() {
    if (recording) {
      const blob = await recorder.stopRecording();
      const nextUrl = URL.createObjectURL(blob);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(nextUrl);
      setRecording(false);
      recordRecordingMade();
      return;
    }
    await waitForTtsIdle();
    await recorder.startRecording();
    setRecording(true);
  }

  async function compare() {
    if (!audioUrl) return;
    setBusy(true);
    await speak(text);
    await new Promise(resolve => window.setTimeout(resolve, 350));
    await playAudio(audioUrl);
    setBusy(false);
  }

  return (
    <div className="mt-3 rounded-xl border border-border bg-surface-2 p-3 flex flex-col gap-2">
      <div className="text-xs text-text-muted">{title}</div>
      <div className="flex gap-2">
        <button
          onClick={toggleRecording}
          disabled={busy}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${recording ? "bg-error text-white" : "bg-accent text-[#2A2522]"} disabled:opacity-50`}
        >
          {recording ? "녹음 중지" : "녹음 시작"}
        </button>
        {audioUrl && (
          <button
            onClick={compare}
            disabled={busy || recording}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
          >
            {busy ? "재생 중..." : "비교 재생"}
          </button>
        )}
      </div>
      {audioUrl && <audio src={audioUrl} controls className="w-full" />}
    </div>
  );
}

function playAudio(url: string): Promise<void> {
  return new Promise(resolve => {
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    void audio.play().catch(() => resolve());
  });
}
