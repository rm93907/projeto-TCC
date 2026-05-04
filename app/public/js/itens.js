// itens.js — adiciona produtos ao carrinho (página de detalhes + cards de listagem)

document.addEventListener("DOMContentLoaded", () => {

  /* ─── Notificação toast ─────────────────────────── */
  function mostrarToast(mensagem, icone = "✅") {
    let el = document.getElementById("floria-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "floria-toast";
      el.style.cssText = `
        position: fixed; bottom: 28px; right: 28px; z-index: 9999;
        background: #1a3d2b; color: #fff;
        padding: 13px 20px; border-radius: 12px;
        font-family: 'Lato', sans-serif; font-size: 14px;
        display: flex; align-items: center; gap: 10px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.22);
        opacity: 0; transform: translateY(12px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: none;
        border-left: 3px solid #b8945f;
      `;
      document.body.appendChild(el);
    }
    el.innerHTML = `<span>${icone}</span><span>${mensagem}</span>`;
    // Animar entrada
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(12px)";
    }, 2500);
  }

  /* ─── Salvar no localStorage ────────────────────── */
  function adicionarAoCarrinho(nome, preco, imagem) {
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const existente = carrinho.find(p => p.nome === nome);
    if (existente) {
      existente.quantidade++;
    } else {
      carrinho.push({ nome, preco: parseFloat(preco), imagem, quantidade: 1 });
    }
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    mostrarToast(`"${nome}" adicionado ao carrinho!`);
  }

  /* ─── Página de DETALHES (.btn-add) ────────────── */
  const btnAdd = document.querySelector(".btn-add");
  if (btnAdd) {
    btnAdd.addEventListener("click", () => {
      const nome  = document.querySelector("h1")?.innerText.trim() || "Produto";
      const preco = parseFloat(
        (document.querySelector(".preco-novo")?.innerText || "0")
          .replace(/[^\d,]/g, "").replace(",", ".")
      );
      const imagem = document.querySelector(".imagem-principal img")?.src || "";
      adicionarAoCarrinho(nome, preco, imagem);
    });
  }

  /* ─── Cards de listagem (.btn-comprar) ────────── */
  // Usar delegação de eventos para cobrir cards carregados dinamicamente
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-comprar");
    if (!btn) return;

    // Impede que o clique no botão navegue para o <a> pai
    e.preventDefault();
    e.stopPropagation();

    const card = btn.closest(".card");
    if (!card) return;

    const nome   = card.querySelector("h3, h4")?.innerText.trim() || "Produto";
    const preco  = parseFloat(
      (card.querySelector(".price")?.innerText || "0")
        .replace(/[^\d,]/g, "").replace(",", ".")
    );
    const imagem = card.querySelector("img")?.src || "";

    adicionarAoCarrinho(nome, preco, imagem);

    // Feedback visual no próprio botão
    btn.textContent = "✓ Adicionado";
    btn.style.background = "#b8945f";
    setTimeout(() => {
      btn.textContent = "Comprar";
      btn.style.background = "";
    }, 1500);
  });

});
