// /home/ubuntu/collpsy_mvc_project/app/api/tests/route.ts
import { NextRequest } from "next/server";
import { getAllTestsHandler } from "../../(mvc)/controllers/testController"; // Adjusted path

export async function GET(req: NextRequest) {
  // Call the handler function from the controller
  return getAllTestsHandler(req);
}

