"use strict";

/* ═══════════════════════════════════
   الآيدون | العدد الختامي
   ═══════════════════════════════════ */

/* العناصر الأساسية */

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


/* ═══════════════════════════════════
   أدوات مساعدة
   ═══════════════════════════════════ */

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
    url.startsWith("/") ||
    url.startsWith("https://") ||
    url.startsWith("http://")
  ) {
    return escapeHTML(url);
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


/* ═══════════════════════════════════
   تحميل البيانات
   ═══════════════════════════════════ */

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

    const settings = result.settings || {};

    data = {
      ...defaultData,
      ...result,

      settings: {
        ...defaultData.settings,
        ...settings
      },

      leadership:
        Array.isArray(result.leadership)
          ? result.leadership
          : defaultData.leadership,

      journalists:
        Array.isArray(result.journalists) &&
        result.journalists.length
          ? result.journalists
          : defaultData.journalists,

      categories:
        Array.isArray(result.categories)
          ? result.categories
          : Array.isArray(result.archive_categories)
            ? result.archive_categories
            : defaultData.categories,

      topics:
        Array.isArray(result.topics)
          ? result.topics
          : Array.isArray(result.archive_topics)
            ? result.archive_topics
            : [],

      profiles: Array.isArray(result.profiles)
        ? result.profiles
        : [],

      events:
        Array.isArray(result.events)
          ? result.events
          : defaultData.events,

      magazine_achievements:
        Array.isArray(result.magazine_achievements)
          ? result.magazine_achievements
          : [],

      statistics:
        Array.isArray(result.statistics)
          ? result.statistics
          : [],

      event_achievements:
        Array.isArray(result.event_achievements)
          ? result.event_achievements
          : [],

      public_results:
        Array.isArray(result.public_results)
          ? result.public_results
          : []
    };

  } catch (error) {
    console.error("Aydon data loading error:", error);
  }
}


/* ═══════════════════════════════════
   القيادات
   ═══════════════════════════════════ */

function getLeadership() {
  const profiles = data.profiles || [];

  const leaders = profiles.filter(person =>
    /قائدة|نائب|مستشار/.test(person.role || "")
  );

  return leaders.length
    ? leaders
    : data.leadership;
}


/* ═══════════════════════════════════
   الصفحة الرئيسية
   ═══════════════════════════════════ */

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


/* ═══════════════════════════════════
   مجلة الآيدون
   ═══════════════════════════════════ */

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


/* ═══════════════════════════════════
   الأرشيف
   ═══════════════════════════════════ */

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


/* ═══════════════════════════════════
   متحف القمم
   ═══════════════════════════════════ */

function museumPage() {
  app.innerHTML = `
    ${pageHeader(
      "متحف القمم",
      "للإنجاز موضعٌ في الذاكرة، ولأصحابه أسماءٌ لا ينبغي أن تغيب."
    )}

    <div class="link-list">

      ${data.events.map(event => row(
        event.title,
        event.subtitle,
        `#/event/${encodeURIComponent(event.id)}`
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


/* ═══════════════════════════════════
   الملفات الشخصية
   ═══════════════════════════════════ */

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


/* ═══════════════════════════════════
   الصفحات والتنقل
   ═══════════════════════════════════ */

function notFound() {
  app.innerHTML = `
    <div class="empty-state">
      <h2>هذه الصفحة غير موجودة</h2>
      <a class="back-link" href="#/">العودة إلى الرئيسية</a>
    </div>
  `;
}


function render() {
  if (!app) return;

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


/* ═══════════════════════════════════
   القائمة الجانبية
   ═══════════════════════════════════ */

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", event => {
    if (event.target.closest("a")) {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}


/* ═══════════════════════════════════
   تشغيل الموقع
   ═══════════════════════════════════ */

window.addEventListener("hashchange", render);

async function start() {
  await loadData();
  render();
}

start(); =>
    String(topic.category_id) === String(category.id)
  );

  app.innerHTML = `
    ${pageHeader(category.name, "من محفوظات الآيدون.")}

    <div class="link-list">

      ${topics.length
        ? topics.map(topic => row(
            topic.title,
            topic.journalist_title
              ? `بقلم: ${topic.journalist_title}`
              : "",
            `#/topic/${encodeURIComponent(topic.id)}`
          )).join("")

        : `<p class="empty-state">لم تُنشر موضوعات في هذا القسم بعد.</p>`
      }

    </div>
  `;
}


function topicPage(id) {
  const topic = data.topics.find(item =>
    String(item.id) === String(id)
  );

  if (!topic) {
    return notFound();
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

      ${data.events.map(event => row(
        event.title,
        event.subtitle,
        `#/event/${encodeURIComponent(event.id)}`
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
    return notFound();
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
              profile
                ? getProfileLink(profile)
                : "#"
            );

          }).join("")

        : `<p class="empty-state">لم تُضف إنجازات بعد.</p>`
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
              profile
                ? getProfileLink(profile)
                : "#"
            );

          }).join("")

        : `<p class="empty-state">لم تُضف نتائج بعد.</p>`
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
    return notFound();
  }

  const achievements = data.event_achievements.filter(item =>
    String(item.profile_id) === String(profile.id)
  );

  const results = data.public_results.filter(item =>
    String(item.winner_profile_id || item.profile_id) === String(profile.id)
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

        : results.length
          ? results.map(item => row(
              item.title,
              item.description || "",
              "#"
            )).join("")

          : `<p class="empty-state">لا توجد إنجازات مسجلة.</p>`
      }

    </div>
  `;
}


/* الصفحة غير الموجودة */

function notFound() {
  app.innerHTML = `
    <div class="empty-state">

      <h2>هذه الصفحة غير موجودة</h2>

      <a class="back-link" href="#/">
        العودة إلى الرئيسية
      </a>

    </div>
  `;
}


/* التنقل */

function render() {
  let path = location.hash || "#/";

  try {
    path = decodeURIComponent(path);
  } catch (error) {
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
          تعذر تحميل لوحة الإدارة. تحققي من ملف admin.js.
        </p>
      `;
    }

    if (nav) {
      nav.classList.remove("open");
    }

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
}


/* القائمة */

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");

    menuButton.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });
}


/* مراقبة التنقل */

window.addEventListener("hashchange", render);


/* تشغيل الموقع */

async function start() {
  await loadData();
  render();
}

start();nt.id)}`
      )).join("")}
    </div>
  `;
}

function eventPage(id) {
  const event = (data.events || []).find(
    item => String(item.id) === String(id)
  );

  if (!event) {
    return notFound();
  }

  const achievements = (data.event_achievements || [])
    .filter(item => String(item.event_id) === String(id));

  const results = (data.public_results || [])
    .filter(item => String(item.event_id) === String(id));

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
            const profile = (data.profiles || []).find(
              person => String(person.id) === String(item.profile_id)
            );

            return row(
              item.title,
              item.description || "",
              profile
                ? `#/profile/${encodeURIComponent(profile.id)}`
                : "#"
            );
          }).join("")
        : `<p class="empty-state">لم تُضف إنجازات بعد.</p>`
      }
    </div>

    ${sectionHeading("النتائج والتتويجات")}

    <div class="link-list">
      ${results.length
        ? results.map(item => {
            const profile = (data.profiles || []).find(
              person => String(person.id) === String(item.winner_profile_id)
            );

            return row(
              item.title,
              profile ? profile.name : "",
              profile
                ? `#/profile/${encodeURIComponent(profile.id)}`
                : "#"
            );
          }).join("")
        : `<p class="empty-state">لم تُضف نتائج بعد.</p>`
      }
    </div>

    <a class="back-link" href="#/museum">
      ← العودة إلى متحف القمم
    </a>
  `;
}

/* الملفات الشخصية */

function profilePage(id) {
  const profiles = data.profiles || [];

  const profile = profiles.find(person =>
    String(person.id) === String(id) ||
    String(person.name) === String(id)
  );

  if (!profile) {
    return notFound();
  }

  const achievements = (data.event_achievements || [])
    .filter(item => String(item.profile_id) === String(profile.id));

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
        : `<p class="empty-state">لا توجد إنجازات مسجلة.</p>`
      }
    </div>
  `;
}

/* الصفحة غير الموجودة */

function notFound() {
  app.innerHTML = `
    <div class="empty-state">
      <h2>هذه الصفحة غير موجودة</h2>
      <a class="back-link" href="#/">
        العودة إلى الرئيسية
      </a>
    </div>
  `;
}

/* التنقل */

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

/* القائمة */

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

window.addEventListener("hashchange", render);

/* التشغيل */

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

start();
