// /home/ubuntu/collpsy_mvc_project/app/api/rendezvous/prochain/[userId]/route.ts
import { NextRequest } from "next/server";
import { getProchainRendezVousByUserIdHandler } from "../../../../(mvc)/controllers/rendezVousController"; // Adjusted path

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  // Call the handler function from the controller
  return getProchainRendezVousByUserIdHandler(request, { params });
}

