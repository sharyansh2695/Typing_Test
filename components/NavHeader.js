import { useState, useEffect } from "react";
import Image from "next/image";
import styled from "styled-components";
import logo from "../public/images/dtulogo.png";

const NavHeader = ({ currentSpeed }) => {
  const [highestSpeed, setHighestSpeed] = useState(0);

  // Update stored speed only when increasing
  if (currentSpeed > highestSpeed) {
    setHighestSpeed(currentSpeed);
    localStorage.setItem("highestSpeed", currentSpeed);
  }

  useEffect(() => {
    const stored = localStorage.getItem("highestSpeed");
    if (stored) setHighestSpeed(parseInt(stored));
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
  justify-content: flex-start;

  background: #ffffff;         /* PURE WHITE */
  color: #000;                 /* BLACK TEXT */

  padding: 12px 30px;
  position: sticky;
  top: 0;
  z-index: 100;

  border-bottom: 1px solid #e5e5e5; /* Light professional border */
`;

const LeftContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;

  img {
    border-radius: 50%;
    transition: transform 0.2s ease;
  }

  img:hover {
    transform: scale(1.05);
  }
`;
