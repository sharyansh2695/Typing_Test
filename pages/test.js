import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import { ConvexReactClient } from "convex/react";
import { api } from "../convex/_generated/api";

import NavHeader from "../components/NavHeader";
import TypingCard from "../components/TypingCard";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default function TestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [studentId, setStudentId] = useState(null);

  // Prevent double validation (Next.js strict mode)
  const validatedRef = useRef(false);

  /* --------------------------------------------------
     BLOCK BACK BUTTON
  ---------------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    history.pushState(null, "", location.href);
    window.onpopstate = () => history.pushState(null, "", location.href);
  }, []);

  /* --------------------------------------------------
     SESSION VALIDATION (RUN ONCE)
  ---------------------------------------------------- */
  useEffect(() => {
    if (validatedRef.current) return;
    validatedRef.current = true;

    let mounted = true;

    async function validate() {
      console.log("🔍 VALIDATING SESSION...");

      /** 1️⃣ Get session cookie */
      const res = await fetch("/api/get-session", { credentials: "include" });
      const { token } = await res.json();

      if (!token) {
        router.replace("/login");
        return;
      }

      /** 2️⃣ Validate session */
      let session;
      try {
        session = await convex.query(api.sessions.validateSession, { token });
      } catch {
        router.replace("/login");
        return;
      }

      /** ❌ Invalid → logout */
      if (!session?.valid) {
        console.log("❌ INVALID SESSION");
        await fetch("/api/logout", { method: "POST" });
        router.replace("/login");
        return;
      }

      /** 3️⃣ Save student ID */
      const sid = session.studentId;
      setStudentId(sid);

      /** 4️⃣ Sync globals for TypingCard */
      window.__studentId = sid;
      window.__sessionActive = session.testActive;

      /** 5️⃣ Verify student exists */
      const exists = await convex.query(api.student.checkExists, {
        studentId: sid,
      });

      if (!exists) {
        console.log("❌ Student not found");
        router.replace("/login");
        return;
      }

      /** 6️⃣ Load paragraph */
      const paragraph = await convex.query(api.paragraphs.getParagraph);
      if (!paragraph?._id) {
        alert("No test available.");
        return;
      }

      /** 7️⃣ Prevent retake */
      const attempted = await convex.query(api.results.hasAttempted, {
        studentId: sid,
        paragraphId: paragraph._id,
      });

      if (attempted) {
        console.log("⛔ Already attempted → logout");
        await fetch("/api/logout", { method: "POST" });
        router.replace("/already-attempted");
        return;
      }

      /** 8️⃣ All checks passed → allow test */
      if (mounted) {
        console.log("✅ Access granted");
        setLoading(false);
      }
    }

    validate();
    return () => (mounted = false);
  }, []);

  /* --------------------------------------------------
     LOADING UI
  ---------------------------------------------------- */
  if (loading) return <div>Validating session…</div>;

  /* --------------------------------------------------
     MAIN UI
  ---------------------------------------------------- */
  return (
    <PageWrapper>
      <NavHeader currentSpeed={currentSpeed} />
      <MainContent>
        <Heading>Typing Test Portal</Heading>

        <TypingCard
          homepageCallback={setCurrentSpeed}
          studentId={studentId}
        />
      </MainContent>
    </PageWrapper>
  );
}

/* ---------------- STYLES ---------------- */

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #fafafa;
`;

const MainContent = styled.div`
  max-width: 900px;
  margin: auto;
  padding: 20px;
`;

const Heading = styled.h1`
  font-size: 32px;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 700;
`;
