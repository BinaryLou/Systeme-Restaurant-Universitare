async function run() {
  try {
    const response = await fetch("http://localhost:5000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: "invalid-token",
        new_password: "Password123!",
        confirm_password: "Password123!"
      })
    });
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Data:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
