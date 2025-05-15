// /home/ubuntu/collpsy_mvc_project/app/api/rendezvous/psychologue/[id]/route.ts
import { NextRequest } from "next/server";
import { getRendezVousByPsychologueIdHandler } from "../../../../(mvc)/controllers/rendezVousController"; // Adjusted path

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Call the handler function from the controller
  return getRendezVousByPsychologueIdHandler(req, { params });
}

