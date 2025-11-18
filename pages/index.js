import Link from "next/link";
import styled from "styled-components";

export default function AdminDashboard() {
  return (
    <PageWrapper>
      <Card>
        <Title>Admin Dashboard</Title>
        <Subtitle>Manage typing tests, paragraphs & results</Subtitle>

        <Menu>
          <MenuItem href="/admin/paragraphs">📄 Manage Paragraphs</MenuItem>
          <MenuItem href="/admin/results">📊 View Results</MenuItem>
          <MenuItem href="/admin/release-results">📤 Release Results</MenuItem>
        </Menu>
      </Card>
    </PageWrapper>
  );
}

/* UI */
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const Card = styled.div`
  background: white;
  width: 100%;
  max-width: 550px;
  padding: 35px;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 5px;
`;

const Subtitle = styled.p`
  color: #555;
  margin-bottom: 30px;
`;

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const MenuItem = styled(Link)`
  padding: 16px;
  background: #fafafa;
  border-radius: 10px;
  font-size: 20px;
  border: 1px solid #ddd;
  text-decoration: none;
  color: #333;
  &:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }
`;
