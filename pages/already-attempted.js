export default function AlreadyAttempted() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>You Have Already Attempted the Test</h1>
        <p style={styles.subtitle}>
          Your test response is already recorded.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f7ff",
  },
  card: {
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
    textAlign: "center",
    width: "90%",
    maxWidth: "450px",
  },
  title: {
    marginBottom: "10px",
    fontSize: "22px",
    fontWeight: "700",
  },
  subtitle: {
    marginBottom: "20px",
    fontSize: "16px",
    color: "#555",
  },
  button: {
    padding: "12px 20px",
    background: "#3b5bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
  },
};
