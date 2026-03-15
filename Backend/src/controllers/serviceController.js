const serviceService = require("../services/serviceService");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");

// GET /api/services
const getServices = async (req, res, next) => {
    try {
        const services = await serviceService.getAllServices();

        return sendSuccess(
            res,
            services,
            "Services récupérés avec succès",
            200
        );
    } catch (error) {
        return next(error);
    }
};

// POST /api/services
const createService = async (req, res, next) => {
    try {
        const { type_repas, heure_debut, heure_fin } = req.body;

        const createdService = await serviceService.createService({
            type_repas,
            heure_debut,
            heure_fin,
        });

        return sendSuccess(
            res,
            createdService,
            "Service créé avec succès",
            201
        );
    } catch (error) {
        return next(error);
    }
};

// PUT /api/services/:id
const updateService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type_repas, heure_debut, heure_fin } = req.body;

        const updatedService = await serviceService.updateService(id, {
            type_repas,
            heure_debut,
            heure_fin,
        });

        if (!updatedService) {
            return next(new AppError("Service introuvable", 404));
        }

        return sendSuccess(
            res,
            updatedService,
            "Service mis à jour avec succès",
            200
        );
    } catch (error) {
        return next(error);
    }
};

// DELETE /api/services/:id
const deleteService = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deleted = await serviceService.deleteService(id);

        if (!deleted) {
            return next(new AppError("Service introuvable", 404));
        }

        return sendSuccess(
            res,
            null,
            "Service supprimé avec succès",
            200
        );
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getServices,
    createService,
    updateService,
    deleteService,
};