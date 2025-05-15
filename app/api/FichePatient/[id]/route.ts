// /home/ubuntu/collpsy_mvc_project/app/api/FichePatient/[id]/route.ts
import { NextRequest } from "next/server";
import {
  createFichePatient,
  getFichePatientByEtudiantId,
  updateOrCreareFichePatientByEtudiantId,
  deleteFichePatientByEtudiantId,
} from "../../../(mvc)/controllers/FichePatientController";

// Note: The original POST was on this route, but semantically POST (create)
// often goes on the collection route (/api/FichePatient). However, since the
// original code used the [id] route for creation based on etudiantId, we keep it here
// but use the createFichePatient controller function.
// Consider standard REST practices for future refactoring (POST to collection, PUT/GET/DELETE to specific resource).

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Although the controller expects only `req`, the original route used `params`.
  // We pass `req` to the controller. The controller extracts `etudiantId` from the body.
  // If the intention was to use `params.id` for creation, the controller needs adjustment.
  // Based on the controller logic, it expects etudiantId in the body.
  // Let's call createFichePatient which expects etudiantId in the body.
  // If the ID in the URL *must* be used, the controller needs modification.
  // For now, assuming the body contains the necessary etudiantId.
  return createFichePatient(req);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return getFichePatientByEtudiantId(req, { params });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return updateOrCreareFichePatientByEtudiantId(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return deleteFichePatientByEtudiantId(req, { params });
}

