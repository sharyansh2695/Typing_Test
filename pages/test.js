import { useState, useEffect } from "react";
import styled from "styled-components";
import NavHeader from "../components/NavHeader";
import TypingCard from "../components/TypingCard";

import { useRouter } from "next/router";
import { ConvexReactClient } from "convex/react";
import { api } from "../convex/_generated/api";

// Convex client
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default function TestPage() {
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function validate() {
      const studentId = localStorage.getItem("studentId");

      // No login → redirect
      if (!studentId) {
        router.replace("/login");
        return;
      }

      try {
        // 🚀 Run first two queries in parallel (super fast)
        const [exists, paragraph] = await Promise.all([
          convex.query(api.student.checkExists, { studentId }),
          convex.query(api.paragraphs.getParagraph)
        ]);

        if (!exists) {
          localStorage.clear();
          router.replace("/login");
          return;
        }

        if (!paragraph?._id) {
          alert("No test available. Contact admin.");
          return;
        }

        // Now check attempt (depends on paragraphId)
        const attempted = await convex.query(api.results.hasAttempted, {
          studentId,
          paragraphId: paragraph._id
        });

        if (attempted) {
          router.replace("/already-attempted");
          return;
        }

      } catch (err) {
        console.error("Validation error:", err);
        router.replace("/login");
        return;
      }

      if (mounted) setLoading(false);
    }

    validate();
    return () => (mounted = false);
  }, [router]);

  const homepageCallback = (speed) => setCurrentSpeed(speed);

  if (loading) {
    return <LoadingScreen>Validating...</LoadingScreen>;
  }

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

/* ------------------------ STYLES ------------------------ */

const LoadingScreen = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.4rem;
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 100vh;
  width: 100vw;

  background: #ffffff;
  font-family: "Inter", sans-serif;
  color: #000;
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
  background: #ffffff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
`;

const Heading = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #222;
  margin: 0;
  text-align: center;
`;
