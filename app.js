(() => {
  const toast = document.getElementById("toast");
  let toastTimer;
  const announce = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  };
  const copy = async value => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = value;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.append(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    announce("Copiado: " + value);
  };
  document.querySelectorAll("[data-copy]").forEach(item => item.addEventListener("click", () => copy(item.dataset.copy)));

  const icons = {comenzar:"ballot", alcaldia:"ballot", economia:"coin", progreso:"shulker", comandos:"spark", configuracion:"market"};
  const icon = (name, className = "") => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (className) svg.setAttribute("class", className);
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `assets/obeda-items.svg#${name}`);
    svg.append(use);
    return svg;
  };
  document.querySelectorAll(".panel[data-panel]").forEach(panel => panel.querySelector(".section-head")?.append(icon(icons[panel.dataset.panel], "section-art")));
  document.querySelectorAll(".feature-icon").forEach((item, index) => {
    item.textContent = "";
    item.append(icon(["ballot", "coin", "shulker", "spark", "mob", "shulker", "coin"][index] || "coin"));
  });
  document.querySelectorAll(".reward-card").forEach(card => card.prepend(icon("shulker", "reward-item")));
  document.querySelectorAll(".market-samples > div").forEach(card => card.prepend(icon("market", "market-item")));

  // Los datos dinámicos de PlaceholderAPI pertenecen al servidor; se muestran
  // aquí como referencia técnica sin interrumpir la lectura del jugador.
  const government = document.querySelector(".government-card");
  if (government) {
    const details = document.createElement("details");
    details.className = "technical-detail";
    details.innerHTML = "<summary>Para scoreboards: datos dinámicos de la alcaldía</summary><p>Estos códigos se convierten en nombres y cifras cuando se usan dentro del servidor con PlaceholderAPI.</p>";
    government.replaceWith(details);
    details.append(government);
  }
  const technicalVotes = document.querySelector(".code-cards");
  if (technicalVotes) {
    const previousHeading = technicalVotes.previousElementSibling?.previousElementSibling;
    const previousText = technicalVotes.previousElementSibling;
    const details = document.createElement("details");
    details.className = "technical-detail";
    details.innerHTML = "<summary>Para scoreboards: votos de candidatos</summary>";
    previousHeading?.replaceWith(details);
    if (previousText) details.append(previousText);
    details.append(technicalVotes);
  }
  const rosterTitle = document.getElementById("alcaldes");
  if (rosterTitle) {
    const rosterParts = [rosterTitle, rosterTitle.nextElementSibling, rosterTitle.nextElementSibling?.nextElementSibling, rosterTitle.nextElementSibling?.nextElementSibling?.nextElementSibling, rosterTitle.nextElementSibling?.nextElementSibling?.nextElementSibling?.nextElementSibling].filter(Boolean);
    document.querySelector("#panel-alcaldia .section-head")?.after(...rosterParts);
  }

  const chapters = ["comenzar", "alcaldia", "economia", "progreso", "comandos", "configuracion"];
  const labels = {comenzar:"Empezar", alcaldia:"Alcaldía", economia:"EderCoins y tiendas", progreso:"Recompensas", comandos:"Comandos", configuracion:"Administración"};
  chapters.forEach((chapter, index) => {
    const panel = document.querySelector(`[data-panel="${chapter}"]`);
    const next = chapters[index + 1];
    if (!panel || !next) return;
    const foot = document.createElement("div");
    foot.className = "next-chapter";
    foot.innerHTML = `<span>SEGUIR LEYENDO</span><a href="#${next}">${String(index + 2).padStart(2, "0")} · ${labels[next]} <b>→</b></a>`;
    panel.append(foot);
  });
  const chapterFromHash = () => {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (!hash || hash === "inicio") return "comenzar";
    if (hash === "alcaldes") return "alcaldia";
    const simple = hash.replace(/^panel-/, "");
    if (chapters.includes(simple)) return simple;
    return document.getElementById(hash)?.closest(".panel")?.dataset.panel || "comenzar";
  };
  const activate = (shouldScroll = true) => {
    const active = chapterFromHash();
    chapters.forEach(chapter => {
      const panel = document.querySelector(`[data-panel="${chapter}"]`);
      const tab = document.querySelector(`[data-chapter="${chapter}"]`);
      if (panel) panel.hidden = chapter !== active;
      if (tab) {
        tab.setAttribute("aria-selected", String(chapter === active));
        tab.tabIndex = chapter === active ? 0 : -1;
      }
    });
    const hash = decodeURIComponent(location.hash.slice(1));
    if (shouldScroll) requestAnimationFrame(() => {
      if (hash === "alcaldes") {
        document.getElementById("alcaldes")?.scrollIntoView({block:"start", behavior:"instant"});
      } else {
        const content = document.getElementById("guideContent");
        if (content) window.scrollTo({top: content.getBoundingClientRect().top + window.scrollY - 58, behavior:"instant"});
      }
    });
  };
  window.addEventListener("hashchange", () => activate());
  document.querySelectorAll(".chapter").forEach(tab => tab.addEventListener("keydown", event => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const current = chapters.indexOf(tab.dataset.chapter);
    const next = (current + (event.key === "ArrowRight" ? 1 : -1) + chapters.length) % chapters.length;
    location.hash = chapters[next];
    document.querySelector(`[data-chapter="${chapters[next]}"]`)?.focus();
  }));
  activate(Boolean(location.hash));

  const newMayors = [
    ["ALLAN TURBINA", "Minería", "El Motor de la Isla", "⛏", "#75c7ff", "Mineros y Minero X · +5 % de ritmo", "1 % de ahorro al construir", "Nora Engranaje", "EderCoin: 5 % menos fluctuación"],
    ["DAMIAN CEBOLLA", "Agricultura", "El Hortelano", "🌾", "#9bd776", "Granjeros · +5 % de ritmo", "20 de dinero por ciclo", "Rosa Semilla", "Alimentadores · +3 % de ritmo"],
    ["XAVIER SIN FUENTES", "Pesca", "El Navegante", "🎣", "#7cdde2", "Pescadores · +5 % de ritmo", "Comisión: −0,15 puntos", "Mara Anzuelo", "Recolectores · +2 % de ritmo"],
    ["EDUARDO LA HACE RICA", "Comercio", "El Comerciante", "◈", "#f1c76f", "Vendedores · +5 % de ritmo", "Comisión: −0,2 puntos", "Elsa Cobre", "EderCoin: 5 % menos fluctuación"],
    ["ERICK ROBA RIÑONES", "Caza", "El Cazador", "⚔", "#ed8d85", "Cazadores · +5 % de ritmo", "+4 % de daño a monstruos", "Iris Escudo", "3 % menos daño de monstruos"],
    ["ADRIANO LA CORONA", "Bosques", "El Silvicultor", "🌳", "#8cd1a4", "Taladores · +5 % de ritmo", "1 % de ahorro al construir", "Tina Brote", "Recolectores · +2 % de ritmo"],
    ["ALVARO PLAYA", "Logística", "El Recolector", "▣", "#79d2cd", "Recolectores · +5 % de ritmo", "3 % menos daño de monstruos", "Leo Caja", "Vendedores · +2 % de ritmo"],
    ["ANTOR QUISPE SIN PALA", "Apoyo", "El Ingenioso", "✦", "#bea3ef", "Alimentadores · +5 % de ritmo", "+4 % de experiencia de mobs", "Paz Inventos", "Recicladores compatibles · +3 %"],
    ["Kevin MELANCAJAS", "Reciclaje", "El Reciclador", "♻", "#d1b08a", "Recicladores compatibles · +5 %", "Impuestos: −0,1 puntos", "Mila Fragmento", "Recolectores · +2 % de ritmo"]
  ];
  const roster = document.querySelector(".candidate-roster");
  if (roster) newMayors.forEach(([name, category, title, icon, color, perk, secondary, minister, ministerPerk], index) => {
    const card = document.createElement("article");
    card.className = "candidate-card candidate-new";
    card.style.setProperty("--candidate", color);
    card.innerHTML = `<div class="candidate-identity"><div><span class="candidate-category">${String(index + 5).padStart(2, "0")} · ${category.toUpperCase()}</span><h4>${name}</h4><p>${title}</p></div><div class="skin-stage candidate-item-stage"><span class="candidate-item" aria-hidden="true">${icon}</span></div></div><div class="proposal-label">Plan de gobierno</div><ul class="benefit-list"><li><b>Minions</b><span>${perk}</span></li><li><b>Para la isla</b><span>${secondary}</span></li></ul><div class="minister-profile"><span class="candidate-minister-icon" aria-hidden="true">✦</span><div><small>MINISTRO DEL GOBIERNO</small><b>${minister}</b><span>${ministerPerk}</span></div></div>`;
    roster.append(card);
  });

  // Si el servicio de modelos 3D falla, muestra la cara de la textura real
  // configurada en candidatos.yml para que la ficha nunca quede vacía.
  document.querySelectorAll(".skin-render[data-skin-hash]").forEach(image => {
    const hash = image.dataset.skinHash;
    const requestedType = image.dataset.renderType || "body";
    const render = type => `https://skinrender.dev/render/steve/${type}?skin=${encodeURIComponent(hash)}&size=${type === "body" ? 192 : 128}&yaw=35&pitch=18`;
    const fallback = document.createElement("span");
    fallback.className = "skin-fallback";
    fallback.setAttribute("role", "img");
    fallback.setAttribute("aria-label", image.alt.replace("Modelo 3D", "Skin").replace("Cabeza 3D", "Skin"));
    const front = document.createElement("span");
    front.className = "skin-face-front";
    const hat = document.createElement("span");
    hat.className = "skin-face-hat";
    const skinUrl = `url("https://textures.minecraft.net/texture/${encodeURIComponent(hash)}")`;
    front.style.backgroundImage = skinUrl;
    hat.style.backgroundImage = skinUrl;
    fallback.append(front, hat);
    image.before(fallback);
    image.addEventListener("load", () => { fallback.hidden = true; image.hidden = false; });
    image.addEventListener("error", () => {
      if (!image.dataset.mcHeadsFallback) {
        image.dataset.mcHeadsFallback = "true";
        image.src = `https://mc-heads.net/${requestedType === "body" ? "body" : "head"}/${encodeURIComponent(hash)}/${requestedType === "body" ? 128 : 64}`;
        return;
      }
      image.hidden = true;
      fallback.hidden = false;
    });
    image.src = render(requestedType);
  });
})();

