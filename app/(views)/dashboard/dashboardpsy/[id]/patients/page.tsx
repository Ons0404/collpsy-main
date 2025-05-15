"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import {
  AlertCircle,
  FileText,
  Loader2,
  Search,
  User,
  Calendar,
  ArrowLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import Input from "../../../../../components/ui/input";
import { Badge } from "../../../../../components/ui/badge";
import { ScrollArea } from "../../../../../components/ui/scroll-area";
import { useToast } from "../../../../../(mvc)/hooks/use-toast";
import jsPDF from "jspdf";

// Interfaces
interface Patient {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  date_naissance: string;
  telephone: string;
  rendezVous: {
    id: number;
    date: string;
    heure_debut: string;
    statut: string;
  }[];
}

interface RapportEntry {
  id: string;
  dateconsultation: string;
  resume: string;
  observations?: string;
}

interface ResultatTest {
  id: string;
  score: number;
  test: {
    titre: string;
    categorie: string;
  };
  interpretation?: string;
  datePassation: string;
}

interface Rapport {
  id: string;
  titre: string;
  description: string;
  psychologueId: number | null;
  createdAt: string;
  updatedAt: string;
  psychologue: {
    utilisateur: {
      nom: string;
      prenom: string;
    };
  };
  etudiant: {
    utilisateur: {
      nom: string;
      prenom: string;
      email: string;
      date_naissance: string;
      telephone: string;
    };
    fichesPatients: {
      id: string;
      antecedentsMedicaux: string | null;
      antecedentsPsychologiques: string | null;
      allergies: string | null;
      medicamentsActuels: string | null;
      traitementsEnCours: string | null;
      symptomesActuels: string | null;
      objectifsTherapie: string | null;
      notesPsychologue: string | null;
      historiqueConsultations: string | null;
    } | null;
  };
  rapportEntries: RapportEntry[];
  resultatTests: ResultatTest[];
  commentaires?: string;
}

interface TextOptions {
  font?: string;
  fontSize?: number;
  color?: [number, number, number];
  align?: string;
  indent?: number;
}

export default function MesPatientsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [rapports, setRapports] = useState<Rapport[]>([]);
  const [loadingRapports, setLoadingRapports] = useState(false);
  const [activeTab, setActiveTab] = useState("rapports");
  const [rapportsNotFound, setRapportsNotFound] = useState(false);
  const [commentSortOrder, setCommentSortOrder] = useState<"asc" | "desc">(
    "desc"
  );
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/psychologists/${params.id}/patients`
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des patients");
        }
        const data = await response.json();
        setPatients(data);
        setFilteredPatients(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [params.id]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter(
      (patient) =>
        patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const handleSelectPatient = async (patientId: number) => {
    try {
      setLoadingRapports(true);
      setRapports([]);
      setRapportsNotFound(false);
      setSelectedPatient(patientId);
      setNewComments({});

      const response = await fetch(`/api/etudiants/${patientId}/rapports`);

      if (response.status === 404) {
        setRapportsNotFound(true);
        toast({
          title: "Aucun rapport trouvé",
          description: "Ce patient n'a pas encore de rapports enregistrés.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des rapports");
      }

      const rapportsData = await response.json();
      console.log("Fetched rapports:", rapportsData);
      setRapports(rapportsData);
      setActiveTab("rapports");
      toast({
        title: "Rapports chargés",
        description: `${rapportsData.length} rapport(s) récupéré(s) avec succès.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      toast({
        title: "Erreur",
        description:
          err instanceof Error ? err.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoadingRapports(false);
    }
  };

  const handleGoBack = () => {
    router.push(`/dashboard/dashboardpsy/${params.id}`);
  };

  const handleSaveComment = async (rapportId: string, commentaire: string) => {
    console.log(
      "Saving comment for rapportId:",
      rapportId,
      "Comment:",
      commentaire
    );

    if (!commentaire.trim()) {
      toast({
        title: "Erreur",
        description: "Le commentaire ne peut pas être vide.",
        variant: "destructive",
      });
      return;
    }

    if (!rapportId || typeof rapportId !== "string") {
      toast({
        title: "Erreur",
        description: "ID du rapport invalide.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/psychologists/rapports/${rapportId}/commentaire`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commentaires: commentaire }),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      const updatedRapport = await response.json();
      console.log("Response data:", updatedRapport);

      if (!response.ok) {
        throw new Error(
          updatedRapport.error ||
            `Erreur lors de la sauvegarde du commentaire (Status: ${response.status})`
        );
      }

      setRapports((prevRapports) => {
        const updated = prevRapports.map((rapport) =>
          rapport.id === rapportId ? updatedRapport : rapport
        );
        console.log("Updated rapports state:", updated);
        return updated;
      });

      setNewComments((prev) => {
        const newComments = { ...prev };
        delete newComments[rapportId];
        return newComments;
      });

      toast({
        title: "Succès",
        description: "Commentaire sauvegardé avec succès !",
      });
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      toast({
        title: "Erreur",
        description:
          err instanceof Error ? err.message : "Échec de la sauvegarde",
        variant: "destructive",
      });
    }
  };

  const toggleCommentSortOrder = () => {
    setCommentSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString("fr-FR");
      const formattedTime = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${formattedDate} ${formattedTime}`;
    } catch (e) {
      return "Date invalide";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "confirmé":
        return (
          <Badge className="bg-green-200 text-green-800 border-green-300">
            Confirmé
          </Badge>
        );
      case "cancelled":
      case "annulé":
        return (
          <Badge className="bg-red-200 text-red-800 border-red-300">
            Annulé
          </Badge>
        );
      case "pending":
      case "en attente":
        return (
          <Badge className="bg-yellow-200 text-yellow-800 border-yellow-300">
            En attente
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-200 text-gray-800 border-gray-300">
            {status}
          </Badge>
        );
    }
  };

  const downloadRapportAsPDF = (rapport: Rapport) => {
    console.log("Generating PDF for rapport:", rapport);
    if (!rapport || !rapport.titre || !rapport.etudiant?.utilisateur) {
      console.error("Invalid or missing rapport data");
      toast({
        title: "Erreur",
        description: "Données du rapport manquantes ou invalides.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    let yOffset = 35;
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    const sectionPadding = 5;

    // Test content to confirm jsPDF is working
    doc.setFontSize(12);
    doc.text("Test PDF Content", 10, 10);

    const checkPageOverflow = (additionalHeight: number = 0) => {
      console.log("yOffset:", yOffset, "additionalHeight:", additionalHeight);
      if (yOffset + additionalHeight > pageHeight - 30) {
        console.log("Adding new page");
        doc.addPage();
        yOffset = 35;
        addHeader();
        addFooter();
        return true;
      }
      return false;
    };

    const addHeader = () => {
      doc.setFillColor(200, 220, 200);
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 128, 0);
      doc.text("Rapport Psychologique", margin, 15);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Patient: ${rapport.etudiant.utilisateur.prenom} ${rapport.etudiant.utilisateur.nom}`,
        margin,
        25
      );
      doc.text(
        `Généré le ${formatDate(new Date().toISOString())}`,
        pageWidth - margin - 50,
        15
      );
      doc.setDrawColor(150, 150, 150);
      doc.line(0, 30, pageWidth, 30);
    };

    const addFooter = () => {
      doc.setDrawColor(150, 150, 150);
      doc.line(0, pageHeight - 20, pageWidth, pageHeight - 20);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`CollPsy - Rapport Confidentiel`, margin, pageHeight - 10);
      doc.text(
        `Page ${doc.getCurrentPageInfo().pageNumber}`,
        pageWidth - margin - 20,
        pageHeight - 10
      );
    };

    const drawSectionBox = (startY: number, endY: number) => {
      if (endY <= startY) {
        endY = startY + 5;
      }
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(
        margin - 2,
        startY - 2,
        maxWidth + 4,
        endY - startY + 4,
        2,
        2,
        "FD"
      );
    };

    const addText = (
      text: string,
      x: number,
      y: number,
      options: TextOptions = {}
    ) => {
      if (!text.trim()) {
        console.warn("Empty text provided to addText");
        return y;
      }
      console.log("Adding text:", text, "at", x, y);
      const {
        font = "normal",
        fontSize = 10,
        color = [0, 0, 0],
        align = "left",
        indent = 0,
      } = options;

      doc.setFontSize(fontSize);
      doc.setFont("helvetica", font);
      doc.setTextColor(...color);

      const effectiveX = x + indent;
      const effectiveWidth = maxWidth - indent;

      const lines = doc.splitTextToSize(text, effectiveWidth);
      console.log("Lines:", lines);
      let currentY = y;
      lines.forEach((line: string) => {
        if (line.trim()) {
          doc.text(line, effectiveX, currentY, { align });
          currentY += fontSize;
        }
      });

      return currentY + 2;
    };

    addHeader();
    addFooter();

    const titleStartY = yOffset;
    yOffset = addText(`[Doc] ${rapport.titre}`, margin + 2, yOffset, {
      font: "bold",
      fontSize: 14,
      color: [0, 128, 0],
    });

    yOffset = addText(
      `Par ${rapport.psychologue?.utilisateur?.prenom || ""} ${
        rapport.psychologue?.utilisateur?.nom || ""
      }`,
      margin + 5,
      yOffset,
      { color: [100, 100, 100] }
    );

    yOffset = addText(
      `Mis à jour le ${formatDate(rapport.updatedAt)}`,
      margin + 5,
      yOffset,
      { color: [100, 100, 100] }
    );

    yOffset += sectionPadding;
    drawSectionBox(titleStartY - sectionPadding, yOffset);
    yOffset += 10;
    checkPageOverflow();

    const studentStartY = yOffset;
    yOffset = addText(
      "[Info] Informations de l'étudiant",
      margin + 2,
      yOffset,
      {
        font: "bold",
        fontSize: 12,
        color: [0, 128, 0],
      }
    );

    const studentInfo = [
      `• Nom: ${rapport.etudiant.utilisateur.nom} ${rapport.etudiant.utilisateur.prenom}`,
      `• Email: ${rapport.etudiant.utilisateur.email}`,
      `• Téléphone: ${
        rapport.etudiant.utilisateur.telephone || "Non renseigné"
      }`,
      `• Date de naissance: ${
        rapport.etudiant.utilisateur.date_naissance
          ? formatDate(rapport.etudiant.utilisateur.date_naissance)
          : "Non renseignée"
      }`,
    ];

    studentInfo.forEach((line: string) => {
      yOffset = addText(line, margin + 5, yOffset, { indent: 5 });
    });

    yOffset += sectionPadding;
    drawSectionBox(studentStartY - sectionPadding, yOffset);
    yOffset += 10;
    checkPageOverflow();

    const patientStartY = yOffset;
    yOffset = addText("[Fiche] Fiche patient", margin + 2, yOffset, {
      font: "bold",
      fontSize: 12,
      color: [0, 128, 0],
    });

    if (rapport.etudiant.fichesPatients) {
      const patientInfo = [
        `• Antécédents médicaux: ${
          rapport.etudiant.fichesPatients.antecedentsMedicaux || "Non renseigné"
        }`,
        `• Antécédents psychologiques: ${
          rapport.etudiant.fichesPatients.antecedentsPsychologiques ||
          "Non renseigné"
        }`,
        `• Allergies: ${
          rapport.etudiant.fichesPatients.allergies || "Non renseigné"
        }`,
        `• Médicaments actuels: ${
          rapport.etudiant.fichesPatients.medicamentsActuels || "Non renseigné"
        }`,
        `• Traitements en cours: ${
          rapport.etudiant.fichesPatients.traitementsEnCours || "Non renseigné"
        }`,
        `• Symptômes actuels: ${
          rapport.etudiant.fichesPatients.symptomesActuels || "Non renseigné"
        }`,
        `• Objectifs de thérapie: ${
          rapport.etudiant.fichesPatients.objectifsTherapie || "Non renseigné"
        }`,
        `• Notes du psychologue: ${
          rapport.etudiant.fichesPatients.notesPsychologue || "Non renseigné"
        }`,
      ];

      patientInfo.forEach((line: string) => {
        yOffset = addText(line, margin + 5, yOffset, { indent: 5 });
      });
    } else {
      yOffset = addText("Aucune fiche patient disponible", margin + 5, yOffset);
    }

    yOffset += sectionPadding;
    drawSectionBox(patientStartY - sectionPadding, yOffset);
    yOffset += 10;
    checkPageOverflow();

    const descStartY = yOffset;
    yOffset = addText("[Desc] Description", margin + 2, yOffset, {
      font: "bold",
      fontSize: 12,
      color: [0, 128, 0],
    });

    yOffset = addText(
      rapport.description || "Pas de description disponible",
      margin + 5,
      yOffset,
      { font: "italic" }
    );

    yOffset += sectionPadding;
    drawSectionBox(descStartY - sectionPadding, yOffset);
    yOffset += 10;
    checkPageOverflow();

    const consultStartY = yOffset;
    yOffset = addText(
      "[Consult] Historique des consultations",
      margin + 2,
      yOffset,
      { font: "bold", fontSize: 12, color: [0, 128, 0] }
    );

    if (rapport.rapportEntries && rapport.rapportEntries.length > 0) {
      rapport.rapportEntries.forEach((entry: RapportEntry, index: number) => {
        const entryStartY = yOffset;
        yOffset = addText(
          `${index + 1}. Consultation du ${formatDate(entry.dateconsultation)}`,
          margin + 5,
          yOffset,
          { font: "bold" }
        );

        yOffset = addText(entry.resume, margin + 10, yOffset);

        if (entry.observations) {
          yOffset = addText(
            `Observations: ${entry.observations}`,
            margin + 10,
            yOffset,
            { font: "italic" }
          );
        }

        yOffset += 3;
        drawSectionBox(entryStartY - 3, yOffset);
        yOffset += 5;
        checkPageOverflow();
      });
    } else {
      yOffset = addText("Aucune consultation enregistrée", margin + 5, yOffset);
      yOffset += 5;
      drawSectionBox(consultStartY - sectionPadding, yOffset);
    }

    yOffset += 10;
    checkPageOverflow();

    const commentStartY = yOffset;
    yOffset = addText("[Comment] Commentaires", margin + 2, yOffset, {
      font: "bold",
      fontSize: 12,
      color: [0, 128, 0],
    });

    yOffset = addText(
      rapport.commentaires || "Aucun commentaire",
      margin + 5,
      yOffset
    );

    yOffset += sectionPadding;
    drawSectionBox(commentStartY - sectionPadding, yOffset);

    console.log("Saving PDF with page count:", doc.getNumberOfPages());
    doc.save(`Rapport_${rapport.titre.replace(/[^a-z0-9]/gi, "_")}.pdf`);
  };

  const sortedRapports: Rapport[] = [...rapports].sort((a, b) => {
    const dateA = new Date(a.updatedAt).getTime();
    const dateB = new Date(b.updatedAt).getTime();
    return commentSortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  useEffect(() => {
    rapports.forEach((rapport) => {
      console.log("Rapport ID for comment:", rapport.id);
      console.log(
        "Current newComments for rapportId",
        rapport.id,
        ":",
        newComments[rapport.id]
      );
    });
  }, [rapports, newComments]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-lg text-gray-600">
          Chargement des patients...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 m-4 text-red-600 bg-red-50 rounded-lg border border-red-200 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>Erreur : {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto bg-gray-50">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="mr-4 text-gray-600 border-gray-300 hover:bg-gray-100 px-3 py-1 rounded-full"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Mes Patients</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-gray-200 lg:col-span-1 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-gray-100 rounded-t-lg px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Liste des Patients
              </CardTitle>
              <Badge
                variant="outline"
                className="font-normal bg-gray-200 text-gray-700 border-gray-300"
              >
                {filteredPatients.length} patients
              </Badge>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher un patient..."
                className="pl-8 bg-white border-gray-300 focus:border-green-400 focus:ring-green-200"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <Table>
                <TableHeader className="bg-gray-100 sticky top-0">
                  <TableRow>
                    <TableHead className="text-gray-700 font-medium">
                      Patient
                    </TableHead>
                    <TableHead className="text-gray-700 font-medium w-32">
                      Dernier RDV
                    </TableHead>
                    <TableHead className="text-right text-gray-700 w-28">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <TableRow
                        key={patient.id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedPatient === patient.id ? "bg-green-50" : ""
                        }`}
                        onClick={() => handleSelectPatient(patient.id)}
                      >
                        <TableCell className="py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                              {patient.nom} {patient.prenom}
                            </span>
                            <span className="text-sm text-gray-500">
                              {patient.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {patient.rendezVous.length > 0 ? (
                            <span>
                              {formatDate(patient.rendezVous[0].date)}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">
                              Aucun RDV
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={
                              selectedPatient === patient.id
                                ? "default"
                                : "outline"
                            }
                            className={
                              selectedPatient === patient.id
                                ? "bg-green-200 text-green-700 hover:bg-green-300 border-green-300"
                                : "text-gray-600 hover:bg-gray-100 border-gray-300"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPatient(patient.id);
                            }}
                          >
                            <span>Consulter</span>
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-8 text-gray-500"
                      >
                        Aucun patient trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 lg:col-span-2 shadow-sm bg-white">
          <CardHeader className="bg-gray-100 rounded-t-lg border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                {selectedPatient ? (
                  <>
                    <User className="h-5 w-5 mr-2 text-gray-500" />
                    <span>
                      {patients.find((p) => p.id === selectedPatient)?.prenom}{" "}
                      {patients.find((p) => p.id === selectedPatient)?.nom} -
                      Dossier patient
                    </span>
                  </>
                ) : (
                  "Dossier Patient"
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {selectedPatient ? (
              loadingRapports ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                  <span className="ml-2 text-lg text-gray-600">
                    Chargement des données...
                  </span>
                </div>
              ) : (
                <div className="p-6">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="mb-6 bg-gray-100 p-1 rounded-lg">
                      <TabsTrigger
                        value="rapports"
                        className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm px-4 py-2 rounded-md"
                      >
                        Rapports
                      </TabsTrigger>
                      <TabsTrigger
                        value="tests"
                        className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm px-4 py-2 rounded-md"
                      >
                        Résultats des tests
                      </TabsTrigger>
                      <TabsTrigger
                        value="commentaires"
                        className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm px-4 py-2 rounded-md"
                      >
                        Commentaires
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="rapports" className="space-y-6">
                      {rapportsNotFound ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="bg-gray-100 p-6 rounded-full mb-4">
                            <FileText className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-medium text-gray-800 mb-3">
                            Aucun rapport disponible
                          </h3>
                          <p className="text-gray-500 max-w-md mb-6">
                            Ce patient n'a pas encore de rapports enregistrés.
                          </p>
                        </div>
                      ) : rapports.length > 0 ? (
                        rapports.map((rapport: Rapport, index: number) => (
                          <Card
                            key={rapport.id}
                            className="overflow-hidden border border-gray-200 shadow-sm"
                          >
                            <CardHeader className="bg-green-50 py-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg font-medium text-green-800">
                                    {rapport.titre}
                                  </CardTitle>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Par{" "}
                                    {rapport.psychologue?.utilisateur?.prenom}{" "}
                                    {rapport.psychologue?.utilisateur?.nom} •
                                    Mis à jour le{" "}
                                    {formatDate(rapport.updatedAt)}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-green-200 text-green-800 border-green-300">
                                    {rapport.rapportEntries.length} consultation
                                    {rapport.rapportEntries.length > 1
                                      ? "s"
                                      : ""}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-gray-600 hover:bg-gray-100 border-gray-300"
                                    onClick={() =>
                                      downloadRapportAsPDF(rapport)
                                    }
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    PDF
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="py-4">
                              <div className="mb-6">
                                <h4 className="font-medium text-gray-800 mb-3 pb-2 border-b border-gray-200">
                                  Informations de l'étudiant
                                </h4>
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                  <div>
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">Nom :</span>{" "}
                                      {rapport.etudiant.utilisateur.nom}{" "}
                                      {rapport.etudiant.utilisateur.prenom}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">
                                        Email :
                                      </span>{" "}
                                      {rapport.etudiant.utilisateur.email}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">
                                        Téléphone :
                                      </span>{" "}
                                      {rapport.etudiant.utilisateur.telephone ||
                                        "Non renseigné"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">
                                        Date de naissance :
                                      </span>{" "}
                                      {rapport.etudiant.utilisateur
                                        .date_naissance
                                        ? formatDate(
                                            rapport.etudiant.utilisateur
                                              .date_naissance
                                          )
                                        : "Non renseignée"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="mb-6">
                                <h4 className="font-medium text-gray-800 mb-3 pb-2 border-b border-gray-200">
                                  Fiche patient
                                </h4>
                                {rapport.etudiant.fichesPatients ? (
                                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">
                                        Antécédents médicaux :
                                      </span>{" "}
                                      {rapport.etudiant.fichesPatients
                                        .antecedentsMedicaux || "Non renseigné"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">
                                        Antécédents psychologiques :
                                      </span>{" "}
                                      {rapport.etudiant.fichesPatients
                                        .antecedentsPsychologiques ||
                                        "Non renseigné"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">
                                        Allergies :
                                      </span>{" "}
                                      {rapport.etudiant.fichesPatients
                                        .allergies || "Non renseigné"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">
                                        Médicaments actuels :
                                      </span>{" "}
                                      {rapport.etudiant.fichesPatients
                                        .medicamentsActuels || "Non renseigné"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">
                                        Traitements en cours :
                                      </span>{" "}
                                      {rapport.etudiant.fichesPatients
                                        .traitementsEnCours || "Non renseigné"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">
                                        Symptômes actuels :
                                      </span>{" "}
                                      {rapport.etudiant.fichesPatients
                                        .symptomesActuels || "Non renseigné"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">
                                        Objectifs de thérapie :
                                      </span>{" "}
                                      {rapport.etudiant.fichesPatients
                                        .objectifsTherapie || "Non renseigné"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">
                                        Notes du psychologue :
                                      </span>{" "}
                                      {rapport.etudiant.fichesPatients
                                        .notesPsychologue || "Non renseigné"}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-gray-500 italic">
                                    Aucune fiche patient disponible
                                  </p>
                                )}
                              </div>

                              <p className="text-gray-700 mb-4 italic bg-gray-50 p-3 rounded-lg border-l-4 border-gray-300">
                                {rapport.description}
                              </p>

                              <h4 className="font-medium text-gray-800 mb-3 pb-2 border-b border-gray-200">
                                Historique des consultations
                              </h4>
                              {rapport.rapportEntries.length > 0 ? (
                                <div className="space-y-4">
                                  {rapport.rapportEntries.map((entry) => (
                                    <div
                                      key={entry.id}
                                      className="border-l-4 border-green-400 pl-4 py-2 bg-green-50 rounded-r-lg"
                                    >
                                      <div className="flex justify-between items-center mb-1">
                                        <h5 className="font-medium text-green-800">
                                          Consultation du{" "}
                                          {formatDate(entry.dateconsultation)}
                                        </h5>
                                      </div>
                                      <p className="text-gray-600 text-sm">
                                        {entry.resume}
                                      </p>
                                      {entry.observations && (
                                        <p className="text-gray-600 text-sm mt-2 bg-white p-2 rounded border border-green-200">
                                          <span className="font-medium">
                                            Observations :
                                          </span>{" "}
                                          {entry.observations}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">
                                  Aucune consultation enregistrée
                                </p>
                              )}

                              <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-medium text-gray-800 mb-3">
                                  Ajouter un Commentaire
                                </h4>
                                <textarea
                                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:border-green-400 focus:ring-green-200"
                                  rows={4}
                                  placeholder="Saisissez votre commentaire ici..."
                                  value={newComments[rapport.id] || ""}
                                  onChange={(e) =>
                                    setNewComments({
                                      ...newComments,
                                      [rapport.id]: e.target.value,
                                    })
                                  }
                                />
                                <Button
                                  className="mt-2 bg-green-500 hover:bg-green-600 text-white"
                                  onClick={() => {
                                    if (
                                      !rapport.id ||
                                      typeof rapport.id !== "string"
                                    ) {
                                      toast({
                                        title: "Erreur",
                                        description: "ID du rapport invalide.",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    handleSaveComment(
                                      rapport.id,
                                      newComments[rapport.id] || ""
                                    );
                                  }}
                                  disabled={!newComments[rapport.id]?.trim()}
                                >
                                  Sauvegarder le commentaire
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="bg-gray-100 p-6 rounded-full mb-4">
                            <FileText className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-medium text-gray-800 mb-3">
                            Aucun rapport disponible
                          </h3>
                          <p className="text-gray-500 max-w-md mb-6">
                            Ce patient n'a pas encore de rapports enregistrés.
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="tests" className="space-y-6">
                      {rapportsNotFound || rapports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="bg-gray-100 p-6 rounded-full mb-4">
                            <AlertCircle className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-medium text-gray-800 mb-3">
                            Aucun test disponible
                          </h3>
                          <p className="text-gray-500 max-w-md mb-6">
                            Ce patient n'a pas encore passé de tests ou aucun
                            rapport n'est disponible.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h4 className="font-medium text-gray-800 mb-3 pb-2 border-b border-gray-200">
                              Résultats des tests psychologiques
                            </h4>
                            {rapports.some(
                              (rapport) =>
                                rapport.resultatTests &&
                                rapport.resultatTests.length > 0
                            ) ? (
                              <div className="space-y-4">
                                {rapports.flatMap((rapport) =>
                                  rapport.resultatTests.map((test) => (
                                    <Card
                                      key={test.id}
                                      className="border border-gray-200 shadow-sm"
                                    >
                                      <CardHeader className="bg-green-50 py-3">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <CardTitle className="text-lg font-medium text-green-800">
                                              {test.test.titre}
                                            </CardTitle>
                                            <p className="text-sm text-gray-500 mt-1">
                                              Catégorie: {test.test.categorie} •
                                              Passé le:{" "}
                                              {formatDate(test.datePassation)}
                                            </p>
                                          </div>
                                          <Badge className="bg-green-200 text-green-800 border-green-300">
                                            Score: {test.score}
                                          </Badge>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="py-4">
                                        {test.interpretation ? (
                                          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                            <h5 className="font-medium text-green-800 mb-2">
                                              Interprétation
                                            </h5>
                                            <p className="text-gray-700">
                                              {test.interpretation}
                                            </p>
                                          </div>
                                        ) : (
                                          <p className="text-gray-500 italic">
                                            Aucune interprétation disponible
                                            pour ce test
                                          </p>
                                        )}
                                      </CardContent>
                                    </Card>
                                  ))
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">
                                Aucun résultat de test disponible pour ce
                                patient
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="commentaires" className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium text-gray-800">
                            Historique des commentaires
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-600 border-gray-300"
                            onClick={toggleCommentSortOrder}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            {commentSortOrder === "desc"
                              ? "Plus récents d'abord"
                              : "Plus anciens d'abord"}
                          </Button>
                        </div>

                        {rapportsNotFound || rapports.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500">
                              Aucun commentaire disponible pour ce patient
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {sortedRapports
                              .filter(
                                (rapport) =>
                                  rapport.commentaires &&
                                  rapport.commentaires.trim() !== ""
                              )
                              .map((rapport) => (
                                <div
                                  key={rapport.id}
                                  className="border-l-4 border-green-400 pl-4 py-3 bg-green-50 rounded-r-lg"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-medium text-green-800">
                                      {rapport.titre}
                                    </h5>
                                    <span className="text-sm text-gray-500">
                                      {formatDate(rapport.updatedAt)}
                                    </span>
                                  </div>
                                  <p className="text-gray-700">
                                    {rapport.commentaires}
                                  </p>
                                  <div className="mt-2 text-sm text-gray-500">
                                    Par{" "}
                                    {rapport.psychologue?.utilisateur?.prenom}{" "}
                                    {rapport.psychologue?.utilisateur?.nom}
                                  </div>
                                </div>
                              ))}
                            {sortedRapports.every(
                              (rapport) =>
                                !rapport.commentaires ||
                                rapport.commentaires.trim() === ""
                            ) && (
                              <p className="text-gray-500 italic text-center py-4">
                                Aucun commentaire n'a été ajouté
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-3">
                  Sélectionnez un patient
                </h3>
                <p className="text-gray-500 max-w-md">
                  Veuillez sélectionner un patient dans la liste pour voir ses
                  informations et ses rapports.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
