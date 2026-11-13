"use strict";

/* ═══════════════════════════════════
   الآيدون | العدد الختامي
   ═══════════════════════════════════ */

const app = document.getElementById("app");
const nav = document.getElementById("mainNav");
const menuButton = document.getElementById("menuButton");

/* البيانات الافتراضية */

const defaultData = {
  settings: {
    site_title: "طبعة الآيدون الأخيرة 🗞️ ㊗️",
    intro: "هنا تُستودَع الذاكرةُ ما عجزت الأيامُ عن استبقائه، وتُجمع من شتات الحكاية فصولٌ كُتبت يومًا ثم مضت؛ أخبارٌ عبرت، وأقلامٌ خلّفت أثرًا، وأسماءٌ غدت جزءًا من تاريخ الآيدون㊗️.",
    magazine_intro: "حيث تُروى أمجاد الشمال، وتُوثّق الأحداث، وتُسلّط الأضواء على آخر المستجدات؛ من أخبارٍ وتقارير إلى تسريباتٍ وفعالياتٍ تخصّ مملكة الشمال♠️."
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

  topics: [],
  profiles: [],
  magazine_achievements: [],
  statistics: [],
  event_achievements: [],
  public_results: [],

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

/* أدوات مساعدة */

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function safeImage(value = "") {
  const url = String(value).trim();

  if (
    url.startsWith("/") &&
    !url.startsWith("//")
  ) {
    return escapeHTML(url);
  }

  try {
    const parsed = new URL(url);

    if (
      parsed.protocol === "https:" ||
      parsed.protocol === "http:"
    ) {
      return escapeHTML(url);
    }
  } catch {
    return "";
  }

  return "";
}

function row(title, description = "", link = "") {
  return `
    <a class="nav-item" href="${escapeHTML(link)}">
      <div>
        <h3>${escapeHTML(title)}</h3>
        ${description
          ? `<p>${escapeHTML(description)}</p>`
          : ""}
      </div>
      <span class="arrow" aria-hidden="true">←</span>
    </a>
  `;
}

function pageHeader(title, description = "") {
  return `
    <a class="back-link" href="#/">← العودة للرئيسية</a>

    <header class="page-header">
      <div class="eyebrow">㊗️ من ذاكرة الآيدون</div>
      <h1>${escapeHTML(title)}</h1>

      ${description
        ? `<p class="intro">${escapeHTML(description)}</p>`
        : ""}
    </header>
  `;
}

function sectionHeading(title, description = "") {
  return `
    <div class="section-heading">
      <h2>${escapeHTML(title)}</h2>

      ${description
        ? `<p>${escapeHTML(description)}</p>`
        : ""}
    </div>
  `;
}

function getProfileLink(profile) {
  return `#/profile/${encodeURIComponent(profile.id)}`;
}

function emptyState(message) {
  return `<p class="empty-state">${escapeHTML(message)}</p>`;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function nonEmptyValue(value, fallback) {
  return typeof value === "string" && value.trim()
    ? value
    : fallback;
}

/* تحميل البيانات */

async function loadData() {
  try {
    const response = await fetch("/api/public", {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result || typeof result !== "object") {
      throw new Error("Invalid API response");
    }

    const settings = result.settings || {};

    data = {
      ...defaultData,
      ...result,

      settings: {
        ...defaultData.settings,
        ...settings,

        site_title: nonEmptyValue(
          settings.site_title,
          defaultData.settings.site_title
        ),

        intro: nonEmptyValue(
          settings.intro,
          defaultData.settings.intro
        ),

        magazine_intro: nonEmptyValue(
          settings.magazine_intro,
          defaultData.settings.magazine_intro
        )
      },

      leadership:
        asArray(result.leadership).length
          ? result.leadership
          : defaultData.leadership,

      journalists:
        asArray(result.journalists).length
          ? result.journalists
          : defaultData.journalists,

      categories:
        asArray(result.categories).length
          ? result.categories
          : asArray(result.archive_categories).length
            ? result.archive_categories
            : defaultData.categories,

      topics: asArray(result.topics).length
        ? result.topics
        : asArray(result.archive_topics),

      profiles: asArray(result.profiles),

      events: asArray(result.events).length
        ? result.events
        : defaultData.events,

      magazine_achievements: asArray(
        result.magazine_achievements
      ),

      statistics: asArray(result.statistics),

      event_achievements: asArray(
        result.event_achievements
      ),

      public_results: asArray(result.public_results)
    };

  } catch (error) {
    console.error("Aydon data loading error:", error);

    data = structuredClone(defaultData);
  }
}

/* القيادات */

function getLeadership() {
  const profiles = data.profiles || [];

  const leaders = profiles.filter(person =>
    /قائدة|نائب|مستشار/.test(person.role || "")
  );

  return leaders.length
    ? leaders
    : data.leadership;
}

/* الصفحة الرئيسية */

function homePage() {
  const settings = data.settings;

  app.innerHTML = `
    <section class="hero">

      <div class="eyebrow">العدد الختامي · ㊗️</div>

      <h1>${escapeHTML(settings.site_title)}</h1>

      <p class="intro">
        ${escapeHTML(settings.intro)}
      </p>

    </section>

    <section class="home-destinations">

      ${sectionHeading("أبواب الذاكرة")}

      <div class="link-list">

        ${row(
          "مجلة الآيدون",
          "مساحةٌ تحفظ سيرة الآيدون㊗️، ومحطّاتها وأبرز ما شهدته من أحداثٍ وتحولات، منذ البدايات حتى الفصل الأخير.",
          "#/magazine"
        )}

        ${row(
          "أرشيف الآيدون",
          "هنا تجتمع حصيلة أقلام الصحيفة؛ مقالاتٌ ومعارف، تنقّلت بين التاريخ والفنون والعلوم وسائر الميادين.",
          "#/archive"
        )}

        ${row(
          "متحف القمم",
          "موضعٌ تُحفظ فيه نتائج الآسترا💫، وأسماءُ المتوّجين في رقعة الآيدون♟️، توثيقًا للاستحقاق وصونًا لذكرى أصحاب الإنجاز.",
          "#/museum"
        )}

      </div>
    </section>
  `;
}

/* مجلة الآيدون */

function magazinePage() {
  const leaders = getLeadership();
  const journalists = data.journalists || [];

  app.innerHTML = `
    ${pageHeader(
      "مَجلـة الآيـدون㊗️",
      data.settings.magazine_intro
    )}

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

          ${leaders.map(person => {
            const profile = data.profiles.find(item =>
              item.id === person.id ||
              item.name === person.name
            );

            const content = `
              ${person.image_key
                ? `<img src="${safeImage(person.image_key)}" alt="">`
                : ""}

              <div>
                <div class="person-name">
                  ${escapeHTML(person.name)}
                </div>

                <div class="person-role">
                  ${escapeHTML(person.role)}
                </div>
              </div>

              <span class="arrow">←</span>
            `;

            return profile
              ? `<a class="person-row" href="${getProfileLink(profile)}">${content}</a>`
              : `<div class="person-row">${content}</div>`;

          }).join("")}

        </div>
      </details>

      <details class="accordion">
        <summary>الصحفيون</summary>

        <div class="accordion-content">

          ${journalists.map(person => `
            <div class="person-row">
              <div class="person-name">
                ${escapeHTML(person.name || person)}
              </div>
            </div>
          `).join("")}

        </div>
      </details>

      <details class="accordion">
        <summary>الإنجازات</summary>

        <div class="accordion-content">
          ${renderMagazineAchievements(data.magazine_achievements)}
        </div>
      </details>

      <details class="accordion">
        <summary>الآيدون بالأرقام</summary>

        <div class="accordion-content">
          ${renderStatistics(data.statistics)}
        </div>
      </details>

    </div>
  `;
}

function renderMagazineAchievements(items = []) {
  if (!items.length) {
    return emptyState("لم تُضف إنجازات بعد.");
  }

  return items.map(item => `
    <div class="simple-row">
      <strong>${escapeHTML(item.title)}</strong>
      <span>${escapeHTML(item.war_number || "")}</span>
    </div>
  `).join("");
}

function renderStatistics(items = []) {
  if (!items.length) {
    return emptyState("لا توجد إحصاءات منشورة بعد.");
  }

  return items.map(item => `
    <div class="simple-row">
      <span>${escapeHTML(item.title)}</span>
      <strong>${escapeHTML(item.value)}</strong>
    </div>
  `).join("");
}

/* الأرشيف */

function archivePage() {
  const categories = data.categories || [];

  app.innerHTML = `
    ${pageHeader(
      "أرشيف الآيدون",
      "هنا تجتمع حصيلة أقلام الصحيفة؛ مقالاتٌ ومعارف، تنقّلت بين التاريخ والفنون والعلوم وسائر الميادين."
    )}

    <div class="category-list">

      ${categories.length
        ? categories.map(category => `
          <a class="category-item"
             href="#/archive/${encodeURIComponent(category.id)}">

            <h3>${escapeHTML(category.name || category.title)}</h3>

            <span class="arrow">←</span>

          </a>
        `).join("")
        : emptyState("لا توجد أقسام منشورة حاليًا.")
      }

    </div>
  `;
}

function categoryPage(id) {
  const category = data.categories.find(item =>
    String(item.id) === String(id) ||
    String(item.slug) === String(id)
  );

  if (!category) {
    notFound();
    return;
  }

  const topics = data.topics.filter(topic =>
    String(topic.category_id) === String(category.id)
  );

  app.innerHTML = `
    ${pageHeader(category.name || category.title, "من محفوظات الآيدون.")}

    <div class="link-list">

      ${topics.length
        ? topics.map(topic => row(
            topic.title,
            topic.journalist_title
              ? `بقلم: ${topic.journalist_title}`
              : "",
            `#/topic/${encodeURIComponent(topic.id)}`
          )).join("")
        : emptyState("لم تُنشر موضوعات في هذا القسم بعد.")
      }

    </div>
  `;
}

function topicPage(id) {
  const topic = data.topics.find(item =>
    String(item.id) === String(id)
  );

  if (!topic) {
    notFound();
    return;
  }

  app.innerHTML = `
    ${pageHeader(topic.title)}

    <article class="topic">

      ${topic.journalist_title
        ? `<div class="byline">بقلم: ${escapeHTML(topic.journalist_title)}</div>`
        : ""}

      ${topic.image_key
        ? `<img src="${safeImage(topic.image_key)}"
                alt="${escapeHTML(topic.title)}">`
        : ""}

      <div class="topic-body">
        ${escapeHTML(topic.body || "").replace(/\n/g, "<br>")}
      </div>

    </article>
  `;
}

/* متحف القمم */

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
        `#/event/${encodeURIComponent(event.id || event.slug)}`
      )).join("")}

    </div>
  `;
}

function eventPage(id) {
  const event = data.events.find(item =>
    String(item.id) === String(id) ||
    String(item.slug) === String(id)
  );

  if (!event) {
    notFound();
    return;
  }

  const achievements = data.event_achievements.filter(item =>
    String(item.event_id) === String(event.id)
  );

  const results = data.public_results.filter(item =>
    String(item.event_id) === String(event.id)
  );

  app.innerHTML = `
    ${pageHeader(event.title, event.subtitle)}

    ${event.image_key
      ? `<img class="event-image"
              src="${safeImage(event.image_key)}"
              alt="${escapeHTML(event.title)}">`
      : ""}

    ${event.description
      ? `<p class="intro">${escapeHTML(event.description)}</p>`
      : ""}

    ${sectionHeading("سجلّ الإنجازات")}

    <div class="link-list">

      ${achievements.length
        ? achievements.map(item => {
            const profileId = item.profile_id || item.winner_profile_id;

            const profile = data.profiles.find(person =>
              String(person.id) === String(profileId)
            );

            return row(
              item.title,
              item.description || "",
              profile ? getProfileLink(profile) : "#"
            );
          }).join("")
        : emptyState("لم تُضف إنجازات بعد.")
      }

    </div>

    ${sectionHeading("النتائج والتتويجات")}

    <div class="link-list">

      ${results.length
        ? results.map(item => {
            const profileId = item.winner_profile_id || item.profile_id;

            const profile = data.profiles.find(person =>
              String(person.id) === String(profileId)
            );

            return row(
              item.title,
              profile ? profile.name : "",
              profile ? getProfileLink(profile) : "#"
            );
          }).join("")
        : emptyState("لم تُضف نتائج بعد.")
      }

    </div>

    <a class="back-link" href="#/museum">
      ← العودة إلى متحف القمم
    </a>
  `;
}

/* الملفات الشخصية */

function profilePage(id) {
  const profile = data.profiles.find(person =>
    String(person.id) === String(id) ||
    String(person.name) === String(id)
  );

  if (!profile) {
    notFound();
    return;
  }

  const achievements = data.event_achievements.filter(item =>
    String(item.profile_id) === String(profile.id)
  );

  app.innerHTML = `
    ${pageHeader("من أصحاب الأثر")}

    <div class="profile-header">

      ${profile.image_key
        ? `<img src="${safeImage(profile.image_key)}"
                alt="${escapeHTML(profile.name)}">`
        : ""}

      <div>
        <h2>${escapeHTML(profile.name)}</h2>
        <p>${escapeHTML(profile.role || "")}</p>
      </div>

    </div>

    ${profile.description
      ? `<p class="profile-description">
           ${escapeHTML(profile.description)}
         </p>`
      : ""}

    ${profile.extra_info
      ? `<div class="simple-row">
           ${escapeHTML(profile.extra_info)}
         </div>`
      : ""}

    ${sectionHeading("الإنجازات")}

    <div class="link-list">

      ${achievements.length
        ? achievements.map(item => row(
            item.title,
            item.description || "",
            "#"
          )).join("")
        : emptyState("لا توجد إنجازات مسجلة.")
      }

    </div>
  `;
}

/* الصفحات والتنقل */

function notFound() {
  app.innerHTML = `
    <div class="empty-state">
      <h2>هذه الصفحة غير موجودة</h2>
      <a class="back-link" href="#/">العودة إلى الرئيسية</a>
    </div>
  `;
}

function render() {
  if (!app) {
    console.error("Aydon: عنصر app غير موجود في index.html");
    return;
  }

  let path = location.hash || "#/";

  try {
    path = decodeURIComponent(path);
  } catch {
    path = "#/";
  }

  const parts = path
    .replace(/^#\/?/, "")
    .split("/")
    .filter(Boolean);

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
          تعذّر تحميل لوحة الإدارة. تحقّقي من ملف admin.js.
        </p>
      `;
    }

    nav?.classList.remove("open");
    return;

  } else {
    notFound();
  }

  if (nav) {
    nav.querySelectorAll("a").forEach(link => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === `#/${parts[0] || ""}`
      );
    });

    nav.classList.remove("open");
  }

  menuButton?.setAttribute("aria-expanded", "false");
}

/* القائمة الجانبية */

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");

    menuButton.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });

  nav.addEventListener("click", event => {
    if (event.target.closest("a")) {
      nav.classList.remove("open");

      menuButton.setAttribute(
        "aria-expanded",
        "false"
      );
    }
  });
}

/* تشغيل الموقع */

window.addEventListener("hashchange", render);

async function start() {
  if (!app) return;

  try {
    await loadData();
    render();
  } catch (error) {
    console.error("Aydon startup error:", error);

    app.innerHTML = `
      <div class="empty-state">
        <h2>تعذّر تحميل صفحات الذاكرة</h2>
        <p>حاولي تحديث الصفحة بعد قليل.</p>
      </div>
    `;
  }
}

start(); 
