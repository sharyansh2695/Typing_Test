// --- Same imports ---
import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import Preview from "./Preview";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/router";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);


// --- Styled components unchanged ---
const Loader = styled.div`
  text-align: center;
  padding: 1.5rem;
  font-size: 1.2rem;
  color: #444;
`;

const OuterWrapper = styled.div`
  width: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
`;



const TypingCardContainer = styled.div`
  background: #f8faff;
  padding: 1.5rem 2rem;

  width: 98vw;          /* 🔥 Full screen width */
  max-width: 1800px;     /* large system panel */
  margin: 10px auto;

  border-radius: 12px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);

  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;







const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
`;

const Timer = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ urgent }) => (urgent ? "#ff4d4d" : "#007bff")};
  background: ${({ urgent }) =>
    urgent ? "rgba(255,77,77,0.15)" : "rgba(0,123,255,0.15)"};
  border: 3px solid
    ${({ urgent }) => (urgent ? "#ff4d4d" : "rgba(0,123,255,0.45)")};
`;

const TypingPanel = styled.div`
  width: 100%;
  background: #e7f0ff;
  border: 1px solid #a4c7f3;
  border-radius: 12px;
  padding: 1.2rem;

  display: flex;
  flex-direction: column;
  gap: 1rem;
`;




// const TextArea = styled.textarea`
//   width: 100%;
//   min-height: 120px;
//   border-radius: 10px;
//   border: 1px solid #b0cef5;
//   padding: 12px;
//   font-size: 1rem;
//   background: #ffffff;
//   color: #111;
//   resize: none;
// `;

// const TextArea = styled.textarea`
//   width: 100%;
//   min-height: 180px;              /* 🔥 larger height */
//   border-radius: 12px;
//   border: 2px solid #90b4f5;      /* stronger border */
//   padding: 18px;
//   font-size: 1.35rem;             /* 🔥 bigger text */
//   background: #ffffff;
//   color: #111;
//   resize: none;
//   line-height: 1.8;
//   letter-spacing: 0.5px;

//   /* Improve typing visibility */
//   outline: none;

//   &:focus {
//     border-color: #1d76ff;
//     box-shadow: 0 0 4px rgba(0, 123, 255, 0.6);
//   }
// `;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 140px;

  padding: 14px;
  font-size: 1.2rem;

  background: #fff;
  border-radius: 10px;
  border: 1px solid #b0cef5;
  resize: none;
`;





const ErrorMessage = styled.div`
  color: #d93025;
  font-size: 0.9rem;
  margin-top: 4px;
  font-weight: 500;
`;

const Centered = styled.div`
  display: flex;
  justify-content: center;
`;

const StartButton = styled.button`
  background: linear-gradient(90deg, #007bff, #0057d8);
  color: white;
  padding: 12px 26px;
  border-radius: 10px;
  cursor: pointer;
  border: none;
`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//               COMPONENT START
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function TypingCard({ studentId }) {
  const router = useRouter();

  const [text, setText] = useState("");
  const [countDown, setCountDown] = useState(null);
  const [typingEnabled, setTypingEnabled] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [errorIndex, setErrorIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [userInputState, setUserInputState] = useState("");
  const [cursorIndex, setCursorIndex] = useState(0);

  const [isActive, setIsActive] = useState(false);

  const paragraphIdRef = useRef(null);
  const userInputRef = useRef("");
  const secRef = useRef(0);
  const backspaceCountRef = useRef(0);
  const completionTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const submittedRef = useRef(false);
  const textareaRef = useRef(null);

  // Load sessionActive from TestPage
  useEffect(() => {
    console.log("🧪 TypingCard sees sessionActive =", window.__sessionActive);
    setIsActive(window.__sessionActive || false);
  }, []);

  const paragraph = useQuery(api.paragraphs.getParagraph);
  const timeSetting = useQuery(api.timeSettings.getTimeSetting);
  const saveResult = useMutation(api.results.saveResult);

  // Reset on paragraph change
  useEffect(() => {
    if (!paragraph || !timeSetting) return;

    const pid = paragraph._id;

    if (paragraphIdRef.current !== pid) {
      paragraphIdRef.current = pid;
      setText(paragraph.content || "");
      userInputRef.current = "";
      setUserInputState("");
      secRef.current = 0;
      backspaceCountRef.current = 0;
      completionTimeRef.current = null;
      setCountDown(timeSetting.duration || 60);

      setTypingEnabled(false);
      setStarted(false);
      setFinished(false);
      submittedRef.current = false;

      setErrorIndex(null);
      setErrorMessage("");
    }
  }, [paragraph, timeSetting]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleSaveResultToDB = useCallback(
    async ({ input, seconds }) => {
      let correctChars = 0;
      for (let i = 0; i < input.length; i++) {
        if (input[i] === text[i]) correctChars++;
      }

      const secondsTaken = completionTimeRef.current ?? seconds;
      const totalTyped = input.length + backspaceCountRef.current;
      const mistakes = backspaceCountRef.current;
      const accuracy =
        totalTyped === 0
          ? 0
          : Math.round(((totalTyped - mistakes) / totalTyped) * 100);
      const wpm = Math.round((correctChars * 60) / (5 * secondsTaken));

      await saveResult({
        studentId,
        paragraphId: paragraphIdRef.current,
        symbols: correctChars,
        seconds: secondsTaken,
        accuracy,
        wpm,
        text: input,
      });
    },
    [saveResult, studentId, text]
  );

  const doAutoSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    clearInterval(intervalRef.current);
    setFinished(true);
    setTypingEnabled(false);

    await handleSaveResultToDB({
      input: userInputRef.current,
      seconds: secRef.current,
    });

    await fetch("/api/logout", { method: "POST" });
    document.cookie = "session_token=; Max-Age=0; path=/; secure;";

    router.replace("/test-submitted");
  }, [handleSaveResultToDB, router]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔥 START TEST — MARK testActive=true (FIXED)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const handleStartTest = async () => {
    const tokenRes = await fetch("/api/get-session", {
      credentials: "include",
    });

    const { token } = await tokenRes.json();

    if (token) {
      await convex.mutation(api.sessions.updateTestActive, {
        token,
        active: true,
      });

      console.log("TypingCard set testActive → true");

      window.__sessionActive = true;
      setIsActive(true);
    }

    setTimeout(() => textareaRef.current?.focus(), 50);

    startTimer();
  };

  const startTimer = useCallback(() => {
    if (started) return;

    const duration = timeSetting?.duration || 60;
    setCountDown(duration);

    secRef.current = 0;
    completionTimeRef.current = null;

    setStarted(true);
    setTypingEnabled(true);
    submittedRef.current = false;

    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      secRef.current++;

      setCountDown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          doAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [started, timeSetting, doAutoSubmit]);

  if (!studentId) return <Loader>Loading...</Loader>;
  if (!paragraph || !timeSetting) return <Loader>Loading test...</Loader>;
  if (countDown === null) return <Loader>Preparing...</Loader>;

  const onUserInputChange = (e) => {
  if (!isActive) return;
  if (!typingEnabled || finished) return;

  const value = e.target.value;

  // 🔹 Always keep track of how many characters are typed
  setCursorIndex(value.length);

  if (value.length > text.length) return;

  // 🔹 If we are already in an error state
  if (errorIndex !== null) {
    // backspace case
    if (value.length < userInputRef.current.length) {
      backspaceCountRef.current++;
      userInputRef.current = value;
      setUserInputState(value);

      setCursorIndex(value.length); // keep preview scroll in sync

      if (text.startsWith(value)) {
        setErrorIndex(null);
        setErrorMessage("");
      }
    }
    return;
  }

  // 🔹 Check for new error
  const idx = value.length - 1;
  if (value[idx] !== text[idx] && value[idx] !== undefined) {
    setErrorIndex(idx);
    userInputRef.current = value;
    setUserInputState(value);

    setCursorIndex(value.length); // update on error as well

    return;
  }

  // 🔹 Normal correct typing path
  userInputRef.current = value;
  setUserInputState(value);
  setErrorIndex(null);
  setErrorMessage("");

  setCursorIndex(value.length); // update on correct typing too

  if (value.length === text.length && !completionTimeRef.current) {
    completionTimeRef.current = secRef.current;
  }
};


  return (
    <OuterWrapper>
      <TypingCardContainer>
        <Header>
          <Title>Typing Test</Title>
          <Timer urgent={countDown <= 10}>{countDown}s</Timer>
        </Header>

        <TypingPanel>
          <Preview
            text={text}
            userInput={userInputState}
            errorIndex={errorIndex}
            cursorIndex={cursorIndex}
          />

          <TextArea
            ref={textareaRef}
            value={userInputState}
            onChange={onUserInputChange}
            readOnly={!typingEnabled || finished || !isActive}
            placeholder={isActive ? "Start typing..." : "Press Start Test"}
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />

          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </TypingPanel>

        {!typingEnabled && !finished && (
          <Centered>
            <StartButton onClick={handleStartTest}>Start Test</StartButton>
          </Centered>
        )}
      </TypingCardContainer>
    </OuterWrapper>
  );
}