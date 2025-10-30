import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const verifyStudent = useMutation(api.student.verifyStudent);

  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Checking credentials...");

    try {
     const res = await verifyStudent({ name, rollNumber });
if (res.success) {
  setMessage("✅ Login successful! Redirecting...");
  localStorage.setItem("studentId", res.studentId); // ✅ Store Convex ID
  localStorage.setItem("studentName", name);
  localStorage.setItem("rollNumber", rollNumber);
  setTimeout(() => router.push("/"), 1000);
} else {
  setMessage("❌ " + res.message);
}
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to server");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <h1>Typing Test Login</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", width: 300 }}
      >
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ marginBottom: 10, padding: 8 }}
        />
        <input
          type="text"
          placeholder="Enter roll number"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          required
          style={{ marginBottom: 10, padding: 8 }}
        />
        <button type="submit" style={{ padding: 8 }}>
          Login
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
}
