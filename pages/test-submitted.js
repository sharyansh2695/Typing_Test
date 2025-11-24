// pages/test-submitted.js
import { useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

export default function TestSubmitted() {
  const router = useRouter();

  useEffect(() => {
    // show the page for 1.5s then clear session and go to login
    const t = setTimeout(() => {
      try {
        localStorage.removeItem("studentId");
        localStorage.removeItem("studentName");
      } catch (e) {}
      router.replace("/login");
    }, 1500); // adjust delay as you like

    return () => clearTimeout(t);
  }, [router]);

  return (
    <Wrapper>
      <Card>
        <Title>Test submitted successfully ✅</Title>
        <Sub>Thank you — your result has been recorded.</Sub>
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  min-height: 100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#fff;
`;
const Card = styled.div`
  background:#f8fbff;
  padding:2rem;
  border-radius:12px;
  box-shadow:0 6px 18px rgba(0,0,0,0.08);
  text-align:center;
`;
const Title = styled.h1`
  margin:0 0 .5rem 0;
  font-size:1.6rem;
`;
const Sub = styled.p`
  margin:0;
  color:#555;
`;
