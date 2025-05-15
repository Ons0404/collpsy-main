// /home/ubuntu/collpsy_mvc_project/app/api/FichePatient/route.ts
import { NextRequest } from "next/server";
import { getAllTestsFromFichePatientRoute } from "../../(mvc)/controllers/FichePatientController";

export async function GET(request: NextRequest) {
  return getAllTestsFromFichePatientRoute();
}
