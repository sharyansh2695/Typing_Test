import styled from "styled-components";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function TestSubmitted() {
  const router = useRouter();

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) router.replace("/test");
  }, [router]);

  return (
    <Container>
      <Card>
        <Title>Test Submitted Successfully</Title>
        <Message>Your typing test result has been recorded.</Message>
      </Card>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;

  /* ⭐ CLEAN WHITE BACKGROUND */
  background: #ffffff;

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const Card = styled.div`
  background: #ffffff;
  border: 1px solid #ddd;
  padding: 2rem 3rem;
  border-radius: 1rem;
  text-align: center;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h2`
  color: #222;
  margin-bottom: 1rem;
  font-size: 1.6rem;
  font-weight: 700;
`;

const Message = styled.p`
  color: #555;
  font-size: 1rem;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  background: #007bff;
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: 0.2s;

  &:hover {
    background: #005fcc;
  }
`;
