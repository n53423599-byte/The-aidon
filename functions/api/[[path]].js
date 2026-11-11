const COOKIE_NAME = "eidon_session";
const SESSION_DAYS = 7;
const PBKDF2_ITERATIONS = 100000;

const TABLES = {
  profiles: ["id", "name", "role", "image_key", "description", "extra_info"],
  journalists: ["id", "name", "profile_id", "position"],
  magazine_achievements: ["id", "title", "war_number", "position"],
  statistics: ["id", "title", "value", "position"],
  archive_categories: ["id", "name", "slug", "position"],
  archive_topics: [
    "id", "category_id", "title", "journalist_title",
    "image_key", "body", "position"
  ],
  events: [
    "id", "slug", "title", "subtitle", "image_key",
    "description", "position"
  ],
  event_achievements: [
    "id", "event_id", "profile_id", "title", "description", "position"
  ],
  public_results: [
    "id", "event_id", "title", "winner_profile_id",
    "description", "position"
  ]
};

const PUBLIC_TABLES = Object.keys(TABLES);

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers
    }
  });
}

function randomId() {
  return crypto.randomUUID();
}

function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex) {
  return new Uint8Array(
    hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
  );
}

async function sha256(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );

  return bytesToHex(digest);
}

async function hashPassword(
  password,
  salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)))
) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBytes(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    key,
    256
  );

  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${bytesToHex(bits)}`;
}

async function verifyPassword(password, stored) {
  try {
    const [method, iterations, salt, expected] = stored.split("$");

    if (method !== "pbkdf2") return false;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: hexToBytes(salt),
        iterations: Number(iterations),
        hash: "SHA-256"
      },
      key,
      256
    );

    return bytesToHex(bits) === expected;
  } catch {
    return false;
  }
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";

  const part = cookie
    .split(";")
    .map(x => x.trim())
    .find(x => x.startsWith(name + "="));

  return part
    ? decodeURIComponent(part.slice(name.length + 1))
    : null;
}

function sessionCookie(token, maxAge = SESSION_DAYS * 86400) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function validOrigin(request) {
  const origin = request.headers.get("Origin");

  if (!origin) return true;

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

async function requireAdmin(request, env) {
  const token = getCookie(request, COOKIE_NAME);

  if (!token) return null;

  const tokenHash = await sha256(token);

  return await env.DB.prepare(`
    SELECT admins.id, admins.username
    FROM admin_sessions
    JOIN admins ON admins.id = admin_sessions.admin_id
    WHERE admin_sessions.token_hash = ?
      AND admin_sessions.expires_at > datetime('now')
    LIMIT 1
  `).bind(tokenHash).first();
}

/* =========================
   PUBLIC DATA
========================= */

async function getPublicData(env) {
  const queries = await Promise.all([
    env.DB.prepare(
      "SELECT * FROM site_settings WHERE id = 1"
    ).first(),

    env.DB.prepare(
      "SELECT * FROM profiles ORDER BY name"
    ).all(),

    env.DB.prepare(
      "SELECT * FROM journalists ORDER BY position"
    ).all(),

    env.DB.prepare(
      "SELECT * FROM magazine_achievements ORDER BY position"
    ).all(),

    env.DB.prepare(
      "SELECT * FROM statistics ORDER BY position"
    ).all(),

    env.DB.prepare(
      "SELECT * FROM archive_categories ORDER BY position"
    ).all(),

    env.DB.prepare(
      "SELECT * FROM archive_topics ORDER BY position"
    ).all(),

    env.DB.prepare(
      "SELECT * FROM events ORDER BY position"
    ).all(),

    env.DB.prepare(
      "SELECT * FROM event_achievements ORDER BY position"
    ).all(),

    env.DB.prepare(
      "SELECT * FROM public_results ORDER BY position"
    ).all()
  ]);

  return {
    settings: queries[0],
    profiles: queries[1].results,
    journalists: queries[2].results,
    magazine_achievements: queries[3].results,
    statistics: queries[4].results,
    categories: queries[5].results,
    topics: queries[6].results,
    events: queries[7].results,
    event_achievements: queries[8].results,
    public_results: queries[9].results
  };
}

async function getAdminData(env) {
  return await getPublicData(env);
}

/* =========================
   FIRST ADMIN SETUP
========================= */

async function setupAdmin(request, env) {
  if (!env.ADMIN_SETUP_KEY) {
    return json({
      error: "إعداد إنشاء المشرف غير مكتمل."
    }, 503);
  }

  const body = await readBody(request);

  if (!body || body.setup_key !== env.ADMIN_SETUP_KEY) {
    return json({
      error: "رمز الإعداد غير صحيح."
    }, 403);
  }

  const existing = await env.DB.prepare(
    "SELECT COUNT(*) AS total FROM admins"
  ).first();

  if (existing.total > 0) {
    return json({
      error: "تم إنشاء حساب المشرف مسبقًا."
    }, 409);
  }

  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
    return json({
      error: "اسم المستخدم يجب أن يكون من 3 إلى 30 حرفًا أو رقمًا."
    }, 400);
  }

  if (password.length < 10 || password.length > 128) {
    return json({
      error: "كلمة المرور يجب أن تكون بين 10 و128 حرفًا."
    }, 400);
  }

  const passwordHash = await hashPassword(password);

  await env.DB.prepare(`
    INSERT INTO admins (id, username, password_hash)
    VALUES (?, ?, ?)
  `).bind(
    randomId(),
    username,
    passwordHash
  ).run();

  return json({
    success: true,
    message: "تم إنشاء حساب المشرف."
  });
}

/* =========================
   LOGIN
========================= */

async function login(request, env) {
  const body = await readBody(request);

  if (!body) {
    return json({
      error: "بيانات غير صالحة."
    }, 400);
  }

  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  const admin = await env.DB.prepare(
    "SELECT * FROM admins WHERE username = ? LIMIT 1"
  ).bind(username).first();

  if (
    !admin ||
    !(await verifyPassword(password, admin.password_hash))
  ) {
    return json({
      error: "اسم المستخدم أو كلمة المرور غير صحيحة."
    }, 401);
  }

  const token = bytesToHex(
    crypto.getRandomValues(new Uint8Array(32))
  );

  const tokenHash = await sha256(token);

  await env.DB.prepare(`
    INSERT INTO admin_sessions (
      token_hash,
      admin_id,
      expires_at
    )
    VALUES (?, ?, datetime('now', '+7 days'))
  `).bind(
    tokenHash,
    admin.id
  ).run();

  return json(
    {
      success: true,
      username: admin.username
    },
    200,
    {
      "Set-Cookie": sessionCookie(token)
    }
  );
}

/* =========================
   LOGOUT
========================= */

async function logout(request, env) {
  const token = getCookie(request, COOKIE_NAME);

  if (token) {
    await env.DB.prepare(
      "DELETE FROM admin_sessions WHERE token_hash = ?"
    ).bind(
      await sha256(token)
    ).run();
  }

  return json(
    { success: true },
    200,
    {
      "Set-Cookie": clearSessionCookie()
    }
  );
}

/* =========================
   IMAGE UPLOAD TO GITHUB
========================= */

async function uploadImage(request, env) {
  const body = await readBody(request);

  if (!body || !body.data || !body.mime) {
    return json({
      error: "بيانات الصورة غير مكتملة."
    }, 400);
  }

  if (
    !env.GITHUB_TOKEN ||
    !env.GITHUB_OWNER ||
    !env.GITHUB_REPO ||
    !env.GITHUB_BRANCH
  ) {
    return json({
      error: "إعدادات رفع الصور غير مكتملة."
    }, 503);
  }

  const mimeTypes = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif"
  };

  const extension = mimeTypes[body.mime];

  if (!extension) {
    return json({
      error: "صيغة الصورة غير مدعومة."
    }, 415);
  }

  const match = String(body.data).match(
    /^data:image\/(?:jpeg|png|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/
  );

  if (!match) {
    return json({
      error: "ملف الصورة غير صالح."
    }, 400);
  }

  const base64 = match[1];

  const estimatedSize = Math.floor(
    base64.length * 3 / 4
  );

  if (
    !estimatedSize ||
    estimatedSize > 3 * 1024 * 1024
  ) {
    return json({
      error: "حجم الصورة يجب ألا يتجاوز 3 ميغابايت."
    }, 413);
  }

  const filename = `${crypto.randomUUID()}.${extension}`;
  const filePath = `assets/uploads/${filename}`;

  try {
    const githubResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${filePath}`,
      {
        method: "PUT",

        headers: {
          "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "Aidon-Website"
        },

        body: JSON.stringify({
          message: `Upload image ${filename}`,
          content: base64,
          branch: env.GITHUB_BRANCH
        })
      }
    );

    const result = await githubResponse.json();

    if (!githubResponse.ok) {
      return json({
        error: "تعذّر رفع الصورة إلى GitHub.",
        details: result.message || "GitHub API error"
      }, 502);
    }

    return json({
      success: true,
      image_key: `/${filePath}`,
      url: `/${filePath}`
    });

  } catch {
    return json({
      error: "تعذّر الاتصال بخدمة رفع الصور."
    }, 502);
  }
}

/* =========================
   SAVE RECORD
========================= */

async function saveRecord(request, env) {
  const body = await readBody(request);

  if (!body || !TABLES[body.table]) {
    return json({
      error: "نوع المحتوى غير صالح."
    }, 400);
  }

  const table = body.table;
  const allowed = TABLES[table];
  const record = body.record || {};

  const values = {};

  for (const field of allowed) {
    if (record[field] !== undefined) {
      values[field] = record[field];
    }
  }

  if (!values.id) {
    values.id = randomId();
  }

  if (
    table === "profiles" &&
    (!values.name || !String(values.name).trim())
  ) {
    return json({
      error: "اسم صاحب الملف مطلوب."
    }, 400);
  }

  if (
    table === "archive_topics" &&
    (!values.category_id || !values.title || !values.body)
  ) {
    return json({
      error: "القسم والعنوان والمحتوى مطلوبة."
    }, 400);
  }

  if (
    table === "public_results" &&
    (
      !values.event_id ||
      !values.title ||
      !values.winner_profile_id
    )
  ) {
    return json({
      error: "بيانات النتيجة غير مكتملة."
    }, 400);
  }

  const columns = Object.keys(values);

  const placeholders = columns
    .map(() => "?")
    .join(", ");

  const updates = columns
    .filter(column => column !== "id")
    .map(column => `${column} = excluded.${column}`)
    .join(", ");

  const sql = `
    INSERT INTO ${table} (${columns.join(", ")})
    VALUES (${placeholders})
    ON CONFLICT(id) DO UPDATE SET
    ${updates || "id = excluded.id"}
  `;

  try {
    await env.DB.prepare(sql)
      .bind(...columns.map(c => values[c]))
      .run();

    return json({
      success: true,
      id: values.id
    });

  } catch {
    return json({
      error: "تعذّر حفظ البيانات. تحققي من الحقول والروابط."
    }, 400);
  }
}

/* =========================
   DELETE RECORD
========================= */

async function deleteRecord(request, env) {
  const body = await readBody(request);

  if (
    !body ||
    !TABLES[body.table] ||
    !body.id
  ) {
    return json({
      error: "بيانات الحذف غير صالحة."
    }, 400);
  }

  try {
    await env.DB.prepare(
      `DELETE FROM ${body.table} WHERE id = ?`
    ).bind(body.id).run();

    return json({
      success: true
    });

  } catch {
    return json({
      error: "تعذّر حذف العنصر؛ قد يكون مرتبطًا بعناصر أخرى."
    }, 409);
  }
}

/* =========================
   SAVE SITE SETTINGS
========================= */

async function saveSettings(request, env) {
  const body = await readBody(request);

  if (!body) {
    return json({
      error: "البيانات غير صالحة."
    }, 400);
  }

  const fields = [
    "site_title",
    "intro",
    "magazine_intro"
  ];

  const values = fields.map(
    field => String(body[field] ?? "")
  );

  await env.DB.prepare(`
    UPDATE site_settings
    SET
      site_title = ?,
      intro = ?,
      magazine_intro = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `).bind(...values).run();

  return json({
    success: true
  });
}

/* =========================
   MAIN ROUTER
========================= */

export async function onRequest(context) {
  const { request, env } = context;

  const url = new URL(request.url);

  const path = url.pathname.replace(/\/+$/, "");

  const method = request.method.toUpperCase();

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204
    });
  }

  if (
    method !== "GET" &&
    !validOrigin(request)
  ) {
    return json({
      error: "مصدر الطلب غير مسموح."
    }, 403);
  }

  try {
    if (
      method === "GET" &&
      path === "/api/public"
    ) {
      return json(
        await getPublicData(env)
      );
    }

    if (
      method === "POST" &&
      path === "/api/setup"
    ) {
      return await setupAdmin(request, env);
    }

    if (
      method === "POST" &&
      path === "/api/login"
    ) {
      return await login(request, env);
    }

    if (
      method === "POST" &&
      path === "/api/logout"
    ) {
      return await logout(request, env);
    }

    const admin = await requireAdmin(request, env);

    if (
      path.startsWith("/api/admin/") &&
      !admin
    ) {
      return json({
        error: "يلزم تسجيل دخول المشرف."
      }, 401);
    }

    if (
      method === "GET" &&
      path === "/api/admin/data"
    ) {
      return json(
        await getAdminData(env)
      );
    }

    if (
      method === "GET" &&
      path === "/api/admin/check"
    ) {
      return json({
        authenticated: !!admin
      });
    }

    if (
      method === "POST" &&
      path === "/api/admin/upload"
    ) {
      return await uploadImage(request, env);
    }

    if (
      method === "POST" &&
      path === "/api/admin/save"
    ) {
      return await saveRecord(request, env);
    }

    if (
      method === "POST" &&
      path === "/api/admin/delete"
    ) {
      return await deleteRecord(request, env);
    }

    if (
      method === "POST" &&
      path === "/api/admin/settings"
    ) {
      return await saveSettings(request, env);
    }

    return json({
      error: "المسار غير موجود."
    }, 404);

  } catch (error) {
    return json({
      error: "حدث خطأ داخلي أثناء معالجة الطلب."
    }, 500);
  }
}
