import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import Preview from "./Preview";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/router";

export default function TypingCard({ homepageCallback }) {
  const router = useRouter();

  // Convex queries/mutations
  const paragraph = useQuery(api.paragraphs.getRandomParagraph);
  const timeSetting = useQuery(api.timeSettings.getTimeSetting);
  const saveResult = useMutation(api.results.saveResult);

  // Visible state
  const [text, setText] = useState("");
  const [countDown, setCountDown] = useState(null);
  const [typingEnabled, setTypingEnabled] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [errorIndex, setErrorIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Refs (latest values / no re-render)
  const paragraphIdRef = useRef(null);
  const userInputRef = useRef("");
  const secRef = useRef(0);
  const backspaceCountRef = useRef(0); // ⭐ MISTAKES
  const intervalRef = useRef(null);
  const submittedRef = useRef(false);
  const textareaRef = useRef(null);

  // Controlled textarea
  const [userInputState, setUserInputState] = useState("");

  // Redirect to login 
  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) router.replace("/login");
  }, [router]);

  // Reset when new paragraph loads 
  useEffect(() => {
    if (!paragraph || !timeSetting) return;
    const pid = paragraph?._id;
    if (!pid) return;

    if (paragraphIdRef.current !== pid) {
      paragraphIdRef.current = pid;
      setText(paragraph.content || "");
      userInputRef.current = "";
      setUserInputState("");
      secRef.current = 0;
      backspaceCountRef.current = 0;
      setCountDown(timeSetting.duration || 60);
      setTypingEnabled(false);
      setStarted(false);
      setFinished(false);
      submittedRef.current = false;
      setErrorIndex(null);
      setErrorMessage("");
    }
  }, [paragraph, timeSetting]);

  // Save result 
  const handleSaveResultToDB = useCallback(
    async ({ input, seconds }) => {
      const studentId = localStorage.getItem("studentId") || "unknown";

      let correctChars = 0;
      for (let i = 0; i < input.length; i++) {
        if (input[i] === text[i]) correctChars++;
      }

      const duration = timeSetting?.duration || 60;
      const secondsTaken = seconds === 0 ? duration : seconds;

      // ⭐ Accuracy based on mistakes
      const totalTyped = input.length + backspaceCountRef.current;
      const mistakes = backspaceCountRef.current;

      const accuracy =
        totalTyped === 0 ? 0 :
        Math.round(((totalTyped - mistakes) / totalTyped) * 100);

      const wpm = Math.round((correctChars * 60) / (5 * secondsTaken));

      const payload = {
        studentId,
        paragraphId: paragraphIdRef.current,
        symbols: correctChars,
        seconds: secondsTaken,
        accuracy,
        wpm,
        text: input,
      };

      const res = await saveResult(payload);
      return res;
    },
    [saveResult, text, timeSetting]
  );

  // Auto submit 
  const doAutoSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    if (intervalRef.current) clearInterval(intervalRef.current);

    setFinished(true);
    setTypingEnabled(false);

    await handleSaveResultToDB({
      input: userInputRef.current,
      seconds: secRef.current,
    });

    setTimeout(() => {
      router.replace("/test-submitted");
    }, 120);
  }, [handleSaveResultToDB, router]);

  /* Start timer */
  const startTimer = useCallback(() => {
    if (started) return;

    const duration = timeSetting?.duration || 60;
    setCountDown(duration);
    secRef.current = 0;
    backspaceCountRef.current = 0;

    setStarted(true);
    setTypingEnabled(true);
    setFinished(false);
    submittedRef.current = false;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      secRef.current++;
      setCountDown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          doAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [started, timeSetting, doAutoSubmit]);

  // Cleanup timer 
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  //Typing Logic 
  const onUserInputChange = (e) => {
    const value = e.target.value;

    if (!typingEnabled || finished) return;
    if (value.length > text.length) return;

    // Lock— user must correct mistake with backspace
    if (errorIndex !== null) {
      // Only allow backspace
      if (value.length < userInputRef.current.length) {
        backspaceCountRef.current++;

        userInputRef.current = value;
        setUserInputState(value);

        if (text.startsWith(value)) {
          setErrorIndex(null);
          setErrorMessage("");
        }
      } else {
        // block all typing except backspace
        return;
      }

      return;
    }

    // Normal typing mode
    const idx = value.length - 1;
    const typedChar = value[idx];
    const expected = text[idx];

    if (typedChar && typedChar !== expected) {
      setErrorIndex(idx);
      //setErrorMessage("Incorrect character — press backspace to correct.");
      userInputRef.current = value;
      setUserInputState(value);
      return;
    }

    userInputRef.current = value;
    setUserInputState(value);
    setErrorIndex(null);
    setErrorMessage("");
  };

  //Start test 
  const onStartClick = () => {
    setTimeout(() => textareaRef.current?.focus(), 50);
    startTimer();
  };

  if (!paragraph || !timeSetting) return <Loader>Loading test...</Loader>;
  if (countDown === null) return <Loader>Preparing test...</Loader>;

  return (
    <OuterWrapper>
      <TypingCardContainer>
        <Header>
          <Title>Typing Test</Title>
          <Timer urgent={countDown <= 10}>{countDown}s</Timer>
        </Header>

        <TypingPanel>
          <Preview text={text} userInput={userInputState} errorIndex={errorIndex} />

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
