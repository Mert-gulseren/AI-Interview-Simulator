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
type Review = {
  id: number;
  status: "correct" | "partial" | "wrong" | "empty";
  score: number;
  feedback: string;
  correct_answer: string;
  mistake: string;
};

type Evaluation = {
  overall_score: number;
  summary: string;
  reviews: Review[];
  study_guide: string[];
};

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { role, difficulty, questionCount, questions, answers } = location.state || {};

  const safeQuestions: Question[] = Array.isArray(questions) ? questions : [];
  const safeAnswers: Record<number, string> =
    answers && typeof answers === "object" ? answers : {};
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
    const [evaluationLoading, setEvaluationLoading] = useState(false);
    const [evaluationError, setEvaluationError] = useState("");

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

  const answeredCount = safeQuestions.filter(
  (_, index) => safeAnswers[index]?.trim()
).length;

  const completionRate =
    safeQuestions.length > 0
      ? Math.round((answeredCount / safeQuestions.length) * 100)
      : 0;

      useEffect(() => {
  if (!location.state || safeQuestions.length === 0) return;

  const evaluateAnswers = async () => {
    setEvaluationLoading(true);
    setEvaluationError("");

    try {
      const payload = {
        role,
        difficulty,
        answers: safeQuestions.map((question, index) => ({
  id: index + 1,
  type: question.type || "theory",
  question: question.question || "",
  code_snippet: question.code_snippet || "",
  options: question.options || [],
  expected_answer: question.expected_answer || "",
  user_answer: safeAnswers[index] || "",
})),
      };

      const response = await fetch("http://127.0.0.1:8000/evaluate-answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Cevaplar değerlendirilemedi.");
      }

      const data: Evaluation = await response.json();
      setEvaluation(data);
    } catch (err) {
      console.error(err);
      setEvaluationError("Cevaplar değerlendirilirken bir hata oluştu.");
    } finally {
      setEvaluationLoading(false);
    }
  };

  evaluateAnswers();
}, [location.state]);

  if (!location.state) {
    navigate("/");
    return null;
  }

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlowTop} />
      <div style={styles.backgroundGlowBottom} />

       

      <div style={styles.container}>
        <div style={styles.headerCard}>
          <div>
            <div style={styles.badge}>Mülakat Sonucu</div>
            <h1 style={styles.title}>Sonuçlar</h1>
            <p style={styles.subtitle}>
              Mülakat tamamlandı. Aşağıda verdiğin cevapları ve soru bazlı
              özetini görebilirsin.
            </p>
          </div>

          <div style={styles.headerButtonRow}>
            <button onClick={() => navigate("/")} style={styles.secondaryButton}>
              Yeni MÜlakat
            </button>
          </div>
        </div>

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
              {answeredCount}/{questionCount || safeQuestions.length}
            </span>
          </div>

          <div style={styles.statBox}>
            <span style={styles.statLabel}>Bİtirme Yüzdesi</span>
            <span style={styles.statValue}>{completionRate}%</span>
          </div>
        </div>

        {evaluationLoading && (
  <div style={styles.evaluationBox}>
    <p style={styles.evaluationTitle}>Cevapların değerlendiriliyor...</p>
    <p style={styles.evaluationText}>
      Yapay zekâ cevaplarını kontrol ediyor. Bu işlem biraz sürebilir.
    </p>
  </div>
)}

{evaluationError && (
  <div style={styles.evaluationBox}>
    <p style={styles.evaluationTitle}>Değerlendirme alınamadı</p>
    <p style={styles.evaluationText}>{evaluationError}</p>
  </div>
)}

{evaluation && (
  <div style={styles.evaluationBox}>
    <p style={styles.evaluationLabel}>Genel Değerlendirme</p>
    <h2 style={styles.evaluationScore}>{evaluation.overall_score}/100</h2>
    <p style={styles.evaluationText}>{evaluation.summary}</p>

    <div style={styles.studyGuideBox}>
      <p style={styles.contentLabel}>Çalışma Rehberi</p>

      {evaluation.study_guide.map((item, index) => (
        <p key={index} style={styles.studyGuideItem}>
          {index + 1}. {item}
        </p>
      ))}
    </div>
  </div>
)}

        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.sectionLabel}>Detaylı SOnuçlar</p>
            <h2 style={styles.sectionTitle}>Soru soru değerlendirme</h2>
          </div>
        </div>

        <div style={styles.questionList}>
          {safeQuestions.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p style={styles.emptyTitle}>Sonuç verisi bulunamadı</p>
              <p style={styles.emptyText}>
                Mülakat verisi bu sayfaya taşınmamış görünüyor. Baştan tekrar
                deneyebilirsin.
              </p>
            </div>
          )}

          {safeQuestions.map((question, index) => (
            <div key={question.id} style={styles.resultCard}>
              <div style={styles.resultHeader}>
                <div>
                  <p style={styles.resultLabel}>Soru {index + 1}</p>
                  <h3 style={styles.resultTitle}>
                    {question.type ? question.type.toUpperCase() : "QUESTION"}
                  </h3>
                </div>

                <div style={styles.questionIdBadge}>ID #{question.id}</div>
              </div>

              <div style={styles.contentBlock}>
                <p style={styles.contentLabel}>Soru</p>
                <p style={styles.questionText}>{question.question}</p>
              </div>

              {question.code_snippet && (
                <div style={styles.contentBlock}>
                  <p style={styles.contentLabel}>Code Snippet</p>
                  <pre style={styles.codeBox}>
                    <code>{question.code_snippet}</code>
                  </pre>
                </div>
              )}

              {question.options && question.options.length > 0 && (
                <div style={styles.contentBlock}>
                  <p style={styles.contentLabel}>Seçenekler</p>

                  <div style={styles.optionsList}>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} style={styles.optionCard}>
                        <div style={styles.optionBadge}>
                          {String.fromCharCode(65 + optionIndex)}
                        </div>
                        <div style={styles.optionText}>{option}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.answerBlock}>
                {evaluation?.reviews?.[index] && (
  <div style={styles.reviewBlock}>
    <p style={styles.contentLabel}>Değerlendirme</p>

    <div style={styles.reviewTopRow}>
      <span style={styles.reviewStatus}>
        {evaluation.reviews[index].status === "correct"
          ? "Doğru"
          : evaluation.reviews[index].status === "partial"
          ? "Eksik"
          : evaluation.reviews[index].status === "empty"
          ? "Boş"
          : "Yanlış"}
      </span>

      <span style={styles.reviewScore}>
        {evaluation.reviews[index].score}/100
      </span>
    </div>

    <p style={styles.reviewText}>
      <strong>Yorum:</strong> {evaluation.reviews[index].feedback}
    </p>

    <p style={styles.reviewText}>
      <strong>Doğru cevap:</strong> {evaluation.reviews[index].correct_answer}
    </p>

    <p style={styles.reviewText}>
      <strong>Hata/Eksik:</strong> {evaluation.reviews[index].mistake}
    </p>
  </div>
)}
                <p style={styles.contentLabel}>Your Answer</p>
                <div style={styles.answerContent}>
                  {safeAnswers[index]?.trim() ? (
  <p style={styles.answerText}>{safeAnswers[index]}</p>
) : (
  <p style={styles.emptyAnswerText}>Bu soru için cevap verilmedi.</p>
)}
                </div>
              </div>
            </div>
          ))}
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
  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1180px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  headerCard: {
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.75)",
    borderRadius: "28px",
    padding: "28px",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.10)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
  },
  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #dcfce7, #ecfeff)",
    color: "#15803d",
    fontWeight: 700,
    fontSize: "13px",
    marginBottom: "18px",
  },
  title: {
    margin: 0,
    fontSize: "40px",
    lineHeight: 1.1,
    color: "#0f172a",
    letterSpacing: "-1px",
  },
  subtitle: {
    marginTop: "16px",
    marginBottom: 0,
    fontSize: "16px",
    lineHeight: 1.7,
    color: "#475569",
    maxWidth: "760px",
  },
  headerButtonRow: {
    display: "flex",
    gap: "12px",
    flexShrink: 0,
  },
  secondaryButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "16px",
    padding: "14px 18px",
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
  },
  statBox: {
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.75)",
    borderRadius: "22px",
    padding: "18px",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
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
    fontSize: "22px",
    color: "#0f172a",
    fontWeight: 800,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },
  sectionLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  sectionTitle: {
    margin: 0,
    marginTop: "8px",
    fontSize: "30px",
    color: "#0f172a",
  },
  questionList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  resultCard: {
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.75)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
  },
  resultLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  resultTitle: {
    margin: 0,
    marginTop: "8px",
    fontSize: "22px",
    color: "#0f172a",
  },
  questionIdBadge: {
    padding: "10px 14px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 800,
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  contentBlock: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "18px",
  },
  contentLabel: {
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
    fontSize: "18px",
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
  answerBlock: {
    borderRadius: "18px",
    padding: "18px",
    background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
    border: "1px solid #dbeafe",
  },
  answerContent: {
    borderRadius: "14px",
    background: "#ffffff",
    border: "1px solid #dbe4f0",
    padding: "16px",
  },
  answerText: {
    margin: 0,
    color: "#0f172a",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
  },
  emptyAnswerText: {
    margin: 0,
    color: "#64748b",
    fontStyle: "italic",
  },
  emptyState: {
    border: "2px dashed #cbd5e1",
    borderRadius: "22px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "42px",
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
evaluationBox: {
  background: "rgba(255,255,255,0.9)",
  border: "1px solid rgba(255,255,255,0.75)",
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
},

evaluationLabel: {
  margin: 0,
  color: "#64748b",
  fontSize: "13px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
},

evaluationTitle: {
  margin: 0,
  color: "#0f172a",
  fontSize: "22px",
  fontWeight: 800,
},

evaluationScore: {
  margin: "8px 0",
  color: "#1d4ed8",
  fontSize: "42px",
  fontWeight: 900,
},

evaluationText: {
  margin: 0,
  color: "#475569",
  fontSize: "16px",
  lineHeight: 1.7,
},

studyGuideBox: {
  marginTop: "18px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  padding: "18px",
},

studyGuideItem: {
  margin: "8px 0 0",
  color: "#0f172a",
  lineHeight: 1.7,
  fontWeight: 500,
},

reviewBlock: {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  padding: "18px",
},

reviewTopRow: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginBottom: "12px",
},

reviewStatus: {
  display: "inline-block",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#dbeafe",
  color: "#1d4ed8",
  fontWeight: 800,
  fontSize: "13px",
},

reviewScore: {
  color: "#0f172a",
  fontWeight: 900,
  fontSize: "18px",
},

reviewText: {
  margin: "8px 0 0",
  color: "#0f172a",
  lineHeight: 1.7,
},
};

export default ResultPage;