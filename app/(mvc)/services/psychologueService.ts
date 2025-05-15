import prisma from "../lib/prisma";
import { formatAvailabilities, getSessionTypes } from "../lib/formatters";
import { TypeConsultation } from "@prisma/client";

export class PsychologueService {
  async findPsychologues(
    serviceType?: string | null,
    location?: string | null,
    specialty?: string | null,
    page = "1",
    limit = "10",
    searchQuery?: string
  ) {
    try {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
        throw new Error("Invalid pagination parameters");
      }
      const skip = (pageNum - 1) * limitNum;

      let whereConditions: any = {};

      if (serviceType) {
        if (!["EN_LIGNE", "PRESENTIEL", "LES_DEUX"].includes(serviceType)) {
          throw new Error("Invalid serviceType parameter");
        }
        // Filter based on the Consultation model's type field
        whereConditions.consultations = {
          some: {
            type: serviceType,
          },
        };
      }

      if (location) {
        whereConditions.OR = [
          {
            adresse_cabinet: {
              contains: location,
              mode: "insensitive",
            },
          },
          {
            utilisateur: {
              ville: {
                contains: location,
                mode: "insensitive",
              },
            },
          },
        ];
      }

      if (specialty) {
        whereConditions.titre = {
          contains: specialty,
          mode: "insensitive",
        };
      }

      if (searchQuery) {
        const params = new URLSearchParams(searchQuery);

        if (params.has("id")) {
          const id = parseInt(params.get("id") || "0");
          if (isNaN(id)) {
            throw new Error("Invalid ID in search query");
          }
          whereConditions.id_psychologue = id;
        }

        if (params.has("serviceType")) {
          const paramServiceType = params.get("serviceType");
          if (paramServiceType) {
            if (
              !["EN_LIGNE", "PRESENTIEL", "LES_DEUX"].includes(paramServiceType)
            ) {
              throw new Error("Invalid serviceType in search query");
            }
            whereConditions.consultations = {
              some: {
                type: paramServiceType,
              },
            };
          }
        }

        if (params.has("location")) {
          const paramLocation = params.get("location");
          if (paramLocation) {
            whereConditions.OR = [
              {
                adresse_cabinet: {
                  contains: paramLocation,
                  mode: "insensitive",
                },
              },
              {
                utilisateur: {
                  ville: {
                    contains: paramLocation,
                    mode: "insensitive",
                  },
                },
              },
            ];
          }
        }

        if (params.has("specialty")) {
          const paramSpecialty = params.get("specialty");
          if (paramSpecialty) {
            whereConditions.titre = {
              contains: paramSpecialty,
              mode: "insensitive",
            };
          }
        }
      }

      const psychologues = await prisma.psychologue.findMany({
        where: whereConditions,
        include: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              ville: true,
              code_postal: true,
              adresse: true,
              telephone: true,
              avatar: true,
              civilite: true,
              statut: true,
              date_naissance: true,
            },
          },
          disponibilites: true,
          consultations: {
            select: {
              type: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1, // Get the most recent consultation to determine the consultation type
          },
        },
        skip,
        take: limitNum,
      });

      const total = await prisma.psychologue.count({
        where: whereConditions,
      });

      return {
        data: psychologues.map((psy) => this.formatPsychologueData(psy)),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      console.error("Detailed error in findPsychologues:", error);
      throw new Error(
        "Failed to fetch psychologists: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }

  async getPsychologueById(id: number) {
    try {
      if (isNaN(id)) {
        throw new Error("Invalid psychologue ID");
      }

      const psychologue = await prisma.psychologue.findUnique({
        where: { id_psychologue: id },
        include: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              ville: true,
              code_postal: true,
              adresse: true,
              telephone: true,
              avatar: true,
              civilite: true,
              statut: true,
              date_naissance: true,
            },
          },
          disponibilites: true,
          consultations: {
            select: {
              type: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      if (!psychologue) {
        return null;
      }

      return this.formatPsychologueData(psychologue);
    } catch (error) {
      console.error(
        `Detailed error fetching psychologue with ID ${id}:`,
        error
      );
      throw new Error(
        "Failed to fetch psychologue details: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }

  async findPsychologueByUtilisateurId(utilisateurId: number) {
    try {
      if (isNaN(utilisateurId)) {
        throw new Error("Invalid utilisateur ID");
      }

      const psychologue = await prisma.psychologue.findUnique({
        where: {
          id_psychologue: utilisateurId,
        },
        include: {
          utilisateur: {
            select: {
              nom: true,
              prenom: true,
              email: true,
              ville: true,
              adresse: true,
              code_postal: true,
              telephone: true,
              civilite: true,
              avatar: true,
              statut: true,
              date_naissance: true,
            },
          },
          disponibilites: true,
          consultations: {
            select: {
              type: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      if (!psychologue) {
        return null;
      }

      return this.formatPsychologueData(psychologue);
    } catch (error) {
      console.error("Detailed error in findPsychologueByUtilisateurId:", error);
      throw new Error(
        "Failed to fetch psychologue by utilisateur ID: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }

  async createPsychologue(data: any) {
    try {
      const requiredFields = [
        "nom",
        "prenom",
        "email",
        "mot_de_passe",
        "cin",
        "titre",
        "etablissement",
        "intitule_diplome",
        "date_obtention",
        "mode_consultation",
      ];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      if (
        !["EN_LIGNE", "PRESENTIEL", "LES_DEUX"].includes(data.mode_consultation)
      ) {
        throw new Error("Invalid mode_consultation value");
      }

      const existingUser = await prisma.utilisateur.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      const result = await prisma.$transaction(async (tx) => {
        const utilisateur = await tx.utilisateur.create({
          data: {
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            mot_de_passe: data.mot_de_passe,
            role: "PSYCHOLOGUE",
            civilite: data.civilite || "M",
            ville: data.ville || null,
            code_postal: data.code_postal || null,
            adresse: data.adresse || null,
            telephone: data.telephone || null,
            statut: true,
          },
        });

        const psychologue = await tx.psychologue.create({
          data: {
            id_psychologue: utilisateur.id,
            cin: data.cin,
            titre: data.titre,
            etablissement: data.etablissement,
            adresse_cabinet: data.adresse_cabinet || null,
            intitule_diplome: data.intitule_diplome,
            date_obtention: new Date(data.date_obtention),
            mode_consultation: data.mode_consultation,
          },
        });

        return { utilisateur, psychologue };
      });

      return result;
    } catch (error) {
      console.error("Detailed error in createPsychologue:", error);
      throw new Error(
        "Failed to create psychologue: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }

  async updatePsychologue(id: number, data: any) {
    try {
      if (isNaN(id)) {
        throw new Error("Invalid psychologue ID");
      }

      const existingPsy = await prisma.psychologue.findUnique({
        where: { id_psychologue: id },
        include: { utilisateur: true },
      });

      if (!existingPsy) {
        throw new Error("Psychologue not found");
      }

      if (
        data.mode_consultation &&
        !["EN_LIGNE", "PRESENTIEL", "LES_DEUX"].includes(data.mode_consultation)
      ) {
        throw new Error("Invalid mode_consultation value");
      }

      const result = await prisma.$transaction(async (tx) => {
        const utilisateur = await tx.utilisateur.update({
          where: { id: id },
          data: {
            nom: data.nom || existingPsy.utilisateur.nom,
            prenom: data.prenom || existingPsy.utilisateur.prenom,
            ville: data.ville || existingPsy.utilisateur.ville,
            code_postal:
              data.code_postal || existingPsy.utilisateur.code_postal,
            adresse: data.adresse || existingPsy.utilisateur.adresse,
            telephone: data.telephone || existingPsy.utilisateur.telephone,
          },
        });

        const psychologue = await tx.psychologue.update({
          where: { id_psychologue: id },
          data: {
            titre: data.titre || existingPsy.titre,
            etablissement: data.etablissement || existingPsy.etablissement,
            adresse_cabinet:
              data.adresse_cabinet || existingPsy.adresse_cabinet,
            intitule_diplome:
              data.intitule_diplome || existingPsy.intitule_diplome,
            mode_consultation:
              data.mode_consultation || existingPsy.mode_consultation,
          },
        });

        return { utilisateur, psychologue };
      });

      return result;
    } catch (error) {
      console.error(
        `Detailed error updating psychologue with ID ${id}:`,
        error
      );
      throw new Error(
        "Failed to update psychologue: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }

  async deletePsychologue(id: number) {
    try {
      if (isNaN(id)) {
        throw new Error("Invalid psychologue ID");
      }

      const existingPsy = await prisma.psychologue.findUnique({
        where: { id_psychologue: id },
      });

      if (!existingPsy) {
        throw new Error("Psychologue not found");
      }

      await prisma.utilisateur.delete({
        where: { id: id },
      });

      return { success: true, id };
    } catch (error) {
      console.error(
        `Detailed error deleting psychologue with ID ${id}:`,
        error
      );
      throw new Error(
        "Failed to delete psychologue: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }

  private formatPsychologueData(psy: any) {
    let avatarUrl = null;
    if (psy.utilisateur?.avatar && Buffer.isBuffer(psy.utilisateur.avatar)) {
      try {
        const avatarBase64 = Buffer.from(psy.utilisateur.avatar).toString(
          "base64"
        );
        avatarUrl = `data:image/jpeg;base64,${avatarBase64}`;
      } catch (error) {
        console.error("Error converting avatar to base64:", error);
      }
    }

    // Use the type from the most recent consultation, if available
    const consultationMode = psy.consultations?.[0]?.type || "LES_DEUX";
    const sessionTypes = getSessionTypes(consultationMode);

    return {
      id: psy.id_psychologue,
      cin: psy.cin,
      firstName: psy.utilisateur?.prenom || "Inconnu",
      lastName: psy.utilisateur?.nom || "Inconnu",
      name: `${psy.utilisateur?.prenom || "Inconnu"} ${
        psy.utilisateur?.nom || "Inconnu"
      }`,
      email: psy.utilisateur?.email || "Non spécifié",
      phone: psy.utilisateur?.telephone || "Non spécifié",
      title: psy.titre || "Psychologue qualifié",
      specialties: psy.intitule_diplome ? [psy.intitule_diplome] : [],
      establishment: psy.etablissement || "Non spécifié",
      cabinetAddress: psy.adresse_cabinet || "Non spécifiée",
      address: psy.utilisateur?.adresse || "Non spécifiée",
      city: psy.utilisateur?.ville || "Non spécifiée",
      postalCode: psy.utilisateur?.code_postal || "Non spécifié",
      civility: psy.utilisateur?.civilite || "Non spécifié",
      consultationMode: consultationMode,
      sessionTypes: sessionTypes,
      diploma: psy.intitule_diplome || "Non spécifié",
      diplomaDate: psy.date_obtention
        ? psy.date_obtention.toISOString()
        : "Non spécifiée",
      birthDate: psy.utilisateur?.date_naissance
        ? psy.utilisateur.date_naissance.toISOString()
        : "Non spécifiée",
      avatar: avatarUrl,
      verified: psy.utilisateur?.statut || false,
      rating: 4.5,
      experience: psy.date_obtention
        ? new Date().getFullYear() - new Date(psy.date_obtention).getFullYear()
        : 0,
      availableSlots: psy.disponibilites
        ? formatAvailabilities(psy.disponibilites)
        : [],
      photo_diplome: psy.photo_diplome ? true : false,
    };
  }

  async disconnect() {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error("Error disconnecting from database:", error);
    }
  }
}
