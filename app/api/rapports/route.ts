// /home/ubuntu/collpsy_mvc_project/app/api/rapports/route.ts
import { NextRequest } from "next/server";
import { createRapport } from "../../(mvc)/controllers/rapportController";

export async function POST(req: NextRequest) {
  return createRapport(req);
}

// Note: Add GET handler if needed for fetching multiple rapports (e.g., all rapports for a psychologist)
// export async function GET(req: NextRequest) {
//   // Call appropriate controller function
// }

