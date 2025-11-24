import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/router";
import styled from "styled-components";

export default function LoginPage() {
  const router = useRouter();

  // Correct Convex mutation
  const verifyStudent = useMutation(api.student.verifyStudent);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

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
      // IMPORTANT: send username + password (new backend structure)
      const result = await verifyStudent({ username, password });

      if (!result.success) {
        setMessage(result.message || "❌ Invalid credentials.");
        return;
      }

      // Save session
      localStorage.setItem("studentId", result.studentId);
      localStorage.setItem("studentName", username);

      setMessage("✅ Login successful! Redirecting...");

      setTimeout(() => {
        router.replace("/test");
      }, 600);
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error, try again.");
    }
  };

  return (
    <Container>
      <Card>
        <Logo>Typing Test Portal</Logo>
        <SubText>Login to begin your test</SubText>

        <Form onSubmit={handleSubmit} autoComplete="off">
          <Label>Username (Application Number)</Label>
          <Input
            type="text"
            placeholder="Enter your Application Number"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />

          <Label>Password</Label>
          <Input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit">Login</Button>
        </Form>

        <Message isSuccess={message.includes("✅")}>{message}</Message>
      </Card>

      <Footer>Developed by CC • DTU</Footer>
    </Container>
  );
}

/* Styled components remain unchanged below */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: #ffffff;
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
  color: #222;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
`;

const SubText = styled.p`
  color: #333;
  font-size: 0.95rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  text-align: left;
  width: 100%;
  margin: 6px 0 4px;
  color: #222;
  font-weight: 500;
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
  background: #f3f3f3;
  border: 1px solid #ccc;
  color: #111;
  font-size: 1rem;
  outline: none;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.08);

  ::placeholder {
    color: #666;
  }

  &:focus {
    background: #e9e9e9;
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
