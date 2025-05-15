// /home/ubuntu/collpsy_mvc_project/app/api/rapports/[etudiantId]/[rapportId]/route.ts
import { NextRequest } from "next/server";
import { getRapportByEtudiantAndId } from "../../../../(mvc)/controllers/rapportController";

export async function GET(
  request: NextRequest,
  { params }: { params: { etudiantId: string; rapportId: string } }
) {
  return getRapportByEtudiantAndId(request, { params });
}

