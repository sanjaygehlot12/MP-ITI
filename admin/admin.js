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


        supabaseClient = createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


        initializeApplication();
    }


    /* =====================================================
       LOGIN PAGE
       ===================================================== */

    async function initializeApplication() {

        const loginForm =
            document.getElementById("adminLoginForm");


        if (loginForm) {

            initializeLogin();

            return;
        }


        /* =================================================
           DASHBOARD PAGE
           ================================================= */

        const dashboardSection =
            document.getElementById("section-dashboard");


        if (!dashboardSection) {
            return;
        }


        const {
            data: {
                session
            },
            error
        } =
            await supabaseClient.auth.getSession();


        if (
            error ||
            !session
        ) {

            window.location.href =
                "admin-login.html";

            return;
        }


        /* =================================================
           VERIFY ADMIN
           ================================================= */

        const isAdmin =
            await verifyAdminUser(
                session.user.id
            );


        if (!isAdmin) {

            await supabaseClient.auth.signOut();

            window.location.href =
                "admin-login.html";

            return;
        }


        initializeDashboard();
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
           CHECK EXISTING SESSION
           ================================================= */

        supabaseClient.auth
            .getSession()
            .then(async function (result) {

                const session =
                    result.data.session;


                if (!session) {
                    return;
                }


                const isAdmin =
                    await verifyAdminUser(
                        session.user.id
                    );


                if (isAdmin) {

                    window.location.href =
                        "admin-panel.html";
                }

            });


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

    function createAdmissionTable(
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

                    No admission applications yet.

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
                            ${escapeHTML(item.father_name)}
                        </td>

                        <td>
                            ${escapeHTML(item.mobile)}
                        </td>

                        <td>
                            ${escapeHTML(item.email)}
                        </td>

                        <td>
                            ${escapeHTML(item.trade)}
                        </td>

                        <td>
                            ${escapeHTML(item.session)}
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
                            <th>Father Name</th>
                            <th>Mobile</th>
                            <th>Email</th>
                            <th>Trade</th>
                            <th>Session</th>
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
       CREATE ENQUIRY TABLE
       ===================================================== */

    function createEnquiryTable(
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

                    No enquiries yet.

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
                            ${escapeHTML(item.subject)}
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
                            <th>Subject</th>
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