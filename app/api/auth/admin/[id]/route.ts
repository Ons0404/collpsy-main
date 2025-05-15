import { NextResponse } from "next/server";
import {
  findAdministrateurById,
  findAdministrateurByEmail,
  updateAdministrateur,
  verifyAdministrateurCredentials,
} from "../../../../(mvc)/models/adminstrateur.model";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID utilisateur invalide." },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { email, ancien_mot_de_passe, nouveau_mot_de_passe } = data;

    // Validate input
    if (!email && !ancien_mot_de_passe && !nouveau_mot_de_passe) {
      return NextResponse.json(
        { error: "Aucune donnée à mettre à jour." },
        { status: 400 }
      );
    }

    // Check if admin exists
    const existingAdmin = await findAdministrateurById(id);
    if (!existingAdmin) {
      return NextResponse.json(
        { error: "Administrateur non trouvé." },
        { status: 404 }
      );
    }

    // If email is provided and changed, check for uniqueness
    if (email && email !== existingAdmin.email) {
      const emailExists = await findAdministrateurByEmail(email);
      if (emailExists) {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé par un autre administrateur." },
          { status: 400 }
        );
      }
    }

    // If updating password, verify old password and ensure new password is provided
    let updateData: any = { email };
    if (ancien_mot_de_passe || nouveau_mot_de_passe) {
      if (!ancien_mot_de_passe || !nouveau_mot_de_passe) {
        return NextResponse.json(
          { error: "L'ancien et le nouveau mot de passe sont requis." },
          { status: 400 }
        );
      }

      // Verify old password (assuming plain text comparison)
      const isValidCredentials = await verifyAdministrateurCredentials(
        existingAdmin.email,
        ancien_mot_de_passe
      );
      if (!isValidCredentials) {
        return NextResponse.json(
          { error: "L'ancien mot de passe est incorrect." },
          { status: 401 }
        );
      }

      updateData.mot_de_passe = nouveau_mot_de_passe;
    }

    // Update admin
    const updatedAdministrateur = await updateAdministrateur(id, updateData);
    if (!updatedAdministrateur) {
      console.error(
        "updateAdministrateur returned null for ID:",
        id,
        "Data:",
        updateData
      );
      return NextResponse.json(
        { error: "Échec de la mise à jour de l'administrateur." },
        { status: 500 }
      );
    }

    // Return updated admin without password
    const { mot_de_passe, ...adminSansMdp } = updatedAdministrateur;
    return NextResponse.json(adminSansMdp);
  } catch (error: any) {
    console.error("Erreur dans PUT /api/auth/admin/[id]:", {
      message: error.message,
      stack: error.stack,
      data: await request.json().catch(() => ({})),
      id: params.id,
    });
    return NextResponse.json(
      {
        error:
          error.message || "Une erreur s'est produite. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}
