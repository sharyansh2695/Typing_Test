import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

const saveResult = useMutation(api.results.saveResult);
const highestWpm = useQuery(api.results.getHighestWpm, { studentId });

// When test ends:
await saveResult({
  studentId,
  paragraphId,
  wpm: currentWpm,
  accuracy: accuracyPercent,
});
