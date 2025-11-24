// --- Same imports ---
import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import Preview from "./Preview";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/router";

// --- Same styled components (UNCHANGED) ---
const Loader = styled.div`
  text-align: center;
  padding: 1.5rem;
  font-size: 1.2rem;
  color: #444;
`;

const OuterWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 85vh;
  width: 100%;
`;

const TypingCardContainer = styled.div`
  background: #f8faff;
  border-radius: 12px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  width: 90%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
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
  background: #e7f0ff;
  border: 1px solid #a4c7f3;
  border-radius: 12px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  border-radius: 10px;
  border: 1px solid #b0cef5;
  padding: 12px;
  font-size: 1rem;
  background: #ffffff;
  color: #111;
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

// --- COMPONENT START ---
export default function TypingCard() {
  const router = useRouter();

  const [studentId, setStudentId] = useState(undefined);
  const [text, setText] = useState("");
  const [countDown, setCountDown] = useState(null);
  const [typingEnabled, setTypingEnabled] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [errorIndex, setErrorIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [userInputState, setUserInputState] = useState("");
  const [attemptCheckDone, setAttemptCheckDone] = useState(false);

  const paragraphIdRef = useRef(null);
  const userInputRef = useRef("");
  const secRef = useRef(0);
  const backspaceCountRef = useRef(0);
  const completionTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const submittedRef = useRef(false);
  const textareaRef = useRef(null);

  // Load studentId safely
  useEffect(() => {
    const id =
      typeof window !== "undefined"
        ? localStorage.getItem("studentId")
        : null;
    setStudentId(id || null);
  }, []);

  // Convex queries
  const paragraph = useQuery(api.paragraphs.getParagraph);
  const timeSetting = useQuery(api.timeSettings.getTimeSetting);

  const hasAttempted = useQuery(
    api.results.hasAttempted,
    studentId && paragraph?._id
      ? {
          studentId,
          paragraphId: paragraph._id,
        }
      : "skip"
  );

  useEffect(() => {
    if (hasAttempted !== undefined) {
      setAttemptCheckDone(true);
    }
  }, [hasAttempted]);

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
    return () =>
      intervalRef.current && clearInterval(intervalRef.current);
  }, []);

  const saveResult = useMutation(api.results.saveResult);

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

    try {
      // 🌟 Catch backend attempt-blocking errors gracefully
      const res = await saveResult({
        studentId,
        paragraphId: paragraphIdRef.current,
        symbols: correctChars,
        seconds: secondsTaken,
        accuracy,
        wpm,
        text: input,
      });

      return res; // important!
    } catch (err) {
      console.warn("Save result error:", err?.message);
      return { success: false, message: err?.message };
    }
  },
  [saveResult, text, studentId]
);


  const doAutoSubmit = useCallback(async () => {
  if (submittedRef.current) return;
  submittedRef.current = true;

  // stop timer
  clearInterval(intervalRef.current);

  setFinished(true);
  setTypingEnabled(false);

  // Save result and capture response
  const res = await handleSaveResultToDB({
    input: userInputRef.current,
    seconds: secRef.current,
  });

  // Always redirect to test-submitted page
  // Don't clear session here — that causes immediate login redirect
  router.replace("/test-submitted");
}, [handleSaveResultToDB, router]);


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

  // Conditional safe rendering
  if (studentId === undefined) return <Loader>Loading...</Loader>;
  if (studentId === null) return <Loader>Invalid session. Please login again.</Loader>;

  if (!paragraph || !timeSetting)
    return <Loader>Loading test...</Loader>;

  if (!attemptCheckDone || hasAttempted === undefined)
    return <Loader>Checking attempt...</Loader>;

  if (countDown === null)
    return <Loader>Preparing test...</Loader>;

  // Typing logic
  const onUserInputChange = (e) => {
    const value = e.target.value;
    if (!typingEnabled || finished) return;
    if (value.length > text.length) return;

    if (errorIndex !== null) {
      if (value.length < userInputRef.current.length) {
        backspaceCountRef.current++;
        userInputRef.current = value;
        setUserInputState(value);

        if (text.startsWith(value)) {
          setErrorIndex(null);
          setErrorMessage("");
        }
      }
      return;
    }

    const idx = value.length - 1;
    const typedChar = value[idx];
    const expected = text[idx];

    if (typedChar && typedChar !== expected) {
      setErrorIndex(idx);
      userInputRef.current = value;
      setUserInputState(value);
      return;
    }

    userInputRef.current = value;
    setUserInputState(value);
    setErrorIndex(null);
    setErrorMessage("");

    if (value.length === text.length && completionTimeRef.current === null) {
      completionTimeRef.current = secRef.current;
    }
  };

  // UI RETURN (unchanged)
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
          />

          <TextArea
            ref={textareaRef}
            value={userInputState}
            onChange={onUserInputChange}
            placeholder="Start typing here..."
            readOnly={!typingEnabled || finished}
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />

          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </TypingPanel>

        {!typingEnabled && !finished && (
          <Centered>
            <StartButton
              onClick={() => {
                setTimeout(
                  () => textareaRef.current?.focus(),
                  50
                );
                startTimer();
              }}
            >
              Start Test
            </StartButton>
          </Centered>
        )}
      </TypingCardContainer>
    </OuterWrapper>
  );
}
