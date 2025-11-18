import { useState } from "react";
import styled from "styled-components";
import NavHeader from "../components/NavHeader";
import TypingCard from "../components/TypingCard";

export default function TestPage() {
  const [currentSpeed, setCurrentSpeed] = useState(0);

  const homepageCallback = (speed) => {
    setCurrentSpeed(speed);
  };

  return (
    <PageWrapper>
      <NavHeader currentSpeed={currentSpeed} />

      <MainContent>
        <Heading>Typing Test Portal</Heading>
        <TypingCard homepageCallback={homepageCallback} />
      </MainContent>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #1e1e2f, #2b2b40);
  font-family: "Inter", sans-serif;
  color: #fff;
  overflow-x: hidden;
  overflow-y: auto;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 95%;
  max-width: 1200px;
  margin-top: 2rem;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
`;

const Heading = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(90deg, #ff6b6b, #feca57, #54a0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  text-align: center;
`;

const Footer = styled.footer`
  margin-top: 2rem;
  font-size: 0.85rem;
  color: #aaa;
`;
