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

  if (url.startsWith("/") && !url.startsWith("//")) {
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
        ${description ? `<p>${description}</p>` : ""}
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
      ${description ? `<p class="intro">${escapeHTML(description)}</p>` : ""}
    </header>
  `;
}

function sectionHeading(title, description = "") {
  return `
    <div class="section-heading">
      <h2>${escapeHTML(title)}</h2>
      ${description ? `<p>${escapeHTML(description)}</p>` : ""}
    </div>
  `;
}

function getProfileLink(profile) {
  return `#/profile/${encodeURIComponent(profile.id)}`;
}

function getTopicLink(topic) {
  return `#/topic/${encodeURIComponent(topic.id)}`;
}

function getEventLink(event) {
  return `#/event/${encodeURIComponent(event.id || event.slug)}`;
}

function findProfile(id) {
  if (id === undefined || id === null || id === "") {
    return null;
  }

  return data.profiles.find(profile =>
    String(profile.id) === String(id)
  ) || null;
}

function findProfileByName(name) {
  if (!name) return null;

  const normalized = String(name).trim();

  return data.profiles.find(profile =>
    String(profile.name || "").trim() === normalized
  ) || null;
}

function findEvent(id) {
  if (id === undefined || id === null || id === "") {
    return null;
  }

  return data.events.find(event =>
    String(event.id) === String(id) ||
    String(event.slug) === String(id)
  ) || null;
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

function hasContent(value) {
  return value !== undefined &&
    value !== null &&
    String(value).trim() !== "";
}

/* ترتيب العناصر:
   الأرقام الصحيحة أولًا تصاعديًا،
   والعناصر بلا ترتيب في النهاية،
   مع الحفاظ على ترتيبها الأصلي عند التعادل. */

function sortByPosition(items = []) {
  return asArray(items)
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aHasPosition =
        hasContent(a.item.position) &&
        Number.isFinite(Number(a.item.position));

      const bHasPosition =
        hasContent(b.item.position) &&
        Number.isFinite(Number(b.item.position));

      if (aHasPosition && bHasPosition) {
        return Number(a.item.position) - Number(b.item.position) ||
          a.index - b.index;
      }

      if (aHasPosition) return -1;
      if (bHasPosition) return 1;

      return a.index - b.index;
    })
    .map(entry => entry.item);
}

/* تحميل البيانات */

async function loadData() {
  try {
    const response = await fetch("/api/public", {
      method: "GET",
      headers: { "Accept": "application/json" },
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

      leadership: asArray(result.leadership).length
        ? sortByPosition(result.leadership)
        : defaultData.leadership,

      journalists: sortByPosition(
        asArray(result.journalists).length
          ? result.journalists
          : defaultData.journalists
      ),

      categories: sortByPosition(
        asArray(result.categories).length
          ? result.categories
          : asArray(result.archive_categories).length
            ? result.archive_categories
            : defaultData.categories
      ),

      topics: sortByPosition(
        asArray(result.topics).length
          ? result.topics
          : asArray(result.archive_topics)
      ),

      profiles: asArray(result.profiles),

      events: sortByPosition(
        asArray(result.events).length
          ? result.events
          : defaultData.events
      ),

      magazine_achievements: sortByPosition(
        asArray(result.magazine_achievements)
      ),

      statistics: sortByPosition(
        asArray(result.statistics)
      ),

      event_achievements: sortByPosition(
        asArray(result.event_achievements)
      ),

      public_results: sortByPosition(
        asArray(result.public_results)
      )
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

  return sortByPosition(
    leaders.length ? leaders : data.leadership
  );
}

/* الصفحة الرئيسية */

function homePage() {
  const settings = data.settings;

  app.innerHTML = `
    <section class="hero">
      <div class="eyebrow">العدد الختامي · ㊗️</div>
      <h1>${escapeHTML(settings.site_title)}</h1>
      <p class="intro">${escapeHTML(settings.intro)}</p>
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
  const journalists = sortByPosition(data.journalists || []);

  app.innerHTML = `
    ${pageHeader("مَجلـة الآيـدون㊗️", data.settings.magazine_intro)}

    <div class="accordion-list">

      <details class="accordion">
        <summary>تعريف المجلة</summary>
        <div class="accordion-content">
          <p class="intro">
            صحيفةٌ وُجدت لتوثّق ما يمرّ على مملكة نورث، وتجمع أخبارها وتقاريرها،
            وتحفظ ما خلّفته أقلام كتّابها من أثر.
          </p>
        </div>
      </details>

      ${leaders.length ? `
        <details class="accordion">
          <summary>العُليا</summary>
          <div class="accordion-content">
            ${leaders.map(person => {
              const profile =
                findProfile(person.id) ||
                findProfileByName(person.name);

              const content = `
                ${person.image_key
                  ? `<img src="${safeImage(person.image_key)}" alt="">`
                  : ""}
                <div>
                  <div class="person-name">${escapeHTML(person.name)}</div>
                  ${hasContent(person.role)
                    ? `<div class="person-role">${escapeHTML(person.role)}</div>`
                    : ""}
                </div>
                <span class="arrow">←</span>
              `;

              return profile
                ? `<a class="person-row" href="${getProfileLink(profile)}">${content}</a>`
                : `<div class="person-row">${content}</div>`;
            }).join("")}
          </div>
        </details>
      ` : ""}

      ${journalists.length ? `
        <details class="accordion">
          <summary>الصحفيون</summary>
          <div class="accordion-content">
            ${journalists.map(person => {
              const name = typeof person === "string"
                ? person
                : person.name || "";

              const profile =
                (typeof person === "object"
                  ? findProfile(person.profile_id)
                  : null) ||
                findProfileByName(name);

              const content = `
                <div class="person-name">
                  ${escapeHTML(name)}
                </div>
              `;

              return profile
                ? `<a class="person-row" href="${getProfileLink(profile)}">${content}<span class="arrow">←</span></a>`
                : `<div class="person-row">${content}</div>`;
            }).join("")}
          </div>
        </details>
      ` : ""}

      ${data.magazine_achievements.length ? `
        <details class="accordion">
          <summary>الإنجازات</summary>
          <div class="accordion-content">
            ${renderMagazineAchievements(data.magazine_achievements)}
          </div>
        </details>
      ` : ""}

      ${data.statistics.length ? `
        <details class="accordion">
          <summary>الآيدون بالأرقام</summary>
          <div class="accordion-content">
            ${renderStatistics(data.statistics)}
          </div>
        </details>
      ` : ""}

    </div>
  `;
}

function renderMagazineAchievements(items = []) {
  const sorted = sortByPosition(items);

  if (!sorted.length) return "";

  return sorted.map(item => `
    <div class="simple-row">
      <strong>${escapeHTML(item.title)}</strong>
      ${hasContent(item.war_number)
        ? `<span>${escapeHTML(item.war_number)}</span>`
        : ""}
    </div>
  `).join("");
}

function renderStatistics(items = []) {
  const sorted = sortByPosition(items);

  if (!sorted.length) return "";

  return sorted.map(item => `
    <div class="simple-row">
      <span>${escapeHTML(item.title)}</span>
      <strong>${escapeHTML(item.value)}</strong>
    </div>
  `).join("");
}

/* الأرشيف */

function archivePage() {
  const categories = sortByPosition(data.categories || []);

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

  const topics = sortByPosition(
    data.topics.filter(topic =>
      String(topic.category_id) === String(category.id)
    )
  );

  app.innerHTML = `
    ${pageHeader(category.name || category.title, "من محفوظات الآيدون.")}

    <div class="link-list">
      ${topics.length
        ? topics.map(topic => {
            const profile = findProfile(topic.journalist_profile_id);

            const description = profile
              ? `بقلم: ${escapeHTML(profile.name)}`
              : topic.journalist_title
                ? `بقلم: ${escapeHTML(topic.journalist_title)}`
                : "";

            return row(
              topic.title,
              description,
              getTopicLink(topic)
            );
          }).join("")
        : emptyState("لم تُنشر موضوعات في هذا القسم بعد.")
      }
    </div>
  `;

  topics.forEach(topic => {
    const profile = findProfile(topic.journalist_profile_id);

    if (!profile) return;

    const links = app.querySelectorAll(
      `.nav-item[href="${getTopicLink(topic)}"]`
    );

    links.forEach(link => {
      const description = link.querySelector("p");

      if (!description) return;

      description.innerHTML = `
        بقلم:
        <a href="${escapeHTML(getProfileLink(profile))}"
           class="inline-profile-link">
          ${escapeHTML(profile.name)}
        </a>
      `;

      description.querySelector("a")?.addEventListener("click", event => {
        event.stopPropagation();
      });
    });
  });
}

function topicPage(id) {
  const topic = data.topics.find(item =>
    String(item.id) === String(id)
  );

  if (!topic) {
    notFound();
    return;
  }

  const profile = findProfile(topic.journalist_profile_id);

  const byline = profile
    ? `
      <div class="byline">
        بقلم:
        <a href="${escapeHTML(getProfileLink(profile))}"
           class="inline-profile-link">
          ${escapeHTML(profile.name)}
        </a>
      </div>
    `
    : topic.journalist_title
      ? `<div class="byline">بقلم: ${escapeHTML(topic.journalist_title)}</div>`
      : "";

  app.innerHTML = `
    ${pageHeader(topic.title)}

    <article class="topic">
      ${byline}

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
  const events = sortByPosition(data.events || []);

  app.innerHTML = `
    ${pageHeader(
      "متحف القمم",
      "للإنجاز موضعٌ في الذاكرة، ولأصحابه أسماءٌ لا ينبغي أن تغيب."
    )}

    <div class="link-list">
      ${events.length
        ? events.map(event => row(
            event.title,
            event.subtitle || "",
            getEventLink(event)
          )).join("")
        : emptyState("لا توجد فعاليات منشورة حاليًا.")
      }
    </div>
  `;
}

/* دمج إنجازات الفعالية ونتائجها */

function getEventResults(eventId) {
  const achievements = data.event_achievements.filter(item =>
    String(item.event_id) === String(eventId)
  );

  const results = data.public_results.filter(item =>
    String(item.event_id) === String(eventId)
  );

  const combined = [
    ...achievements.map(item => ({
      ...item,
      linked_profile_id: item.profile_id,
      source_type: "achievement"
    })),

    ...results.map(item => ({
      ...item,
      linked_profile_id:
        item.winner_profile_id || item.profile_id,
      source_type: "result"
    }))
  ];

  return sortByPosition(combined);
}

function eventPage(id) {
  const event = findEvent(id);

  if (!event) {
    notFound();
    return;
  }

  const results = getEventResults(event.id);

  app.innerHTML = `
    ${pageHeader(event.title, event.subtitle || "")}

    ${event.image_key
      ? `<img class="event-image"
              src="${safeImage(event.image_key)}"
              alt="${escapeHTML(event.title)}">`
      : ""}

    ${hasContent(event.description)
      ? `<p class="intro">${escapeHTML(event.description)}</p>`
      : ""}

    ${results.length ? `
      ${sectionHeading("النتائج والتتويجات")}

      <div class="link-list">
        ${results.map(item => {
          const profile = findProfile(item.linked_profile_id);

          const descriptionParts = [];

          if (profile) {
            descriptionParts.push(
              `<a class="inline-profile-link" href="${escapeHTML(getProfileLink(profile))}">${escapeHTML(profile.name)}</a>`
            );
          } else if (hasContent(item.description)) {
            descriptionParts.push(escapeHTML(item.description));
          }

          return row(
            item.title,
            descriptionParts.join(""),
            profile ? getProfileLink(profile) : getEventLink(event)
          );
        }).join("")}
      </div>
    ` : ""}

    <a class="back-link" href="#/museum">
      ← العودة إلى متحف القمم
    </a>
  `;

  app.querySelectorAll(".inline-profile-link").forEach(link => {
    link.addEventListener("click", event => {
      event.stopPropagation();
    });
  });
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

  /* المواضيع التي كتبها صاحب الملف */

  const authoredTopics = sortByPosition(
    data.topics.filter(topic =>
      String(topic.journalist_profile_id) === String(profile.id)
    )
  );

  /* إنجازاته ونتائجه في الفعاليات */

  const achievements = data.event_achievements
    .filter(item =>
      String(item.profile_id) === String(profile.id)
    )
    .map(item => ({
      ...item,
      linked_profile_id: item.profile_id
    }));

  const results = data.public_results
    .filter(item =>
      String(item.winner_profile_id || item.profile_id) === String(profile.id)
    )
    .map(item => ({
      ...item,
      linked_profile_id:
        item.winner_profile_id || item.profile_id
    }));

  const combinedResults = sortByPosition([
    ...achievements,
    ...results
  ]);

  app.innerHTML = `
    ${pageHeader("من أصحاب الأثر")}

    <div class="profile-header">
      ${profile.image_key
        ? `<img src="${safeImage(profile.image_key)}"
                alt="${escapeHTML(profile.name)}">`
        : ""}

      <div>
        <h2>${escapeHTML(profile.name)}</h2>
        ${hasContent(profile.role)
          ? `<p>${escapeHTML(profile.role)}</p>`
          : ""}
      </div>
    </div>

    ${hasContent(profile.description)
      ? `<p class="profile-description">
           ${escapeHTML(profile.description)}
         </p>`
      : ""}

    ${hasContent(profile.extra_info)
      ? `<div class="simple-row">${escapeHTML(profile.extra_info)}</div>`
      : ""}

    ${authoredTopics.length ? `
      ${sectionHeading("الأعمال المنشورة")}

      <div class="link-list">
        ${authoredTopics.map(topic => {
          const category = data.categories.find(item =>
            String(item.id) === String(topic.category_id)
          );

          return row(
            topic.title,
            category ? category.name || category.title : "",
            getTopicLink(topic)
          );
        }).join("")}
      </div>
    ` : ""}

    ${combinedResults.length ? `
      ${sectionHeading("النتائج والتتويجات")}

      <div class="link-list">
        ${combinedResults.map(item => {
          const event = findEvent(item.event_id);

          return row(
            item.title,
            hasContent(item.description)
              ? escapeHTML(item.description)
              : event
                ? escapeHTML(event.title)
                : "",
            event ? getEventLink(event) : getProfileLink(profile)
          );
        }).join("")}
      </div>
    ` : ""}
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
  if (!app) {
    console.error("Aydon: عنصر app غير موجود.");
    return;
  }

  app.innerHTML = `
    <div class="empty-state">
      <p>تُفتح صفحات الذاكرة...</p>
    </div>
  `;

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

start();emId(item))
      : [];

    const relatedResults = type === "event"
      ? state.data.results.filter((entry) => text(entry.event_id) === itemId(item))
      : [];

    return `<article class="detail-page">
      ${pageHeading(itemTitle(item), text(item.date ?? item.published_at))}

      ${image ? `<img class="detail-image" src="${esc(image)}" alt="">` : ""}

      ${linkedProfile ? `<div class="detail-meta">${linkedProfile}</div>` : ""}

      <div class="detail-content">${esc(body).replace(/\n/g, "<br>")}</div>

      ${authoredTopics.length ? `
        <section class="content-section">
          <h2>موضوعاته في الأرشيف</h2>
          <div class="card-grid">
            ${authoredTopics.map((entry) => card(entry, "topic")).join("")}
          </div>
        </section>
      ` : ""}

      ${relatedAchievements.length ? `
        <section class="content-section">
          <h2>الإنجازات والتكريمات</h2>
          ${relatedAchievements.map((entry) => `
            <div class="archive-card__body">
              <h3>${esc(itemTitle(entry))}</h3>
              <p>${esc(itemDescription(entry))}</p>
            </div>
          `).join("")}
        </section>
      ` : ""}

      ${relatedResults.length ? `
        <section class="content-section">
          <h2>النتائج والتكريم</h2>
          ${relatedResults.map((entry) => {
            const winner = findItem(
              state.data.profiles,
              text(entry.profile_id ?? entry.winner_profile_id)
            );

            return `
              <div class="archive-card__body">
                <h3>${esc(itemTitle(entry))}</h3>
                <p>${esc(itemDescription(entry))}</p>
                ${winner
                  ? `<a href="${profileLink(winner)}">${esc(itemTitle(winner))}</a>`
                  : ""}
              </div>
            `;
          }).join("")}
        </section>
      ` : ""}

      ${linkedEvent
        ? `<p><a href="#/event/${encodeURIComponent(itemId(linkedEvent))}">الفعالية المرتبطة</a></p>`
        : ""}
    </article>`;
  }

  function renderMagazine() {
    const items = state.data.magazine.length
      ? state.data.magazine
      : state.data.topics;

    const journalists = state.data.journalists.length
      ? state.data.journalists
      : [
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
        ];

    return `${pageHeading("المجلة", "إصدارات الآيدون وموادها المحفوظة.")}

      <div class="card-grid">
        ${items.length
          ? items.map((item) => `
              <article class="archive-topic-card">
                ${card(item, "topic")}
                ${topicAuthor(item)}
              </article>
            `).join("")
          : emptyState("لا توجد إصدارات منشورة حاليًا.")}
      </div>

      <section class="content-section">
        <h2>الصحفيون</h2>
        <div class="journalists-list">
          ${journalists.map((person) => {
            const name = personName(person);
            const profile = findProfileFor(person);

            return profile
              ? `<a class="person-row" href="${profileLink(profile)}">
                   <span class="person-name">${esc(name)}</span>
                   <span class="arrow">←</span>
                 </a>`
              : `<div class="person-row">
                   <span class="person-name">${esc(name)}</span>
                 </div>`;
          }).join("")}
        </div>
      </section>`;
  }

  function renderMuseum() {
    return `${pageHeading("المتحف", "شواهد وصور ومحطات من ذاكرة الآيدون.")}
      <div class="card-grid">
        ${state.data.museum.length
          ? state.data.museum.map((item) => {
              const image = text(item.image_url ?? item.image);

              return `<article class="archive-card">
                ${image
                  ? `<div class="archive-card__image"><img src="${esc(image)}" alt="" loading="lazy"></div>`
                  : ""}
                <div class="archive-card__body">
                  <h3>${esc(itemTitle(item))}</h3>
                  <p>${esc(itemDescription(item))}</p>
                </div>
              </article>`;
            }).join("")
          : emptyState("لا توجد مقتنيات معروضة في المتحف بعد.")}
      </div>`;
  }

  function renderEvent(id) {
    return renderDetail(findItem(state.data.events, id), "الفعالية", "event");
  }

  function renderProfile(id) {
    const profile = findItem(state.data.profiles, id);

    if (profile) {
      return renderDetail(profile, "الملف الشخصي", "profile");
    }

    const journalist = findItem(
      state.data.journalists.filter((person) => typeof person === "object"),
      id
    );

    if (journalist) {
      return renderDetail(journalist, "الملف الشخصي", "profile");
    }

    return `${pageHeading("الملف الشخصي")}${emptyState("لم يُعثر على الملف المطلوب.")}`;
  }

  // التعديل الأول: تشغيل لوحة الإدارة بالطريقة الصحيحة.
  let adminStarted = false;

  function renderAdmin() {
    if (!window.AdminPanel || typeof window.AdminPanel.start !== "function") {
      app.innerHTML = `${pageHeading("الإدارة")}
        ${emptyState("لوحة الإدارة غير متاحة. تأكّد من تحميل ملف admin.js ثم أعد المحاولة.")}`;
      return;
    }

    if (!adminStarted) {
      adminStarted = true;
      window.AdminPanel.start();
    }
  }

  function renderNavigation() {
    if (!nav) return;

    nav.innerHTML = `
      <a href="#/">الرئيسية</a>
      <a href="#/magazine">المجلة</a>
      <a href="#/archive">الأرشيف</a>
      <a href="#/museum">المتحف</a>`;

    // التعديل الثاني: استخدام open المطابقة للـ CSS.
    nav.classList.toggle("open", state.menuOpen);
    menuButton?.setAttribute("aria-expanded", String(state.menuOpen));
  }

  // التعديل الثالث: فحص مسار الإدارة قبل حالة التحميل والخطأ.
  function render() {
    renderNavigation();

    const route = currentRoute();

    if (route.page === "admin") {
      renderAdmin();
      return;
    }

    adminStarted = false;

    if (state.loading) {
      app.innerHTML = `<div class="loading">تُفتح صفحات الذاكرة...</div>`;
      return;
    }

    if (state.error) {
      app.innerHTML = `${pageHeading("تعذّر تحميل الأرشيف")}
        <div class="error-state">
          <p>${esc(state.error)}</p>
          <p>تحقّق من خدمة <code>/api/public</code> في الخادم.</p>
          <button class="button" id="retryButton" type="button">إعادة المحاولة</button>
        </div>`;

      $("#retryButton")?.addEventListener("click", loadPublicData);
      return;
    }

    switch (route.page) {
      case "home":
        app.innerHTML = renderHome();
        break;

      case "magazine":
        app.innerHTML = renderMagazine();
        break;

      case "archive":
        app.innerHTML = renderArchive();
        break;

      case "category":
        app.innerHTML = renderCategory(route.id);
        break;

      case "topic":
        app.innerHTML = renderDetail(
          findItem(state.data.topics, route.id),
          "الموضوع",
          "topic"
        );
        break;

      case "museum":
        app.innerHTML = renderMuseum();
        break;

      case "event":
        app.innerHTML = renderEvent(route.id);
        break;

      case "profile":
        app.innerHTML = renderProfile(route.id);
        break;

      default:
        app.innerHTML = `${pageHeading("الصفحة غير موجودة")}${emptyState("الرابط الذي فتحته غير صالح أو لم يعد متاحًا.")}`;
    }
  }

  menuButton?.addEventListener("click", () => {
    state.menuOpen = !state.menuOpen;
    renderNavigation();
  });

  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      state.menuOpen = false;
      renderNavigation();
    }
  });

  window.addEventListener("hashchange", render);
  loadPublicData();
})(); 
