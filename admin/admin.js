/* =========================================================
   MAHARANA PRATAP PRIVATE ITI SEHORE
   ADMIN PANEL - SUPABASE VERSION
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       SUPABASE CONFIGURATION
       ===================================================== */

    const SUPABASE_URL = "https://zxgpekuluewytbxtebvy.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_Xnh5RRUBqQDkBbhNsy8E_Q_l8T_h8LT";


    /* =====================================================
       LOAD SUPABASE
       ===================================================== */

    const supabaseScript = document.createElement("script");

    supabaseScript.src =
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

    supabaseScript.onload = initializeSupabase;

    document.head.appendChild(supabaseScript);


    let supabaseClient = null;


    /* =====================================================
       INITIALIZE
       ===================================================== */

    function initializeSupabase() {

        if (
            SUPABASE_URL.includes("PASTE_YOUR") ||
            SUPABASE_PUBLISHABLE_KEY.includes("PASTE_YOUR")
        ) {

            console.error(
                "Supabase URL or Publishable Key is missing."
            );

            showLoginError(
                "Supabase configuration missing."
            );

            return;
        }


        const {
            createClient
        } = window.supabase;


        supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
            storage: window.sessionStorage
        }
    }
);

        initializeApplication();
    }

/* =====================================================
   SECURE ADMIN APPLICATION INITIALIZATION
   Maharana Pratap Pvt ITI Sehore
===================================================== */

async function initializeApplication() {

    "use strict";

    const loginForm = document.getElementById("adminLoginForm");

    /*
     * LOGIN PAGE
     * Login page must remain accessible without a session.
     */
    if (loginForm) {
        initializeLogin();
        return;
    }

    /*
     * DASHBOARD PAGE
     */
    const dashboardSection =
        document.getElementById("section-dashboard");

    const isDashboardPage = window.location.pathname.toLowerCase().endsWith("admin-panel.html") || Boolean(dashboardSection);
    if (!isDashboardPage) {
        return;
    }

    /*
     * Hide dashboard content while authentication is checked.
     */
    document.documentElement.style.visibility = "hidden";

    /*
     * Always resolve the login page relative to the current page.
     */
    const loginUrl = new URL(
        "admin-login.html",
        window.location.href
    ).href;

    /*
     * Redirect helper.
     */
    function redirectToLogin() {
        window.location.replace(loginUrl);
    }

    try {

        /*
         * 1. Confirm that Supabase initialized successfully.
         */
        if (!supabaseClient || !supabaseClient.auth) {
            console.error("Supabase authentication is unavailable.");
            redirectToLogin();
            return;
        }

        /*
         * 2. Get the current authenticated session.
         */
        const {
            data,
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            console.error("Session verification failed:", error);
            redirectToLogin();
            return;
        }

        const session = data?.session;

        /*
         * 3. Reject users without a valid session.
         */
        if (!session || !session.user || !session.user.id) {
            redirectToLogin();
            return;
        }

        /*
         * 4. Verify that the logged-in user is an authorized admin.
         */
        const isAdmin = await verifyAdminUser(session.user.id);

        if (!isAdmin) {

            console.warn("Unauthorized admin dashboard access.");

            try {
                await supabaseClient.auth.signOut();
            } catch (signOutError) {
                console.error(
                    "Sign-out failed:",
                    signOutError
                );
            }

            redirectToLogin();
            return;
        }

        /*
         * 5. Only authorized admins can initialize the dashboard.
         */
        initializeDashboard();

        /*
         * 6. Reveal the page after successful verification.
         */
        document.documentElement.style.visibility = "visible";

    } catch (authError) {

        console.error(
            "Admin authentication failed:",
            authError
        );

        redirectToLogin();
    }
}


    /* =====================================================
       LOGIN
       ===================================================== */

    function initializeLogin() {

        const loginForm =
            document.getElementById(
                "adminLoginForm"
            );


        const emailInput =
            document.getElementById(
                "adminEmail"
            );


        const passwordInput =
            document.getElementById(
                "adminPassword"
            );


        const passwordToggle =
            document.getElementById(
                "passwordToggle"
            );


        const loginMessage =
            document.getElementById(
                "loginMessage"
            );
        /* =================================================
           PASSWORD SHOW / HIDE
           ================================================= */

        if (passwordToggle) {

            passwordToggle.addEventListener(
                "click",
                function () {

                    if (
                        passwordInput.type ===
                        "password"
                    ) {

                        passwordInput.type =
                            "text";

                        passwordToggle.innerHTML =
                            '<i class="fa-solid fa-eye-slash"></i>';

                        passwordToggle.setAttribute(
                            "aria-label",
                            "Hide password"
                        );

                    } else {

                        passwordInput.type =
                            "password";

                        passwordToggle.innerHTML =
                            '<i class="fa-solid fa-eye"></i>';

                        passwordToggle.setAttribute(
                            "aria-label",
                            "Show password"
                        );
                    }

                }
            );
        }


        /* =================================================
           LOGIN SUBMIT
           ================================================= */

        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const email =
                    emailInput.value.trim();


                const password =
                    passwordInput.value;


                if (
                    !email ||
                    !password
                ) {

                    loginMessage.textContent =
                        "Please enter email and password.";

                    return;
                }


                loginMessage.textContent =
                    "Signing in...";


                /* =========================================
                   SUPABASE AUTH
                   ========================================= */

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({

                            email: email,

                            password: password

                        });


                if (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    loginMessage.textContent =
                        "Invalid email or password.";

                    passwordInput.value = "";

                    passwordInput.focus();

                    return;
                }


                /* =========================================
                   VERIFY ADMIN USER
                   ========================================= */

                const isAdmin =
                    await verifyAdminUser(
                        data.user.id
                    );


                if (!isAdmin) {

                    await supabaseClient.auth.signOut();

                    loginMessage.textContent =
                        "This account is not authorized as an administrator.";

                    passwordInput.value = "";

                    return;
                }


                loginMessage.textContent =
                    "Login successful...";


                window.location.href =
                    "admin-panel.html";

            }
        );

    }



    /* =====================================================
       VERIFY ADMIN
       ===================================================== */

    async function verifyAdminUser(userId) {

        if (!userId) {
            return false;
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("admin_users")
                .select("user_id")
                .eq(
                    "user_id",
                    userId
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Admin verification error:",
                error
            );

            return false;
        }


        return !!data;
    }

/* =====================================================
       DASHBOARD INITIALIZATION
       ===================================================== */

    function initializeDashboard() {
        
        const sidebar =
            document.getElementById(
                "adminSidebar"
            );


        const sidebarToggle =
            document.getElementById(
                "sidebarToggle"
            );


        const logoutButton =
            document.getElementById(
                "logoutBtn"
            );

                    /* =========================================
           VIEW WEBSITE - LOGOUT BEFORE NAVIGATION
        ========================================= */

        const viewWebsiteBtn =
            document.getElementById("viewWebsiteBtn");

        if (viewWebsiteBtn) {
            viewWebsiteBtn.addEventListener(
                "click",
                async function (event) {

                    event.preventDefault();

                    const { error } =
                        await supabaseClient.auth.signOut();

                    if (error) {
                        console.error(
                            "Logout failed:",
                            error
                        );

                        alert(
                            "Logout nahi ho paya. Dobara try karein."
                        );

                        return;
                    }

                    window.location.replace("../index.html");
                }
            );
        }
        
        /* =================================================
           TRASH / RESTORE UI (INJECTED BY JS)
           Keeps the existing admin HTML unchanged.
           ================================================= */

        const adminNav = document.querySelector(".admin-nav");
        const adminContent = document.querySelector(".admin-content");

        if (adminNav && !adminNav.querySelector('[data-section="trash"]')) {
            const trashNavItem = document.createElement("button");
            trashNavItem.type = "button";
            trashNavItem.className = "admin-nav-item";
            trashNavItem.dataset.section = "trash";
            trashNavItem.innerHTML = '<i class="fa-solid fa-trash-can"></i><span>Trash / Restore</span>';
            adminNav.appendChild(trashNavItem);
        }

        if (adminContent && !document.getElementById("section-trash")) {
            const trashSection = document.createElement("div");
            trashSection.className = "dashboard-section";
            trashSection.id = "section-trash";
            trashSection.innerHTML = `
                <div class="panel-card glass-card">
                    <div class="panel-heading">
                        <div>
                            <p class="eyebrow">RECOVER DELETED RECORDS</p>
                            <h2>Trash / Restore</h2>
                            <p style="margin-top:8px;color:var(--text-muted,#64748b);">Deleted records are kept here. Restore returns a record to its original section. No permanent-delete action is available here.</p>
                        </div>
                        <button type="button" class="admin-nav-item" id="refreshTrashBtn" style="width:auto;"> <i class="fa-solid fa-rotate"></i><span>Refresh</span></button>
                    </div>
                    <div id="trashRecordsContainer" class="table-wrap">
                        <div class="empty-state">Open Trash / Restore to load deleted records.</div>
                    </div>
                </div>`;
            adminContent.appendChild(trashSection);
        }

        const sectionTitle =
            document.getElementById(
                "sectionTitle"
            );


        const sections =
            document.querySelectorAll(
                ".dashboard-section"
            );


        const navItems =
            document.querySelectorAll(
                ".admin-nav-item"
            );


        const sectionTitles = {

            dashboard:
                "Dashboard",

            submissions:
                "All Submissions",

            admissions:
                "Admissions",

            contacts:
                "Contact Enquiries",

            feedback:
                "Feedback",

            trash:
                "Trash / Restore"

        };


        /* =================================================
           SHOW SECTION
           ================================================= */

        function showSection(
            sectionName
        ) {

            sections.forEach(
                function (section) {

                    const shouldShow =
                        section.id ===
                        "section-" +
                        sectionName;


                    section.classList.toggle(
                        "active",
                        shouldShow
                    );

                }
            );


            navItems.forEach(
                function (item) {

                    item.classList.toggle(
                        "active",
                        item.dataset.section ===
                        sectionName
                    );

                }
            );


            if (sectionTitle) {

                sectionTitle.textContent =
                    sectionTitles[
                        sectionName
                    ] ||
                    "Dashboard";
            }


            if (sidebar) {

                sidebar.classList.remove(
                    "open"
                );
            }

        }


        /* =================================================
           SIDEBAR NAVIGATION
           ================================================= */

        navItems.forEach(
            function (item) {

                item.addEventListener(
                    "click",
                    function () {

                        showSection(
                            item.dataset.section
                        );

                    }
                );

            }
        );


        /* =================================================
           TRASH RECORDS + RESTORE ACTION
           ================================================= */

        const trashTables = [
            { key: "admissions", label: "Admissions" },
            { key: "enquiries", label: "Contact Enquiries" },
            { key: "feedback", label: "Feedback" }
        ];

        function formatTrashValue(value) {
            if (value === null || value === undefined || value === "") return "—";
            if (typeof value === "object") return JSON.stringify(value);
            return String(value);
        }

        async function loadTrashRecords() {
            const container = document.getElementById("trashRecordsContainer");
            if (!container) return;
            container.innerHTML = '<div class="empty-state">Loading deleted records…</div>';

            try {
                const results = await Promise.all(trashTables.map(async (table) => {
                    const { data, error } = await supabaseClient
                        .from(table.key)
                        .select("*")
                        .not("deleted_at", "is", null)
                        .order("deleted_at", { ascending: false });
                    if (error) throw new Error(`${table.label}: ${error.message}`);
                    return { ...table, rows: data || [] };
                }));

                const total = results.reduce((sum, group) => sum + group.rows.length, 0);
                if (!total) {
                    container.innerHTML = '<div class="empty-state"><i class="fa-regular fa-folder-open"></i><br>Trash is empty. No deleted records found.</div>';
                    return;
                }

                container.innerHTML = results.map((group) => {
                    if (!group.rows.length) return "";
                    const rows = group.rows.map((record) => {
                        const preferred = ["name", "full_name", "student_name", "email", "mobile", "phone", "created_at"];
                        const keys = [...preferred.filter((key) => record[key] !== undefined), ...Object.keys(record).filter((key) => !preferred.includes(key) && !["id", "deleted_at", "updated_at"].includes(key))].slice(0, 5);
                        const details = keys.map((key) => `<div style="min-width:110px;"><small style="display:block;color:var(--text-muted,#64748b);">${escapeHTML(key.replaceAll("_", " "))}</small><span>${escapeHTML(formatTrashValue(record[key]).slice(0, 180))}</span></div>`).join("");
                        return `<div style="display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:14px;border:1px solid rgba(148,163,184,.25);border-radius:12px;margin:10px 0;"><div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;flex:1;">${details}<small style="color:var(--text-muted,#64748b);">Deleted: ${escapeHTML(formatTrashValue(record.deleted_at))}</small></div><button type="button" class="admin-nav-item" data-trash-restore="${escapeHTML(group.key)}" data-record-id="${escapeHTML(record.id)}" style="width:auto;color:#15803d;border-color:#86efac;"><i class="fa-solid fa-rotate-left"></i><span>Restore</span></button></div>`;
                    }).join("");
                    return `<section style="margin-bottom:26px;"><h3 style="margin:8px 0 12px;">${escapeHTML(group.label)} <span style="font-size:13px;opacity:.7;">(${group.rows.length})</span></h3>${rows}</section>`;
                }).join("");
            } catch (error) {
                console.error("Trash load failed:", error);
                container.innerHTML = `<div class="empty-state" style="color:#b91c1c;">Could not load Trash: ${escapeHTML(error.message || "Unknown error")}</div>`;
            }
        }

        document.addEventListener("click", async function (event) {
            const refreshButton = event.target.closest("#refreshTrashBtn");
            if (refreshButton) {
                loadTrashRecords();
                return;
            }

            const restoreButton = event.target.closest("[data-trash-restore]");
            if (!restoreButton) return;

            const tableName = restoreButton.dataset.trashRestore;
            const recordId = restoreButton.dataset.recordId;
            if (!trashTables.some((table) => table.key === tableName) || !recordId) return;

            if (!window.confirm("Restore this record? It will become visible again in its original section.")) return;

            restoreButton.disabled = true;
            restoreButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Restoring…</span>';

            try {
                const { error } = await supabaseClient
                    .from(tableName)
                    .update({ deleted_at: null })
                    .eq("id", recordId)
                    .not("deleted_at", "is", null);
                if (error) throw error;
                alert("Record restored successfully.");
                await loadTrashRecords();
                await renderDashboard();
            } catch (error) {
                console.error("Restore failed:", error);
                alert(`Could not restore record: ${error.message || "Unknown error"}`);
                restoreButton.disabled = false;
                restoreButton.innerHTML = '<i class="fa-solid fa-rotate-left"></i><span>Restore</span>';
            }
        });

        /* Load Trash only when its section is opened. */
        const trashNavItem = document.querySelector('.admin-nav-item[data-section="trash"]');
        if (trashNavItem) {
            trashNavItem.addEventListener("click", loadTrashRecords);
        }

        /* =================================================
           VIEW ALL
           ================================================= */

        const sectionButtons =
            document.querySelectorAll(
                "[data-section-target]"
            );


        sectionButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        showSection(
                            button.dataset.sectionTarget
                        );

                    }
                );

            }
        );


        /* =================================================
           MOBILE SIDEBAR
           ================================================= */

        if (sidebarToggle) {

            sidebarToggle.addEventListener(
                "click",
                function () {

                    sidebar.classList.toggle(
                        "open"
                    );

                }
            );

        }


        /* =================================================
           LOGOUT
           ================================================= */

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                async function () {

                    const {
                        error
                    } =
                        await supabaseClient.auth
                            .signOut();


                    if (error) {

                        console.error(
                            "Logout error:",
                            error
                        );

                        return;
                    }


                    window.location.href =
                        "admin-login.html";

                }
            );

        }


        /* =================================================
           LOAD REAL DATABASE DATA
           ================================================= */

        renderDashboard();

    }



    /* =====================================================
       GET ADMISSIONS
       ===================================================== */

    async function getAdmissions() {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("admissions")
                .select("*")
                .is("deleted_at", null)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Admissions error:",
                error
            );

            return [];
        }


        return data || [];
    }



    /* =====================================================
       GET ENQUIRIES
       ===================================================== */

    async function getEnquiries() {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("enquiries")
                .select("*")
                .is("deleted_at", null)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Enquiries error:",
                error
            );

            return [];
        }


        return data || [];
    }



    /* =====================================================
       GET FEEDBACK
       ===================================================== */

    async function getFeedback() {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("feedback")
                .select("*")
                .is("deleted_at", null)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Feedback error:",
                error
            );

            return [];
        }


        return data || [];
    }



    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHTML(value) {

        return String(
            value ?? ""
        )

            .replaceAll(
                "&",
                "&amp;"
            )

            .replaceAll(
                "<",
                "&lt;"
            )

            .replaceAll(
                ">",
                "&gt;"
            )

            .replaceAll(
                '"',
                "&quot;"
            )

            .replaceAll(
                "'",
                "&#039;"
            );

    }



    /* =====================================================
       FORMAT DATE
       ===================================================== */

    function formatDate(
        date
    ) {

        if (!date) {
            return "-";
        }


        const d =
            new Date(date);


        if (
            Number.isNaN(
                d.getTime()
            )
        ) {

            return escapeHTML(
                date
            );
        }


        return d.toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    }



    /* =====================================================
       CREATE ALL SUBMISSIONS
       ===================================================== */

    function createAllSubmissions(
        admissions,
        enquiries,
        feedback
    ) {

        const records = [];


        admissions.forEach(
            function (item) {

                records.push({

                    name:
                        item.name,

                    email:
                        item.email,

                    phone:
                        item.mobile,

                    type:
                        "Admission",

                    date:
                        item.created_at

                });

            }
        );


        enquiries.forEach(
            function (item) {

                records.push({

                    name:
                        item.name,

                    email:
                        item.email,

                    phone:
                        item.mobile,

                    type:
                        "Enquiry",

                    date:
                        item.created_at

                });

            }
        );


        feedback.forEach(
            function (item) {

                records.push({

                    name:
                        item.name,

                    email:
                        item.email,

                    phone:
                        item.mobile,

                    type:
                        "Feedback",

                    date:
                        item.created_at

                });

            }
        );


        records.sort(
            function (a, b) {

                return new Date(
                    b.date
                ) -
                new Date(
                    a.date
                );

            }
        );


        return records;
    }



    /* =====================================================
       CREATE GENERAL TABLE
       ===================================================== */

    function createGeneralTable(
        data,
        limit
    ) {

        if (
            !data ||
            data.length === 0
        ) {

            return `

                <div class="empty-state">

                    <i class="fa-regular fa-folder-open"></i>

                    <br>

                    No data available yet.

                </div>

            `;
        }


        const records =
            limit
                ? data.slice(
                    0,
                    limit
                )
                : data;


        let rows = "";


        records.forEach(
            function (item) {

                rows += `

                    <tr>

                        <td>
                            ${escapeHTML(item.name)}
                        </td>

                        <td>
                            ${escapeHTML(item.email)}
                        </td>

                        <td>
                            ${escapeHTML(item.phone)}
                        </td>

                        <td>
                            ${escapeHTML(item.type)}
                        </td>

                        <td>
                            ${escapeHTML(
                                formatDate(item.date)
                            )}
                        </td>

                    </tr>

                `;

            }
        );


        return `

            <table class="data-table">

                <thead>

                    <tr>

                        <th>Name</th>

                        <th>Email</th>

                        <th>Phone</th>

                        <th>Type</th>

                        <th>Date</th>

                    </tr>

                </thead>

                <tbody>

                    ${rows}

                </tbody>

            </table>

        `;

    }

function createAdmissionTable(data) {
    if (!data || data.length === 0) {
        return `<div class="empty-state">
            <i class="fa-regular fa-folder-open"></i>
            <br>No admission applications yet.
        </div>`;
    }

    const rows = data.map(item => `
        <tr>
            <td>${escapeHTML(item.id)}</td>
            <td>${escapeHTML(item.name || '')}</td>
            <td>${escapeHTML(item.father_name || '')}</td>
            <td>${escapeHTML(item.mobile || '')}</td>
            <td>${escapeHTML(item.trade || '')}</td>
            <td>${escapeHTML(item.session || '')}</td>
            <td>${escapeHTML(item.status || 'New')}</td>
            <td>${escapeHTML(formatDate(item.created_at))}</td>
            <td class="admin-admission-actions">
                <button type="button"
                    class="outline-btn"
                    data-admission-action="view-form"
                    data-admission-id="${Number(item.id)}">
                    View Form
                </button>
            </td>
        </tr>
    `).join('');

    return `
        <div class="admin-table-scroll">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Father Name</th>
                        <th>Mobile</th>
                        <th>Trade</th>
                        <th>Session</th>
                        <th>Application Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
}

/* =====================================================
   ADMISSION FORM DETAILS + SECURE DOCUMENT VIEWER
   These features run only after the existing admin auth gate succeeds.
   ===================================================== */
function ensureAdminModal(id, title) {
    let overlay = document.getElementById(id);
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'admin-detail-overlay';
    overlay.innerHTML = `<section class="admin-detail-modal" role="dialog" aria-modal="true" aria-labelledby="${id}Title">
        <header class="admin-detail-header"><h2 id="${id}Title">${escapeHTML(title)}</h2><button type="button" class="admin-detail-close" aria-label="Close">&times;</button></header>
        <div class="admin-detail-body" id="${id}Body">Loading…</div></section>`;
    overlay.querySelector('.admin-detail-close').addEventListener('click', () => overlay.classList.remove('show'));
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('show'); });
    document.body.appendChild(overlay);
    return overlay;
}

function displayValue(value) {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

window.viewAdmissionDetails = async function (admissionId) {
    const modal = ensureAdminModal('admissionDetailsOverlay', 'Student Admission Form');
    const body = document.getElementById('admissionDetailsOverlayBody');
    modal.classList.add('show');
    body.innerHTML = '<p>Loading student details…</p>';

    try {
        const { data: admission, error } = await supabaseClient
            .from('admissions')
            .select('*')
            .eq('id', admissionId)
            .single();

        if (error) throw error;

        // Display admission details only; payment and document handling are not part of this enquiry flow.
        const labels = {
            id: 'Student / Admission ID',
            name: 'Student Name',
            student_name: 'Student Name',
            father_name: 'Father Name',
            mother_name: 'Mother Name',
            mobile: 'Mobile',
            phone: 'Phone',
            email: 'Email',
            dob: 'Date of Birth',
            address: 'Address',
            qualification: 'Highest Qualification',
            trade: 'Trade',
            session: 'Session',
            status: 'Application Status',
            created_at: 'Application Date',
            updated_at: 'Last Updated'
        };

        const hiddenKeys = new Set([
            'payment_method',
            'payment_utr',
            'payment_status',
            'payment_screenshot_path',
            'document_url'
        ]);

        const entries = Object.entries(admission).filter(([key]) =>
            !hiddenKeys.has(key) &&
            !/password|secret|token|storage_path|file_path/i.test(key)
        );

        const rows = entries.map(([key, value]) => `
            <tr>
                <th>${escapeHTML(labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))}</th>
                <td>${escapeHTML(displayValue(value))}</td>
            </tr>
        `).join('');

        body.innerHTML = `
            <div class="admin-detail-table-wrap">
                <table class="admin-detail-table">
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (err) {
        console.error('Admission form load failed:', err);
        body.innerHTML = `<p class="admin-detail-error">Could not load student form: ${escapeHTML(err.message || 'Unknown error')}</p><p class="admin-detail-muted">Check admin access and Supabase Row Level Security policies.</p>`;
    }
};


/* =====================================================
   CSP-SAFE ADMISSION BUTTON HANDLERS
   No inline onclick attributes; compatible with strict script-src.
   ===================================================== */
document.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-admission-action]');
    if (!button) return;

    const admissionId = Number(button.dataset.admissionId);
    if (!Number.isSafeInteger(admissionId) || admissionId <= 0) {
        console.error('Invalid admission ID for admin action.');
        return;
    }

    if (button.dataset.admissionAction === 'view-form') {
        window.viewAdmissionDetails(admissionId);
    }
});


/* =====================================================
   CREATE ENQUIRY TABLE
   ===================================================== */

function createEnquiryTable(data) {

    if (!data || data.length === 0) {

        return `
            <div class="empty-state">
                <i class="fa-regular fa-folder-open"></i>
                <br>
                No enquiries yet.
            </div>
        `;
    }

    let rows = "";

    data.forEach(function (item, index) {

        const message = item.message || "No message";

        rows += `

            <tr>

                <td>
                    ${escapeHTML(item.name || "")}
                </td>

                <td>
                    ${escapeHTML(item.mobile || "")}
                </td>

                <td>
                    ${escapeHTML(item.email || "")}
                </td>

                <td>
                    ${escapeHTML(item.subject || "")}
                </td>

                <td>
    <button
        type="button"
        class="view-message-btn"
        data-message-index="${index}"
    >
        <i class="fa-regular fa-message"></i>
        View Message
    </button>
</td>

                <td>
                    ${escapeHTML(item.status || "")}
                </td>

                <td>
                    ${escapeHTML(
                        formatDate(item.created_at)
                    )}
                </td>

            </tr>

        `;

    });


    /* Store enquiries for View Message button */

    window.currentEnquiries = data;


    return `

        <div style="overflow-x:auto;">

            <table class="data-table">

                <thead>

                    <tr>

                        <th>Name</th>
                        <th>Mobile</th>
                        <th>Email</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Date</th>

                    </tr>

                </thead>

                <tbody>

                    ${rows}

                </tbody>

            </table>

        </div>

    `;
}
    /* =====================================================
       CREATE FEEDBACK TABLE
       ===================================================== */

    function createFeedbackTable(
        data
    ) {

        if (
            !data ||
            data.length === 0
        ) {

            return `

                <div class="empty-state">

                    <i class="fa-regular fa-folder-open"></i>

                    <br>

                    No feedback yet.

                </div>

            `;
        }


        let rows = "";


        data.forEach(
            function (item) {

                rows += `

                    <tr>

                        <td>
                            ${escapeHTML(item.name)}
                        </td>

                        <td>
                            ${escapeHTML(item.mobile)}
                        </td>

                        <td>
                            ${escapeHTML(item.email)}
                        </td>

                        <td>
                            ${escapeHTML(item.rating)}
                        </td>

                        <td>
                            ${escapeHTML(item.message)}
                        </td>

                        <td>
                            ${escapeHTML(item.status)}
                        </td>

                        <td>
                            ${escapeHTML(
                                formatDate(item.created_at)
                            )}
                        </td>

                    </tr>

                `;

            }
        );


        return `

            <div style="overflow-x:auto;">

                <table class="data-table">

                    <thead>

                        <tr>

                            <th>Name</th>
                            <th>Mobile</th>
                            <th>Email</th>
                            <th>Rating</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th>Date</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${rows}

                    </tbody>

                </table>

            </div>

        `;

    }



    /* =====================================================
       RENDER DASHBOARD
       ===================================================== */

    async function renderDashboard() {

        const [
            admissions,
            enquiries,
            feedback
        ] =
            await Promise.all([

                getAdmissions(),

                getEnquiries(),

                getFeedback()

            ]);


        const allData =
            createAllSubmissions(
                admissions,
                enquiries,
                feedback
            );


        /* =================================================
           COUNTS
           ================================================= */

        const totalCount =
            document.getElementById(
                "totalCount"
            );


        const admissionCount =
            document.getElementById(
                "admissionCount"
            );


        const contactCount =
            document.getElementById(
                "contactCount"
            );


        const feedbackCount =
            document.getElementById(
                "feedbackCount"
            );


        if (totalCount) {

            totalCount.textContent =
                allData.length;

        }


        if (admissionCount) {

            admissionCount.textContent =
                admissions.length;

        }


        if (contactCount) {

            contactCount.textContent =
                enquiries.length;

        }


        if (feedbackCount) {

            feedbackCount.textContent =
                feedback.length;

        }


        /* =================================================
           TABLES
           ================================================= */

        const recentTable =
            document.getElementById(
                "recentTable"
            );


        const allSubmissionsTable =
            document.getElementById(
                "allSubmissionsTable"
            );


        const admissionsTable =
            document.getElementById(
                "admissionsTable"
            );


        const contactsTable =
            document.getElementById(
                "contactsTable"
            );


        const feedbackTable =
            document.getElementById(
                "feedbackTable"
            );


        if (recentTable) {

            recentTable.innerHTML =
                createGeneralTable(
                    allData,
                    8
                );

        }


        if (allSubmissionsTable) {

            allSubmissionsTable.innerHTML =
                createGeneralTable(
                    allData
                );

        }


        if (admissionsTable) {

            admissionsTable.innerHTML =
                createAdmissionTable(
                    admissions
                );

        }


        if (contactsTable) {

            contactsTable.innerHTML =
                createEnquiryTable(
                    enquiries
                );

        }


        if (feedbackTable) {

            feedbackTable.innerHTML =
                createFeedbackTable(
                    feedback
                );

        }

    }



    /* =====================================================
       AUTH STATE LISTENER
       ===================================================== */

    function setupAuthListener() {

        if (!supabaseClient) {
            return;
        }


        supabaseClient.auth.onAuthStateChange(
            function (
                event,
                session
            ) {

                if (
                    event ===
                    "SIGNED_OUT"
                ) {

                    const dashboard =
                        document.getElementById(
                            "section-dashboard"
                        );


                    if (dashboard) {

                        window.location.href =
                            "admin-login.html";

                    }

                }

            }
        );

    }



    /* =====================================================
       LOGIN ERROR
       ===================================================== */

    function showLoginError(
        message
    ) {

        const loginMessage =
            document.getElementById(
                "loginMessage"
            );


        if (loginMessage) {

            loginMessage.textContent =
                message;

        }

    }
    
/* =========================================================
   PASSWORD PROTECTED CLEAR DATA
   SUPABASE VERSION
========================================================= */


/* =========================================================
   CLEAR DATA CONFIRMATION POPUP
========================================================= */

const clearDataBtn =
    document.getElementById("clearDataBtn");

const clearDataPopup =
    document.getElementById("clearDataPopup");

const clearDataCancel =
    document.getElementById("clearDataCancel");

const clearDataCancelTop =
    document.getElementById("clearDataCancelTop");

const clearDataConfirm =
    document.getElementById("clearDataConfirm");


/* =========================================================
   CLOSE CLEAR DATA CONFIRMATION POPUP
========================================================= */

function closeClearDataPopup() {

    if (clearDataPopup) {

        clearDataPopup.classList.remove("show");

    }

    document.body.style.overflow = "";

}


/* =========================================================
   OPEN CLEAR DATA CONFIRMATION POPUP
========================================================= */

if (clearDataBtn) {

    clearDataBtn.addEventListener(
        "click",
        function () {

            if (clearDataPopup) {

                clearDataPopup.classList.add(
                    "show"
                );

                document.body.style.overflow =
                    "hidden";

            }

        }
    );

}


/* =========================================================
   CANCEL BUTTON
========================================================= */

if (clearDataCancel) {

    clearDataCancel.addEventListener(
        "click",
        closeClearDataPopup
    );

}


/* =========================================================
   TOP CLOSE BUTTON
========================================================= */

if (clearDataCancelTop) {

    clearDataCancelTop.addEventListener(
        "click",
        closeClearDataPopup
    );

}


/* =========================================================
   CLOSE WHEN CLICKING OUTSIDE
========================================================= */

if (clearDataPopup) {

    clearDataPopup.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                clearDataPopup
            ) {

                closeClearDataPopup();

            }

        }
    );

}


/* =========================================================
   YES - CLEAR DATA
========================================================= */

if (clearDataConfirm) {

    clearDataConfirm.addEventListener(
        "click",
        function () {

            closeClearDataPopup();


            const passwordPopup =
                document.getElementById(
                    "adminPasswordPopup"
                );


            const passwordInput =
                document.getElementById(
                    "clearDataPassword"
                );


            const passwordError =
                document.getElementById(
                    "clearPasswordError"
                );


            if (passwordPopup) {

                passwordPopup.classList.add(
                    "show"
                );

                document.body.style.overflow =
                    "hidden";

            }


            if (passwordInput) {

                passwordInput.value = "";

                setTimeout(
                    function () {

                        passwordInput.focus();

                    },
                    100
                );

            }


            if (passwordError) {

                passwordError.textContent = "";

            }

        }
    );

}


/* =========================================================
   ADMIN PASSWORD POPUP ELEMENTS
========================================================= */

const adminPasswordPopup =
    document.getElementById(
        "adminPasswordPopup"
    );


const adminPasswordCancel =
    document.getElementById(
        "adminPasswordCancel"
    );


const adminPasswordCancelTop =
    document.getElementById(
        "adminPasswordCancelTop"
    );


const adminPasswordSubmit =
    document.getElementById(
        "adminPasswordSubmit"
    );


const clearDataPassword =
    document.getElementById(
        "clearDataPassword"
    );


const toggleClearPassword =
    document.getElementById(
        "toggleClearPassword"
    );


const clearPasswordError =
    document.getElementById(
        "clearPasswordError"
    );


/* =========================================================
   CLOSE PASSWORD POPUP
========================================================= */

function closeAdminPasswordPopup() {

    if (adminPasswordPopup) {

        adminPasswordPopup.classList.remove(
            "show"
        );

    }

    document.body.style.overflow = "";

}


/* =========================================================
   PASSWORD POPUP CANCEL
========================================================= */

if (adminPasswordCancel) {

    adminPasswordCancel.addEventListener(
        "click",
        closeAdminPasswordPopup
    );

}


/* =========================================================
   PASSWORD POPUP TOP CLOSE
========================================================= */

if (adminPasswordCancelTop) {

    adminPasswordCancelTop.addEventListener(
        "click",
        closeAdminPasswordPopup
    );

}


/* =========================================================
   SHOW / HIDE PASSWORD
========================================================= */

if (toggleClearPassword) {

    toggleClearPassword.addEventListener(
        "click",
        function () {

            if (
                clearDataPassword.type ===
                "password"
            ) {

                clearDataPassword.type =
                    "text";


                toggleClearPassword.innerHTML =
                    '<i class="fa-solid fa-eye-slash"></i>';

            }

            else {

                clearDataPassword.type =
                    "password";


                toggleClearPassword.innerHTML =
                    '<i class="fa-solid fa-eye"></i>';

            }

        }
    );

}


/* =========================================================
   PASSWORD VERIFICATION + SOFT DELETE
========================================================= */

if (adminPasswordSubmit) {

    adminPasswordSubmit.addEventListener(
        "click",
        async function () {


            const password =
                clearDataPassword
                    ? clearDataPassword.value
                    : "";


            /* -----------------------------------------
               EMPTY PASSWORD
            ----------------------------------------- */

            if (!password) {

                if (clearPasswordError) {

                    clearPasswordError.textContent =
                        "Please enter your admin password.";

                }

                if (clearDataPassword) {

                    clearDataPassword.focus();

                }

                return;

            }


            /* -----------------------------------------
               BUTTON LOADING
            ----------------------------------------- */

            adminPasswordSubmit.disabled =
                true;

            adminPasswordSubmit.textContent =
                "Verifying...";


            if (clearPasswordError) {

                clearPasswordError.textContent =
                    "";

            }


            try {


                /* =====================================
                   GET CURRENT SUPABASE USER
                ===================================== */

                const {
                    data: { user },
                    error: userError
                } =
                    await supabaseClient.auth.getUser();


                if (
                    userError ||
                    !user
                ) {

                    throw new Error(
                        "Admin session expired. Please login again."
                    );

                }


                /* =====================================
                   VERIFY ADMIN PASSWORD
                ===================================== */

                const {
                    error: loginError
                } =
                    await supabaseClient.auth
                        .signInWithPassword({

                            email:
                                user.email,

                            password:
                                password

                        });


                /* =====================================
                   WRONG PASSWORD
                ===================================== */

                if (loginError) {

                    if (clearPasswordError) {

                        clearPasswordError.textContent =
                            "Incorrect admin password.";

                    }


                    if (clearDataPassword) {

                        clearDataPassword.value = "";

                        clearDataPassword.focus();

                    }


                    return;

                }


                /* =====================================
                   SOFT DELETE ADMISSIONS
                ===================================== */

                const deletedAt = new Date().toISOString();

                const {
                    error:
                        admissionsError
                } =
                    await supabaseClient
                        .from("admissions")
                        .update({
                            deleted_at: deletedAt
                        })
                        .is("deleted_at", null);


                if (admissionsError) {

                    throw admissionsError;

                }


                /* =====================================
                   SOFT DELETE ENQUIRIES
                ===================================== */

                const {
                    error:
                        enquiriesError
                } =
                    await supabaseClient
                        .from("enquiries")
                        .update({
                            deleted_at: deletedAt
                        })
                        .is("deleted_at", null);


                if (enquiriesError) {

                    throw enquiriesError;

                }


                /* =====================================
                   SOFT DELETE FEEDBACK
                ===================================== */

                const {
                    error:
                        feedbackError
                } =
                    await supabaseClient
                        .from("feedback")
                        .update({
                            deleted_at: deletedAt
                        })
                        .is("deleted_at", null);


                if (feedbackError) {

                    throw feedbackError;

                }


                /* =====================================
                   CLOSE PASSWORD POPUP
                ===================================== */

                closeAdminPasswordPopup();


                /* =====================================
                   SUCCESS
                ===================================== */

                alert(
                    "All active website records have been moved to deleted items. They have not been permanently erased."
                );


                /* =====================================
                   REFRESH DASHBOARD
                ===================================== */

                window.location.reload();


            }

            catch (error) {

                console.error(
                    "Clear Data Error:",
                    error
                );


                if (clearPasswordError) {

                    clearPasswordError.textContent =
                        error.message ||
                        "Unable to clear data.";

                }

            }

            finally {

                adminPasswordSubmit.disabled =
                    false;

                adminPasswordSubmit.textContent =
                    "Verify & Clear";

            }

        }
    );

}


/* =========================================================
   ESC KEY - CLOSE POPUPS
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeClearDataPopup();

            closeAdminPasswordPopup();

        }

    }
);

})();
/* =====================================================
   VIEW ENQUIRY MESSAGE MODAL
   ===================================================== */

document.addEventListener("click", function (event) {

    const button = event.target.closest(".view-message-btn");

    if (!button) {
        return;
    }

    const index = Number(
        button.getAttribute("data-message-index")
    );

    const enquiry = window.currentEnquiries?.[index];

    if (!enquiry) {
        alert("Enquiry message not found.");
        return;
    }

    const overlay =
        document.getElementById("enquiryViewOverlay");

    const name =
        document.getElementById("enquiryViewName");

    const subject =
        document.getElementById("enquiryViewSubject");

    const message =
        document.getElementById("enquiryViewMessage");

    if (!overlay || !name || !subject || !message) {

        console.error(
            "Enquiry modal elements not found."
        );

        return;
    }

    /* Fill enquiry details */

    name.textContent =
        enquiry.name || "Unknown";

    subject.textContent =
        enquiry.subject || "General Enquiry";

    message.textContent =
        enquiry.message || "No message available.";

    /* Open modal */

    overlay.style.display = "flex";

    document.body.style.overflow = "hidden";

});


/* =====================================================
   CLOSE ENQUIRY MESSAGE MODAL
   ===================================================== */

document.addEventListener("click", function (event) {

    if (
        event.target.closest("#enquiryViewClose") ||
        event.target.closest("#enquiryViewCloseBtn")
    ) {

        const overlay =
            document.getElementById("enquiryViewOverlay");

        if (overlay) {

            overlay.style.display = "none";

        }

        document.body.style.overflow = "";

    }

});


/* =====================================================
   CLOSE WHEN CLICKING OUTSIDE
   ===================================================== */

document.addEventListener("click", function (event) {

    const overlay =
        document.getElementById("enquiryViewOverlay");

    if (
        overlay &&
        event.target === overlay
    ) {

        overlay.style.display = "none";

        document.body.style.overflow = "";

    }

});


/* =====================================================
   CLOSE WITH ESC
   ===================================================== */

document.addEventListener("keydown", function (event) {

    if (event.key !== "Escape") {
        return;
    }

    const overlay =
        document.getElementById("enquiryViewOverlay");

    if (
        overlay &&
        overlay.style.display === "flex"
    ) {

        overlay.style.display = "none";

        document.body.style.overflow = "";

    }

});