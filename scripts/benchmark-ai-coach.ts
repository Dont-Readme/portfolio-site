import { benchmarkAiCoach } from "../src/features/ai-coach/metrics";

const result = benchmarkAiCoach();

console.log("AI Coach synthetic benchmark");
console.log(JSON.stringify(result, null, 2));
