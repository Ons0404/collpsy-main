// /home/ubuntu/collpsy_mvc_project/app/api/tests/[testId]/submit/route.ts
import { NextRequest } from "next/server";
import { submitTestHandler } from "../../../../(mvc)/controllers/testController"; // Adjusted path

export async function POST(
  request: NextRequest,
  { params }: { params: { testId: string } }
) {
  // Call the handler function from the controller
  return submitTestHandler(request, { params });
}

