// /home/ubuntu/collpsy_mvc_project/app/api/etudiants/[id]/rapports/route.ts
import { NextRequest } from "next/server";
import { getRapportsByEtudiantId } from "../../../../(mvc)/controllers/rapportController";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return getRapportsByEtudiantId(request, { params });
}

