import React, { useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { primaryColor, headingColor } from "../constants/color";

function Preview({ text = "", userInput = "", errorIndex = null }) {
  const containerRef = useRef(null);

  // Auto-scroll to current character
  useEffect(() => {
    const idx = Math.max(0, Math.min(userInput.length, text.length - 1));
    const container = containerRef.current;
    if (!container) return;

    const el = container.querySelector(`[data-index="${idx}"]`);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [userInput, text]);

  return (
    <Wrapper>
      <PreviewContainer ref={containerRef}>
        {text.split("").map((char, i) => {
          const typedChar = userInput[i];
          const isTyped = i < userInput.length;

          let status = "default";

          if (isTyped) {
            status = typedChar === char ? "correct" : "incorrect";
          }

          if (errorIndex === i) {
            status = "incorrect";
          }

          if (i === userInput.length && errorIndex === null) {
            status = "caret";
          }

          return (
            <Char key={i} data-index={i} $status={status}>
              {char}
            </Char>
          );
        })}
      </PreviewContainer>
    </Wrapper>
  );
}

export default Preview;


const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(1px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const PreviewContainer = styled.div`
  min-height: 300px;       /* MUCH bigger preview area */
  max-height: 500px;       /* Allows scrolling if needed */
  overflow-y: auto;
  padding: 24px;
  border-radius: 10px;
  background: #ffffff;     /* Clean white background */
  font-size: 1.4rem;       /* LARGE TEXT */
  line-height: 2.5rem;     /* Extra line spacing */
  color: #000000;          /* BLACK TEXT */
  white-space: pre-wrap;
  word-break: break-word;

  width: 100%;             /* Take full width */
  border: 2px solid #ddd;
`;


const Char = styled.span`
  display: inline-block;
  padding: 0 1px;
  transition: color 150ms ease, background 150ms ease;
  animation: ${fadeIn} 120ms ease;

  ${(p) =>
    p.$status === "default" &&
    `
    color: #000000;
  `}

  ${(p) =>
    p.$status === "correct" &&
    `
    color: #10b981;
  `}

  ${(p) =>
    p.$status === "incorrect" &&
    `
    color: #dc2626;
    background: rgba(220,38,38,0.1);
    border-radius: 3px;
  `}

  ${(p) =>
    p.$status === "caret" &&
    `
    color: ${primaryColor};
    border-bottom: 2px solid ${primaryColor};
  `}
`;
