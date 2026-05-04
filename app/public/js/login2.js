document.querySelectorAll(".js-signup").forEach(btn => {
  btn.addEventListener("click", () => {
    document.body.className = "sign-up-js";
  });
});

document.querySelectorAll(".js-signin").forEach(btn => {
  btn.addEventListener("click", () => {
    document.body.className = "sign-in-js";
  });
});

async function enviarFormulario(form, rota, msgId) {
  const dados = Object.fromEntries(new FormData(form).entries());
  const msg = document.getElementById(msgId);
  msg.textContent = "";
  msg.className = "mensagem";
  try {
    const res = await fetch(rota, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });
    const data = await res.json();
    if (!res.ok) {
      msg.textContent = data.errors ? data.errors.map(e => e.msg).join(" • ") : data.message || "Erro.";
      msg.classList.add("erro");
    } else {
      msg.textContent = data.message || "Sucesso!";
      msg.classList.add("sucesso");
      form.reset();
    }
  } catch {
    msg.textContent = "Falha de conexão com o servidor.";
    msg.classList.add("erro");
  }
}

document.getElementById("login-form")?.addEventListener("submit", e => {
  e.preventDefault();
  enviarFormulario(e.target, "/login", "login-msg");
});

document.getElementById("cadastro-form")?.addEventListener("submit", e => {
  e.preventDefault();
  enviarFormulario(e.target, "/cadastro", "cadastro-msg");
});