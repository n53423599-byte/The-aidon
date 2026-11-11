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
      window.AdminPanel &&
      typeof window.AdminPanel.start === "function"
    ) {
      window.AdminPanel.start();
    } else {
      app.innerHTML = `
        ${pageHeader("إدارة الآيدون")}
        <p class="notice">
          تعذر تحميل لوحة الإدارة. تحققي من ملف admin.js.
        </p>
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

start(); showLogin() {
    const root = getRoot();

    root.innerHTML = `
      <section class="admin-panel">
        <div class="admin-login">
          <h2>إدارة طبعة الآيدون الأخيرة ㊗️</h2>
          <p>سجّلي الدخول لمتابعة إدارة الموقع.</p>

          <div id="admin-message"
               class="admin-message"
               hidden></div>

          <form id="admin-login-form" class="admin-form">
            <div class="admin-field">
              <label for="admin-username">اسم المستخدم</label>
              <input id="admin-username"
                     name="username"
                     autocomplete="username"
                     required>
            </div>

            <div class="admin-field">
              <label for="admin-password">كلمة المرور</label>
              <input id="admin-password"
                     name="password"
                     type="password"
                     autocomplete="current-password"
                     required>
            </div>

            <button class="admin-button primary" type="submit">
              تسجيل الدخول
            </button>
          </form>
        </div>
      </section>
    `;

    $("#admin-login-form").addEventListener(
      "submit",
      handleLogin
    );
  }

  async function handleLogin(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    try {
      await post("/login", {
        username: form.get("username"),
        password: form.get("password")
      });

      await loadData();
      showDashboard();

    } catch (error) {
      notify(error.message, "error");
    }
  }

  /* =========================
     DATA
  ========================= */

  async function loadData() {
    state.data = await api("/admin/data");
  }

  /* =========================
     DASHBOARD
  ========================= */

  function showDashboard() {
    const root = getRoot();

    root.innerHTML = `
      <section class="admin-panel">

        <header class="admin-top">
          <div>
            <h1>لوحة إدارة طبعة الآيدون الأخيرة</h1>
            <p>إدارة محتويات الموقع وأرشيفه.</p>
          </div>

          <button class="admin-button danger"
                  id="admin-logout">
            تسجيل الخروج
          </button>
        </header>

        <div id="admin-message"
             class="admin-message"
             hidden></div>

        <div class="admin-layout">

          <nav class="admin-nav" id="admin-nav">
            ${Object.entries(sections).map(([key, section]) => `
              <button type="button"
                      data-section="${key}">
                ${escapeHTML(section.title)}
              </button>
            `).join("")}

            <button type="button"
                    data-section="settings">
              إعدادات الموقع
            </button>
          </nav>

          <main class="admin-content" id="admin-content"></main>

        </div>
      </section>
    `;

    $("#admin-logout").addEventListener(
      "click",
      handleLogout
    );

    $("#admin-nav").addEventListener("click", event => {
      const button = event.target.closest("[data-section]");

      if (!button) return;

      state.section = button.dataset.section;
      state.image = null;

      renderSection();
    });

    renderSection();
  }

  async function handleLogout() {
    try {
      await api("/logout", { method: "POST" });
    } catch {}

    state.data = null;
    showLogin();
  }

  /* =========================
     SECTION RENDERING
  ========================= */

  function renderSection() {
    document.querySelectorAll("[data-section]").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.section === state.section
      );
    });

    if (state.section === "settings") {
      renderSettings();
      return;
    }

    const section = sections[state.section];

    if (section) renderRecords(section);
  }

  function getRows(table) {
    const map = {
      archive_categories: "categories",
      archive_topics: "topics"
    };

    return state.data?.[map[table] || table] || [];
  }

  function renderRecords(section) {
    const content = $("#admin-content");
    const rows = getRows(section.table);

    content.innerHTML = `
      <div class="admin-top">
        <div>
          <h2>${escapeHTML(section.title)}</h2>
          <small>عدد العناصر: ${rows.length}</small>
        </div>

        <button class="admin-button primary"
                id="admin-add">
          إضافة عنصر
        </button>
      </div>

      <div class="admin-list" id="admin-list">
        ${rows.length ? rows.map(row => `
          <article class="admin-item">
            <div class="admin-item-main">
              <strong>${escapeHTML(
                row.title || row.name || row.value || "عنصر"
              )}</strong>

              <small>${escapeHTML(
                row.role ||
                row.journalist_title ||
                row.war_number ||
                ""
              )}</small>
            </div>

            <div class="admin-actions">
              <button class="admin-button"
                      data-edit="${escapeHTML(row.id)}">
                تعديل
              </button>

              <button class="admin-button danger"
                      data-delete="${escapeHTML(row.id)}">
                حذف
              </button>
            </div>
          </article>
        `).join("") : `
          <div class="admin-empty">
            لا توجد عناصر في هذا القسم بعد.
          </div>
        `}
      </div>
    `;

    $("#admin-add").addEventListener(
      "click",
      () => openEditor(section, null)
    );

    $("#admin-list").addEventListener("click", event => {
      const edit = event.target.closest("[data-edit]");
      const remove = event.target.closest("[data-delete]");

      if (edit) {
        const record = rows.find(
          item => String(item.id) === edit.dataset.edit
        );

        if (record) openEditor(section, record);
      }

      if (remove) {
        const record = rows.find(
          item => String(item.id) === remove.dataset.delete
        );

        if (record) deleteItem(section, record);
      }
    });
  }

  /* =========================
     RELATION SELECTS
  ========================= */

  function relationOptions(type, selected) {
    let rows = [];
    let label = row => row.name;

    if (type === "profile") {
      rows = state.data.profiles || [];
      label = row => row.name;
    }

    if (type === "category") {
      rows = state.data.categories || [];
      label = row => row.name;
    }

    if (type === "event") {
      rows = state.data.events || [];
      label = row => row.title;
    }

    return `
      <option value="">اختاري...</option>
      ${rows.map(row => `
        <option value="${escapeHTML(row.id)}"
          ${String(row.id) === String(selected) ? "selected" : ""}>
          ${escapeHTML(label(row))}
        </option>
      `).join("")}
    `;
  }

  /* =========================
     IMAGE HANDLING
  ========================= */

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  }

  async function compressImage(file) {
    if (!file.type.startsWith("image/")) {
      throw new Error("الملف المختار ليس صورة.");
    }

    const dataURL = await fileToDataURL(file);
    const image = new Image();

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = dataURL;
    });

    const maxDimension = 1800;

    const ratio = Math.min(
      1,
      maxDimension / Math.max(image.width, image.height)
    );

    const canvas = document.createElement("canvas");

    canvas.width = Math.round(image.width * ratio);
    canvas.height = Math.round(image.height * ratio);

    canvas.getContext("2d").drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height
    );

    let quality = 0.82;
    let output = canvas.toDataURL("image/jpeg", quality);

    while (
      output.length > 4 * 1024 * 1024 &&
      quality > 0.35
    ) {
      quality -= 0.1;
      output = canvas.toDataURL("image/jpeg", quality);
    }

    if (output.length > 4 * 1024 * 1024) {
      throw new Error("حجم الصورة كبير جدًا.");
    }

    return {
      data: output,
      mime: "image/jpeg"
    };
  }

  async function uploadImage(file) {
    const compressed = await compressImage(file);

    const result = await post(
      "/admin/upload",
      compressed
    );

    if (!result.success || !result.image_key) {
      throw new Error("لم يتم رفع الصورة.");
    }

    return result.image_key;
  }

  /* =========================
     EDITOR
  ========================= */

  function openEditor(section, record) {
    state.image = null;

    const content = $("#admin-content");

    const fieldsHTML = section.fields.map(field => {
      const [name, label, type, required] = field;
      const value = record?.[name] ?? "";

      if (type === "textarea") {
        return `
          <div class="admin-field">
            <label for="field-${name}">${label}</label>
            <textarea id="field-${name}"
                      name="${name}"
                      ${required ? "required" : ""}>${escapeHTML(value)}</textarea>
          </div>
        `;
      }

      if (["profile", "category", "event"].includes(type)) {
        return `
          <div class="admin-field">
            <label for="field-${name}">${label}</label>
            <select id="field-${name}"
                    name="${name}"
                    ${required ? "required" : ""}>
              ${relationOptions(type, value)}
            </select>
          </div>
        `;
      }

      if (type === "image") {
        return `
          <div class="admin-field">
            <label>${label}</label>

            <input type="hidden"
                   name="${name}"
                   id="field-${name}"
                   value="${escapeHTML(value)}">

            <input type="file"
                   id="image-file"
                   accept="image/*">

            <div id="image-preview-area">
              ${value ? `
                <img class="admin-preview"
                     src="${escapeHTML(value)}"
                     alt="معاينة الصورة">
              ` : ""}
            </div>

            ${section.table !== "profiles" ? `
              <div class="admin-field">
                <label>استخدام صورة ملف شخصي موجود</label>
                <select id="reuse-profile-image">
                  <option value="">اختاري صورة...</option>

                  ${(state.data.profiles || [])
                    .filter(profile => profile.image_key)
                    .map(profile => `
                      <option value="${escapeHTML(profile.image_key)}">
                        ${escapeHTML(profile.name)}
                      </option>
                    `).join("")}
                </select>
              </div>
            ` : ""}
          </div>
        `;
      }

      return `
        <div class="admin-field">
          <label for="field-${name}">${label}</label>

          <input
            id="field-${name}"
            name="${name}"
            type="${type === "number" ? "number" : "text"}"
            value="${escapeHTML(value)}"
            ${required ? "required" : ""}
          >
        </div>
      `;
    }).join("");

    content.innerHTML = `
      <div class="admin-top">
        <h2>${record ? "تعديل عنصر" : "إضافة عنصر جديد"}</h2>

        <button class="admin-button" id="admin-back">
          العودة
        </button>
      </div>

      <form id="admin-editor" class="admin-form">
        ${fieldsHTML}

        <div class="admin-form-actions">
          <button class="admin-button primary" type="submit">
            حفظ
          </button>

          <button class="admin-button"
                  type="button"
                  id="admin-cancel">
            إلغاء
          </button>
        </div>
      </form>
    `;

    $("#admin-back").addEventListener("click", renderSection);
    $("#admin-cancel").addEventListener("click", renderSection);

    const imageInput = $("#image-file");

    if (imageInput) {
      imageInput.addEventListener("change", previewImage);
    }

    const reuse = $("#reuse-profile-image");

    if (reuse) {
      reuse.addEventListener("change", () => {
        if (!reuse.value) return;

        $("#field-image_key").value = reuse.value;

        $("#image-preview-area").innerHTML = `
          <img class="admin-preview"
               src="${escapeHTML(reuse.value)}"
               alt="معاينة الصورة">
        `;

        state.image = null;
      });
    }

    $("#admin-editor").addEventListener(
      "submit",
      event => saveEditor(event, section, record)
    );
  }

  async function previewImage(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const dataURL = await fileToDataURL(file);

      $("#image-preview-area").innerHTML = `
        <img class="admin-preview"
             src="${dataURL}"
             alt="معاينة الصورة المختارة">
      `;

      state.image = file;

      if ($("#reuse-profile-image")) {
        $("#reuse-profile-image").value = "";
      }

    } catch {
      notify("تعذّرت معاينة الصورة.", "error");
    }
  }

  /* =========================
     SAVE
  ========================= */

  async function saveEditor(event, section, oldRecord) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const record = {};

    for (const field of section.fields) {
      const name = field[0];
      const type = field[2];

      if (type === "image") {
        record[name] = $("#field-" + name).value;
        continue;
      }

      const value = formData.get(name);

      record[name] = type === "number"
        ? (value === "" ? 0 : Number(value))
        : value;
    }

    if (oldRecord?.id) {
      record.id = oldRecord.id;
    }

    const button = form.querySelector(
      'button[type="submit"]'
    );

    button.disabled = true;
    button.textContent = "جارٍ الحفظ...";

    try {
      if (state.image) {
        notify("جارٍ رفع الصورة...");

        record.image_key = await uploadImage(state.image);
      }

      await post("/admin/save", {
        table: section.table,
        record
      });

      await loadData();

      state.image = null;

      notify("تم حفظ البيانات بنجاح.", "success");

      renderSection();

    } catch (error) {
      notify(error.message, "error");

      button.disabled = false;
      button.textContent = "حفظ";
    }
  }

  /* =========================
     DELETE
  ========================= */

  async function deleteItem(section, record) {
    const name = record.title || record.name || "هذا العنصر";

    if (!confirm(
      `هل تريدين حذف "${name}"؟\n\nلا يمكن التراجع عن هذه العملية.`
    )) return;

    try {
      await post("/admin/delete", {
        table: section.table,
        id: record.id
      });

      await loadData();

      notify("تم حذف العنصر.", "success");

      renderSection();

    } catch (error) {
      notify(error.message, "error");
    }
  }

  /* =========================
     SETTINGS
  ========================= */

  function renderSettings() {
    const settings = state.data?.settings || {};

    $("#admin-content").innerHTML = `
      <h2>إعدادات الموقع</h2>

      <form id="admin-settings-form" class="admin-form">

        <div class="admin-field">
          <label for="setting-title">عنوان الموقع</label>

          <input id="setting-title"
                 name="site_title"
                 value="${escapeHTML(settings.site_title || "")}">
        </div>

        <div class="admin-field">
          <label for="setting-intro">مقدمة الصفحة الرئيسية</label>

          <textarea id="setting-intro"
                    name="intro">${escapeHTML(settings.intro || "")}</textarea>
        </div>

        <div class="admin-field">
          <label for="setting-magazine">مقدمة المجلة</label>

          <textarea id="setting-magazine"
                    name="magazine_intro">${escapeHTML(settings.magazine_intro || "")}</textarea>
        </div>

        <button class="admin-button primary" type="submit">
          حفظ الإعدادات
        </button>

      </form>
    `;

    $("#admin-settings-form").addEventListener(
      "submit",
      saveSettings
    );
  }

  async function saveSettings(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form.entries());

    try {
      await post("/admin/settings", values);
      await loadData();

      notify("تم حفظ الإعدادات.", "success");

    } catch (error) {
      notify(error.message, "error");
    }
  }

  /* =========================
     START
  ========================= */

  async function start() {
    addStyles();

    const root = getRoot();

    root.innerHTML = `
      <section class="admin-panel">
        <div class="admin-empty">
          جارٍ التحقق من جلسة المشرف...
        </div>
      </section>
    `;

    try {
      await loadData();
      showDashboard();

    } catch {
      showLogin();
    }
  }

  return {
    start,
    reload: loadData
  };

})();
