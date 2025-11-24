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
      </Card>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e1e2f, #2b2b40);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  padding: 2rem 3rem;
  border-radius: 1rem;
  text-align: center;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
`;

const Title = styled.h2`
  color: #fff;
  margin-bottom: 1rem;
  font-size: 1.6rem;
`;

const Message = styled.p`
  color: #d6d6d6;
  font-size: 1rem;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  background: linear-gradient(90deg, #54a0ff, #5f27cd);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(84, 160, 255, 0.25);
  }
`;
