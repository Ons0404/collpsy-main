import { NextRequest } from "next/server";
import { PsychologueController } from "../../(mvc)/controllers/psychologueController";

const controller = new PsychologueController();

export async function GET(request: NextRequest) {
  console.log("API route called:", request.url);
  return controller.getPsychologues(request);
}
