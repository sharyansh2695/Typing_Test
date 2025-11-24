import { useState } from "react";
import styled from "styled-components";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { validateParagraph } from "../../utils/textValidator";

export default function ManageParagraphs() {
  const addParagraph = useMutation(api.paragraphs.addParagraph);
  const deleteParagraph = useMutation(api.paragraphs.deleteParagraph);
  const paragraphs = useQuery(api.paragraphs.getAllParagraphs);

  const [fileText, setFileText] = useState("");
  const [error, setError] = useState("");

  // Upload File
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setFileText(reader.result);
    reader.readAsText(file);
  };

  // Save Paragraph
  const handleSave = async () => {
    const check = validateParagraph(fileText);

    if (!check.valid) {
      setError(`Invalid characters detected: ${check.invalidChars.join(" , ")}`);
      return;
    }

    await addParagraph({ content: fileText.trim() });
    alert("Paragraph saved!");
    setFileText("");
  };

  return (
    <Wrapper>
      <Card>
        <Title>Manage Paragraphs</Title>

        <InputBox>
          <label>Upload .txt file:</label>
          <input type="file" accept=".txt" onChange={handleFileUpload} />

          <TextArea
            value={fileText}
            placeholder="Or paste paragraph manually..."
            onChange={(e) => setFileText(e.target.value)}
          />

          {error && <Error>{error}</Error>}

          <SaveBtn onClick={handleSave}>Save Paragraph</SaveBtn>
        </InputBox>

        <List>
          <h3>Saved Paragraphs:</h3>

          {!paragraphs?.length && <p>No paragraphs added yet.</p>}

          {paragraphs?.map((p) => (
            <ParagraphItem key={p._id}>
              <span>{p.content.slice(0, 60)}...</span>
              <DeleteBtn onClick={() => deleteParagraph({ id: p._id })}>
                Delete
              </DeleteBtn>
            </ParagraphItem>
          ))}
        </List>
      </Card>
    </Wrapper>
  );
}

/* UI Styles */

const Wrapper = styled.div`
  padding: 40px;
  background: #f5f7fa;
  min-height: 100vh;
`;

const Card = styled.div`
  background: white;
  max-width: 900px;
  margin: auto;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.08);
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const InputBox = styled.div`
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 160px;
  padding: 12px;
  font-size: 16px;
`;

const Error = styled.div`
  color: red;
`;

const SaveBtn = styled.button`
  padding: 12px 18px;
  background: #007bff;
  color: white;
  border-radius: 8px;
  cursor: pointer;
`;

const List = styled.div`
  margin-top: 40px;
`;

const ParagraphItem = styled.div`
  padding: 12px;
  background: #fafafa;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
`;

const DeleteBtn = styled.button`
  background: red;
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
`;
