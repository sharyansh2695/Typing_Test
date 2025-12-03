import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import Preview from "./Preview";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/router";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

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
  width: 98vw;
  max-width: 1800px;
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

  // Restore active test from sessionStorage
  useEffect(() => {
    const active = sessionStorage.getItem("testActive") === "true";
    setIsActive(active);
  }, []);

  const paragraph = useQuery(api.paragraphs.getParagraph);
  const timeSetting = useQuery(api.timeSettings.getTimeSetting);
  const saveResult = useMutation(api.results.saveResult);

  // Reset typing state when paragraph changes
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

  useEffect(() => () => clearInterval(intervalRef.current), []);

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
        studentId: studentId ?? sessionStorage.getItem("studentId"),
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

    sessionStorage.removeItem("testActive");
    sessionStorage.removeItem("studentId");

    await fetch("/api/logout", { method: "POST" });
    document.cookie = "session_token=; Max-Age=0; path=/; secure;";

    router.replace("/test-submitted");
  }, [handleSaveResultToDB, router]);

  const handleStartTest = async () => {
    const tokenRes = await fetch("/api/get-session", {
      credentials: "include",
    });
    const { token } = await tokenRes.json();

    if (token) {
      try {
        await convex.mutation(api.sessions.updateTestActive, {
          token,
          active: true,
        });
      } catch {}

      sessionStorage.setItem("testActive", "true");
      if (studentId) sessionStorage.setItem("studentId", studentId);

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

  if (!studentId && !sessionStorage.getItem("studentId"))
    return <Loader>Loading...</Loader>;
  if (!paragraph || !timeSetting) return <Loader>Loading test...</Loader>;
  if (countDown === null) return <Loader>Preparing...</Loader>;

  const onUserInputChange = (e) => {
    if (!isActive || !typingEnabled || finished) return;

    const value = e.target.value;

    setCursorIndex(value.length);

    if (value.length > text.length) return;

    if (errorIndex !== null) {
      if (value.length < userInputRef.current.length) {
        backspaceCountRef.current++;
        userInputRef.current = value;
        setUserInputState(value);
        setCursorIndex(value.length);

        if (text.startsWith(value)) {
          setErrorIndex(null);
          setErrorMessage("");
        }
      }
      return;
    }

    const idx = value.length - 1;
    if (value[idx] !== text[idx] && value[idx] !== undefined) {
      setErrorIndex(idx);
      userInputRef.current = value;
      setUserInputState(value);
      return;
    }

    userInputRef.current = value;
    setUserInputState(value);
    setErrorIndex(null);
    setCursorIndex(value.length);

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
            placeholder={
              isActive
                ? "Please click on Start Test Button to start the test.."
                : "Press Start Test"
            }
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
