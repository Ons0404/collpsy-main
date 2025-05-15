// /home/ubuntu/collpsy_mvc_project/app/api/tests/[testId]/route.ts
import { NextRequest } from "next/server";
import { getTestByIdHandler } from "../../../(mvc)/controllers/testController"; // Adjusted path

export async function GET(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  // Call the handler function from the controller
  return getTestByIdHandler(request, { params });
}

