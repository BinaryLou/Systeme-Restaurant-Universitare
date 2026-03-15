const serviceModel = require("../models/serviceModel");
const AppError = require("../utils/AppError");

async function getAllServices() {
  return await serviceModel.findAll();
}

async function getServiceById(idService) {
  const service = await serviceModel.findById(idService);

  if (!service) {
    throw new AppError("Service introuvable", 404);
  }

  return service;
}

async function createService({ type_repas, heure_debut, heure_fin }) {
  const createdService = await serviceModel.create({
    type_repas,
    heure_debut,
    heure_fin,
  });

  return createdService;
}

async function updateService(idService, { type_repas, heure_debut, heure_fin }) {
  const existingService = await serviceModel.findById(idService);

  if (!existingService) {
    throw new AppError("Service introuvable", 404);
  }

  const result = await serviceModel.update(idService, {
    type_repas,
    heure_debut,
    heure_fin,
  });

  if (!result.affectedRows || !result.service) {
    throw new AppError("Échec de mise à jour du service", 500);
  }

  return result.service;
}

async function deleteService(idService) {
  const existingService = await serviceModel.findById(idService);

  if (!existingService) {
    throw new AppError("Service introuvable", 404);
  }

  try {
    const result = await serviceModel.deleteById(idService);

    if (!result.affectedRows) {
      throw new AppError("Échec de suppression du service", 500);
    }

    return {
      deleted: true,
      id_service: Number(idService),
    };
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new AppError(
        "Suppression impossible : ce service est déjà lié à un ou plusieurs menus",
        409
      );
    }

    throw error;
  }
}

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};