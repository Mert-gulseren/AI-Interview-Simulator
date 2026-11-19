import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const roleItems = [
  { key: "frontend", label: "Frontend Developer" },
  { key: "backend", label: "Backend Developer" },
  { key: "fullstack", label: "Full Stack Developer" },
  { key: "python", label: "Python Developer" },
  { key: "mobile", label: "Mobile Developer" },
  { key: "devops", label: "DevOps Engineer" },
];

const difficultyItems = [
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
];

function SetupPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionCount, setQuestionCount] = useState(5);

  const selectedRoleLabel = useMemo(() => {
    const found = roleItems.find((item) => item.key === role);
    return found ? found.label : "Not selected";
  }, [role]);

  const selectedDifficultyLabel = useMemo(() => {
    const found = difficultyItems.find((item) => item.key === difficulty);
    return found ? found.label : "Not selected";
  }, [difficulty]);

  const handleStartInterview = () => {
    if (!role || !difficulty) {
      alert("Lütfen role ve difficulty seç.");
      return;
    }

    navigate("/interview", {
      state: {
        role,
        difficulty,
        questionCount,
      },
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlowTop} />
      <div style={styles.backgroundGlowBottom} />

      <div style={styles.container}>
        <div style={styles.heroCard}>
          <div style={styles.badge}>Yapay Zeka ile Mülakat</div>

          <h1 style={styles.title}>Mülakatını Seç</h1>

          <p style={styles.subtitle}>
            Rolünü, zorluk seviyeni ve soru sayısını seç. Sonrasında interview
            ekranına geçip yapay zekâ tarafından oluşturulan soruları tek tek
            çözmeye başlayacaksın.
          </p>

          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <span style={styles.statLabel}>Rol</span>
              <span style={styles.statValue}>{selectedRoleLabel}</span>
            </div>

            <div style={styles.statBox}>
              <span style={styles.statLabel}>Zorluk</span>
              <span style={styles.statValue}>{selectedDifficultyLabel}</span>
            </div>

            <div style={styles.statBox}>
              <span style={styles.statLabel}>Soru Sayısı</span>
              <span style={styles.statValue}>{questionCount}</span>
            </div>
          </div>

          <div style={styles.section}>
            <p style={styles.sectionTitle}>Rol Seç</p>

            <div style={styles.roleGrid}>
              {roleItems.map((item) => {
                const isActive = role === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => setRole(item.key)}
                    style={{
                      ...styles.roleCard,
                      ...(isActive ? styles.roleCardActive : {}),
                    }}
                  >

                    <div style={styles.roleTextGroup}>
                      <span
                        style={{
                          ...styles.roleTitle,
                          ...(isActive ? styles.roleTitleActive : {}),
                        }}
                      >
                        {item.label}
                      </span>

                      <span
                        style={{
                          ...styles.roleDescription,
                          ...(isActive ? styles.roleDescriptionActive : {}),
                        }}
                      >
                        {item.key} interview track
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={styles.section}>
            <p style={styles.sectionTitle}>Zorluk Seç</p>

            <div style={styles.difficultyRow}>
              {difficultyItems.map((item) => {
                const isActive = difficulty === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => setDifficulty(item.key)}
                    style={{
                      ...styles.difficultyButton,
                      ...(isActive ? styles.difficultyButtonActive : {}),
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={styles.section}>
            <p style={styles.sectionTitle}>Soru Sayısı</p>

            <div style={styles.counterBox}>
              <button
                onClick={() =>
                  setQuestionCount((prev) => Math.max(1, prev - 1))
                }
                style={styles.counterButton}
              >
                -
              </button>

              <span style={styles.counterValue}>{questionCount}</span>

              <button
                onClick={() =>
                  setQuestionCount((prev) => Math.min(10, prev + 1))
                }
                style={styles.counterButton}
              >
                +
              </button>
            </div>
          </div>

          <div style={styles.buttonRow}>
            <button onClick={handleStartInterview} style={styles.mainButton}>
              Mülakatı Başlat
            </button>
          </div>
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
    maxWidth: "1100px",
    margin: "0 auto",
  },
  heroCard: {
    background: "rgba(255,255,255,0.84)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.7)",
    borderRadius: "28px",
    padding: "32px",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.10)",
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
    fontSize: "44px",
    lineHeight: 1.1,
    color: "#0f172a",
    letterSpacing: "-1px",
  },
  subtitle: {
    marginTop: "16px",
    marginBottom: "24px",
    fontSize: "17px",
    lineHeight: 1.7,
    color: "#475569",
    maxWidth: "760px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
    marginBottom: "28px",
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
  section: {
    marginTop: "10px",
    marginBottom: "24px",
  },
  sectionTitle: {
    margin: 0,
    marginBottom: "14px",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "16px",
  },
  roleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
  },
  roleCard: {
    border: "1px solid #dbe4f0",
  background: "#ffffff",
  borderRadius: "16px",
  padding: "18px",
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
  textAlign: "left",
  },
  roleCardActive: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
    border: "1px solid #1e3a8a",
    boxShadow: "0 14px 30px rgba(30, 64, 175, 0.22)",
  },
  roleTextGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  roleTitle: {
    fontSize: "17px",
    fontWeight: 800,
    color: "#0f172a",
  },
  roleTitleActive: {
    color: "#ffffff",
  },
  roleDescription: {
    fontSize: "13px",
    color: "#64748b",
  },
  roleDescriptionActive: {
    color: "#cbd5e1",
  },
  difficultyRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  difficultyButton: {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    padding: "12px 18px",
    borderRadius: "14px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
  },
  difficultyButtonActive: {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    border: "1px solid #1d4ed8",
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.18)",
  },
  counterBox: {
    display: "inline-flex",
    alignItems: "center",
    gap: "18px",
    padding: "10px 14px",
    borderRadius: "18px",
    background: "#ffffff",
    border: "1px solid #dbe4f0",
  },
  counterButton: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    border: "none",
    background: "#e2e8f0",
    color: "#0f172a",
    fontSize: "24px",
    fontWeight: 700,
    cursor: "pointer",
  },
  counterValue: {
    minWidth: "28px",
    textAlign: "center",
    fontSize: "20px",
    fontWeight: 800,
    color: "#0f172a",
  },
  buttonRow: {
    marginTop: "8px",
    display: "flex",
    justifyContent: "flex-start",
  },
  mainButton: {
    border: "none",
    borderRadius: "16px",
    padding: "15px 26px",
    fontSize: "15px",
    fontWeight: 800,
    color: "#ffffff",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.28)",
  },
};

export default SetupPage;