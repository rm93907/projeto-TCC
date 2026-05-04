
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".carrinho-esquerda");
  const resumoTotal = document.querySelector(".total span");
  const produtosSpan = document.querySelector(".carrinho-direita p span");

  function carregarCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    container.innerHTML = "<h2>Produtos</h2>";

    if (carrinho.length === 0) {
      container.innerHTML += "<p>Seu carrinho está vazio.</p>";
      resumoTotal.textContent = "R$ 0,00";
      produtosSpan.textContent = "R$ 0,00";
      return;
    }

    let total = 0;

    carrinho.forEach((item, index) => {
      // Extrai apenas o valor numérico do preço (caso venha com R$)
      const precoNumerico = parseFloat(
        String(item.preco).replace("R$", "").replace(",", ".").trim()
      );

      const subtotal = precoNumerico * item.quantidade;
      total += subtotal;

      const artigo = document.createElement("article");
      artigo.classList.add("produto");
      artigo.innerHTML = `
        <img src="${item.imagem}" alt="${item.nome}">
        <section class="info">
          <h3>${item.nome}</h3>
          <p class="preco">R$ ${precoNumerico.toFixed(2).replace(".", ",")}</p>
          <button class="remover" data-index="${index}">Excluir</button>
          <section class="quantidade" aria-label="Quantidade">
            <button class="diminuir" data-index="${index}">-</button>
            <span>${item.quantidade}</span>
            <button class="aumentar" data-index="${index}">+</button>
          </section>
        </section>
      `;
      container.appendChild(artigo);
    });

    resumoTotal.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
    produtosSpan.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
    adicionarEventos();
  }

  function adicionarEventos() {
    document.querySelectorAll(".remover").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        carrinho.splice(index, 1);
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        carregarCarrinho();
      })
    );

    document.querySelectorAll(".aumentar").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        carrinho[index].quantidade++;
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        carregarCarrinho();
      })
    );

    document.querySelectorAll(".diminuir").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        if (carrinho[index].quantidade > 1) {
          carrinho[index].quantidade--;
        } else {
          carrinho.splice(index, 1);
        }
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        carregarCarrinho();
      })
    );
  }

  carregarCarrinho();
});
