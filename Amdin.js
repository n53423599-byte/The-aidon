const AdminPanel = (() => {
  const app = document.getElementById("app");

  const sections = [
    ["settings", "إعدادات الموقع"],
    ["profiles", "الملفات الشخصية"],
    ["journalists", "الصحفيون"],
    ["magazine_achievements", "إنجازات المجلة"],
    ["statistics", "الآيدون بالأرقام"],
    ["archive_categories", "أقسام الأرشيف"],
    ["archive_topics", "موضوعات الأرشيف"],
    ["events", "فعاليات المتحف"],
    ["event_achievements", "إنجازات المشاركين"],
    ["public_results", "النتائج والتتويجات"]
  ];

  let data = {};
  let current = "settings";

  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

  async function api(path, options = {}) {
    const response = await fetch(path, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      ...options
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || "تعذّر تنفيذ الطلب.");
    }

    return result;
  }

  async function start() {
    try {
      const check = await api("/api/admin/check");

      if (!check.authenticated) {
        renderLogin();
        return;
      }

      data = await api("/api/admin/data");
      render();
    } catch (error) {
      app.innerHTML = `<p class="notice">${esc(error.message)}</p>`;
    }
  }

  function renderLogin() {
    app.innerHTML = `
      <section class="admin-wrap">
        <h1>إدارة طبعة الآيدون</h1>
        <p>سجّلي الدخول للمتابعة.</p>

        <form id="adminLogin" class="admin-form">
          <label>اسم المستخدم
            <input name="username" required autocomplete="username">
          </label>

          <label>كلمة المرور
            <input name="password" type="password" required
              autocomplete="current-password">
          </label>

          <button class="button" type="submit">دخول</button>
          <p id="loginError" class="notice"></p>
        </form>
      </section>
    `;

    document.getElementById("adminLogin").onsubmit = async event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);

      try {
        await api("/api/login", {
          method: "POST",
          body: JSON.stringify({
            username: form.get("username"),
            password: form.get("password")
          })
        });

        await start();
      } catch (error) {
        document.getElementById("loginError").textContent = error.message;
      }
    };
  }

  function render() {
    app.innerHTML = `
      <section class="admin-wrap">
        <div class="admin-heading">
          <div>
            <span class="eyebrow">لوحة التحكم</span>
            <h1>إدارة طبعة الآيدون</h1>
          </div>
          <button class="button secondary" id="logout">تسجيل الخروج</button>
        </div>

        <div class="admin-layout">
          <aside class="admin-menu">
            ${sections.map(([key, title]) => `
              <button class="${current === key ? "active" : ""}"
                data-section="${key}">${title}</button>
            `).join("")}
          </aside>

          <section class="admin-content" id="adminContent"></section>
        </div>
      </section>
    `;

    document.querySelectorAll("[data-section]").forEach(button => {
      button.onclick = () => {
        current = button.dataset.section;
        render();
      };
    });

    document.getElementById("logout").onclick = async () => {
      await api("/api/logout", { method: "POST", body: "{}" });
      renderLogin();
    };

    renderSection();
  }

  function renderSection() {
    const target = document.getElementById("adminContent");

    if (current === "settings") {
      renderSettings(target);
      return;
    }

    const records = data[current] || [];

    target.innerHTML = `
      <div class="admin-section-heading">
        <h2>${esc(sections.find(item => item[0] === current)[1])}</h2>
        <button class="button" id="addRecord">إضافة عنصر</button>
      </div>

      <div class="admin-records">
        ${records.map(record => `
          <article class="admin-record">
            <div>
              <strong>${esc(record.title || record.name || record.value || record.id)}</strong>
              <small>${esc(record.war_number || record.journalist_title || "")}</small>
            </div>
            <div class="admin-actions">
              <button data-edit="${esc(record.id)}">تعديل</button>
              <button data-delete="${esc(record.id)}">حذف</button>
            </div>
          </article>
        `).join("") || `<p class="muted">لا توجد عناصر بعد.</p>`}
      </div>
    `;

    target.querySelector("#addRecord").onclick = () => editRecord(null);

    target.querySelectorAll("[data-edit]").forEach(button => {
      button.onclick = () => {
        const record = records.find(item => item.id === button.dataset.edit);
        editRecord(record);
      };
    });

    target.querySelectorAll("[data-delete]").forEach(button => {
      button.onclick = () => deleteRecord(button.dataset.delete);
    });
  }

  function renderSettings(target) {
    const settings = data.settings || {};

    target.innerHTML = `
      <h2>إعدادات الموقع</h2>
      <form id="settingsForm" class="admin-form">
        <label>عنوان الموقع
          <input name="site_title" value="${esc(settings.site_title)}">
        </label>

        <label>المقدمة الرئيسية
          <textarea name="intro" rows="5">${esc(settings.intro)}</textarea>
        </label>

        <label>مقدمة المجلة
          <textarea name="magazine_intro" rows="5">${esc(settings.magazine_intro)}</textarea>
        </label>

        <button class="button">حفظ التعديلات</button>
      </form>
    `;

    target.querySelector("#settingsForm").onsubmit = async event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);

      try {
        await api("/api/admin/settings", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(form))
        });

        data = await api("/api/admin/data");
        alert("تم حفظ التعديلات.");
      } catch (error) {
        alert(error.message);
      }
    };
  }

  function fieldsFor(table) {
    const fields = {
      profiles: [
        ["name", "الاسم"],
        ["role", "الصفة أو المنصب"],
        ["image_key", "رابط الصورة"],
        ["description", "التعريف"],
        ["extra_info", "معلومات إضافية"]
      ],
      journalists: [
        ["name", "اسم الصحفي"],
        ["profile_id", "معرّف الملف الشخصي"],
        ["position", "الترتيب"]
      ],
      magazine_achievements: [
        ["title", "عنوان الإنجاز"],
        ["war_number", "رقم الحرب"],
        ["position", "الترتيب"]
      ],
      statistics: [
        ["title", "العنوان"],
        ["value", "القيمة"],
        ["position", "الترتيب"]
      ],
      archive_categories: [
        ["name", "اسم القسم"],
        ["slug", "المعرّف المختصر"],
        ["position", "الترتيب"]
      ],
      archive_topics: [
        ["category_id", "معرّف القسم"],
        ["title", "عنوان الموضوع"],
        ["journalist_title", "صفة الكاتب"],
        ["image_key", "رابط الصورة"],
        ["body", "النص الكامل"],
        ["position", "الترتيب"]
      ],
      events: [
        ["slug", "المعرّف المختصر"],
        ["title", "اسم الفعالية"],
        ["subtitle", "الوصف المختصر"],
        ["image_key", "رابط صورة الفعالية"],
        ["description", "التفاصيل"],
        ["position", "الترتيب"]
      ],
      event_achievements: [
        ["event_id", "معرّف الفعالية"],
        ["profile_id", "معرّف صاحب الإنجاز"],
        ["title", "عنوان الإنجاز"],
        ["description", "التفاصيل"],
        ["position", "الترتيب"]
      ],
      public_results: [
        ["event_id", "معرّف الفعالية"],
        ["title", "عنوان النتيجة"],
        ["winner_profile_id", "معرّف الفائز"],
        ["description", "التفاصيل"],
        ["position", "الترتيب"]
      ]
    };

    return fields[table] || [];
  }

  function editRecord(record) {
    const fields = fieldsFor(current);
    const values = record || {};
    const target = document.getElementById("adminContent");

    target.innerHTML = `
      <div class="admin-editor">
        <h2>${record ? "تعديل عنصر" : "إضافة عنصر جديد"}</h2>

        <form id="recordForm" class="admin-form">
          ${fields.map(([key, label]) => `
            <label>${esc(label)}
              ${key === "body" || key === "description" || key === "extra_info"
                ? `<textarea name="${key}" rows="6">${esc(values[key])}</textarea>`
                : `<input name="${key}" value="${esc(values[key])}" ${key === "title" || key === "name" ? "required" : ""}>`
              }
            </label>
          `).join("")}

          <div class="admin-actions">
            <button class="button">حفظ</button>
            <button class="button secondary" type="button" id="cancelEdit">إلغاء</button>
          </div>
        </form>
      </div>
    `;

    target.querySelector("#cancelEdit").onclick = renderSection;

    target.querySelector("#recordForm").onsubmit = async event => {
      event.preventDefault();

      const form = new FormData(event.currentTarget);
      const item = Object.fromEntries(form);
      if (record) item.id = record.id;

      if (item.position !== undefined && item.position !== "") {
        item.position = Number(item.position);
      }

      try {
        await api("/api/admin/save", {
          method: "POST",
          body: JSON.stringify({ table: current, record: item })
        });

        data = await api("/api/admin/data");
        renderSection();
      } catch (error) {
        alert(error.message);
      }
    };
  }

  async function deleteRecord(id) {
    if (!confirm("هل تريدين حذف هذا العنصر؟")) return;

    try {
      await api("/api/admin/delete", {
        method: "POST",
        body: JSON.stringify({ table: current, id })
      });

      data = await api("/api/admin/data");
      renderSection();
    } catch (error) {
      alert(error.message);
    }
  }

  return { start };
})();
