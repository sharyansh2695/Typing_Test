import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Preview from "./Preview";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  headingColor,
  lightSecondaryColor1,
  primaryColor,
  secondaryColor,
} from "../constants/color";
import Speed from "./Speed";

function TypingCard({ homepageCallback }) {
  const paragraph = useQuery(api.paragraphs.getRandomParagraph);
  const addResult = useMutation(api.results.addResult);

  // Local state
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [symbols, setSymbols] = useState(0);
  const [sec, setSec] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [countDown, setCountDown] = useState(60);
  const [currentWPM, setCurrentWPM] = useState(0);
  const intervalRef = useRef(null);

  // 🧩 Load random paragraph
  useEffect(() => {
    if (paragraph === undefined) return; // still loading
    if (paragraph === null) {
      setText("");
    } else {
      setText(paragraph.content || "");
    }
  }, [paragraph]);

  // 🧩 Start timer when typing begins
  useEffect(() => {
    if (!started) return;

    intervalRef.current = setInterval(() => {
      setSec((s) => s + 1);
      setCountDown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current);
          setFinished(true);
          handleTestFinish();
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [started]);

  // 🧩 Restart everything
  const onRestart = () => {
    clearInterval(intervalRef.current);
    setText(paragraph?.content || "");
    setUserInput("");
    setSymbols(0);
    setSec(0);
    setStarted(false);
    setFinished(false);
    setCountDown(60);
    setCurrentWPM(0);
  };

  // 🧩 When user types
  const onUserInputChange = (e) => {
    const value = e.target.value;
    if (!started) setStarted(true);
    onFinished(value);
    setUserInput(value);
    setSymbols(countCorrectSymbols(value, text));

    // Live WPM calculation
    const elapsedMinutes = sec / 60;
    if (elapsedMinutes > 0) {
      const wpm = symbols / 5 / elapsedMinutes;
      setCurrentWPM(Math.round(wpm));
    }
  };

  // 🧩 Check finish condition
  const onFinished = (userInputVal) => {
    if (
      userInputVal === text ||
      userInputVal.length === text.length ||
      countDown === 0
    ) {
      clearInterval(intervalRef.current);
      setFinished(true);
      handleTestFinish();
    }
  };

  // 🧩 Count correct symbols ignoring spaces
  const countCorrectSymbols = (userInputVal, baseText) => {
    const t = (baseText || "").replace(/ /g, "");
    return userInputVal
      .replace(/ /g, "")
      .split("")
      .filter((data, i) => data === t[i]).length;
  };

  // 🧩 When timer ends or test finishes
  const handleTestFinish = async () => {
    const wpm = symbols / 5 / (sec / 60 || 1);
    const finalWpm = Math.round(wpm);

    homepageCallback(finalWpm);

    try {
      // replace rollNumber & name with actual student info
      await addResult({
        rollNumber: "23EC187",
        name: "Sharyansh Chhikara",
        highestSpeed: finalWpm,
      });
      console.log("✅ Result saved:", finalWpm);
    } catch (err) {
      console.error("❌ Failed to save result:", err);
    }
  };

  if (paragraph === undefined) return <p>Loading...</p>;
  if (paragraph === null) return <p>No paragraphs found in database.</p>;

  return (
    <CardContainer>
      <div className="inner">
        <CountDown isStated={started} countDown={countDown}>
          <h2>{countDown}s</h2>
        </CountDown>

        <Preview text={text} userInput={userInput} />

        <TextArea
          value={userInput}
          onChange={onUserInputChange}
          placeholder="Start typing....."
          readOnly={finished}
        />

        <Content>
          <Speed
            countDown={countDown}
            typingCardCallback={(speed) => homepageCallback(speed)}
            sec={sec}
            symbols={symbols}
            isFinished={finished}
          />

          <Button onClick={onRestart}> Restart </Button>
        </Content>
      </div>
    </CardContainer>
  );
}

export default TypingCard;

// ---------------- Styled Components ----------------
const CardContainer = styled.div`
  width: 100%;
  height: auto;
  border-radius: 1rem;
  background-color: #fff;
  overflow: hidden;
  box-shadow: 0 0 15px 2px hsl(258, 100%, 40%);

  @media (min-width: 986px) {
    width: 60vw;
  }

  .inner {
    padding: 30px;
    position: relative;
  }
`;

const CountDown = styled.div`
  height: 50px;
  width: 50px;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ isStated, countDown }) =>
    isStated && countDown !== 0 ? primaryColor : lightSecondaryColor1};
  color: ${headingColor};
  font-size: 0.8rem;
  position: absolute;
  right: 10px;
  top: 10px;
  transition: all 0.5s ease-in-out;
  transform: ${({ isStated, countDown }) =>
    isStated && countDown !== 0 ? "scale(1.1)" : "scale(1)"};

  h2 {
    opacity: ${({ isStated, countDown }) =>
      isStated && countDown !== 0 ? 1 : 0.5};
    z-index: 10;
  }
`;

const TextArea = styled.textarea`
  width: 97%;
  height: 10vh;
  border-radius: 15px;
  margin-top: 2rem;
  border: none;
  outline: none;
  box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.2);
  font-size: 1rem;
  padding: 10px 1rem;
  resize: none;
  line-height: 1.5rem;

  scrollbar-face-color: #ff8c00;

  :focus {
    opacity: 0.9;
    background-color: ${secondaryColor};
    box-shadow: 0 0 10px 1px rgba(154, 129, 225, 0.8);
    color: #ffffff;
  }
`;

const Content = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-top: 20px;
`;

const Button = styled.button`
  border: none;
  outline: none;
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  background-color: ${secondaryColor};
  color: #ffff;
  font-size: 1rem;
  font-weight: 600;
  transition: opacity 0.5s, background-color 0.5s, transform 0.5s linear;
  box-shadow: 0 5px 15px 2px rgba(0, 0, 0, 0.4);

  :hover {
    cursor: pointer;
    transform: scale(1.05);
    background-color: ${primaryColor};
  }
`;
