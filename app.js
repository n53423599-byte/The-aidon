const app = document.getElementById("app");
const nav = document.getElementById("mainNav");
const menuButton = document.getElementById("menuButton");

const defaultData = {
  settings: {
    site_title: "طبعة الآيدون الأخيرة 🗞️ ㊗️",
    intro: "هنا تُستودَع الذاكرةُ ما عجزت الأيامُ عن استبقائه، وتُجمع من شتات الحكاية فصولٌ كُتبت يومًا ثم مضت؛ أخبارٌ عبرت، وأقلامٌ خلّفت أثرًا، وأسماءٌ غدت جزءًا من تاريخ الآيدون㊗️.",
    magazine_intro: "حيث تُروى أمجاد الشمَـال، وتُوثّق الأحداث، وتُسلّط الأضواء على آخر المستجـدات؛ من أخبارٍ وتقارير إلى تسريباتٍ وفعالياتٍ تخصّ مملكة الشمال♠️."
  },

  leadership: [
    { name: "كورومي 🎐", role: "قائدة الآيدون" },
    { name: "ساسكي ⚡", role: "نائب الآيدون" },
    { name: "فورينا 🎐", role: "مستشارة الآيدون" }
  ],

  journalists: [
    "كورومي 🎐㊗️",
    "فوريـنا 🎐",
    "مَـاوماو 🎐",
    "ريزي 🎐",
    "بالالايكا 🎐",
    "آن",
    "هيستوريـا 🎐",
    "ساسكي ⚡㊗️",
    "نيـترو",
    "ايـرزا",
    "سيـرا 🎐",
    "فايوليت 🎐"
  ],

  categories: [
    { id: "religion", name: "قسم الدين" },
    { id: "history", name: "قسم التاريخ" },
    { id: "literature", name: "قسم الأدب" },
    { id: "science", name: "قسم العلوم" },
    { id: "clocks", name: "قسم عقارب الآيدون" }
  ],

  events: [
    {
      id: "astra",
      title: "آسترا الآيدون 💫",
      subtitle: "سماءٌ تحفظُ نجومَ حكايتها"
    },
    {
      id: "chess",
      title: "رقعة الآيدون ♟️",
      subtitle: "إذا ما حُرّكت قطع المدى، بان الذكي من الذي يتوهّم"
    }
  ]
};

let data = structuredClone(defaultData);

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function row(title, description = "", link = "") {
  return `
    <a class="nav-item" href="${link}">
      <div>
        <h3>${escapeHTML(title)}</h3>
        ${description ? `<p>${escapeHTML(description)}</p>` : ""}
      </div>
      <span class="arrow">←</span>
    </a>
  `;
}

function pageHeader(title, description = "") {
  return `
    <a class="back-link" href="#/">← العودة للرئيسية</a>
    <header class="page-header">
      <div class="eyebrow">㊗️ من ذاكرة الآيدون</div>
      <h1>${escapeHTML(title)}</h1>
      ${description ? `<p class="intro">${escapeHTML(description)}</p>` : ""}
    </header>
  `;
}

async function loadData() {
  try {
    const response = await fetch("/api/public");

    if (response.ok) {
      const result = await response.json();

      if (result && result.settings) {
        data = { ...data, ...result };
      }
    }
  } catch (error) {
    console.warn("تعذر تحميل البيانات من الخادم حاليًا.", error);
  }
}

function homePage() {
  const settings = data.settings || defaultData.settings;

  app.innerHTML = `
    <section class="hero">
      <div class="eyebrow">العدد الختامي · ㊗️</div>
      <h1>${escapeHTML(settings.site_title)}</h1>
      <p class="intro">${escapeHTML(settings.intro)}</p>
    </section>

    <section>
      <div class="section-heading">
        <h2>أبواب الذاكرة</h2>
        <p>ثلاثة أبواب، لكلٍّ منها حكاية.</p>
      </div>

      <div class="link-list">
        ${row(
          "مجلة الآيدون",
          "مساحةٌ تحفظ سيرة الآيدون، ومحطّاتها وأبرز ما شهدته من أحداثٍ وتحولات، منذ البدايات حتى الفصل الأخير.",
          "#/magazine"
        )}

        ${row(
          "أرشيف الآيدون",
          "هنا تجتمع حصيلة أقلام الصحيفة؛ مقالاتٌ ومعارف، تنقّلت بين التاريخ والفنون والعلوم وسائر الميادين.",
          "#/archive"
        )}

        ${row(
          "متحف القمم",
          "موضعٌ تُحفظ فيه نتائج الآسترا، وأسماء المتوّجين في رقعة الآيدون، توثيقًا للاستحقاق وصونًا لذكرى أصحاب الإنجاز.",
          "#/museum"
        )}
      </div>
    </section>
  `;
}

function magazinePage() {
  const leaders = data.leadership || [];
  const journalists = data.journalists || [];

  app.innerHTML = `
    ${pageHeader("مَجلـة الآيـدون㊗️", data.settings.magazine_intro)}

    <div class="accordion-list">

      <details class="accordion">
        <summary>تعريف المجلة</summary>
        <div class="accordion-content">
          <p class="intro">
            صحيفةٌ وُجدت لتوثّق ما مرّ بالآيدون، وتجمع أخبارها وتقاريرها،
            وتحفظ ما خلّفته أقلام كتّابها من أثر.
          </p>
        </div>
      </details>

      <details class="accordion">
        <summary>العُليا</summary>
        <div class="accordion-content">
          ${leaders.map(person => `
            <a class="person-row" href="#/profile/${encodeURIComponent(person.name)}">
              <div>
                <div class="person-name">${escapeHTML(person.name)}</div>
                <div class="person-role">${escapeHTML(person.role)}</div>
              </div>
              <span class="arrow">←</span>
            </a>
          `).join("")}
        </div>
      </details>

      <details class="accordion">
        <summary>الصحفيون</summary>
        <div class="accordion-content">
          ${journalists.map(person => `
            <div class="person-row">
              <div class="person-name">${escapeHTML(person.name || person)}</div>
            </div>
          `).join("")}
        </div>
      </details>

      <details class="accordion">
        <summary>الإنجازات</summary>
        <div class="accordion-content" id="magazineAchievements">
          ${renderSimpleList(data.magazine_achievements)}
        </div>
      </details>

      <details class="accordion">
        <summary>الآيدون بالأرقام</summary>
        <div class="accordion-content" id="statistics">
          ${renderStatistics(data.statistics)}
        </div>
      </details>

    </div>
  `;
}

function renderSimpleList(items = []) {
  if (!items || !items.length) {
    return `<p class="empty-state">لم تُضف إنجازات بعد.</p>`;
  }

  return items.map(item => `
    <div class="simple-row">
      <strong>${escapeHTML(item.title)}</strong>
      ${item.war_number ? `<span> — ${escapeHTML(item.war_number)}</span>` : ""}
    </div>
  `).join("");
}

function renderStatistics(items = []) {
  if (!items || !items.length) {
    return `<p class="empty-state">لا توجد إحصاءات منشورة بعد.</p>`;
  }

  return items.map(item => `
    <div class="simple-row">
      ${escapeHTML(item.title)}
      <strong> — ${escapeHTML(item.value)}</strong>
    </div>
  `).join("");
}

function archivePage() {
  app.innerHTML = `
    ${pageHeader(
      "أرشيف الآيدون",
      "ما كتبته الأقلام لا ينتهي بانتهاء اللحظة؛ فهنا تستقرّ النصوص والمعارف في مواضعها."
    )}

    <div class="category-list">
      ${(data.categories || []).map(category => `
        <a class="category-item"
           href="#/archive/${encodeURIComponent(category.id)}">
          <h3>${escapeHTML(category.name)}</h3>
          <span class="arrow">←</span>
        </a>
      `).join("")}
    </div>
  `;
}

function categoryPage(id) {
  const category = (data.categories || []).find(item => item.id === id);

  if (!category) return notFound();

  const topics = (data.topics || [])
    .filter(topic => topic.category_id === id);

  app.innerHTML = `
    ${pageHeader(category.name, "من محفوظات الآيدون.")}

    <div class="link-list">
      ${topics.length ? topics.map(topic => row(
        topic.title,
        topic.journalist_title ? `بقلم: ${topic.journalist_title}` : "",
        `#/topic/${encodeURIComponent(topic.id)}`
      )).join("") : `
        <p class="empty-state">لم تُنشر موضوعات في هذا القسم بعد.</p>
      `}
    </div>
  `;
}

function topicPage(id) {
  const topic = (data.topics || []).find(item => item.id === id);

  if (!topic) return notFound();

  app.innerHTML = `
    ${pageHeader(topic.title)}

    <article class="topic">
      ${topic.journalist_title
        ? `<div class="byline">بقلم: ${escapeHTML(topic.journalist_title)}</div>`
        : ""}

      ${topic.image_key
        ? `<img src="${escapeHTML(topic.image_key)}" alt="${escapeHTML(topic.title)}">`
        : ""}

      <div class="topic-body">${escapeHTML(topic.body)}</div>
    </article>
  `;
}

function museumPage() {
  app.innerHTML = `
    ${pageHeader(
      "متحف القمم",
      "للإنجاز موضعٌ في الذاكرة، ولأصحابه أسماءٌ لا ينبغي أن تغيب."
    )}

    <div class="link-list">
      ${(data.events || []).map(event => row(
        event.title,
        event.subtitle,
        `#/event/${encodeURIComponent(event.id)}`
      )).join("")}
    </div>
  `;
}

function eventPage(id) {
  const event = (data.events || []).find(item => item.id === id);

  if (!event) return notFound();

  const achievements = (data.event_achievements || [])
    .filter(item => item.event_id === id);

  const results = (data.public_results || [])
    .filter(item => item.event_id === id);

  app.innerHTML = `
    ${pageHeader(event.title, event.subtitle)}

    ${event.image_key
      ? `<img class="event-image" src="${escapeHTML(event.image_key)}" alt="${escapeHTML(event.title)}">`
      : ""}

    ${event.description
      ? `<p class="intro">${escapeHTML(event.description)}</p>`
      : ""}

    <div class="section-heading">
      <h2>سجلّ الإنجازات</h2>
    </div>

    <div class="link-list">
      ${achievements.length ? achievements.map(item => {
        const profile = (data.profiles || []).find(
          p => p.id === item.profile_id
        );

        return row(
          item.title,
          `${profile ? profile.name : ""}${item.description ? " — " + item.description : ""}`,
          profile ? `#/profile/${encodeURIComponent(profile.id)}` : "#"
        );
      }).join("") : `<p class="empty-state">لم تُضف إنجازات بعد.</p>`}
    </div>

    <div class="section-heading">
      <h2>النتائج والتتويجات</h2>
    </div>

    <div class="link-list">
      ${results.length ? results.map(item => {
        const profile = (data.profiles || []).find(
          p => p.id === item.winner_profile_id
        );

        return row(
          item.title,
          profile ? profile.name : "",
          profile ? `#/profile/${encodeURIComponent(profile.id)}` : "#"
        );
      }).join("") : `<p class="empty-state">لم تُضف نتائج بعد.</p>`}
    </div>

    <a class="back-link" href="#/museum">← العودة إلى متحف القمم</a>
  `;
}

function profilePage(id) {
  const profiles = data.profiles || [];

  const profile = profiles.find(person =>
    person.id === id || person.name === id
  );

  if (!profile) return notFound();

  const achievements = (data.event_achievements || [])
    .filter(item => item.profile_id === profile.id);

  app.innerHTML = `
    ${pageHeader("من أصحاب الأثر")}

    <div class="profile-header">
      ${profile.image_key
        ? `<img src="${escapeHTML(profile.image_key)}" alt="${escapeHTML(profile.name)}">`
        : ""}

      <div>
        <h2>${escapeHTML(profile.name)}</h2>
        <p>${escapeHTML(profile.role || "")}</p>
      </div>
    </div>

    ${profile.description
      ? `<div class="section-heading"><p>${escapeHTML(profile.description)}</p></div>`
      : ""}

    ${profile.extra_info
      ? `<div class="simple-row">${escapeHTML(profile.extra_info)}</div>`
      : ""}

    <div class="section-heading">
      <h2>الإنجازات</h2>
    </div>

    <div class="link-list">
      ${achievements.length ? achievements.map(item => row(
        item.title,
        item.description || "",
        "#"
      )).join("") : `<p class="empty-state">لا توجد إنجازات مسجلة.</p>`}
    </div>
  `;
}

function notFound() {
  app.innerHTML = `
    <div class="empty-state">
      <h2>هذه الصفحة غير موجودة</h2>
      <a class="back-link" href="#/">العودة إلى الرئيسية</a>
    </div>
  `;
}

function render() {
  const path = decodeURIComponent(location.hash || "#/");
  const parts = path.replace(/^#\/?/, "").split("/").filter(Boolean);

  if (parts.length === 0) {
    homePage();

  } else if (parts[0] === "magazine") {
    magazinePage();

  } else if (parts[0] === "archive" && parts.length === 1) {
    archivePage();

  } else if (parts[0] === "archive" && parts[1]) {
    categoryPage(parts[1]);

  } else if (parts[0] === "topic" && parts[1]) {
    topicPage(parts[1]);

  } else if (parts[0] === "museum") {
    museumPage();

  } else if (parts[0] === "event" && parts[1]) {
    eventPage(parts[1]);

  } else if (parts[0] === "profile" && parts[1]) {
    profilePage(parts[1]);

  } else if (parts[0] === "admin") {
    if (
      typeof AdminPanel !== "undefined" &&
      typeof AdminPanel.start === "function"
    ) {
      AdminPanel.start();
    } else {
      app.innerHTML = `
        ${pageHeader("إدارة الآيدون")}
        <p class="notice">تعذر تحميل لوحة الإدارة. تحققي من ملف admin.js.</p>
      `;
    }

    nav.classList.remove("open");
    return;

  } else {
    notFound();
  }

  nav.querySelectorAll("a").forEach(link => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#/${parts[0] || ""}`
    );
  });

  nav.classList.remove("open");
}

menuButton.addEventListener("click", () => {
  nav.classList.toggle("open");
});

window.addEventListener("hashchange", render);

async function start() {
  await loadData();
  render();
}

start();      );
      }).join("") : `<p class="empty-state">لم تُضف نتائج بعد.</p>`}
    </div>

    <a class="back-link" href="#/museum">← العودة إلى متحف القمم</a>
  `;
}

function profilePage(id) {
  const profiles = data.profiles || [];

  const profile = profiles.find(person =>
    person.id === id || person.name === id
  );

  if (!profile) return notFound();

  const achievements = (data.event_achievements || [])
    .filter(item => item.profile_id === profile.id);

  app.innerHTML = `
    ${pageHeader("من أصحاب الأثر")}

    <div class="profile-header">
      ${profile.image_key
        ? `<img src="${escapeHTML(profile.image_key)}" alt="${escapeHTML(profile.name)}">`
        : ""}

      <div>
        <h2>${escapeHTML(profile.name)}</h2>
        <p>${escapeHTML(profile.role || "")}</p>
      </div>
    </div>

    ${profile.description
      ? `<div class="section-heading"><p>${escapeHTML(profile.description)}</p></div>`
      : ""}

    ${profile.extra_info
      ? `<div class="simple-row">${escapeHTML(profile.extra_info)}</div>`
      : ""}

    <div class="section-heading">
      <h2>الإنجازات</h2>
    </div>

    <div class="link-list">
      ${achievements.length ? achievements.map(item => row(
        item.title,
        item.description || "",
        "#"
      )).join("") : `<p class="empty-state">لا توجد إنجازات مسجلة.</p>`}
    </div>
  `;
}

function notFound() {
  app.innerHTML = `
    <div class="empty-state">
      <h2>هذه الصفحة غير موجودة</h2>
      <a class="back-link" href="#/">العودة إلى الرئيسية</a>
    </div>
  `;
}

function render() {
  const path = decodeURIComponent(location.hash || "#/");
  const parts = path.replace(/^#\/?/, "").split("/").filter(Boolean);

  if (parts.length === 0) {
    homePage();

  } else if (parts[0] === "magazine") {
    magazinePage();

  } else if (parts[0] === "archive" && parts.length === 1) {
    archivePage();

  } else if (parts[0] === "archive" && parts[1]) {
    categoryPage(parts[1]);

  } else if (parts[0] === "topic" && parts[1]) {
    topicPage(parts[1]);

  } else if (parts[0] === "museum") {
    museumPage();

  } else if (parts[0] === "event" && parts[1]) {
    eventPage(parts[1]);

  } else if (parts[0] === "profile" && parts[1]) {
    profilePage(parts[1]);

  } else if (parts[0] === "admin") {
    AdminPanel.start();
    nav.classList.remove("open");
    return;

  } else {
    notFound();
  }

  nav.querySelectorAll("a").forEach(link => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#/${parts[0] || ""}`
    );
  });

  nav.classList.remove("open");
}

menuButton.addEventListener("click", () => {
  nav.classList.toggle("open");
});

window.addEventListener("hashchange", render);

async function start() {
  await loadData();
  render();
}

start();      );
      }).join("") : `<p class="empty-state">لم تُضف نتائج بعد.</p>`}
    </div>

    <a class="back-link" href="#/museum">← العودة إلى متحف القمم</a>
  `;
}

function profilePage(id) {
  const profiles = data.profiles || [];

  const profile = profiles.find(person =>
    person.id === id || person.name === id
  );

  if (!profile) return notFound();

  const achievements = (data.event_achievements || [])
    .filter(item => item.profile_id === profile.id);

  app.innerHTML = `
    ${pageHeader("من أصحاب الأثر")}

    <div class="profile-header">
      ${profile.image_key
        ? `<img src="${escapeHTML(profile.image_key)}" alt="${escapeHTML(profile.name)}">`
        : ""}

      <div>
        <h2>${escapeHTML(profile.name)}</h2>
        <p>${escapeHTML(profile.role || "")}</p>
      </div>
    </div>

    ${profile.description
      ? `<div class="section-heading"><p>${escapeHTML(profile.description)}</p></div>`
      : ""}

    ${profile.extra_info
      ? `<div class="simple-row">${escapeHTML(profile.extra_info)}</div>`
      : ""}

    <div class="section-heading">
      <h2>الإنجازات</h2>
    </div>

    <div class="link-list">
      ${achievements.length ? achievements.map(item => row(
        item.title,
        item.description || "",
        "#"
      )).join("") : `<p class="empty-state">لا توجد إنجازات مسجلة.</p>`}
    </div>
  `;
}

function notFound() {
  app.innerHTML = `
    <div class="empty-state">
      <h2>هذه الصفحة غير موجودة</h2>
      <a class="back-link" href="#/">العودة إلى الرئيسية</a>
    </div>
  `;
}

function render() {
  const path = decodeURIComponent(location.hash || "#/");
  const parts = path.replace(/^#\/?/, "").split("/").filter(Boolean);

  if (parts.length === 0) {
    homePage();
  } else if (parts[0] === "magazine") {
    magazinePage();
  } else if (parts[0] === "archive" && parts.length === 1) {
    archivePage();
  } else if (parts[0] === "archive" && parts[1]) {
    categoryPage(parts[1]);
  } else if (parts[0] === "topic" && parts[1]) {
    topicPage(parts[1]);
  } else if (parts[0] === "museum") {
    museumPage();
  } else if (parts[0] === "event" && parts[1]) {
    eventPage(parts[1]);
  } else if (parts[0] === "profile" && parts[1]) {
    profilePage(parts[1]);
  } else if (parts[0] === "admin") {
    app.innerHTML = `
      ${pageHeader("إدارة الآيدون")}
      <p class="notice">لوحة الإدارة ستُربط بالخادم الآمن في ملف الإدارة القادم.</p>
    `;
  } else {
    notFound();
  }

  nav.querySelectorAll("a").forEach(link => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#/${parts[0] || ""}`
    );
  });

  nav.classList.remove("open");
}

menuButton.addEventListener("click", () => {
  nav.classList.toggle("open");
});

window.addEventListener("hashchange", render);

async function start() {
  await loadData();
  render();
}

start(); 
