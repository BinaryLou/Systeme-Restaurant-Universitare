import { loginStudent } from "./api/authApi";

const testLogin = async () => {
  try {
    const res = await loginStudent({
      apogee: "A1234",
      password: "Password123!",
    });

    console.log("Login OK:", res);
  } catch (error) {
    console.log("Erreur:", error.message);
  }
};