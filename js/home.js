console.log("✅ home.js chargé !");

document.addEventListener("DOMContentLoaded", async () => {
  const userInfoDiv = document.getElementById("userInfo");
  const userIconBtn = document.getElementById("userIcon");

  try {
    const res = await fetch("http://localhost:3000/me", {
      credentials: "include"
    });

    const result = await res.json();

    if (result.loggedIn) {
      const email = result.user.email;

      // 🔹 Contenu du menu utilisateur
      userInfoDiv.innerHTML = `
        <strong>Email :</strong><br>${email}<br><br>
        <button id="compteBtn" class="btn btn-primary btn-sm w-100 mb-2">Compte</button>
        <button id="logoutBtn" class="btn btn-danger btn-sm w-100">Déconnexion</button>
      `;
      userInfoDiv.style.display = "none";
      userIconBtn.style.display = "inline-block";

      // 🔹 Toggle affichage
      userIconBtn.addEventListener("click", () => {
        userInfoDiv.style.display =
          userInfoDiv.style.display === "none" ? "block" : "none";
      });

      // 🔹 Déconnexion
      document.getElementById("logoutBtn").addEventListener("click", async () => {
        try {
          const res = await fetch("http://localhost:3000/logout", {
            method: "POST",
            credentials: "include"
          });
          const result = await res.json();
          if (result.success) {
            window.location.reload();
          }
        } catch (err) {
          console.error("Erreur lors de la déconnexion :", err);
        }
      });

      // 🔹 Redirection vers compte
      document.getElementById("compteBtn").addEventListener("click", () => {
        window.location.href = "compte.html";
      });

    } else {
      userIconBtn.style.display = "none";
    }
  } catch (err) {
    console.error("Erreur lors de la vérification de session :", err);
  }
});