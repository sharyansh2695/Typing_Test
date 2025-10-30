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
  // 🧠 Fetch data from Convex DB
  const paragraph = useQuery(api.paragraphs.getRandomParagraph);
  const timeSetting = useQuery(api.timeSettings.getTimeSetting); // ✅ New query for time
  const saveResult = useMutation(api.results.saveResult);

  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [symbols, setSymbols] = useState(0);
  const [sec, setSec] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [countDown, setCountDown] = useState(null);
  const [locked, setLocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const intervalRef = useRef(null);

  // ✅ Load paragraph
  useEffect(() => {
    if (paragraph === undefined) return;
    if (paragraph === null) setText("");
    else setText(paragraph.content || "");
  }, [paragraph]);

  // ✅ Load time duration from DB
  useEffect(() => {
    if (timeSetting) {
      setCountDown(timeSetting.duration || 60);
    }
  }, [timeSetting]);

  // ✅ Timer logic
  const setTimer = () => {
    if (!started && countDown !== null) {
      setStarted(true);
      intervalRef.current = setInterval(() => {
        setSec((s) => s + 1);
        setCountDown((c) => {
          if (c <= 1) {
            clearInterval(intervalRef.current);
            setFinished(true);
            handleSaveResult(); // Save on timeout
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
  };

  // ✅ Restart
  const onRestart = () => {
    clearInterval(intervalRef.current);
    setUserInput("");
    setSymbols(0);
    setSec(0);
    setStarted(false);
    setFinished(false);
    setCountDown(timeSetting?.duration || 60);
    setLocked(false);
    setErrorMsg("");
    setText(paragraph?.content || "");
  };

  // ✅ Typing logic with stop on wrong input
  const onUserInputChange = (e) => {
    const value = e.target.value;

    if (!started) setTimer();
    if (locked || finished) return;

    const expected = text.substring(0, value.length);
    const currentChar = text[value.length - 1];
    const typedChar = value[value.length - 1];

    if (typedChar !== currentChar) {
      // ❌ Stop typing on wrong input
      setLocked(true);
      setErrorMsg("❌ Typing stopped — incorrect character entered!");
      clearInterval(intervalRef.current);
      setFinished(true);
      handleSaveResult();
      return;
    }

    setUserInput(value);
    setSymbols(countCorrectSymbols(value, text));
    setErrorMsg("");

    // ✅ Paragraph finished
    if (value === text) {
      clearInterval(intervalRef.current);
      setFinished(true);
      handleSaveResult();
    }
  };

  // ✅ Count correct characters
  const countCorrectSymbols = (userInputVal, baseText) => {
    const t = (baseText || "").replace(/ /g, "");
    return userInputVal
      .replace(/ /g, "")
      .split("")
      .filter((data, i) => data === t[i]).length;
  };

  // ✅ Save result to Convex DB
  const handleSaveResult = async () => {
    try {
      const studentId = localStorage.getItem("studentId");
      const paragraphId = paragraph?._id;

      if (!studentId || !paragraphId) {
        console.warn("Missing student or paragraph ID");
        return;
      }

      const testDuration = timeSetting?.duration || 60;
      const secondsTaken = sec === 0 ? testDuration : sec;
      const wpm = (symbols * 60) / (5 * secondsTaken);

      await saveResult({
        studentId,
        paragraphId,
        symbols,
        seconds: secondsTaken,
        accuracy: 100,
        wpm: Math.round(wpm),
      });

      console.log("✅ Result saved successfully:", Math.round(wpm));
    } catch (err) {
      console.error("❌ Failed to save result:", err);
    }
  };

  if (paragraph === undefined || timeSetting === undefined)
    return <p>Loading...</p>;
  if (paragraph === null) return <p>No paragraphs found in database.</p>;

  return (
    <CardContainer>
      <div className="inner">
        <CountDown isStarted={started} countDown={countDown}>
          <h2>{countDown}s</h2>
        </CountDown>

        <Preview text={text} userInput={userInput} />
        <TextArea
          value={userInput}
          onChange={onUserInputChange}
          placeholder={locked ? errorMsg : "Start typing..."}
          readOnly={finished || locked}
        />

        <Content>
          <Speed
            countDown={countDown}
            typingCardCallback={(speed) => homepageCallback(speed)}
            sec={sec}
            symbols={symbols}
            isFinished={finished}
          />
          <Button onClick={onRestart}>Restart</Button>
        </Content>
      </div>
    </CardContainer>
  );
}

export default TypingCard;

// ---------- Styled Components ----------
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
  background-color: ${({ isStarted, countDown }) =>
    isStarted && countDown !== 0 ? primaryColor : lightSecondaryColor1};
  color: ${headingColor};
  font-size: 0.8rem;
  position: absolute;
  right: 10px;
  top: 10px;
  transition: all 0.5s ease-in-out;
  transform: ${({ isStarted, countDown }) =>
    isStarted && countDown !== 0 ? "scale(1.1)" : "scale(1)"};
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
