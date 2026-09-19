/* =========================================================
   MAHARANA PRATAP PRIVATE ITI SEHORE
   ADMIN PANEL JAVASCRIPT

   FRONTEND VERSION

   BACKEND DATABASE BAAD ME CONNECT HOGA.
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       DEMO LOGIN DETAILS

       IMPORTANT:
       Backend connect hone ke baad ye remove hoga.
    ===================================================== */

    const ADMIN_USERNAME = "admin";

    const ADMIN_PASSWORD = "Admin@12345";


    /* =====================================================
       CHECK LOGIN PAGE
    ===================================================== */

    const loginForm =
        document.getElementById("adminLoginForm");


    if (loginForm) {

        const usernameInput =
            document.getElementById("adminUsername");

        const passwordInput =
            document.getElementById("adminPassword");

        const passwordToggle =
            document.getElementById("passwordToggle");

        const loginMessage =
            document.getElementById("loginMessage");


        /* ================================================
           SHOW / HIDE PASSWORD
        ================================================= */

        passwordToggle.addEventListener(
            "click",
            function () {

                if (
                    passwordInput.type === "password"
                ) {

                    passwordInput.type = "text";

                    passwordToggle.innerHTML =
                        '<i class="fa-solid fa-eye-slash"></i>';

                } else {

                    passwordInput.type = "password";

                    passwordToggle.innerHTML =
                        '<i class="fa-solid fa-eye"></i>';

                }

            }
        );


        /* ================================================
           LOGIN
        ================================================= */

        loginForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const username =
                    usernameInput.value.trim();

                const password =
                    passwordInput.value;


                /* =========================================
                   DEMO AUTHENTICATION
                ========================================= */

                if (
                    username === ADMIN_USERNAME &&
                    password === ADMIN_PASSWORD
                ) {

                    sessionStorage.setItem(
                        "mpiti_admin_logged_in",
                        "true"
                    );


                    loginMessage.textContent = "";


                    window.location.href =
                        "admin-panel.html";


                } else {

                    loginMessage.textContent =
                        "Invalid username or password.";

                    passwordInput.value = "";

                    passwordInput.focus();

                }

            }
        );

    }



    /* =====================================================
       DASHBOARD CHECK
    ===================================================== */

    const dashboardSection =
        document.getElementById(
            "section-dashboard"
        );


    if (!dashboardSection) {
        return;
    }



    /* =====================================================
       SECURITY CHECK
    ===================================================== */

    const isLoggedIn =
        sessionStorage.getItem(
            "mpiti_admin_logged_in"
        );


    if (isLoggedIn !== "true") {

        window.location.href =
            "admin-login.html";

        return;

    }



    /* =====================================================
       ELEMENTS
    ===================================================== */

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


    const clearDemoData =
        document.getElementById(
            "clearDemoData"
        );



    /* =====================================================
       SECTION TITLES
    ===================================================== */

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



    /* =====================================================
       DATA TYPE
    ===================================================== */

    function getTypeFromKey(key) {

        const lowerKey =
            key.toLowerCase();


        if (
            lowerKey.includes("admission")
        ) {

            return "Admission";

        }


        if (
            lowerKey.includes("contact")
        ) {

            return "Contact";

        }


        if (
            lowerKey.includes("feedback")
        ) {

            return "Feedback";

        }


        return "Submission";

    }



    /* =====================================================
       GET DATA

       CURRENTLY:
       localStorage

       LATER:
       DATABASE/API
    ===================================================== */

    function getAllData() {

        const storageKeys = [

            "siteSubmissions",

            "contactSubmissions",

            "admissionSubmissions",

            "feedbackSubmissions"

        ];


        const allData = [];


        storageKeys.forEach(
            function (key) {

                try {

                    const stored =
                        localStorage.getItem(key);


                    if (!stored) {
                        return;
                    }


                    const parsed =
                        JSON.parse(stored);


                    if (
                        !Array.isArray(parsed)
                    ) {
                        return;
                    }


                    parsed.forEach(
                        function (item) {

                            allData.push({

                                ...item,

                                type:
                                    item.type ||
                                    getTypeFromKey(key)

                            });

                        }
                    );


                } catch (error) {

                    console.warn(
                        "Unable to read:",
                        key
                    );

                }

            }
        );


        return allData;

    }



    /* =====================================================
       GET FIRST AVAILABLE VALUE
    ===================================================== */

    function getValue(
        item,
        keys
    ) {

        for (
            let i = 0;
            i < keys.length;
            i++
        ) {

            const key =
                keys[i];


            if (
                item[key] !== undefined &&
                item[key] !== null &&
                item[key] !== ""
            ) {

                return item[key];

            }

        }


        return "-";

    }



    /* =====================================================
       HTML SECURITY
    ===================================================== */

    function escapeHTML(value) {

        return String(value)

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
       CREATE TABLE
    ===================================================== */

    function createTable(
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

                    No data available yet.

                    <br>

                    Backend/database connect
                    karne ke baad real submissions
                    yahan show honge.

                </div>

            `;

        }


        let records =
            data;


        if (limit) {

            records =
                data.slice(
                    0,
                    limit
                );

        }


        let rows = "";


        records.forEach(
            function (item) {


                const name =
                    getValue(
                        item,
                        [
                            "name",
                            "fullName",
                            "studentName",
                            "applicantName"
                        ]
                    );


                const email =
                    getValue(
                        item,
                        [
                            "email",
                            "emailAddress"
                        ]
                    );


                const phone =
                    getValue(
                        item,
                        [
                            "phone",
                            "mobile",
                            "mobileNumber"
                        ]
                    );


                const type =
                    item.type || "-";


                const date =
                    getValue(
                        item,
                        [
                            "date",
                            "createdAt",
                            "timestamp"
                        ]
                    );


                rows += `

                    <tr>

                        <td>
                            ${escapeHTML(name)}
                        </td>

                        <td>
                            ${escapeHTML(email)}
                        </td>

                        <td>
                            ${escapeHTML(phone)}
                        </td>

                        <td>
                            ${escapeHTML(type)}
                        </td>

                        <td>
                            ${escapeHTML(date)}
                        </td>

                    </tr>

                `;

            }
        );


        return `

            <table class="data-table">

                <thead>

                    <tr>

                        <th>
                            Name
                        </th>

                        <th>
                            Email
                        </th>

                        <th>
                            Phone
                        </th>

                        <th>
                            Type
                        </th>

                        <th>
                            Date
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${rows}

                </tbody>

            </table>

        `;

    }



    /* =====================================================
       RENDER DASHBOARD
    ===================================================== */

    function renderDashboard() {


        const allData =
            getAllData();


        const admissions =
            allData.filter(
                function (item) {

                    return item.type ===
                        "Admission";

                }
            );


        const contacts =
            allData.filter(
                function (item) {

                    return item.type ===
                        "Contact";

                }
            );


        const feedback =
            allData.filter(
                function (item) {

                    return item.type ===
                        "Feedback";

                }
            );



        /* ================================================
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
                contacts.length;

        }


        if (feedbackCount) {

            feedbackCount.textContent =
                feedback.length;

        }



        /* ================================================
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
                createTable(
                    allData,
                    8
                );

        }


        if (allSubmissionsTable) {

            allSubmissionsTable.innerHTML =
                createTable(
                    allData
                );

        }


        if (admissionsTable) {

            admissionsTable.innerHTML =
                createTable(
                    admissions
                );

        }


        if (contactsTable) {

            contactsTable.innerHTML =
                createTable(
                    contacts
                );

        }


        if (feedbackTable) {

            feedbackTable.innerHTML =
                createTable(
                    feedback
                );

        }

    }



    /* =====================================================
       SHOW DASHBOARD SECTION
    ===================================================== */

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
                ] || "Dashboard";

        }


        /* Mobile sidebar close */

        if (sidebar) {

            sidebar.classList.remove(
                "open"
            );

        }

    }



    /* =====================================================
       SIDEBAR NAVIGATION
    ===================================================== */

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



    /* =====================================================
       VIEW ALL BUTTON
    ===================================================== */

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



    /* =====================================================
       MOBILE SIDEBAR
    ===================================================== */

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



    /* =====================================================
       LOGOUT
    ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                sessionStorage.removeItem(
                    "mpiti_admin_logged_in"
                );


                window.location.href =
                    "admin-login.html";

            }
        );

    }



    /* =====================================================
       CLEAR FRONTEND DEMO DATA
    ===================================================== */

    if (clearDemoData) {

        clearDemoData.addEventListener(
            "click",
            function () {


                const confirmed =
                    window.confirm(
                        "Are you sure you want to clear frontend demo data?"
                    );


                if (!confirmed) {
                    return;
                }


                const keys = [

                    "siteSubmissions",

                    "contactSubmissions",

                    "admissionSubmissions",

                    "feedbackSubmissions"

                ];


                keys.forEach(
                    function (key) {

                        localStorage.removeItem(
                            key
                        );

                    }
                );


                renderDashboard();

            }
        );

    }



    /* =====================================================
       INITIALIZE
    ===================================================== */

    renderDashboard();


})();