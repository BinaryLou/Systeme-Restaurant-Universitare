import React, { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import UserRow from "../../components/admin/UserRow";
import UserFormModal from "../../components/admin/UserFormModal";
import AdjustBalanceModal from "../../components/admin/AdjustBalanceModal";
import toast from "react-hot-toast";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getUsers(searchTerm);
      // data is already the array because adminApi returns response.data
      setUsers(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la récupération des utilisateurs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsFormModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const handleAdjustBalance = (user) => {
    setSelectedUser(user);
    setIsBalanceModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      try {
        await adminApi.deleteUser(id);
        toast.success("Utilisateur supprimé avec succès.");
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || "Erreur lors de la suppression.");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedUser) {
        await adminApi.updateUser(selectedUser.id_utilisateur, formData);
        toast.success("Utilisateur modifié avec succès.");
      } else {
        await adminApi.createUser(formData);
        toast.success("Utilisateur créé avec succès.");
      }
      setIsFormModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  };

  const handleBalanceSubmit = async (amount) => {
    try {
      await adminApi.adjustUserBalance(selectedUser.id_utilisateur, amount);
      toast.success("Solde ajusté avec succès.");
      setIsBalanceModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajustement du solde.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-500 mt-1">Gérez le catalogue des étudiants et leurs soldes</p>
        </div>
        <button
          onClick={handleAddUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouvel Étudiant
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou Apogée..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Étudiant</th>
                <th className="p-4 font-semibold">Code Apogée</th>
                <th className="p-4 font-semibold">Solde</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    Chargement des utilisateurs...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserRow
                    key={user.id_utilisateur}
                    user={user}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onAdjustBalance={handleAdjustBalance}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedUser}
      />

      <AdjustBalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        onSubmit={handleBalanceSubmit}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersManagement;
