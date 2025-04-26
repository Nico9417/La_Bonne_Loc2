document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {
      nom: form.get("nom"),
      email: form.get("email"),
      mot_de_passe: form.get("mot_de_passe"),
      role: form.get("role")
    };
  
    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
  
      const result = await res.json();
  
      if (result.success) {
        document.getElementById("registerMessage").innerHTML = `<p style="color: #00ffb8;">Inscription réussie ! Redirection...</p>`;
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        document.getElementById("registerMessage").innerHTML = `<p style="color: red;">${result.message}</p>`;
      }
    } catch (err) {
      console.error("Erreur inscription:", err);
      document.getElementById("registerMessage").innerHTML = `<p style="color: red;">Erreur serveur</p>`;
    }
  });