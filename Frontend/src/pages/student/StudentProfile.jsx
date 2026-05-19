import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { changePassword } from "../../api/authApi";
import { 
  User, 
  Wallet, 
  KeyRound, 
  LogOut, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff 
} from "lucide-react";

const StudentProfile = () => {
  const { user, logout } = useAuth();
  
  const student = user || JSON.parse(localStorage.getItem("user") || "null");
  const firstName = student?.prenom || "Mohammed";
  const lastName = student?.nom || "ALAMI";
  const apogee = student?.apogee || "20220001";
  const solde = student?.solde ?? 600;

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus({ type: "", message: "" });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: "error", message: "Les mots de passe ne correspondent pas." });
      return;
    }

    if (formData.newPassword.length < 8) {
      setStatus({ type: "error", message: "Le nouveau mot de passe doit contenir au moins 8 caractères." });
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        old_password: formData.oldPassword,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword
      });
      
      setStatus({ type: "success", message: "Mot de passe mis à jour avec succès !" });
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setStatus({ 
        type: "error", 
        message: error.message || "Une erreur est survenue lors de la mise à jour." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 lg:px-8 lg:py-8">
      {/* HEADER SECTION */}
      <section className="rounded-[18px] bg-[#1d4fed] px-6 py-8 lg:px-12 lg:py-10 text-white shadow-xl shadow-blue-900/20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full">
            <div className="flex h-16 w-16 lg:h-20 lg:w-20 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-2xl lg:text-3xl font-bold uppercase">
              {firstName.charAt(0)}{lastName.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                {firstName} {lastName}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-blue-100 text-sm lg:text-base">
                <span className="font-semibold bg-white/15 px-3 py-1 rounded-lg">Apogée : {apogee}</span>
              </div>
            </div>
          </div>

          <div className="flex w-full lg:w-auto lg:min-w-[250px] items-center gap-4 rounded-2xl border border-white/20 bg-white/15 px-5 py-4 backdrop-blur">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] lg:text-xs font-medium uppercase tracking-widest text-blue-100">
                Solde actuel
              </p>
              <p className="text-2xl lg:text-3xl font-bold">{solde} DH</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PASSWORD FORM */}
        <div className="lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <KeyRound size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Sécurité</h2>
                <p className="text-sm text-slate-500">Mettez à jour votre mot de passe</p>
              </div>
            </div>

            {status.message && (
              <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {status.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
                <p className="text-sm font-medium">{status.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ancien mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword.old ? "text" : "password"}
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all pr-12"
                    placeholder="Entrez votre ancien mot de passe"
                  />
                  <button type="button" onClick={() => togglePasswordVisibility('old')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword.old ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all pr-12"
                    placeholder="Au moins 8 caractères"
                  />
                  <button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all pr-12"
                    placeholder="Répétez le nouveau mot de passe"
                  />
                  <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? "Mise à jour en cours..." : "Mettre à jour le mot de passe"}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* SIDEBAR INFO & LOGOUT */}
        <div className="lg:col-span-1 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4">
              <User size={32} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Informations du compte</h3>
            <p className="text-sm text-slate-500 mt-1">Géré par l'administration</p>
            
            <div className="mt-6 space-y-3 text-sm text-left border-t border-slate-100 pt-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Rôle</span>
                <span className="font-semibold text-slate-900">Étudiant</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Statut</span>
                <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">Actif</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm">
            <h3 className="font-bold text-red-900 mb-2">Déconnexion</h3>
            <p className="text-sm text-red-700/80 mb-5">Fermez votre session en toute sécurité sur cet appareil.</p>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-100 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-200 transition-colors"
            >
              <LogOut size={18} />
              Se déconnecter
            </button>
          </section>
        </div>

      </div>
    </div>
  );
};

export default StudentProfile;
