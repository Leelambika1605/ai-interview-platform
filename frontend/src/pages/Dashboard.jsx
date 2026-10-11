
function Dashboard() {
  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "Arial, sans-serif",
      color: "#1e293b",
    },
    header: {
      background: "#ffffff",
      padding: "20px 7%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #e2e8f0",
    },
    logo: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#4f46e5",
    },
    content: {
      padding: "40px 7%",
    },
    cardGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "20px",
      marginTop: "30px",
    },
    card: {
      background: "#ffffff",
      padding: "25px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
    },
    button: {
      background: "#4f46e5",
      color: "#ffffff",
      border: "none",
      padding: "12px 18px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "15px",
    },
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo}>AI Interview</div>
        <button
          style={styles.button}
          onClick={() => {
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </header>

      <main style={styles.content}>
        <h1>Welcome to Your Dashboard! 👋</h1>
        <p>
          Practice interviews, improve your skills, and prepare
          confidently for your dream job.
        </p>

        <div style={styles.cardGrid}>
          <div style={styles.card}>
            <h2>🎯 Mock Interview</h2>
            <p>Practice interview questions based on your chosen role.</p>
            <button
              style={styles.button}
              onClick={() => alert("Mock Interview feature is coming next!")}
            >
              Start Interview
            </button>
          </div>

          <div style={styles.card}>
            <h2>📊 My Progress</h2>
            <p>Review your interview performance and identify areas to improve.</p>
            <button
              style={styles.button}
              onClick={() => alert("Progress tracking is coming soon!")}
            >
              View Progress
            </button>
          </div>

          <div style={styles.card}>
            <h2>📚 Practice Questions</h2>
            <p>Prepare for technical, HR, and behavioral interviews.</p>
            <button
              style={styles.button}
              onClick={() => alert("Practice questions are coming next!")}
            >
              Explore Questions
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
