import { FichePatientModel } from "../models/FichePatient";

export const FichePatientService = {
  async createFichePatient(data: any) {
    return await FichePatientModel.create({ data });
  },

  async getFichePatientById(id: string) {
    return await FichePatientModel.findUnique({ where: { id } });
  },

  async updateFichePatient(id: string, data: any) {
    return await FichePatientModel.update({ where: { id }, data });
  },

  async deleteFichePatient(id: string) {
    return await FichePatientModel.delete({ where: { id } });
  },

  async getFichePatientByEtudiantId(etudiantId: number) {
    return await FichePatientModel.findUnique({ where: { etudiantId } });
  },
};
