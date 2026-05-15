let mediaRecorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let stream: MediaStream | null = null;

export function recordingSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof MediaRecorder !== "undefined"
  );
}

export async function startRecording(): Promise<void> {
  if (!recordingSupported()) throw new Error("MediaRecorder is not supported");
  if (mediaRecorder?.state === "recording") return;
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = pickMimeType();
  mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  chunks = [];
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };
  mediaRecorder.start();
}

export function stopRecording(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      reject(new Error("not recording"));
      return;
    }
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mediaRecorder?.mimeType || "audio/webm" });
      chunks = [];
      stream?.getTracks().forEach(track => track.stop());
      stream = null;
      mediaRecorder = null;
      resolve(blob);
    };
    mediaRecorder.stop();
  });
}

export function isRecording(): boolean {
  return mediaRecorder?.state === "recording";
}

function pickMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  return candidates.find(type => MediaRecorder.isTypeSupported(type)) ?? "";
}
