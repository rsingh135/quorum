import { CaseAnalysisClient } from "./CaseAnalysisClient";

export default function CasePage({
  params,
}: {
  params: { docket: string };
}) {
  return <CaseAnalysisClient docket={params.docket} />;
}
