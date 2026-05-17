import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { applyTimeOfDay } from "./lib/time";
import { useStore } from "./lib/store";
import { buildLearnerProfile } from "./lib/adaptive-profile";
import { buildAdaptiveUiPatches } from "./lib/adaptive-ui";
import { BottomBar } from "./components/BottomBar";

const Home = lazy(() => import("./routes/Home").then(module => ({ default: module.Home })));
const AxisDay = lazy(() => import("./routes/AxisDay").then(module => ({ default: module.AxisDay })));
const AxisStage = lazy(() => import("./routes/AxisStage").then(module => ({ default: module.AxisStage })));
const AxisPlace = lazy(() => import("./routes/AxisPlace").then(module => ({ default: module.AxisPlace })));
const AxisSituation = lazy(() => import("./routes/AxisSituation").then(module => ({ default: module.AxisSituation })));
const AxisTime = lazy(() => import("./routes/AxisTime").then(module => ({ default: module.AxisTime })));
const Lesson = lazy(() => import("./routes/Lesson").then(module => ({ default: module.Lesson })));
const Story = lazy(() => import("./routes/Story").then(module => ({ default: module.Story })));
const Review = lazy(() => import("./routes/Review").then(module => ({ default: module.Review })));
const MemoryMap = lazy(() => import("./routes/MemoryMap").then(module => ({ default: module.MemoryMap })));
const Journal = lazy(() => import("./routes/Journal").then(module => ({ default: module.Journal })));
const Toolbelt = lazy(() => import("./routes/Toolbelt").then(module => ({ default: module.Toolbelt })));
const PromotionExam = lazy(() => import("./routes/PromotionExam").then(module => ({ default: module.PromotionExam })));
const ExamHistory = lazy(() => import("./routes/ExamHistory").then(module => ({ default: module.ExamHistory })));
const Intermediate = lazy(() => import("./routes/Intermediate").then(module => ({ default: module.Intermediate })));
const Dialogues = lazy(() => import("./routes/Dialogues").then(module => ({ default: module.Dialogues })));
const DialogueLesson = lazy(() => import("./routes/DialogueLesson").then(module => ({ default: module.DialogueLesson })));
const DialogueQuiz = lazy(() => import("./routes/DialogueQuiz").then(module => ({ default: module.DialogueQuiz })));
const DialogueRoleplay = lazy(() => import("./routes/DialogueRoleplay").then(module => ({ default: module.DialogueRoleplay })));
const IntermediateReadings = lazy(() => import("./routes/IntermediateReadings").then(module => ({ default: module.IntermediateReadings })));
const IntermediateReading = lazy(() => import("./routes/IntermediateReading").then(module => ({ default: module.IntermediateReading })));
const Advanced = lazy(() => import("./routes/Advanced").then(module => ({ default: module.Advanced })));
const AdvancedArticle = lazy(() => import("./routes/AdvancedArticle").then(module => ({ default: module.AdvancedArticle })));

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname, location.search]);

  return null;
}

function RouteLoading() {
  return (
    <div className="px-6 py-12 text-center text-sm text-text-muted">
      화면을 불러오는 중입니다...
    </div>
  );
}

export default function App() {
  const learningSignals = useStore(s => s.learningSignals);
  const quizAttempts = useStore(s => s.quizAttempts);
  const recallSpeedMs = useStore(s => s.recallSpeedMs);
  const journal = useStore(s => s.journal);
  const writingMistakes = useStore(s => s.writingMistakes);
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
    const profile = buildLearnerProfile({ learningSignals, quizAttempts, recallSpeedMs, journal, writingMistakes });
    setLearnerProfile(profile);
  }, [learningSignals, quizAttempts, recallSpeedMs, journal, writingMistakes, setLearnerProfile]);

  useEffect(() => {
    const patches = buildAdaptiveUiPatches({ learnerProfile, adaptiveUiPatches, prefs, learningSignals });
    patches.forEach(upsertAdaptiveUiPatch);
  }, [adaptiveUiPatches, learnerProfile, learningSignals, prefs, upsertAdaptiveUiPatch]);

  return (
    <div className="app-shell relative pb-20">
      <ScrollToTop />
      <Suspense fallback={<RouteLoading />}>
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
          <Route path="/promotion-exam/:id" element={<PromotionExam />} />
          <Route path="/exam-history"   element={<ExamHistory />} />
          <Route path="/intermediate"   element={<Intermediate />} />
          <Route path="/dialogues"      element={<Dialogues />} />
          <Route path="/dialogue/:id"   element={<DialogueLesson />} />
          <Route path="/dialogue-quiz/:id" element={<DialogueQuiz />} />
          <Route path="/dialogue-roleplay/:id" element={<DialogueRoleplay />} />
          <Route path="/intermediate-readings" element={<IntermediateReadings />} />
          <Route path="/intermediate-reading/:id" element={<IntermediateReading />} />
          <Route path="/advanced"       element={<Advanced />} />
          <Route path="/advanced/article/:id" element={<AdvancedArticle />} />
          <Route path="/toolbelt"       element={<Toolbelt />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <BottomBar />
    </div>
  );
}
