(() => {
  const season = document.createElement("button");
  season.type = "button";
  season.className = "season-toggle";
  const october = new Date().getMonth() === 9;
  const savedSeason = sessionStorage.getItem("obeda-season");
  const showHalloween = savedSeason === "halloween" || (savedSeason !== "normal" && october);
  const setSeason = active => {
    document.documentElement.dataset.season = active ? "halloween" : "normal";
    season.textContent = active ? "☾ Halloween" : "☾ Ver Halloween";
    season.setAttribute("aria-pressed", String(active));
  };
  setSeason(showHalloween);
  season.addEventListener("click", () => {
    const active = document.documentElement.dataset.season !== "halloween";
    sessionStorage.setItem("obeda-season", active ? "halloween" : "normal");
    setSeason(active);
  });
  document.querySelector(".top-actions")?.prepend(season);

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
    ["Allan Turbina", "Minería", "El Motor de la Isla", "288c71de4cbd0b09606a5ff9db1805a769003ab2639e4478a9c6aea9d12dc7d6", "#75c7ff", "Mineros · +5 % de ritmo", "1 % de ahorro al construir", "Nora Engranaje", "EderCoin: 5 % menos fluctuación", "782fe211ea4e6cb0503025ac94f0f99d42ff97fcb5009004081db3aa0bbf9076", "Minería", "Recolectores · +2 % de ritmo", "Vendedores · +2 % de ritmo"],
    ["Damián Cebolla", "Agricultura", "El Hortelano", "68c986799bafe7184a8ae233db6d9ab8e9b844fa9d4da68fa3dc94ac8fe820", "#9bd776", "Granjeros · +5 % de ritmo", "15 de dinero por ciclo", "Rosa Semilla", "Alimentadores · +3 % de ritmo", "fea30b2b041d3471c7d02e5dd14276831c9f48fd78a1f3f0c13676c5306a51ac", "Agricultura", "Recolectores · +2 % de ritmo", "Vendedores · +2 % de ritmo"],
    ["Xavier Sin Fuentes", "Pesca", "El Navegante", "7c5b78e2d7f9e658fd392f299eac802ec3cd5c9a2c8ea662ee56169875983a90", "#7cdde2", "Pescadores · +5 % de ritmo", "Comisión: −0,15 puntos", "Mara Anzuelo", "Recolectores · +2 % de ritmo", "419e0397d35510f73864310daca966036518ef7e4e20fd3c2e3185840e4141cf", "Pesca", "Alimentadores · +2 % de ritmo", "EderCoin: 3 % menos fluctuación"],
    ["Eduardo La Hace Rica", "Comercio", "El Comerciante", "864d431651d8ce7da2d8f88dd822d9557d7bcf9b0b5d0a8ed13b989881fadbef", "#f1c76f", "Vendedores · +5 % de ritmo", "Comisión: −0,2 puntos", "Elsa Cobre", "EderCoin: 5 % menos fluctuación", "2b22704f661666f6ff7b8c0ad8dba0cd783485f13df884785d47f127a025c89d", "", "Recolectores · +2 % de ritmo", "10 de dinero por ciclo"],
    ["Erick Roba Riñones", "Caza", "El Cazador", "8e8097b931ceea98ce1b5bad485d756959b374a5ef674236d14ec43186125d", "#ed8d85", "Cazadores · +5 % de ritmo", "+4 % de daño a monstruos", "Iris Escudo", "3 % menos daño de monstruos", "49198eb5e65007deceec1ef57270d2ca5eba151fe52fd9a4aa78410d1b3b53fa", "", "+4 % de experiencia de monstruos", "Leales +6 % de fuerza en un golpe"],
    ["Adriano La Corona", "Bosques", "El Silvicultor", "85d175c1c9a86559900a61d690e2f354b8d13f9f144a4ce858cf0cf93a78ae12", "#8cd1a4", "Taladores · +5 % de ritmo", "1 % de ahorro al construir", "Tina Brote", "Recolectores · +2 % de ritmo", "63c143640079253eff861872b6c5580c755eda6bdc3ff74a9846d0ce790c7b2e", "Tala", "Granjeros · +2 % de ritmo", "Vendedores · +2 % de ritmo"],
    ["Álvaro Playa", "Logística", "El Recolector", "69a600ab0a83097065b95ae284f8059961774609adb3dbd3a4ca269d44409551", "#79d2cd", "Recolectores · +5 % de ritmo", "3 % menos daño de monstruos", "Leo Caja", "Vendedores · +2 % de ritmo", "72a1d9654d81f86bdb13db2d8dcc90baaa049ace52d2b6e27f719d2f93217c10", "", "Vendedores · +2 % de ritmo", "0,5 % de ahorro al construir"],
    ["Antor Quispe Sin Pala", "Apoyo", "El Ingenioso", "64f5abf40c36fd699148154aed1644d4d1db628670c129d48d02935b2bf33a63", "#bea3ef", "Alimentadores · +5 % de ritmo", "+4 % de experiencia de mobs", "Paz Inventos", "Vendedores · +2 % de ritmo", "17cad9f27d74de3e59f2a517d04a282e2cf86e4c5e40639daeca7b1aae7f5a71", "", "Recolectores · +2 % de ritmo", "2 % menos daño de monstruos"],
    ["Kevin Melancajas", "Reciclaje", "El Reciclador", "187fcccae4c56b1969e6dcfdd7a9921667ffb3c25968cd187e0d7ba45bae37fb", "#d1b08a", "Vendedores · +5 % de ritmo", "Impuestos: −0,1 puntos", "Mila Fragmento", "Recolectores · +2 % de ritmo", "3d487a79a0117338feaddbd2f2ac4e896643f9bd9612ad865a84d41ed8f9f0", "", "Recolectores · +2 % de ritmo", "0,5 % de ahorro al construir"]
  ];
  const roster = document.querySelector(".candidate-roster");
  if (roster) newMayors.forEach(([name, category, title, skin, color, perk, secondary, minister, ministerPerk, ministerSkin, petCategory, bonus, ministerBonus], index) => {
    const card = document.createElement("article");
    card.className = "candidate-card candidate-new";
    card.style.setProperty("--candidate", color);
    const petLine = petCategory
      ? `Todas las mascotas +1,3 %; las de ${petCategory.toLowerCase()} llegan a +3,3 % de estadísticas.`
      : "Todas las mascotas +1,3 % de estadísticas.";
    card.innerHTML = `<div class="candidate-identity"><div><span class="candidate-category">${String(index + 5).padStart(2, "0")} · ${category.toUpperCase()}</span><h4>${name}</h4><p>${title}</p></div><div class="skin-stage candidate-item-stage"><span class="skin-pedestal"></span><img class="skin-render" data-render-type="body" data-skin-hash="${skin}" alt="Modelo 3D de cuerpo completo de ${name}" loading="lazy"></div></div><div class="proposal-label">Plan de gobierno</div><ul class="benefit-list"><li><b>Minions</b><span>${perk}</span></li><li><b>Para la isla</b><span>${secondary}</span></li><li><b>Apoyo</b><span>${bonus}</span></li><li><b>EderusPets</b><span>${petLine}</span></li></ul><div class="minister-profile"><img class="skin-render minister-skin" data-render-type="head" data-skin-hash="${ministerSkin}" alt="Cabeza 3D de ${minister}" loading="lazy"><div><small>MINISTRO DEL GOBIERNO</small><b>${minister}</b><span>${ministerPerk} · ${ministerBonus}</span></div></div>`;
    roster.append(card);
  });
  if (roster) roster.querySelectorAll(".candidate-card:not(.candidate-new)").forEach(card => {
    const name = card.querySelector("h4")?.textContent?.trim();
    const effect = name === "Beatriz"
      ? "Todas las mascotas +1,3 %; las de tala +2,5 % de estadísticas."
      : "Todas las mascotas +1,3 % de estadísticas.";
    const list = card.querySelector(".benefit-list");
    let line = [...(list?.children || [])].find(item => item.querySelector("b")?.textContent === "EderusPets");
    if (!line) {
      line = document.createElement("li");
      list?.append(line);
    }
    line.innerHTML = `<b>EderusPets</b><span>${effect}</span>`;
  });

  // Si el servicio de modelos 3D falla, muestra la cara de la textura real
  // configurada en candidatos.yml para que la ficha nunca quede vacía.
  document.querySelectorAll(".skin-render[data-skin-hash]").forEach(image => {
    const hash = image.dataset.skinHash;
    const requestedType = image.dataset.renderType || "body";
    const render = type => hash.length === 64
      ? `https://skinrender.dev/render/texture:${encodeURIComponent(hash)}/${type}?size=${type === "body" ? 256 : 128}&yaw=35&pitch=12`
      : `https://mc-heads.net/${type === "body" ? "body" : "head"}/${encodeURIComponent(hash)}/${type === "body" ? 128 : 64}`;
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

