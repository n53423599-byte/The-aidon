function renderLogin() {
  app.innerHTML = `
    <section class="admin-wrap">
      <h1>إدارة طبعة الآيدون</h1>

      <div class="admin-editor">
        <h2>تسجيل الدخول</h2>
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
      </div>

      <details class="admin-editor" style="margin-top:25px">
        <summary>إنشاء حساب المشرف الأول</summary>

        <form id="adminSetup" class="admin-form">
          <label>مفتاح الإعداد
            <input name="setup_key" type="password" required>
          </label>

          <label>اسم المستخدم الجديد
            <input name="username" required autocomplete="username">
          </label>

          <label>كلمة المرور الجديدة
            <input name="password" type="password"
              minlength="10" required autocomplete="new-password">
          </label>

          <button class="button" type="submit">إنشاء الحساب</button>
          <p id="setupError" class="notice"></p>
        </form>
      </details>
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

  document.getElementById("adminSetup").onsubmit = async event => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const message = document.getElementById("setupError");

    try {
      await api("/api/setup", {
        method: "POST",
        body: JSON.stringify({
          setup_key: form.get("setup_key"),
          username: form.get("username"),
          password: form.get("password")
        })
      });

      alert("تم إنشاء حساب المشرف الأول بنجاح. يمكنك الآن تسجيل الدخول.");
      event.currentTarget.reset();
    } catch (error) {
      message.textContent = error.message;
    }
  };
} table: current, id })
      });

      data = await api("/api/admin/data");
      renderSection();
    } catch (error) {
      alert(error.message);
    }
  }

  return { start };
})();
