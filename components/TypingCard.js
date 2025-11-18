import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import Preview from "./Preview";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/router";

export default function TypingCard({ homepageCallback }) {
  const router = useRouter();

  const paragraph = useQuery(api.paragraphs.getRandomParagraph);
  const timeSetting = useQuery(api.timeSettings.getTimeSetting);
  const saveResult = useMutation(api.results.saveResult);

  const [paragraphId, setParagraphId] = useState(null);

  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [symbols, setSymbols] = useState(0);
  const [sec, setSec] = useState(0);

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [typingEnabled, setTypingEnabled] = useState(false);
  const [countDown, setCountDown] = useState(null);

  const [locked, setLocked] = useState(false);
  const [errorIndex, setErrorIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const intervalRef = useRef(null);
  const textareaRef = useRef(null);

  /* Redirect to login */
  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) router.replace("/login");
  }, [router]);

  /* Load paragraph + timer before typing */
  useEffect(() => {
    if (!paragraph || !timeSetting) return;

    if (paragraph?._id && paragraphId !== paragraph._id) {
      setParagraphId(paragraph._id);
    }

    if (hasSubmitted) return;
    if (started || typingEnabled || finished) return;

    setText(paragraph.content || "");
    setUserInput("");
    setSymbols(0);
    setSec(0);
    setLocked(false);
    setErrorMessage("");
    setErrorIndex(null);
    setCountDown(timeSetting.duration || 60);
  }, [
    paragraph,
    timeSetting,
    paragraphId,
    started,
    typingEnabled,
    finished,
    hasSubmitted,
  ]);

  const handleSaveResult = async ({ input, seconds }) => {
    console.log("🔵 handleSaveResult CALLED");

    const studentId = localStorage.getItem("studentId");

    let correctChars = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === text[i]) correctChars++;
    }

    const duration = timeSetting?.duration || 60;
    const secondsTaken = seconds === 0 ? duration : seconds;

    const accuracy =
      input.length === 0
        ? 0
        : Math.round((correctChars / input.length) * 100);

    const wpm = Math.round((correctChars * 60) / (5 * secondsTaken));

    console.log("🟡 Sending to DB:", {
      studentId,
      paragraphId,
      symbols: correctChars,
      seconds: secondsTaken,
      accuracy,
      wpm,
      text: input,
    });

    const res = await saveResult({
      studentId,
      paragraphId,
      symbols: correctChars,
      seconds: secondsTaken,
      accuracy,
      wpm,
      text: input,
    });

    console.log("🟢 DB Save OK:", res);
  };

  /* Auto submit when time ends */
  const autoSubmit = async () => {
    console.log("🚀 autoSubmit TRIGGERED");

    if (finished) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    setFinished(true);
    setTypingEnabled(false);
    setLocked(true);
    setHasSubmitted(true);

    console.log("💾 Saving final result...");

    /* ✅ Pass real-time values to avoid 0 issues */
    await handleSaveResult({
      input: userInput,
      seconds: sec,
    });

    router.replace("/test-submitted");
  };

  /* Timer system */
  const startTimer = useCallback(() => {
    if (started) return;

    setStarted(true);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setSec((s) => s + 1);

      setCountDown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current);
          autoSubmit();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, [started, autoSubmit]);

  /* Start test */
  const onStartClick = () => {
    setTypingEnabled(true);
    setFinished(false);
    setLocked(false);

    setTimeout(() => textareaRef.current?.focus(), 50);
    startTimer();
  };

  /* Typing logic */
  const onUserInputChange = (e) => {
    let value = e.target.value;

    if (!typingEnabled || finished) return;
    if (value.length > text.length) return;

    if (locked) {
      if (value.length < userInput.length) {
        setUserInput(value);

        if (text.startsWith(value)) {
          setLocked(false);
          setErrorMessage("");
          setErrorIndex(null);
        }
      }
      return;
    }

    const index = value.length - 1;
    const expected = text[index];
    const typed = value[index];

    if (typed && typed !== expected) {
      setLocked(true);
      setErrorIndex(index);
      setUserInput(value);
      return;
    }

    setUserInput(value);
    setSymbols(value.replace(/ /g, "").length);
    setErrorMessage("");
    setErrorIndex(null);
  };

  if (!paragraph || !timeSetting) return <Loader>Loading test...</Loader>;
  if (countDown === null) return <Loader>Loading test...</Loader>;

  return (
    <OuterWrapper>
      <TypingCardContainer>
        <Header>
          <Title>Typing Test</Title>
          <Timer urgent={countDown <= 10}>{countDown}s</Timer>
        </Header>

        <TypingPanel>
          <Preview text={text} userInput={userInput} errorIndex={errorIndex} />

          <TextArea
            ref={textareaRef}
            value={userInput}
            onChange={onUserInputChange}
            placeholder="Start typing here..."
            readOnly={!typingEnabled || finished}
          />

          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </TypingPanel>

        {!typingEnabled && !finished && (
          <Centered>
            <StartButton onClick={onStartClick}>Start Test</StartButton>
          </Centered>
        )}
      </TypingCardContainer>
    </OuterWrapper>
  );
}


const ErrorMessage = styled.div`
  color: #d93025;
  font-size: 0.9rem;
  margin-top: 4px;
  font-weight: 500;
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
  margin: 0;
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
    ${({ urgent }) => (urgent ? "#ff4d4d" : "rgba(0,123,255,0.45)")}};

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
`;

const TypingPanel = styled.div`
  background: linear-gradient(180deg, #cfe2ff 0%, #e7f0ff 100%);
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
  outline: none;
`;

const Centered = styled.div`
  display: flex;
  justify-content: center;
`;

const StartButton = styled.button`
  background: linear-gradient(90deg, #007bff, #0057d8);
  color: white;
  border: none;
  padding: 12px 26px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
`;

const Loader = styled.div`
  text-align: center;
  padding: 1.5rem;
  color: #555;
`;
