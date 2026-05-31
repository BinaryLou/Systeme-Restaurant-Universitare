import React from "react";

const UserRow = ({ user, onEdit, onDelete, onAdjustBalance }) => {
  return (
    <tr className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
      <td className="p-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
            {user.prenom[0]}
            {user.nom[0]}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.prenom} {user.nom}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="p-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
          {user.apogee}
        </div>
      </td>
      <td className="p-4 whitespace-nowrap">
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {user.solde ? `${Number(user.solde).toFixed(2)} MAD` : "0.00 MAD"}
        </span>
      </td>
      <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onAdjustBalance(user)}
          className="text-emerald-600 hover:text-emerald-900 mr-3 font-semibold bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-md transition-colors"
          title="Recharger solde"
        >
          Solde
        </button>
        <button
          onClick={() => onEdit(user)}
          className="text-blue-600 hover:text-blue-900 mr-3 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
        >
          Modifier
        </button>
        <button
          onClick={() => onDelete(user.id_utilisateur)}
          className="text-red-600 hover:text-red-900 font-semibold bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
        >
          Supprimer
        </button>
      </td>
    </tr>
  );
};

export default UserRow;
