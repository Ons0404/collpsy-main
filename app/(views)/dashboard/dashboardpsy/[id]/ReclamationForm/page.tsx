"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../../components/ui/dialog";
import { Button } from "../../../../../components/ui/button";
import { Label } from "../../../../../components/ui/label";
import Input from "../../../../../components/ui/input"; // Importation nommée
import { Textarea } from "../../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { useToast } from "../../../../../(mvc)/hooks/use-toast";

interface ReclamationFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  userRole: "ETUDIANT" | "PSYCHOLOGUE" | null;
}

const ReclamationForm: React.FC<ReclamationFormProps> = ({
  isOpen,
  onClose,
  userId,
  userRole,
}) => {
  const [category, setCategory] = useState<string>("");
  const [otherCategory, setOtherCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale autorisée est de 5Mo.",
          variant: "destructive",
        });
        event.target.value = "";
        setAttachment(null);
      } else {
        setAttachment(file);
      }
    }
  };

  // Fonction pour créer une notification admin
  const createAdminNotification = async (reclamationId: number) => {
    try {
      const notificationData = {
        title: "Nouvelle réclamation",
        message: `Une nouvelle réclamation a été soumise: ${
          category === "Autre" ? otherCategory : category
        }`,
        reclamationId: reclamationId,
        isUrgent: isUrgent,
      };

      const response = await fetch("/api/notifications/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        console.error("Erreur lors de la création de la notification admin");
      }
    } catch (error) {
      console.error("Erreur notification:", error);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!category || (category === "Autre" && !otherCategory) || !description) {
      toast({
        title: "Champs obligatoires manquants",
        description: "Veuillez remplir la catégorie et la description.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validation utilisateur
    if (!userId || !userRole) {
      toast({
        title: "Erreur",
        description: "Informations d'utilisateur manquantes.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Préparation des données pour l'API
      const formData = new FormData();
      formData.append(
        "categorie",
        category === "Autre" ? otherCategory : category
      );
      formData.append("description", description);
      formData.append("isUrgent", isUrgent.toString());
      formData.append("utilisateurId", userId.toString());
      formData.append("roleUtilisateur", userRole);

      if (attachment) {
        formData.append("pieceJointe", attachment);
      }

      // Appel API
      const response = await fetch("/api/reclamations", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de l'envoi de la réclamation"
        );
      }

      const result = await response.json();

      // Créer une notification pour l'admin après avoir soumis la réclamation avec succès
      if (result.id) {
        await createAdminNotification(result.id);
      }

      toast({
        title: "Réclamation envoyée",
        description: "Votre réclamation a été soumise avec succès.",
      });

      handleClose();
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur s'est produite lors de l'envoi",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCategory("");
    setOtherCategory("");
    setDescription("");
    setAttachment(null);
    setIsUrgent(false);
    const fileInput = document.getElementById(
      "attachment"
    ) as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
    }
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => !open && handleClose()}
    >
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Signaler un problème</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Violence verbale">
                  Violence verbale
                </SelectItem>
                <SelectItem value="Comportement inapproprié">
                  Comportement inapproprié
                </SelectItem>
                <SelectItem value="Problème technique">
                  Problème technique
                </SelectItem>
                <SelectItem value="Autre">Autre (préciser)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {category === "Autre" && (
            <div className="grid gap-2">
              <Label htmlFor="otherCategory">Préciser la catégorie *</Label>
              <Input
                id="otherCategory"
                value={otherCategory}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setOtherCategory(e.target.value)
                }
                placeholder="Autre catégorie"
                required
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="description">Description détaillée *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              placeholder="Décrivez l'incident en détail (date, heure, contexte, personnes impliquées...)."
              required
              rows={5}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="attachment">
              Joindre une preuve (Optionnel, max 5Mo)
            </Label>
            <Input
              id="attachment"
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
            />
            {attachment && (
              <p className="text-sm text-muted-foreground mt-1">
                Fichier sélectionné : {attachment.name}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="urgent"
              checked={isUrgent}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setIsUrgent(e.target.checked)
              }
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <Label
              htmlFor="urgent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Ce signalement nécessite une attention immédiate
            </Label>
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            onClick={(e) => {
              const form = e.currentTarget.closest("div")
                ?.previousElementSibling as HTMLFormElement;
              if (form)
                form.dispatchEvent(
                  new Event("submit", { cancelable: true, bubbles: true })
                );
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Envoi en cours..." : "Soumettre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

console.log("ReclamationForm loaded");
export default ReclamationForm;
