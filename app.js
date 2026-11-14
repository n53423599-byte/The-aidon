/* Aydon Archive — clean frontend entry point.
   Save this file as UTF-8, replacing the entire old app.js. */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const app = $("#app");
  const nav = $("#mainNav");
  const menuButton = $("#menuButton");

  if (!app) {
    console.error("Aydon: #app element was not found.");
    return;
  }

  const state = {
    data: {
      categories: [],
      topics: [],
      events: [],
      profiles: [],
      journalists: [],
      magazine: [],
      museum: [],
      achievements: [],
      results: []
    },
    loading: true,
    error: null,
    menuOpen: false
  };

  const text = (value, fallback = "") =>
    value === null || value === undefined || value === "" ? fallback : String(value);

  const esc = (value) => text(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));

  const list = (...values) => values.find(Array.isArray) || [];

  function normalizePayload(payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    return {
      ...source,
      categories: list(source.categories, source.archive_categories),
      topics: list(source.topics, source.archive_topics),
      events: list(source.events, source.archive_events),
      profiles: list(source.profiles, source.archive_profiles),
      journalists: list(source.journalists, source.staff, source.writers),
      magazine: list(source.magazine, source.editions, source.issues),
      museum: list(source.museum, source.museum_items, source.gallery),
      achievements: list(source.achievements, source.profile_achievements),
      results: list(source.results, source.event_results, source.winners)
    };
  }

  async function loadPublicData() {
    state.loading = true;
    state.error = null;
    render();

    try {
      const response = await fetch("/api/public", {
        method: "GET",
        headers: { "Accept": "application/json" },
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`تعذّر تحميل البيانات (HTTP ${response.status}).`);
      }

      const payload = await response.json();
      state.data = normalizePayload(payload);
    } catch (error) {
      console.error("Aydon public API error:", error);
      state.error = error && error.message
        ? error.message
        : "تعذّر الاتصال بالخادم.";
    } finally {
      state.loading = false;
      render();
    }
  }

  function currentRoute() {
    const raw = (location.hash || "#/").replace(/^#/, "");
    const parts = raw.split("/").filter(Boolean).map(decodeURIComponent);
    if (!parts.length) return { page: "home" };
    if (parts[0] === "archive" && parts[1]) return { page: "category", id: parts[1] };
    if (parts[0] === "topic" && parts[1]) return { page: "topic", id: parts[1] };
    if (parts[0] === "event" && parts[1]) return { page: "event", id: parts[1] };
    if (parts[0] === "profile" && parts[1]) return { page: "profile", id: parts[1] };
    if (parts[0] === "magazine") return { page: "magazine" };
    if (parts[0] === "archive") return { page: "archive" };
    if (parts[0] === "museum") return { page: "museum" };
    if (parts[0] === "admin") return { page: "admin" };
    return { page: "not-found" };
  }

  function itemId(item) {
    return text(item?.id ?? item?.slug ?? item?.key);
  }

  function itemTitle(item) {
    return text(item?.title ?? item?.name ?? item?.label, "بلا عنوان");
  }

  function itemDescription(item) {
    return text(item?.description ?? item?.summary ?? item?.excerpt ?? item?.content);
  }

  function findItem(collection, id) {
    return collection.find((item) =>
      itemId(item) === id || text(item?.slug) === id || text(item?.id) === id
    );
  }

  function personName(person) {
    return typeof person === "string"
      ? person
      : text(person?.name ?? person?.title ?? person?.journalist_name);
  }

  function normalizeName(value) {
    return text(value).replace(/[🎐⚡㊗️祝️\sـ]/g, "").toLowerCase();
  }

  function findProfileFor(person) {
    const profileId = typeof person === "object" && person
      ? text(person.profile_id ?? person.journalist_profile_id)
      : "";

    if (profileId) {
      const byId = findItem(state.data.profiles, profileId);
      if (byId) return byId;
    }

    const name = normalizeName(personName(person));
    return state.data.profiles.find((profile) =>
      normalizeName(profile.name ?? profile.title) === name
    );
  }

  function profileLink(profile) {
    return `#/profile/${encodeURIComponent(itemId(profile))}`;
  }

  function topicAuthor(topic) {
    const profileId = text(topic?.journalist_profile_id ?? topic?.profile_id);

    if (profileId) {
      const profile = findItem(state.data.profiles, profileId);
      if (profile) {
        return `<a class="topic-author" href="${profileLink(profile)}">بقلم: ${esc(itemTitle(profile))}</a>`;
      }
    }

    const journalist = state.data.journalists.find((person) =>
      normalizeName(personName(person)) === normalizeName(topic?.journalist_title ?? topic?.journalist)
    );

    const profile = journalist ? findProfileFor(journalist) : null;
    const name = text(topic?.journalist_title ?? topic?.journalist ?? personName(journalist));

    if (!name) return "";

    return profile
      ? `<a class="topic-author" href="${profileLink(profile)}">بقلم: ${esc(name)}</a>`
      : `<span class="topic-author">بقلم: ${esc(name)}</span>`;
  }

  function pageHeading(title, description = "") {
    return `<header class="page-heading">
      <p class="eyebrow">أرشيف الآيدون</p>
      <h1>${esc(title)}</h1>
      ${description ? `<p>${esc(description)}</p>` : ""}
    </header>`;
  }

  function card(item, routePrefix, extra = "") {
    const id = itemId(item);
    const title = itemTitle(item);
    const description = itemDescription(item);
    const image = text(item?.image_url ?? item?.image ?? item?.cover_url);

    return `<a class="archive-card" href="#/${routePrefix}/${encodeURIComponent(id)}">
      ${image ? `<div class="archive-card__image"><img src="${esc(image)}" alt="" loading="lazy"></div>` : ""}
      <div class="archive-card__body">
        ${extra ? `<span class="archive-card__meta">${esc(extra)}</span>` : ""}
        <h3>${esc(title)}</h3>
        ${description ? `<p>${esc(description)}</p>` : ""}
      </div>
    </a>`;
  }

  function emptyState(message) {
    return `<div class="empty-state"><p>${esc(message)}</p></div>`;
  }

  function renderHome() {
    const categories = state.data.categories;
    const topics = state.data.topics.slice(0, 6);

    return `
      <section class="hero">
        <p class="eyebrow">ذاكرةٌ لا تُطوى</p>
        <h1>أرشيف الآيدون</h1>
        <p>هنا تُستودَع الذاكرة، وتُجمع فصول الحكاية وأخبارها وأسماء الذين تركوا أثرًا في تاريخ الآيدون.</p>
        <a class="button" href="#/archive">تصفّح الأرشيف</a>
      </section>

      <section class="content-section">
        ${pageHeading("أقسام الأرشيف", "محطاتٌ تحفظ ما مرّ وتعيده إلى الضوء.")}
        <div class="card-grid">
          ${categories.length
            ? categories.map((item) => card(item, "archive")).join("")
            : emptyState("لا توجد أقسام منشورة حتى الآن.")}
        </div>
      </section>

      <section class="content-section">
        ${pageHeading("أحدث الإضافات")}
        <div class="card-grid">
          ${topics.length
            ? topics.map((item) => card(item, "topic")).join("")
            : emptyState("لم تُضف موضوعات إلى الأرشيف بعد.")}
        </div>
      </section>`;
  }

  function renderArchive() {
    return `${pageHeading("الأرشيف", "كل ما جُمع من أخبار الآيدون وموضوعاتها وأحداثها.")}
      <div class="card-grid">
        ${state.data.categories.length
          ? state.data.categories.map((item) => card(item, "archive")).join("")
          : emptyState("لا توجد أقسام متاحة حاليًا.")}
      </div>

      <div class="content-section">
        <h2>الموضوعات</h2>
        <div class="card-grid">
          ${state.data.topics.length
            ? state.data.topics.map((item) => card(item, "topic")).join("")
            : emptyState("لا توجد موضوعات منشورة حاليًا.")}
        </div>
      </div>`;
  }

  function renderCategory(id) {
    const category = findItem(state.data.categories, id);

    const related = state.data.topics.filter((topic) =>
      text(topic.category_id ?? topic.category ?? topic.category_slug) === id ||
      text(topic.category_id ?? topic.category ?? topic.category_slug) === itemId(category)
    );

    const title = category ? itemTitle(category) : "القسم";

    return `${pageHeading(title, itemDescription(category))}
      <div class="card-grid">
        ${related.length
          ? related.map((item) => `
              <article class="archive-topic-card">
                ${card(item, "topic")}
                ${topicAuthor(item)}
              </article>
            `).join("")
          : emptyState("لا توجد موضوعات مدرجة في هذا القسم بعد.")}
      </div>`;
  }

  function renderDetail(item, fallbackTitle = "الموضوع", type = "topic") {
    if (!item) {
      return `${pageHeading(fallbackTitle)}${emptyState("لم يُعثر على المحتوى المطلوب.")}`;
    }

    const image = text(item.image_url ?? item.image ?? item.cover_url);
    const body = text(item.content ?? item.body ?? item.description ?? item.summary);
    const linkedProfile = type === "topic" ? topicAuthor(item) : "";

    const linkedEvent = type === "achievement" && item.event_id
      ? findItem(state.data.events, text(item.event_id))
      : null;

    const relatedAchievements = type === "profile"
      ? state.data.achievements.filter((entry) =>
          text(entry.profile_id ?? entry.journalist_profile_id) === itemId(item))
      : [];

    const authoredTopics = type === "profile"
      ? state.data.topics.filter((topic) =>
          text(topic.journalist_profile_id ?? topic.profile_id) === itemId(item))
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
