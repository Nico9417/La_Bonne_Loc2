document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {
      email: form.get("email"),
      mot_de_passe: form.get("mot_de_passe")
    };
  
    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ important pour envoyer les cookies
        body: JSON.stringify(data)
      });
  
      const result = await res.json();
      if (result.success) {
        document.getElementById("loginMessage").innerHTML = `<p style="color: green;">Bienvenue ${result.user.nom} !</p>`;
        setTimeout(() => window.location.href = "Home.html", 1500);
      } else {
        document.getElementById("loginMessage").innerHTML = `<p style="color: red;">${result.message}</p>`;
      }
    } catch (err) {
      console.error("Erreur login:", err);
      document.getElementById("loginMessage").innerHTML = `<p style="color: red;">Erreur serveur</p>`;
    }
  });