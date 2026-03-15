require("dotenv").config();
const serviceModel = require("./src/models/serviceModel");

async function run() {
  try {
    const allBefore = await serviceModel.findAll();
    console.log("Services avant:", allBefore);

    const created = await serviceModel.create({
      type_repas: "DEJEUNER",
      heure_debut: "12:00:00",
      heure_fin: "14:00:00",
    });
    console.log("Créé:", created);

    const updated = await serviceModel.update(created.id_service, {
      type_repas: "DINER",
      heure_debut: "19:00:00",
      heure_fin: "21:00:00",
    });
    console.log("Mis à jour:", updated);

    const deleted = await serviceModel.deleteById(created.id_service);
    console.log("Supprimé:", deleted);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

run();

