import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Question = {
  id: number;
  type: string;
  question: string;
  code_snippet?: string;
  options?: string[];
  expected_answer?: string;
};

type GenerateQuestionsResponse = {
  questions: Question[];
};

function InterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { role, difficulty, questionCount } = location.state || {};

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
  const savedAnswers = sessionStorage.getItem("interviewAnswers");
  return savedAnswers ? JSON.parse(savedAnswers) : {};
});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const roleLabel = useMemo(() => {
    if (!role) return "Not selected";

    const roleMap: Record<string, string> = {
      frontend: "Frontend Developer",
      backend: "Backend Developer",
      fullstack: "Full Stack Developer",
      python: "Python Developer",
      mobile: "Mobile Developer",
      devops: "DevOps Engineer",
    };

    return roleMap[role] || role;
  }, [role]);

 useEffect(() => {
  if (!role || !difficulty || !questionCount) {
    navigate("/");
    return;
  }

  const savedQuestions = sessionStorage.getItem("interviewQuestions");

  if (savedQuestions) {
    setQuestions(JSON.parse(savedQuestions));
    setLoading(false);
    return;
  }

  const fetchQuestions = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          difficulty,
          count: questionCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Sorular alınamadı.");
      }

      const data: GenerateQuestionsResponse = await response.json();
      const generatedQuestions = data.questions || [];

      setQuestions(generatedQuestions);
      sessionStorage.setItem(
        "interviewQuestions",
        JSON.stringify(generatedQuestions)
      );
    } catch (err) {
      console.error(err);
      setError("Sorular yüklenirken bir hata oluştu. Backend'i kontrol et.");
    } finally {
      setLoading(false);
    }
  };

  fetchQuestions();
}, [role, difficulty, questionCount, navigate]);

useEffect(() => {
  sessionStorage.setItem("interviewAnswers", JSON.stringify(answers));
}, [answers]);

  const handleAnswerChange = (value: string) => {
  if (!currentQuestion) return;

  setAnswers((prev) => ({
    ...prev,
    [currentQuestionIndex]: value,
  }));
};

  const handleNext = () => {
    if (!currentQuestion) return;

    const currentAnswer = answers[currentQuestionIndex]?.trim();

    if (!currentAnswer) {
      alert("Lütfen bu soruya bir cevap gir.");
      return;
    }

    if (isLastQuestion) {
      navigate("/result", {
        state: {
          role,
          difficulty,
          questionCount,
          questions,
          answers,
        },
      });
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const progressPercent =
    questions.length > 0
      ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100)
      : 0;

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlowTop} />
      <div style={styles.backgroundGlowBottom} />

    

      <div style={styles.wrapper}>
        <div style={styles.sidebarCard}>
          <div style={styles.badge}>Mülakat Soruları</div>

          <h1 style={styles.title}>Devam eden mülakat...</h1>

          <p style={styles.subtitle}>
            Soruları tek tek çöz. Her cevap bir sonraki adıma geçmeni sağlayacak.
            Tüm sorular bitince sonuç ekranına yönlendirileceksin.
          </p>

          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Rol</span>
              <span style={styles.statValue}>{roleLabel}</span>
            </div>

            <div style={styles.statBox}>
              <span style={styles.statLabel}>Zorluk</span>
              <span style={styles.statValue}>
                {difficulty ? String(difficulty).toUpperCase() : "—"}
              </span>
            </div>

            <div style={styles.statBox}>
              <span style={styles.statLabel}>Soru</span>
              <span style={styles.statValue}>
                {questions.length > 0 ? currentQuestionIndex + 1 : 0}/{questionCount}
              </span>
            </div>
          </div>

          <div style={styles.progressCard}>
            <div style={styles.progressHeader}>
              <span style={styles.progressLabel}>Progress</span>
              <span style={styles.progressValue}>{progressPercent}%</span>
            </div>

            <div style={styles.progressBarTrack}>
              <div
                style={{
                  ...styles.progressBarFill,
                  width: `${progressPercent}%`,
                }}
              />
            </div>
          </div>

          <button
  onClick={() => navigate("/")}
  style={styles.secondaryButton}
>
  Geri
</button>
        </div>

        <div style={styles.mainCard}>
          {loading && (
            <div style={styles.loadingBox}>
              <div style={styles.loader} />
              <p style={styles.loadingTitle}>Sorular hazırlanıyor</p>
              <p style={styles.loadingText}>
                AI senin için uygun interview sorularını oluşturuyor...
              </p>
            </div>
          )}

          {!loading && error && (
            <div style={styles.errorBox}>
              <p style={styles.errorTitle}>Bir hata oluştu</p>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          {!loading && !error && !currentQuestion && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p style={styles.emptyTitle}>Soru bulunamadı</p>
              <p style={styles.emptyText}>
                Backend boş veri döndürmüş olabilir. Ayarları kontrol edip tekrar dene.
              </p>
            </div>
          )}

          {!loading && !error && currentQuestion && (
            <div style={styles.questionContent}>
              <div style={styles.questionHeader}>
                <div>
                  <p style={styles.questionLabel}>Current Question</p>
                  <h2 style={styles.questionTitle}>
                    Soru {currentQuestionIndex + 1}
                  </h2>
                </div>

                <div style={styles.typePill}>
                  {currentQuestion.type
                    ? currentQuestion.type.toUpperCase()
                    : "QUESTION"}
                </div>
              </div>

              <div style={styles.questionSection}>
                <p style={styles.sectionLabel}>Soru</p>
                <p style={styles.questionText}>{currentQuestion.question}</p>
              </div>

              {currentQuestion.code_snippet && (
                <div style={styles.questionSection}>
                  <p style={styles.sectionLabel}>Code Snippet</p>
                  <pre style={styles.codeBox}>
                    <code>{currentQuestion.code_snippet}</code>
                  </pre>
                </div>
              )}

              {currentQuestion.options && currentQuestion.options.length > 0 && (
                <div style={styles.questionSection}>
                  <p style={styles.sectionLabel}>Seçenekler</p>

                  <div style={styles.optionsList}>
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} style={styles.optionCard}>
                        <div style={styles.optionBadge}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div style={styles.optionText}>{option}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.answerSection}>
                <p style={styles.sectionLabel}>Cevabın</p>

                <textarea
                  value={answers[currentQuestionIndex] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Cevabını buraya yaz..."
                  rows={8}
                  style={styles.answerTextarea}
                />
              </div>

              <div style={styles.footerRow}>
                <div style={styles.questionCounter}>
                  {currentQuestionIndex + 1} / {questions.length}
                </div>

                <button onClick={handleNext} style={styles.mainButton}>
                  {isLastQuestion ? "Finish Interview" : "Next Question"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #eef2ff 0%, #f8fafc 35%, #ecfeff 100%)",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "32px 20px",
  },
  backgroundGlowTop: {
    position: "absolute",
    top: "-120px",
    left: "-80px",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "rgba(59, 130, 246, 0.16)",
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  backgroundGlowBottom: {
    position: "absolute",
    bottom: "-120px",
    right: "-80px",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "rgba(16, 185, 129, 0.14)",
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  wrapper: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1220px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: "24px",
  },
  sidebarCard: {
    background: "rgba(255,255,255,0.84)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.7)",
    borderRadius: "28px",
    padding: "28px",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.10)",
    height: "fit-content",
  },
  mainCard: {
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.75)",
    borderRadius: "28px",
    padding: "28px",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.10)",
    minHeight: "680px",
    display: "flex",
    flexDirection: "column",
  },
  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #dbeafe, #e0f2fe)",
    color: "#1d4ed8",
    fontWeight: 700,
    fontSize: "13px",
    marginBottom: "18px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    lineHeight: 1.15,
    color: "#0f172a",
    letterSpacing: "-0.8px",
  },
  subtitle: {
    marginTop: "14px",
    marginBottom: "22px",
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#475569",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
    marginBottom: "22px",
  },
  statBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
  },
  statValue: {
    fontSize: "18px",
    color: "#0f172a",
    fontWeight: 700,
  },
  progressCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "16px",
    marginBottom: "18px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  progressLabel: {
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
  },
  progressValue: {
    fontSize: "13px",
    color: "#1d4ed8",
    fontWeight: 800,
  },
  progressBarTrack: {
    width: "100%",
    height: "10px",
    borderRadius: "999px",
    background: "#dbeafe",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #2563eb, #06b6d4)",
  },
  secondaryButton: {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: "16px",
    padding: "14px 18px",
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
  },
  loadingBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "14px",
  },
  loader: {
    width: "56px",
    height: "56px",
    borderRadius: "999px",
    border: "5px solid #dbeafe",
    borderTop: "5px solid #2563eb",
  },
  loadingTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 800,
    color: "#0f172a",
  },
  loadingText: {
    margin: 0,
    color: "#64748b",
    fontSize: "15px",
  },
  errorBox: {
    flex: 1,
    borderRadius: "24px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    padding: "28px",
  },
  errorTitle: {
    margin: 0,
    marginBottom: "10px",
    color: "#991b1b",
    fontSize: "24px",
    fontWeight: 800,
  },
  errorText: {
    margin: 0,
    color: "#b91c1c",
    lineHeight: 1.7,
  },
  emptyState: {
    flex: 1,
    border: "2px dashed #cbd5e1",
    borderRadius: "22px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "32px",
    textAlign: "center",
    background: "#f8fafc",
  },
  emptyIcon: {
    fontSize: "42px",
    marginBottom: "14px",
  },
  emptyTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#0f172a",
    fontWeight: 800,
  },
  emptyText: {
    marginTop: "10px",
    marginBottom: 0,
    color: "#64748b",
    maxWidth: "460px",
    lineHeight: 1.7,
  },
  questionContent: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    height: "100%",
  },
  questionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
  },
  questionLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  questionTitle: {
    margin: 0,
    marginTop: "8px",
    fontSize: "30px",
    color: "#0f172a",
  },
  typePill: {
    padding: "10px 14px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 800,
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  questionSection: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "18px",
  },
  sectionLabel: {
    margin: 0,
    marginBottom: "10px",
    fontSize: "12px",
    fontWeight: 800,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  questionText: {
    margin: 0,
    fontSize: "19px",
    lineHeight: 1.8,
    color: "#0f172a",
    fontWeight: 500,
  },
  codeBox: {
    margin: 0,
    background: "#0f172a",
    color: "#e2e8f0",
    padding: "16px",
    borderRadius: "14px",
    overflowX: "auto",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  optionCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px",
    borderRadius: "14px",
    background: "#ffffff",
    border: "1px solid #dbe4f0",
  },
  optionBadge: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    flexShrink: 0,
  },
  optionText: {
    color: "#0f172a",
    fontWeight: 500,
  },
  answerSection: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "18px",
  },
  answerTextarea: {
    width: "100%",
    borderRadius: "16px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    padding: "16px",
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#0f172a",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    minHeight: "180px",
  },
  footerRow: {
    marginTop: "auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },
  questionCounter: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 800,
    fontSize: "14px",
  },
  mainButton: {
    border: "none",
    borderRadius: "16px",
    padding: "15px 24px",
    fontSize: "15px",
    fontWeight: 800,
    color: "#ffffff",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.28)",
  },
  backButton: {
  position: "relative",
  zIndex: 2,
  border: "1px solid #cbd5e1",
  borderRadius: "12px",
  padding: "10px 16px",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 700,
  fontSize: "14px",
  cursor: "pointer",
  marginBottom: "20px",
},
};

export default InterviewPage;