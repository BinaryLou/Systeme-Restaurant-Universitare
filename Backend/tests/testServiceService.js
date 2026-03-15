require("dotenv").config();
const serviceService = require("../src/services/serviceService");

(async () => {
  try {
    const services = await serviceService.getAllServices();
    console.log("All services:", services);

    const oneService = await serviceService.getServiceById(1);
    console.log("Service 1:", oneService);

    const updated = await serviceService.updateService(1, {
      type_repas: "DEJEUNER",
      heure_debut: "12:00",
      heure_fin: "14:00",
    });
    console.log("Updated:", updated);

    const deleted = await serviceService.deleteService(2);
    console.log("Deleted:", deleted);

  } catch (error) {
    console.error(error.message);
    console.error(error.statusCode || 500);
  }
})();