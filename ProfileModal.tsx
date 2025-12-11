import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [className, setClassName] = useState("");
  const [bio, setBio] = useState("");
  
  const currentProfile = useQuery(api.profiles.getCurrentUserProfile);
  const updateProfile = useMutation(api.profiles.updateProfile);
  
  useEffect(() => {
    if (currentProfile) {
      setDisplayName(currentProfile.displayName || "");
      setClassName(currentProfile.className || "");
      setBio(currentProfile.bio || "");
    }
  }, [currentProfile]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({
        displayName: displayName.trim(),
        className: className.trim(),
        bio: bio.trim(),
      });
      toast.success("Profil mis à jour !");
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    }
  };
  
  if (!isOpen) return null;

  // Générer les classes du collège (6ème à 3ème)
  const collegeClasses: string[] = [];
  for (let niveau = 6; niveau >= 3; niveau--) {
    for (let classe = 1; classe <= 8; classe++) {
      collegeClasses.push(`${niveau}0${classe}`);
    }
  }

  // Générer les classes du lycée (2nde, 1ère, Terminale)
  const lyceeClasses: string[] = [];
  const niveauxLycee = [
    { code: "2nd", label: "2nde" },
    { code: "1er", label: "1ère" },
    { code: "Ter", label: "Terminale" }
  ];
  
  niveauxLycee.forEach(niveau => {
    for (let classe = 1; classe <= 12; classe++) {
      const classeNum = classe < 10 ? `0${classe}` : `${classe}`;
      lyceeClasses.push(`${niveau.code}${classeNum}`);
    }
  });

  // Autres
  const autresClasses = ["Professeur", "Administration", "Personnel"];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[80vh] overflow-y-auto my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">👤 Mon Profil</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'affichage
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Votre nom ou pseudonyme"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classe
            </label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner votre classe</option>
              
              <optgroup label="🏫 Lycée">
                {lyceeClasses.map((classe) => (
                  <option key={classe} value={classe}>{classe}</option>
                ))}
              </optgroup>
              
              <optgroup label="🏫 Collège">
                {collegeClasses.map((classe) => (
                  <option key={classe} value={classe}>{classe}</option>
                ))}
              </optgroup>
              
              <optgroup label="👨‍🏫 Personnel">
                {autresClasses.map((classe) => (
                  <option key={classe} value={classe}>{classe}</option>
                ))}
              </optgroup>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Biographie
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Parlez-nous de vous... (optionnel)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {bio.length}/200 caractères
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!displayName.trim() || !className}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sauvegarder
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
