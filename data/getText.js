"use client";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function GetText() {
  const paragraph = useQuery(api.paragraphs.getRandomParagraph);

  if (paragraph === undefined) return <p>Loading...</p>;
  if (paragraph === null) return <p>No paragraphs found in database.</p>;

  return <p>{paragraph.content}</p>;
}
