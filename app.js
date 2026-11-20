/* =====================================================
   طبعة الآيدون الأخيرة — PUBLIC APP
   النسخة المدمجة
===================================================== */

(() => {
  "use strict";

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const app = $("#app");
  const nav = $("#mainNav");
  const menuButton = $("#menuButton");

  if (!app) {
    console.error("Aydon: #app element was not found.");
    return;
  }

  /* =========================
     DEFAULT DATA
  ========================= */

  const DEFAULT_LEADERSHIP = [
    { name: "كورومي 🎐", role: "قائدة الآيدون" },
    { name: "ساسكي ⚡", role: "نائب الآيدون" },
    { name: "فورينا 🎐", role: "مستشارة الآيدون" }
  ];

  const DEFAULT_JOURNALISTS = [
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

  const DEFAULT_CATEGORIES = [
    { id: "religion", name: "قسم الدين" },
    { id: "history", name: "قسم التاريخ" },
    { id: "literature", name: "قسم الأدب" },
    { id: "science", name: "قسم العلوم" },
    { id: "clocks", name: "قسم عقارب الآيدون" }
  ];

  const DEFAULT_EVENTS = [
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
  ];

  const DEFAULT_SETTINGS = {
    site_title: "طبعة الآيدون الأخيرة 🗞️ ㊗️",

    intro: "هنا تُستودَع الذاكرةُ ما عجزت الأيامُ عن استبقائه، وتُجمع من شتات الحكاية فصولٌ كُتبت يومًا ثم مضت؛ أخبارٌ عبرت، وأقلامٌ خلّفت أثرًا، وأسماءٌ غدت جزءًا من تاريخ الآيدون㊗️.",

    magazine_intro: "حيث تُروى أمجاد الشمال، وتُوثّق الأحداث، وتُسلّط الأضواء على آخر المستجدات؛ من أخبارٍ وتقارير إلى تسريباتٍ وفعالياتٍ تخصّ مملكة الشمال♠️."
  };

  const state = {
    data: {
      settings: { ...DEFAULT_SETTINGS },
      leadership: DEFAULT_LEADERSHIP,
      journalists: DEFAULT_JOURNALISTS,
      categories: DEFAULT_CATEGORIES,
      topics: [],
      profiles: [],
      magazine_achievements: [],
      statistics: [],
      events: DEFAULT_EVENTS,
      event_achievements: [],
      public_results: [],
      magazine: [],
      museum: []
    },

    loading: true,
    error: null,
    menuOpen: false
  };

  /* =========================
     BASIC HELPERS
  ========================= */

  const text = (value, fallback = "") =>
    value === null || value === undefined || value === ""
      ? fallback
      : String(value);

  const esc = value =>
    text(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);

  const list = value =>
    Array.isArray(value) ? value : [];

  function normalizeName(value) {
    return text(value)
      .normalize("NFKC")
      .replace(/[^\p{L}\p{N}]/gu, "")
      .toLowerCase();
  }

  function nonEmpty(value, fallback) {
    return typeof value === "string" && value.trim()
      ? value
      : fallback;
  }

  function safeImage(value) {
    const url = text(value).trim();

    if (url.startsWith("/") && !url.startsWith("//")) {
      return esc(url);
    }

    try {
      const parsed = new URL(url);

      if (
        parsed.protocol === "https:" ||
        parsed.protocol === "http:"
      ) {
        return esc(url);
      }
    } catch {
      return "";
    }

    return "";
  }

  function emptyState(message) {
    return `
      <div class="empty-state">
        <p>${esc(message)}</p>
      </div>
    `;
  }

  function sortByPosition(items = []) {
    return list(items)
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const first = a.item?.position;
        const second = b.item?.position;

        const firstValid =
          first !== null &&
          first !== undefined &&
          String(first).trim() !== "" &&
          Number.isFinite(Number(first));

        const secondValid =
          second !== null &&
          second !== undefined &&
          String(second).trim() !== "" &&
          Number.isFinite(Number(second));

        if (firstValid && secondValid) {
          return Number(first) - Number(second) ||
            a.index - b.index;
        }

        if (firstValid) return -1;
        if (secondValid) return 1;

        return a.index - b.index;
      })
      .map(entry => entry.item);
  }

  /* لا نعرض position في أي بطاقة أو صفحة.
     يستخدم الحقل للترتيب الداخلي فقط. */

  function itemId(item) {
    return text(item?.id ?? item?.slug ?? item?.key);
  }

  function itemTitle(item) {
    return text(
      item?.title ??
      item?.name ??
      item?.label,
      "بلا عنوان"
    );
  }

  function itemDescription(item) {
    return text(
      item?.description ??
      item?.summary ??
      item?.excerpt ??
      item?.content ??
      item?.body
    );
  }

  function itemImage(item) {
    return text(
      item?.image_key ??
      item?.image_url ??
      item?.image ??
      item?.cover_url
    );
  }

  function findItem(collection, id) {
    return list(collection).find(item =>
      itemId(item) === String(id) ||
      text(item?.slug) === String(id) ||
      text(item?.id) === String(id)
    ) || null;
  }

  function personName(person) {
    return typeof person === "string"
      ? person
      : text(
          person?.name ??
          person?.title ??
          person?.journalist_name
        );
  }

  function findProfileByName(name) {
    const normalized = normalizeName(name);

    if (!normalized) return null;

    return state.data.profiles.find(profile =>
      normalizeName(profile.name ?? profile.title) === normalized
    ) || null;
  }

  function findProfileFor(person) {
    const profileId =
      typeof person === "object" && person
        ? text(
            person.profile_id ??
            person.journalist_profile_id ??
            person.id
          )
        : "";

    if (profileId) {
      const profile = findItem(
        state.data.profiles,
        profileId
      );

      if (profile) return profile;
    }

    return findProfileByName(personName(person));
  }

  function profileLink(profile) {
    return `#/profile/${encodeURIComponent(itemId(profile))}`;
  }

  function topicLink(topic) {
    return `#/topic/${encodeURIComponent(itemId(topic))}`;
  }

  function eventLink(event) {
    return `#/event/${encodeURIComponent(itemId(event))}`;
  }

  /* =========================
     DATA NORMALIZATION
  ========================= */

  function normalizePayload(payload) {
    const source =
      payload && typeof payload === "object"
        ? payload
        : {};

    const settings = source.settings || {};

    return {
      ...source,

      settings: {
        ...DEFAULT_SETTINGS,
        ...settings,

        site_title: nonEmpty(
          settings.site_title,
          DEFAULT_SETTINGS.site_title
        ),

        intro: nonEmpty(
          settings.intro,
          DEFAULT_SETTINGS.intro
        ),

        magazine_intro: nonEmpty(
          settings.magazine_intro,
          DEFAULT_SETTINGS.magazine_intro
        )
      },

      leadership: list(source.leadership).length
        ? source.leadership
        : DEFAULT_LEADERSHIP,

      journalists: list(source.journalists).length
        ? source.journalists
        : DEFAULT_JOURNALISTS,

      categories: list(source.categories).length
        ? source.categories
        : list(source.archive_categories).length
          ? source.archive_categories
          : DEFAULT_CATEGORIES,

      topics: list(source.topics).length
        ? source.topics
        : list(source.archive_topics),

      profiles: list(source.profiles),

      events: list(source.events).length
        ? source.events
        : DEFAULT_EVENTS,

      magazine_achievements: list(
        source.magazine_achievements
      ),

      statistics: list(source.statistics),

      event_achievements: list(
        source.event_achievements
      ),

      public_results: list(
        source.public_results
      ),

      magazine: list(source.magazine),

      museum: list(source.museum)
    };
  }

  /* =========================
     PUBLIC DATA
  ========================= */

  async function loadPublicData() {
    state.loading = true;
    state.error = null;
    render();

    try {
      const response = await fetch("/api/public", {
        method: "GET",
        headers: {
          Accept: "application/json"
        },
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(
          `تعذّر تحميل البيانات (HTTP ${response.status}).`
        );
      }

      const payload = await response.json();

      state.data = normalizePayload(payload);

    } catch (error) {
      console.error("Aydon public API error:", error);

      state.error = error?.message ||
        "تعذّر الاتصال بالخادم.";

    } finally {
      state.loading = false;
      render();
    }
  }

  /* =========================
     ROUTES
  ========================= */

  function currentRoute() {
    let raw = (location.hash || "#/")
      .replace(/^#/, "");

    try {
      raw = decodeURIComponent(raw);
    } catch {
      raw = "/";
    }

    const parts = raw
      .split("/")
      .filter(Boolean);

    if (!parts.length) {
      return { page: "home" };
    }

    if (parts[0] === "archive" && parts[1]) {
      return {
        page: "category",
        id: parts[1]
      };
    }

    if (parts[0] === "topic" && parts[1]) {
      return {
        page: "topic",
        id: parts[1]
      };
    }

    if (parts[0] === "event" && parts[1]) {
      return {
        page: "event",
        id: parts[1]
      };
    }

    if (parts[0] === "profile" && parts[1]) {
      return {
        page: "profile",
        id: parts[1]
      };
    }

    if (parts[0] === "magazine") {
      return { page: "magazine" };
    }

    if (parts[0] === "archive") {
      return { page: "archive" };
    }

    if (parts[0] === "museum") {
      return { page: "museum" };
    }

    if (parts[0] === "admin") {
      return { page: "admin" };
    }

    return { page: "not-found" };
  }

  /* =========================
     PAGE ELEMENTS
  ========================= */

  function pageHeading(title, description = "") {
    return `
      <header class="page-heading">
        <p class="eyebrow">㊗️ من ذاكرة الآيدون</p>
        <h1>${esc(title)}</h1>

        ${description
          ? `<p>${esc(description)}</p>`
          : ""
        }
      </header>
    `;
  }

  function sectionHeading(title, description = "") {
    return `
      <div class="section-heading">
        <h2>${esc(title)}</h2>

        ${description
          ? `<p>${esc(description)}</p>`
          : ""
        }
      </div>
    `;
  }

  function card(item, routePrefix, extra = "") {
    const id = itemId(item);
    const title = itemTitle(item);
    const description = itemDescription(item);
    const image = safeImage(itemImage(item));

    return `
      <a class="archive-card"
         href="#/${routePrefix}/${encodeURIComponent(id)}">

        ${image
          ? `
            <div class="archive-card__image">
              <img
                src="${image}"
                alt=""
                loading="lazy"
              >
            </div>
          `
          : ""
        }

        <div class="archive-card__body">

          ${extra
            ? `<span class="archive-card__meta">${esc(extra)}</span>`
            : ""
          }

          <h3>${esc(title)}</h3>

          ${description
            ? `<p>${esc(description)}</p>`
            : ""
          }

        </div>
      </a>
    `;
  }

  function simpleRow(title, description = "", link = "") {
    return `
      <a class="nav-item" href="${esc(link)}">
        <div>
          <h3>${esc(title)}</h3>
          ${description
            ? `<p>${esc(description)}</p>`
            : ""
          }
        </div>
        <span class="arrow">←</span>
      </a>
    `;
  }

  /* =========================
     LEADERSHIP
  ========================= */

  function getLeadership() {
    const supplied = state.data.leadership.length
      ? state.data.leadership
      : DEFAULT_LEADERSHIP;

    const profileLeaders = state.data.profiles.filter(profile =>
      /قائدة|نائب|مستشار/.test(profile.role || "")
    );

    const combined = [
      ...supplied,
      ...profileLeaders
    ];

    const seen = new Set();
    const leaders = [];

    for (const person of combined) {
      const name = personName(person);
      const key = normalizeName(name);

      if (!key || seen.has(key)) continue;

      seen.add(key);

      const profile =
        findProfileFor(person) ||
        findProfileByName(name);

      leaders.push(
        profile
          ? { ...person, ...profile }
          : person
      );
    }

    return sortByPosition(leaders);
  }

  function renderLeadership() {
    const leaders = getLeadership();

    if (!leaders.length) {
      return emptyState("لا توجد أسماء في العُليا حاليًا.");
    }

    return `
      <div class="leadership-list">

        ${leaders.map(person => {
          const profile = findProfileFor(person);

          const name = text(
            profile?.name ?? person.name,
            "بلا اسم"
          );

          const role = text(
            profile?.role ?? person.role
          );

          const image = safeImage(
            itemImage(profile || person)
          );

          const content = `
            ${image
              ? `
                <img
                  class="person-image"
                  src="${image}"
                  alt=""
                  loading="lazy"
                >
              `
              : ""
            }

            <span class="person-info">

              <strong class="person-name">
                ${esc(name)}
              </strong>

              ${role
                ? `<small class="person-role">${esc(role)}</small>`
                : ""
              }

            </span>

            ${profile
              ? `<span class="arrow" aria-hidden="true">←</span>`
              : ""
            }
          `;

          return profile
            ? `
              <a
                class="person-row leadership-row"
                href="${profileLink(profile)}"
              >
                ${content}
              </a>
            `
            : `
              <div class="person-row leadership-row">
                ${content}
              </div>
            `;
        }).join("")}

      </div>
    `;
  }

  /* =========================
     AUTHORS
  ========================= */

  function topicAuthor(topic) {
    const profileId = text(
      topic?.journalist_profile_id ??
      topic?.profile_id
    );

    if (profileId) {
      const profile = findItem(
        state.data.profiles,
        profileId
      );

      if (profile) {
        return `
          <a class="topic-author"
             href="${profileLink(profile)}">
            بقلم: ${esc(itemTitle(profile))}
          </a>
        `;
      }
    }

    const journalistName = text(
      topic?.journalist_title ??
      topic?.journalist
    );

    const journalist = state.data.journalists.find(person =>
      normalizeName(personName(person)) ===
      normalizeName(journalistName)
    );

    const profile = journalist
      ? findProfileFor(journalist)
      : findProfileByName(journalistName);

    if (!journalistName) return "";

    return profile
      ? `
        <a class="topic-author"
           href="${profileLink(profile)}">
          بقلم: ${esc(profile.name)}
        </a>
      `
      : `
        <span class="topic-author">
          بقلم: ${esc(journalistName)}
        </span>
      `;
  }

  /* =========================
     HOME
  ========================= */

  function renderHome() {
    const settings = state.data.settings;

    const topics = sortByPosition(
      state.data.topics
    ).slice(0, 6);

    return `
      <section class="hero">

        <p class="eyebrow">العدد الختامي · ㊗️</p>

        <h1>${esc(settings.site_title)}</h1>

        <p class="intro">
          ${esc(settings.intro)}
        </p>

      </section>

      <section class="content-section">

        ${sectionHeading("أبواب الذاكرة")}

        <div class="link-list">

          ${simpleRow(
            "مجلة الآيدون",
            "مساحةٌ تحفظ سيرة الآيدون㊗️، ومحطّاتها وأبرز ما شهدته من أحداثٍ وتحولات، منذ البدايات حتى الفصل الأخير.",
            "#/magazine"
          )}

          ${simpleRow(
            "أرشيف الآيدون",
            "هنا تجتمع حصيلة أقلام الصحيفة؛ مقالاتٌ ومعارف، تنقّلت بين التاريخ والفنون والعلوم وسائر الميادين.",
            "#/archive"
          )}

          ${simpleRow(
            "متحف القمم",
            "موضعٌ تُحفظ فيه نتائج الآسترا💫، وأسماءُ المتوّجين في رقعة الآيدون♟️.",
            "#/museum"
          )}

        </div>

      </section>

      <section class="content-section">

        ${sectionHeading(
          "أحدث الإضافات",
          "من محفوظات الآيدون."
        )}

        <div class="card-grid">

          ${topics.length
            ? topics.map(item => card(item, "topic")).join("")
            : emptyState("لم تُضف موضوعات إلى الأرشيف بعد.")
          }

        </div>

      </section>
    `;
  }

  /* =========================
     MAGAZINE ACHIEVEMENTS
     مستقل تمامًا عن نتائج الفعاليات
  ========================= */

  function renderMagazineAchievements(items = []) {
    items = sortByPosition(items);

    if (!items.length) {
      return emptyState("لا توجد إنجازات مسجلة حاليًا.");
    }

    return items.map(item => `
      <div class="simple-row">
        <strong>${esc(item.title || "")}</strong>

        ${item.war_number
          ? `<span>${esc(item.war_number)}</span>`
          : ""
        }
      </div>
    `).join("");
  }

  function renderStatistics(items = []) {
    items = sortByPosition(items);

    if (!items.length) {
      return emptyState("لا توجد إحصائيات مسجلة حاليًا.");
    }

    return items.map(item => `
      <div class="simple-row">
        <span>${esc(item.title || "")}</span>
        <strong>${esc(item.value ?? "")}</strong>
      </div>
    `).join("");
  }

  /* =========================
     MAGAZINE
  ========================= */

  function renderMagazine() {
    const leaders = getLeadership();

    const journalists = sortByPosition(
      state.data.journalists
    ).filter(person => personName(person));

    const achievements = sortByPosition(
      state.data.magazine_achievements
    );

    const statistics = sortByPosition(
      state.data.statistics
    );

    return `
      ${pageHeading(
        "مَجلـة الآيـدون㊗️",
        state.data.settings.magazine_intro
      )}

      <div class="accordion-list">

        <details class="accordion">

          <summary>تعريف المجلة</summary>

          <div class="accordion-content">
            <p class="intro">
              صحيفةٌ وُجدت لتوثّق ما يمرّ على مملكة نورث،
              وتجمع أخبارها وتقاريرها، وتحفظ ما خلّفته
              أقلام كتّابها من أثر.
            </p>
          </div>

        </details>

        <details class="accordion">

          <summary>العُليا</summary>

          <div class="accordion-content">
            ${renderLeadership()}
          </div>

        </details>

        <details class="accordion">

          <summary>الصحفيون</summary>

          <div class="accordion-content">

            ${journalists.length
              ? journalists.map(person => {
                  const name = personName(person);
                  const profile = findProfileFor(person);

                  return profile
                    ? `
                      <a class="person-row"
                         href="${profileLink(profile)}">

                        <span class="person-name">
                          ${esc(name)}
                        </span>

                        <span class="arrow">←</span>

                      </a>
                    `
                    : `
                      <div class="person-row">
                        <span class="person-name">
                          ${esc(name)}
                        </span>
                      </div>
                    `;
                }).join("")
              : emptyState("لا يوجد صحفيون مسجلون.")
            }

          </div>

        </details>

        <details class="accordion">

          <summary>الإنجازات</summary>

          <div class="accordion-content">
            ${renderMagazineAchievements(achievements)}
          </div>

        </details>

        <details class="accordion">

          <summary>الآيدون بالأرقام</summary>

          <div class="accordion-content">
            ${renderStatistics(statistics)}
          </div>

        </details>

      </div>
    `;
  }

  /* =========================
     ARCHIVE
  ========================= */

  function renderArchive() {
    const categories = sortByPosition(
      state.data.categories
    );

    const topics = sortByPosition(
      state.data.topics
    );

    return `
      ${pageHeading(
        "أرشيف الآيدون",
        "هنا تجتمع حصيلة أقلام الصحيفة؛ مقالاتٌ ومعارف، تنقّلت بين التاريخ والفنون والعلوم وسائر الميادين."
      )}

      <div class="card-grid">

        ${categories.length
          ? categories.map(item =>
              card(item, "archive")
            ).join("")
          : emptyState("لا توجد أقسام متاحة حاليًا.")
        }

      </div>

      <section class="content-section">

        ${sectionHeading("الموضوعات")}

        <div class="card-grid">

          ${topics.length
            ? topics.map(item => `
                <article class="archive-topic-card">
                  ${card(item, "topic")}
                  ${topicAuthor(item)}
                </article>
              `).join("")
            : emptyState("لا توجد موضوعات منشورة حاليًا.")
          }

        </div>

      </section>
    `;
  }

  /* =========================
     CATEGORY
  ========================= */

  function renderCategory(id) {
    const category = findItem(
      state.data.categories,
      id
    );

    if (!category) {
      return `
        ${pageHeading("القسم غير موجود")}
        ${emptyState("لم يُعثر على القسم المطلوب.")}
      `;
    }

    const related = state.data.topics.filter(topic => {
      const categoryId = text(
        topic.category_id ??
        topic.category ??
        topic.category_slug
      );

      return (
        categoryId === id ||
        categoryId === itemId(category)
      );
    });

    return `
      ${pageHeading(
        itemTitle(category),
        itemDescription(category) || "من محفوظات الآيدون."
      )}

      <div class="card-grid">

        ${related.length
          ? sortByPosition(related)
              .map(item => `
                <article class="archive-topic-card">
                  ${card(item, "topic")}
                  ${topicAuthor(item)}
                </article>
              `)
              .join("")
          : emptyState("لا توجد موضوعات مدرجة في هذا القسم بعد.")
        }

      </div>
    `;
  }

  /* =========================
     COMBINED EVENT RECORDS
     دمج العرض فقط، لا دمج الجداول
  ========================= */

  function getCombinedEventRecords(eventId) {
    const achievements = state.data.event_achievements
      .filter(entry =>
        String(entry.event_id) === String(eventId)
      )
      .map(entry => ({
        ...entry,
        record_type: "achievement"
      }));

    const results = state.data.public_results
      .filter(entry =>
        String(entry.event_id) === String(eventId)
      )
      .map(entry => ({
        ...entry,
        record_type: "result"
      }));

    return sortByPosition([
      ...achievements,
      ...results
    ]);
  }

  function getProfileTrophies(profileId) {
    const achievements = state.data.event_achievements
      .filter(entry =>
        String(entry.profile_id) === String(profileId)
      )
      .map(entry => ({
        ...entry,
        record_type: "achievement"
      }));

    const results = state.data.public_results
      .filter(entry =>
        String(
          entry.winner_profile_id ??
          entry.profile_id
        ) === String(profileId)
      )
      .map(entry => ({
        ...entry,
        record_type: "result"
      }));

    return sortByPosition([
      ...achievements,
      ...results
    ]);
  }

  /* =========================
     MUSEUM
  ========================= */

  function renderMuseum() {
    const events = sortByPosition(
      state.data.events
    );

    return `
      ${pageHeading(
        "متحف القمم",
        "للإنجاز موضعٌ في الذاكرة، ولأصحابه أسماءٌ لا ينبغي أن تغيب."
      )}

      <div class="card-grid">

        ${events.length
          ? events.map(event => card(event, "event")).join("")
          : emptyState("لا توجد فعاليات منشورة حاليًا.")
        }

      </div>

    `;
  }

  /* =========================
     DETAIL PAGES
  ========================= */

  function renderTopic(id) {
    const topic = findItem(
      state.data.topics,
      id
    );

    if (!topic) {
      return `
        ${pageHeading("الموضوع")}
        ${emptyState("لم يُعثر على الموضوع المطلوب.")}
      `;
    }

    const image = safeImage(itemImage(topic));

    return `
      <article class="detail-page">

        ${pageHeading(itemTitle(topic))}

        ${topicAuthor(topic)
          ? `<div class="detail-meta">${topicAuthor(topic)}</div>`
          : ""
        }

        ${image
          ? `
            <img
              class="detail-image"
              src="${image}"
              alt=""
            >
          `
          : ""
        }

        <div class="detail-content">
          ${esc(
            text(topic.content ?? topic.body ?? topic.description)
          ).replace(/\n/g, "<br>")}
        </div>

      </article>
    `;
  }

  function renderEvent(id) {
    const event = findItem(
      state.data.events,
      id
    );

    if (!event) {
      return `
        ${pageHeading("الفعالية")}
        ${emptyState("لم يُعثر على الفعالية المطلوبة.")}
      `;
    }

    const records = getCombinedEventRecords(itemId(event));

    const image = safeImage(itemImage(event));

    return `
      <article class="detail-page">

        ${pageHeading(
          itemTitle(event),
          text(event.subtitle ?? event.description)
        )}

        ${image
          ? `
            <img
              class="detail-image"
              src="${image}"
              alt=""
            >
          `
          : ""
        }

        ${event.description
          ? `<p>${esc(event.description)}</p>`
          : ""
        }

        <section class="content-section">

          ${sectionHeading("النتائج والتتويجات")}

          <div class="link-list">

            ${records.length
              ? records.map(entry => {
                  const winnerId = text(
                    entry.winner_profile_id ??
                    entry.profile_id
                  );

                  const winner = winnerId
                    ? findItem(state.data.profiles, winnerId)
                    : null;

                  const description = [
                    winner?.name,
                    itemDescription(entry)
                  ].filter(Boolean).join(" — ");

                  return simpleRow(
                    itemTitle(entry),
                    description,
                    winner
                      ? profileLink(winner)
                      : eventLink(event)
                  );
                }).join("")
              : emptyState("لم تُضف نتائج أو تتويجات بعد.")
            }

          </div>

        </section>

      </article>
    `;
  }

  /* =========================
     PROFILE
  ========================= */

  function renderProfile(id) {
    const profile = findItem(
      state.data.profiles,
      id
    );

    if (!profile) {
      return `
        ${pageHeading("الملف الشخصي")}
        ${emptyState("لم يُعثر على الملف المطلوب.")}
      `;
    }

    const authoredTopics = sortByPosition(
      state.data.topics.filter(topic =>
        String(
          topic.journalist_profile_id ??
          topic.profile_id
        ) === String(itemId(profile)) ||

        (
          !topic.journalist_profile_id &&
          !topic.profile_id &&
          normalizeName(topic.journalist_title) ===
            normalizeName(profile.name)
        )
      )
    );

    const trophies = getProfileTrophies(
      itemId(profile)
    );

    const image = safeImage(itemImage(profile));

    return `
      <article class="detail-page">

        ${pageHeading("من أصحاب الأثر")}

        <div class="profile-header">

          ${image
            ? `
              <img
                src="${image}"
                alt="${esc(profile.name)}"
              >
            `
            : ""
          }

          <div>
            <h2>${esc(profile.name || "")}</h2>

            ${profile.role
              ? `<p>${esc(profile.role)}</p>`
              : ""
            }
          </div>

        </div>

        ${profile.description
          ? `
            <p class="profile-description">
              ${esc(profile.description)}
            </p>
          `
          : ""
        }

        ${profile.extra_info
          ? `
            <div class="simple-row">
              ${esc(profile.extra_info)}
            </div>
          `
          : ""
        }

        ${authoredTopics.length
          ? `
            <section class="content-section">

              ${sectionHeading("الأعمال المنشورة")}

              <div class="card-grid">
                ${authoredTopics.map(topic => {
                  const category = findItem(
                    state.data.categories,
                    topic.category_id
                  );

                  return card(
                    topic,
                    "topic",
                    category ? itemTitle(category) : ""
                  );
                }).join("")}
              </div>

            </section>
          `
          : ""
        }

        ${trophies.length
          ? `
            <section class="content-section">

              ${sectionHeading("النتائج والتتويجات")}

              <div class="link-list">

                ${trophies.map(entry => {
                  const event = findItem(
                    state.data.events,
                    entry.event_id
                  );

                  return simpleRow(
                    itemTitle(entry),
                    itemDescription(entry) ||
                      (event ? itemTitle(event) : ""),
                    event
                      ? eventLink(event)
                      : profileLink(profile)
                  );
                }).join("")}

              </div>

            </section>
          `
          : ""
        }

      </article>
    `;
  }

  /* =========================
     NAVIGATION
  ========================= */

  function renderNavigation() {
    if (!nav) return;

    nav.innerHTML = `
      <a href="#/">الرئيسية</a>
      <a href="#/magazine">المجلة</a>
      <a href="#/archive">الأرشيف</a>
      <a href="#/museum">متحف القمم</a>
    `;

    nav.classList.toggle(
      "is-open",
      state.menuOpen
    );

    const route = currentRoute();

    nav.querySelectorAll("a").forEach(link => {
      const href = link.getAttribute("href");

      const active =
        href === "#/" && route.page === "home" ||
        href === "#/magazine" && route.page === "magazine" ||
        href === "#/archive" &&
          ["archive", "category", "topic"].includes(route.page) ||
        href === "#/museum" &&
          ["museum", "event", "profile"].includes(route.page);

      link.classList.toggle("active", active);
    });
  }

  /* =========================
     ADMIN
  ========================= */

  function renderAdmin() {
    if (
      window.AdminPanel &&
      typeof window.AdminPanel.start === "function"
    ) {
      window.AdminPanel.start();

      return `
        <div class="loading-state">
          جارٍ فتح لوحة الإدارة...
        </div>
      `;
    }

    return `
      ${pageHeading("الإدارة")}

      ${emptyState(
        "لوحة الإدارة غير متاحة. تأكّد من تحميل ملف admin.js."
      )}
    `;
  }

  /* =========================
     MAIN RENDER
  ========================= */

  function render() {
    renderNavigation();

    if (state.loading) {
      app.innerHTML = `
        <div class="loading-state">
          جارٍ تحميل أرشيف الآيدون…
        </div>
      `;

      return;
    }

    if (state.error) {
      app.innerHTML = `
        ${pageHeading("تعذّر تحميل الأرشيف")}

        <div class="error-state">

          <p>${esc(state.error)}</p>

          <p>
            تحقّق من خدمة
            <code>/api/public</code>
            في الخادم.
          </p>

          <button
            class="button"
            id="retryButton"
            type="button"
          >
            إعادة المحاولة
          </button>

        </div>
      `;

      $("#retryButton")?.addEventListener(
        "click",
        loadPublicData
      );

      return;
    }

    const route = currentRoute();

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
        app.innerHTML = renderTopic(route.id);
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

      case "admin":
        app.innerHTML = renderAdmin();
        break;

      default:
        app.innerHTML = `
          ${pageHeading("الصفحة غير موجودة")}
          ${emptyState(
            "الرابط الذي فتحته غير صالح أو لم يعد متاحًا."
          )}
        `;
    }
  }

  /* =========================
     EVENTS
  ========================= */

  menuButton?.addEventListener("click", () => {
    state.menuOpen = !state.menuOpen;
    renderNavigation();

    menuButton.setAttribute(
      "aria-expanded",
      String(state.menuOpen)
    );
  });

  nav?.addEventListener("click", event => {
    if (event.target.closest("a")) {
      state.menuOpen = false;
      renderNavigation();

      menuButton?.setAttribute(
        "aria-expanded",
        "false"
      );
    }
  });

  window.addEventListener(
    "hashchange",
    render
  );

  /* =========================
     START
  ========================= */

  loadPublicData();

})();
