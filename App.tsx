import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { ProfileModal } from "./ProfileModal";
import { Toaster, toast } from "sonner";
import { useState, useEffect } from "react";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">🎓 Forum SMP</h1>
            <p className="text-sm text-gray-600">Plateforme d'échange pour étudiants SMP</p>
          </div>
          <Authenticated>
            <div className="flex items-center gap-3">
              <ProfileButton />
              <SignOutButton />
            </div>
          </Authenticated>
        </div>
      </header>
      
      <main className="flex-1 max-w-6xl mx-auto w-full p-4">
        <Authenticated>
          <ForumContent />
        </Authenticated>
        <Unauthenticated>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue</h2>
                <p className="text-gray-600">Connectez-vous pour accéder au forum</p>
              </div>
              <SignInForm />
            </div>
          </div>
        </Unauthenticated>
      </main>
      <Toaster />
    </div>
  );
}

function ProfileButton() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const currentProfile = useQuery(api.profiles.getCurrentUserProfile);
  
  return (
    <>
      <button
        onClick={() => setShowProfileModal(true)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
      >
        👤 {currentProfile?.displayName || "Profil"}
      </button>
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </>
  );
}

function ForumContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  
  const messages = useQuery(api.messages.list, { category: selectedCategory });
  const categories = useQuery(api.categories.list);
  const initCategories = useMutation(api.categories.initializeDefaultCategories);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  
  useEffect(() => {
    if (categories && categories.length === 0) {
      initCategories();
    }
  }, [categories, initCategories]);
  
  if (!messages || !categories || !loggedInUser) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-24">
          <h3 className="font-semibold text-gray-900 mb-4">Catégories</h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                !selectedCategory 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 Tous les messages
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category.name)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedCategory === category.name
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span 
                  className="inline-block w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: category.color }}
                ></span>
                {category.name}
              </button>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <button
              onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
              className="w-full bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              📢 Faire une annonce
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Message form */}
        <MessageForm selectedCategory={selectedCategory} categories={categories} />
        
        {/* Announcement form */}
        {showAnnouncementForm && (
          <AnnouncementForm 
            selectedCategory={selectedCategory} 
            categories={categories}
            onClose={() => setShowAnnouncementForm(false)}
          />
        )}
        
        {/* Messages list */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-500">Aucun message dans cette catégorie</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageCard key={message._id} message={message} currentUserId={loggedInUser._id} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MessageForm({ selectedCategory, categories }: { 
  selectedCategory?: string; 
  categories: Array<{ _id: Id<"categories">; name: string; color: string }>;
}) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(selectedCategory || "");
  const sendMessage = useMutation(api.messages.sendMessage);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    try {
      await sendMessage({ 
        content: content.trim(),
        category: category || undefined
      });
      setContent("");
      toast.success("Message envoyé !");
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="font-semibold text-gray-900 mb-4">💬 Nouveau message</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écrivez votre message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            required
          />
        </div>
        <button
          type="submit"
          disabled={!content.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}

function AnnouncementForm({ 
  selectedCategory, 
  categories, 
  onClose 
}: { 
  selectedCategory?: string; 
  categories: Array<{ _id: Id<"categories">; name: string; color: string }>;
  onClose: () => void;
}) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(selectedCategory || "");
  const [password, setPassword] = useState("");
  const sendAnnouncement = useMutation(api.messages.sendAnnouncement);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !password) return;
    
    try {
      await sendAnnouncement({ 
        content: content.trim(),
        password,
        category: category || undefined
      });
      setContent("");
      setPassword("");
      onClose();
      toast.success("Annonce publiée !");
    } catch (error) {
      toast.error("Mot de passe incorrect ou erreur lors de la publication");
    }
  };
  
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-orange-800">📢 Nouvelle annonce officielle</h3>
        <button
          onClick={onClose}
          className="text-orange-600 hover:text-orange-800"
        >
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contenu de l'annonce..."
            className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
            required
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe secret pour les annonces"
            className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!content.trim() || !password}
            className="bg-orange-600 text-white px-6 py-2 rounded-md font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Publier l'annonce
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-400 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageCard({ 
  message, 
  currentUserId 
}: { 
  message: any; 
  currentUserId: Id<"users">;
}) {
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const authorProfile = useQuery(api.profiles.getUserProfile, { userId: message.authorId });
  
  const handleDelete = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      try {
        await deleteMessage({ messageId: message._id });
        toast.success("Message supprimé");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };
  
  const isAnnouncement = message.type === "announcement";
  
  return (
    <div className={`rounded-lg border p-4 ${
      isAnnouncement 
        ? 'bg-orange-50 border-orange-200' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {isAnnouncement && <span className="text-orange-600">📢</span>}
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {authorProfile?.displayName || message.authorName}
            </span>
            {authorProfile?.className && (
              <span className="text-xs text-gray-500">{authorProfile.className}</span>
            )}
          </div>
          {message.category && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {message.category}
            </span>
          )}
          {isAnnouncement && (
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
              ANNONCE OFFICIELLE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{new Date(message._creationTime).toLocaleString('fr-FR')}</span>
          {message.authorId === currentUserId && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 ml-2"
              title="Supprimer"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      <div className="text-gray-800 whitespace-pre-wrap">{message.content}</div>
      {authorProfile?.bio && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 italic">{authorProfile.bio}</p>
        </div>
      )}
    </div>
  );
}
