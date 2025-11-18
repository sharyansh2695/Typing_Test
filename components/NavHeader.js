import { useState, useEffect } from "react";
import Image from "next/image";
import styled from "styled-components";
import {
  headingAnimationColor,
  headingColor,
  primaryColor,
  success,
} from "../constants/color";
import logo from "../public/images/dtulogo.png";

const NavHeader = ({ currentSpeed }) => {
  const [highestSpeed, setHighestSpeed] = useState(0);
  const [isTrue, setIsTrue] = useState(false);

  // update highest speed logic
  if (highestSpeed < currentSpeed) {
    setHighestSpeed(currentSpeed);
    setIsTrue(true);
  }

  if (isTrue) {
    localStorage.setItem("highestSpeed", highestSpeed);
    localStorage.setItem("isTrue", isTrue);
  }

  useEffect(() => {
    const storedTrue = localStorage.getItem("isTrue") === "true";
    const storedSpeed = storedTrue ? localStorage.getItem("highestSpeed") : "";
    setHighestSpeed(storedSpeed);
  }, []);

  return (
    <HeaderContainer>
      <LeftContent>
        <Logo>
          <Image src={logo} alt="DTU Logo" width={55} height={55} />
        </Logo>
      </LeftContent>
    </HeaderContainer>
  );
};

export default NavHeader;


const HeaderContainer = styled.header`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start; /* ✅ Aligns everything to left */
  background: #1e1e2f; /* dark backdrop for contrast */
  padding: 10px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const LeftContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;

  img {
    border-radius: 50%;
    transition: transform 0.2s ease;
  }

  img:hover {
    transform: scale(1.05);
  }
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
  transition: color 0.3s ease;

  &:hover {
    color: ${headingAnimationColor};
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;
