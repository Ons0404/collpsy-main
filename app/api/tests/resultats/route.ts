// /home/ubuntu/collpsy_mvc_project/app/api/tests/resultats/route.ts
import { NextRequest } from "next/server";
import { createResultatTestHandler } from "../../../(mvc)/controllers/testController"; // Adjusted path

export async function POST(request: NextRequest) {
  // Call the handler function from the controller
  return createResultatTestHandler(request);
}

// Note: Add GET handler if needed for fetching multiple results (e.g., all results)
// export async function GET(request: NextRequest) {
//   // Call appropriate controller function
// }

