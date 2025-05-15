// /home/ubuntu/collpsy_mvc_project/app/api/evaluation/route.ts
import { NextRequest } from "next/server";
import { 
  createEvaluation, 
  getEvaluationsByPsychologue 
} from "../../(mvc)/controllers/evaluationController";

export async function POST(request: NextRequest) {
  return createEvaluation(request);
}

export async function GET(request: NextRequest) {
  return getEvaluationsByPsychologue(request);
}
