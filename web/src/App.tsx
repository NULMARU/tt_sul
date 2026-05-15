import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { applyTimeOfDay } from "./lib/time";
import { useStore } from "./lib/store";
import { buildLearnerProfile } from "./lib/adaptive-profile";
import { buildAdaptiveUiPatches } from "./lib/adaptive-ui";
import { BottomBar } from "./components/BottomBar";
import { Home } from "./routes/Home";
import { AxisDay } from "./routes/AxisDay";
import { AxisStage } from "./routes/AxisStage";
import { AxisPlace } from "./routes/AxisPlace";
import { AxisSituation } from "./routes/AxisSituation";
import { AxisTime } from "./routes/AxisTime";
import { Lesson } from "./routes/Lesson";
import { Story } from "./routes/Story";
import { Review } from "./routes/Review";
import { MemoryMap } from "./routes/MemoryMap";
import { Journal } from "./routes/Journal";
import { Toolbelt } from "./routes/Toolbelt";

export default function App() {
  const learningSignals = useStore(s => s.learningSignals);
  const quizAttempts = useStore(s => s.quizAttempts);
  const recallSpeedMs = useStore(s => s.recallSpeedMs);
  const learnerProfile = useStore(s => s.learnerProfile);
  const adaptiveUiPatches = useStore(s => s.adaptiveUiPatches);
  const prefs = useStore(s => s.prefs);
  const setLearnerProfile = useStore(s => s.setLearnerProfile);
  const upsertAdaptiveUiPatch = useStore(s => s.upsertAdaptiveUiPatch);

  useEffect(() => {
    applyTimeOfDay();
    const id = window.setInterval(applyTimeOfDay, 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const profile = buildLearnerProfile({ learningSignals, quizAttempts, recallSpeedMs });
    setLearnerProfile(profile);
  }, [learningSignals, quizAttempts, recallSpeedMs, setLearnerProfile]);

  useEffect(() => {
    const patches = buildAdaptiveUiPatches({ learnerProfile, adaptiveUiPatches, prefs, learningSignals });
    patches.forEach(upsertAdaptiveUiPatch);
  }, [adaptiveUiPatches, learnerProfile, learningSignals, prefs, upsertAdaptiveUiPatch]);

  return (
    <div className="app-shell relative pb-20">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/axis/day"       element={<AxisDay />} />
        <Route path="/axis/stage"     element={<AxisStage />} />
        <Route path="/axis/place"     element={<AxisPlace />} />
        <Route path="/axis/situation" element={<AxisSituation />} />
        <Route path="/axis/time"      element={<AxisTime />} />
        <Route path="/lesson/:id"     element={<Lesson />} />
        <Route path="/story/:id"      element={<Story />} />
        <Route path="/review"         element={<Review />} />
        <Route path="/memory-map"     element={<MemoryMap />} />
        <Route path="/journal"        element={<Journal />} />
        <Route path="/toolbelt"       element={<Toolbelt />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomBar />
    </div>
  );
}
