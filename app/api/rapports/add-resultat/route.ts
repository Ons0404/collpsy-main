// /home/ubuntu/collpsy_mvc_project/app/api/rapports/add-resultat/route.ts
import { NextRequest } from "next/server";
import { addResultatToRapport } from "../../../(mvc)/controllers/rapportController";

export async function POST(request: NextRequest) {
  return addResultatToRapport(request);
}

