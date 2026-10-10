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
                "Feedback"

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



    /* =====================================================
       CREATE ADMISSION TABLE
       ===================================================== */

    function createAdmissionTable(data) {
        if (!data || data.length === 0) {
            return `<div class="empty-state"><i class="fa-regular fa-folder-open"></i><br>No admission applications yet.</div>`;
        }
        const rows = data.map(item => `
            <tr>
                <td>${escapeHTML(item.id)}</td>
                <td>${escapeHTML(item.name || item.student_name || '')}</td>
                <td>${escapeHTML(item.father_name || '')}</td>
                <td>${escapeHTML(item.mobile || '')}</td>
                <td>${escapeHTML(item.trade || '')}</td>
                <td>${escapeHTML(item.session || '')}</td>
                <td>${escapeHTML(item.status || 'New')}</td>
                <td><span class="admin-payment-pill ${String(item.payment_status || 'Pending').toLowerCase()}">${escapeHTML(item.payment_status || 'Pending')}</span></td>
                <td>${escapeHTML(formatDate(item.created_at))}</td>
                <td class="admin-admission-actions">
                    <button type="button" class="outline-btn" onclick="window.viewAdmissionDetails(${Number(item.id)})">View Form</button>
                    <button type="button" class="outline-btn" onclick="window.viewAdmissionDocuments(${Number(item.id)})">View Documents</button>
                </td>
            </tr>`).join('');
        return `<div class="admin-table-scroll"><table class="data-table"><thead><tr>
            <th>Student ID</th><th>Name</th><th>Father Name</th><th>Mobile</th><th>Trade</th><th>Session</th><th>Application Status</th><th>Payment Status</th><th>Date</th><th>Actions</th>
            </tr></thead><tbody>${rows}</tbody></table></div>`;
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
    body.innerHTML = '<p>Loading student form and payment details…</p>';
    try {
        const { data: admission, error } = await supabaseClient.from('admissions').select('*').eq('id', admissionId).single();
        if (error) throw error;
        // All fields returned by the admissions row are shown in one table. Sensitive storage paths are intentionally not exposed.
        const labels = {
            id: 'Student / Admission ID', name: 'Student Name', student_name: 'Student Name', father_name: 'Father Name', mother_name: 'Mother Name',
            mobile: 'Mobile', phone: 'Phone', email: 'Email', dob: 'Date of Birth', address: 'Address', qualification: 'Highest Qualification',
            trade: 'Trade', session: 'Session', status: 'Application Status', created_at: 'Application Date', updated_at: 'Last Updated',
            payment_method: 'Payment Method', payment_utr: 'Payment UTR / Transaction ID', payment_status: 'Payment Status'
        };
        const hiddenKeys = new Set(['payment_screenshot_path']);
        const entries = Object.entries(admission).filter(([key]) => !hiddenKeys.has(key) && !/password|secret|token|storage_path|file_path/i.test(key));
        let screenshotRow = '<tr><th>Payment Screenshot</th><td>No payment screenshot path saved.</td></tr>';
        if (admission.payment_screenshot_path) {
            const { data: signed, error: signedError } = await supabaseClient.storage.from('admission-documents').createSignedUrl(admission.payment_screenshot_path, 120);
            if (!signedError && signed?.signedUrl) screenshotRow = `<tr><th>Payment Screenshot</th><td><a class="outline-btn" href="${signed.signedUrl}" target="_blank" rel="noopener noreferrer">View payment screenshot (expires in 2 minutes)</a></td></tr>`;
            else screenshotRow = '<tr><th>Payment Screenshot</th><td>Unavailable. Check private bucket access policy and saved file path.</td></tr>';
        }
        const rows = entries.map(([key, value]) => `<tr><th>${escapeHTML(labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))}</th><td>${escapeHTML(displayValue(value))}</td></tr>`).join('');
        const status = String(admission.payment_status || 'Pending');
        body.innerHTML = `<div class="admin-detail-table-wrap"><table class="admin-detail-table"><tbody>${rows}${screenshotRow}</tbody></table></div>
          <div class="admin-payment-actions"><span class="admin-detail-muted">Current payment status: <strong>${escapeHTML(status)}</strong></span>
          <button type="button" class="admin-verify-btn" onclick="window.setAdmissionPaymentStatus(${Number(admissionId)}, 'Verified')">Verify Payment</button>
          <button type="button" class="admin-reject-btn" onclick="window.setAdmissionPaymentStatus(${Number(admissionId)}, 'Rejected')">Reject Payment</button></div>
          <p class="admin-detail-muted">Payment status is an admin record only. Verify the actual bank credit before choosing Verified.</p>`;
    } catch (err) {
        console.error('Admission form load failed:', err);
        body.innerHTML = `<p class="admin-detail-error">Could not load student form: ${escapeHTML(err.message || 'Unknown error')}</p><p class="admin-detail-muted">Check admin access and Supabase Row Level Security policies.</p>`;
    }
};

window.viewAdmissionDocuments = async function (admissionId) {
    const modal = ensureAdminModal('admissionDocumentsOverlay', 'Student Documents');
    const body = document.getElementById('admissionDocumentsOverlayBody');
    modal.classList.add('show');
    body.innerHTML = '<p>Loading private student documents…</p>';
    try {
       const { data: admission, error: admissionError } =
    await supabaseClient
        .from('admissions')
        .select('id, name, trade, session')
        .eq('id', admissionId)
        .single();
        if (admissionError) throw admissionError;
        const { data: docs, error } = await supabaseClient.from('admission_documents')
            .select('id,admission_id,document_type,file_name,file_path,uploaded_at,status,notes')
            .eq('admission_id', admissionId).order('id', { ascending: true });
        if (error) throw error;
        let paymentScreenshot = '';
        const { data: payment, error: paymentError } = await supabaseClient.from('admissions').select('payment_screenshot_path').eq('id', admissionId).single();
        if (!paymentError && payment?.payment_screenshot_path) {
            const signed = await supabaseClient.storage.from('admission-documents').createSignedUrl(payment.payment_screenshot_path, 120);
            if (!signed.error && signed.data?.signedUrl) paymentScreenshot = `<div class="admin-doc-item"><div><strong>Payment Screenshot</strong><small>Student ID folder: ${escapeHTML(admissionId)}</small></div><a class="outline-btn" href="${signed.data.signedUrl}" target="_blank" rel="noopener noreferrer">View file</a></div>`;
        }
        const docsHtml = await Promise.all((docs || []).map(async doc => {
            // Short-lived signed URLs; the bucket stays private.
            const signed = await supabaseClient.storage.from('admission-documents').createSignedUrl(doc.file_path, 120);
            const link = !signed.error && signed.data?.signedUrl
                ? `<a class="outline-btn" href="${signed.data.signedUrl}" target="_blank" rel="noopener noreferrer">View file</a>`
                : '<span class="admin-detail-muted">Unavailable — check private bucket permissions</span>';
            return `<div class="admin-doc-item"><div><strong>${escapeHTML(doc.document_type || 'Document')}</strong><small>${escapeHTML(doc.file_name || 'Unnamed file')}</small><small>Uploaded: ${escapeHTML(formatDate(doc.uploaded_at))} · Status: ${escapeHTML(doc.status || 'Pending')}</small>${doc.notes ? `<small>Notes: ${escapeHTML(doc.notes)}</small>` : ''}</div>${link}</div>`;
        }));
        const studentName = admission.name || admission.student_name || 'Student';
        body.innerHTML = `<div class="admin-folder-card"><div class="admin-folder-icon">📁</div><div><small>PRIVATE STUDENT FOLDER</small><h3>Student ID: ${escapeHTML(admission.id)}</h3><p>${escapeHTML(studentName)} · ${escapeHTML(admission.trade || 'Trade not set')} · ${escapeHTML(admission.session || 'Session not set')}</p><small>Documents are accessed using admin authentication and short-lived signed links.</small></div></div>
          <div class="admin-doc-list">${paymentScreenshot}${docsHtml.join('') || '<p class="admin-detail-muted">No uploaded document records found for this student.</p>'}</div>`;
    } catch (err) {
        console.error('Student documents load failed:', err);
        body.innerHTML = `<p class="admin-detail-error">Could not load student documents: ${escapeHTML(err.message || 'Unknown error')}</p><p class="admin-detail-muted">Ensure the admission_documents table, private storage bucket, and admin SELECT policies are configured.</p>`;
    }
};

window.setAdmissionPaymentStatus = async function (admissionId, status) {
    if (!['Verified', 'Rejected'].includes(status)) return;
    if (!window.confirm(`Set payment status to ${status}? Verify the actual bank transaction before marking it Verified.`)) return;
    try {
        const { error } = await supabaseClient.rpc('admin_set_admission_payment_status', { p_admission_id: admissionId, p_status: status });
        if (error) throw error;
        alert(`Payment status updated to ${status}.`);
        const modal = document.getElementById('admissionDetailsOverlay');
        if (modal) modal.classList.remove('show');
        await renderDashboard();
    } catch (err) {
        console.error('Payment status update failed:', err);
        alert('Could not update payment status. Run the admin_set_admission_payment_status SQL function setup and check admin permissions. ' + (err.message || ''));
    }
};

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
   PASSWORD VERIFICATION + DELETE
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
                   DELETE ADMISSIONS
                ===================================== */

                const {
                    error:
                        admissionsError
                } =
                    await supabaseClient
                        .from("admissions")
                        .delete()
                        .not(
                            "id",
                            "is",
                            null
                        );


                if (admissionsError) {

                    throw admissionsError;

                }


                /* =====================================
                   DELETE ENQUIRIES
                ===================================== */

                const {
                    error:
                        enquiriesError
                } =
                    await supabaseClient
                        .from("enquiries")
                        .delete()
                        .not(
                            "id",
                            "is",
                            null
                        );


                if (enquiriesError) {

                    throw enquiriesError;

                }


                /* =====================================
                   DELETE FEEDBACK
                ===================================== */

                const {
                    error:
                        feedbackError
                } =
                    await supabaseClient
                        .from("feedback")
                        .delete()
                        .not(
                            "id",
                            "is",
                            null
                        );


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
                    "All website data has been cleared successfully."
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