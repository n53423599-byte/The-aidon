/* =====================================================
   ADMIN PANEL — طبعة الآيدون الأخيرة
===================================================== */

window.AdminPanel = (() => {
  "use strict";

  const API = "/api";

  const state = {
    data: null,
    section: "profiles",
    image: null
  };

  const sections = {
    profiles: {
      title: "الملفات الشخصية",
      table: "profiles",
      fields: [
        ["name", "الاسم", "text", true],
        ["role", "الصفة", "text"],
        ["image_key", "الصورة", "image"],
        ["description", "التعريف", "textarea"],
        ["extra_info", "معلومات إضافية", "textarea"]
      ]
    },

    journalists: {
      title: "الصحفيون",
      table: "journalists",
      fields: [
        ["name", "اسم الصحفي", "text", true],
        ["profile_id", "الملف الشخصي", "profile"],
        ["position", "الترتيب", "number"]
      ]
    },

    magazine_achievements: {
      title: "إنجازات المجلة",
      table: "magazine_achievements",
      fields: [
        ["title", "الإنجاز", "text", true],
        ["war_number", "رقم الحرب", "text"],
        ["position", "الترتيب", "number"]
      ]
    },

    statistics: {
      title: "إحصائيات الآيدون",
      table: "statistics",
      fields: [
        ["title", "عنوان الإحصائية", "text", true],
        ["value", "القيمة", "text", true],
        ["position", "الترتيب", "number"]
      ]
    },

    archive_categories: {
      title: "أقسام الأرشيف",
      table: "archive_categories",
      fields: [
        ["name", "اسم القسم", "text", true],
        ["slug", "الرابط المختصر", "text", true],
        ["position", "الترتيب", "number"]
      ]
    },

    archive_topics: {
      title: "مواضيع الأرشيف",
      table: "archive_topics",
      fields: [
        ["category_id", "القسم", "category", true],
        ["title", "عنوان الموضوع", "text", true],
        ["journalist_title", "صفة الكاتب", "text"],
        ["image_key", "الصورة الرئيسية", "image"],
        ["body", "المحتوى", "textarea", true],
        ["position", "الترتيب", "number"]
      ]
    },

    events: {
      title: "فعاليات المتحف",
      table: "events",
      fields: [
        ["slug", "معرّف الفعالية", "text", true],
        ["title", "اسم الفعالية", "text", true],
        ["subtitle", "العنوان الفرعي", "text"],
        ["image_key", "الصورة الرئيسية", "image"],
        ["description", "الوصف", "textarea"],
        ["position", "الترتيب", "number"]
      ]
    },

    event_achievements: {
      title: "إنجازات الفعاليات",
      table: "event_achievements",
      fields: [
        ["event_id", "الفعالية", "event", true],
        ["profile_id", "صاحب الإنجاز", "profile", true],
        ["title", "الإنجاز", "text", true],
        ["description", "التفاصيل", "textarea"],
        ["position", "الترتيب", "number"]
      ]
    },

    public_results: {
      title: "النتائج والمتوّجون",
      table: "public_results",
      fields: [
        ["event_id", "الفعالية", "event", true],
        ["title", "عنوان النتيجة", "text", true],
        ["winner_profile_id", "الفائز", "profile", true],
        ["description", "التفاصيل", "textarea"],
        ["position", "الترتيب", "number"]
      ]
    }
  };

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const escapeHTML = value =>
    String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);

  function notify(message, type = "info") {
    const box = $("#admin-message");

    if (!box) {
      alert(message);
      return;
    }

    box.textContent = message;
    box.dataset.type = type;
    box.hidden = false;

    clearTimeout(notify.timer);

    notify.timer = setTimeout(() => {
      box.hidden = true;
    }, 4000);
  }

  async function api(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body ? {
          "Content-Type": "application/json"
        } : {}),
        ...options.headers
      }
    });

    let result = {};

    try {
      result = await response.json();
    } catch {
      result = {};
    }

    if (!response.ok) {
      throw new Error(
        result.error || `حدث خطأ (${response.status})`
      );
    }

    return result;
  }

  const post = (path, body) =>
    api(path, {
      method: "POST",
      body: JSON.stringify(body)
    });

  /* =========================
     STYLES
  ========================= */

  function addStyles() {
    if ($("#admin-panel-styles")) return;

    const style = document.createElement("style");
    style.id = "admin-panel-styles";

    style.textContent = `
      .admin-panel {
        direction: rtl;
        color: #eee5d8;
        max-width: 1100px;
        margin: auto;
        padding: 24px 16px 60px;
        font-family: inherit;
      }

      .admin-panel * {
        box-sizing: border-box;
      }

      .admin-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
        margin-bottom: 25px;
      }

      .admin-panel h1,
      .admin-panel h2,
      .admin-panel h3 {
        color: #d6b17b;
        margin-top: 0;
      }

      .admin-panel button,
      .admin-panel input,
      .admin-panel textarea,
      .admin-panel select {
        font: inherit;
      }

      .admin-panel button {
        cursor: pointer;
      }

      .admin-button {
        border: 1px solid #765b3d;
        background: #34291f;
        color: #f2e5d1;
        padding: 11px 17px;
        border-radius: 8px;
      }

      .admin-button.primary {
        background: #775638;
        border-color: #a27b50;
      }

      .admin-button.danger {
        background: #482b2a;
        border-color: #80504b;
      }

      .admin-button:disabled {
        opacity: .5;
        cursor: not-allowed;
      }

      .admin-layout {
        display: grid;
        grid-template-columns: 210px minmax(0, 1fr);
        gap: 20px;
        align-items: start;
      }

      .admin-nav {
        display: grid;
        gap: 7px;
      }

      .admin-nav button {
        text-align: right;
        background: #211e1a;
        color: #d8cabb;
        border: 1px solid #393027;
        padding: 12px;
        border-radius: 7px;
      }

      .admin-nav button.active {
        border-color: #a17b50;
        background: #392c20;
        color: #e6c18e;
      }

      .admin-content {
        min-width: 0;
        background: #211e1a;
        border: 1px solid #403329;
        border-radius: 10px;
        padding: 20px;
      }

      .admin-list {
        display: grid;
        gap: 10px;
      }

      .admin-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border: 1px solid #40372e;
        background: #29241f;
        border-radius: 8px;
        padding: 13px;
      }

      .admin-item-main {
        min-width: 0;
      }

      .admin-item-main strong {
        display: block;
        overflow-wrap: anywhere;
      }

      .admin-item small {
        color: #ad9c87;
      }

      .admin-actions {
        display: flex;
        gap: 7px;
        flex-wrap: wrap;
      }

      .admin-form {
        display: grid;
        gap: 15px;
      }

      .admin-field {
        display: grid;
        gap: 7px;
      }

      .admin-field label {
        color: #d7bd9b;
        font-size: 14px;
      }

      .admin-field input,
      .admin-field textarea,
      .admin-field select {
        width: 100%;
        min-width: 0;
        background: #171513;
        border: 1px solid #574634;
        color: #eee5d8;
        border-radius: 7px;
        padding: 12px;
        outline: none;
      }

      .admin-field input:focus,
      .admin-field textarea:focus,
      .admin-field select:focus {
        border-color: #c39a67;
      }

      .admin-field textarea {
        min-height: 150px;
        resize: vertical;
        line-height: 1.9;
      }

      .admin-preview {
        max-width: 230px;
        max-height: 180px;
        object-fit: contain;
        display: block;
        border-radius: 8px;
        border: 1px solid #574634;
        margin-top: 10px;
      }

      .admin-message {
        padding: 12px;
        margin-bottom: 15px;
        border: 1px solid #66513b;
        background: #30271f;
        border-radius: 8px;
      }

      .admin-message[data-type="error"] {
        border-color: #a05c54;
        color: #ffc4bb;
      }

      .admin-message[data-type="success"] {
        border-color: #66856c;
        color: #c5e4c7;
      }

      .admin-login {
        max-width: 420px;
        margin: 60px auto;
        padding: 25px;
        background: #211e1a;
        border: 1px solid #574634;
        border-radius: 12px;
      }

      .admin-login .admin-form {
        margin-top: 20px;
      }

      .admin-empty {
        text-align: center;
        color: #aa9b88;
        padding: 30px 10px;
      }

      .admin-form-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 9px;
        margin-top: 8px;
      }

      @media (max-width: 700px) {
        .admin-layout {
          grid-template-columns: 1fr;
        }

        .admin-nav {
          display: flex;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .admin-nav button {
          white-space: nowrap;
        }

        .admin-content {
          padding: 15px;
        }

        .admin-item {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================
     ROOT
  ========================= */

  function getRoot() {
    return $("#app") ||
      $("#admin-root") ||
      document.body;
  }

  /* =========================
     LOGIN
  ========================= */

  function showLogin() {
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
