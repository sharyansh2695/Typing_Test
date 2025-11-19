import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/router";
import styled from "styled-components";

export default function LoginPage() {
  const router = useRouter();
  const verifyStudent = useMutation(api.student.verifyStudent);

  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [message, setMessage] = useState("");

  // If already logged in, go to test directly
  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    if (studentId) router.replace("/test");
  }, [router]);

  // Prevent back navigation on login page
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, "", window.location.href);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("🔍 Checking credentials...");

    try {
      const res = await verifyStudent({ name, rollNumber });

      if (res && res.success) {
        setMessage("✅ Login successful! Redirecting...");
        localStorage.setItem("studentId", res.studentId);
        localStorage.setItem("studentName", name);
        localStorage.setItem("rollNumber", rollNumber);

        // Replace to avoid back navigation to login
        setTimeout(() => {
          router.replace("/test");
        }, 1000);
      } else {
        setMessage("❌ Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error, please try again later.");
    }
  };

  return (
    <Container>
      <Card>
        <Logo>Typing Test Portal</Logo>
        <SubText>Login to begin your test</SubText>

        <Form onSubmit={handleSubmit} autoComplete="off">
          <Label htmlFor="name">Username</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            autoComplete="off"
          />

          <Label htmlFor="roll">Password</Label>
          <Input
            id="roll"
            name="roll"
            type="text"
            placeholder="Enter password"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            required
            autoComplete="off"
          />

          <Button type="submit">Login</Button>
        </Form>

        <Message isSuccess={message.includes("✅")}>{message}</Message>
      </Card>
      <Footer>Developed by CC • DTU</Footer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background:background: #ffffff;;
  font-family: "Inter", sans-serif;
  color: #fff;
  overflow: hidden;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 2rem 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  text-align: center;
  width: 92%;
  max-width: 420px;
`;

const Logo = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #222;                /* professional dark grey */
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
`;


const SubText = styled.p`
  color: #333;           /* darker grey */
  font-size: 0.95rem;
  margin-bottom: 1rem;
`;

const DebugHint = styled.p`
  color: #ffd166;
  font-size: 0.8rem;
  margin-bottom: 0.6rem;
`;

const Label = styled.label`
  display: block;
  text-align: left;
  width: 100%;
  margin: 6px 0 4px;

  /* UPDATED */
  color: #222;            /* strong dark grey */
  font-weight: 500;       /* slightly bolder */
  font-size: 0.9rem;
`;


const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
`;

const Input = styled.input`
  padding: 0.8rem 0.9rem;
  border-radius: 8px;

  /* UPDATED */
  background: #f3f3f3;     /* light grey */
  border: 1px solid #ccc;  /* soft grey border */
  color: #111;

  font-size: 1rem;
  outline: none;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.08);

  ::placeholder {
    color: #666;           /* darker placeholder */
  }

  &:focus {
    background: #e9e9e9;   /* slightly darker focus */
    border-color: #777;
    box-shadow: 0 0 0 3px rgba(84,160,255,0.12);
  }
`;



const Button = styled.button`
  margin-top: 0.6rem;
  background: linear-gradient(90deg, #54a0ff, #5f27cd);
  border: none;
  color: white;
  padding: 0.85rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  }
`;

const Message = styled.p`
  margin-top: 0.9rem;
  color: ${({ isSuccess }) => (isSuccess ? "#00b894" : "#ff7675")};
  font-weight: 600;
`;

const Footer = styled.footer`
  position: absolute;
  bottom: 15px;
  font-size: 0.85rem;
  color: #aaa;
`;
