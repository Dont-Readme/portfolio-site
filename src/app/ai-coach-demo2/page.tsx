import type { Metadata } from "next";
import { AiCoachDemo } from "@/components/demos/AiCoachDemo";

export const metadata: Metadata = {
  title: "AI 학습 코치 알고리즘 데모",
  description:
    "합성 학습 데이터에서 취약도를 계산하고 AI 개인 적합도와 결합해 추천하는 과정을 검증하는 인터랙티브 데모",
};

export default function AiCoachDemo2Page() {
  return <AiCoachDemo />;
}
