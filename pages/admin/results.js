import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import styled from "styled-components";

export default function Results() {
  const results = useQuery(api.results.getAllResults);

  return (
    <Container>
      <Title>All Results</Title>

      {!results ? (
        <Loading>Loading results...</Loading>
      ) : results.length === 0 ? (
        <Empty>No results found.</Empty>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Paragraph</th>
                <th>WPM</th>
                <th>Accuracy</th>
                <th>Symbols</th>
                <th>Time (sec)</th>
                <th>Typed Text</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id}>
                  <td>{r.studentId}</td>
                  <td>{r.paragraphId}</td>
                  <td>{r.wpm}</td>
                  <td>{r.accuracy}%</td>
                  <td>{r.symbols}</td>
                  <td>{r.seconds}</td>
                  <td className="textCell">{r.text}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </Container>
  );
}


const Container = styled.div`
  padding: 40px;
  background: #f6f8fc;
  min-height: 100vh;
`;

const Title = styled.h2`
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 25px;
`;

const Loading = styled.div`
  font-size: 18px;
  color: #555;
`;

const Empty = styled.div`
  font-size: 18px;
  color: #777;
  padding: 20px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  margin-top: 20px;
  border-radius: 10px;
  border: 1px solid #d0d7e2;
  background: #fff;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    background: #eef2ff;
    padding: 14px;
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #d0d7e2;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid #ececec;
    font-size: 14px;
    color: #444;
  }

  tr:hover {
    background: #f9fafb;
  }

  .textCell {
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
