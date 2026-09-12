/* =====================================================
   STUDYFLOW V2
   JavaScript
===================================================== */


/* ================= DATA ================= */

let tasks =
    JSON.parse(localStorage.getItem("studyflow_tasks")) || [];

let schedules =
    JSON.parse(localStorage.getItem("studyflow_schedules")) || [];

let profile =
    JSON.parse(localStorage.getItem("studyflow_profile")) || {
        name: "Student",
        className: "",
        school: ""
    };

let goal =
    JSON.parse(localStorage.getItem("studyflow_goal")) || {
        target: 2,
        current: 0
    };


/* ================= SAVE DATA ================= */

function saveAll() {

    localStorage.setItem(
        "studyflow_tasks",
        JSON.stringify(tasks)
    );

    localStorage.setItem(
        "studyflow_schedules",
        JSON.stringify(schedules)
    );

    localStorage.setItem(
        "studyflow_profile",
        JSON.stringify(profile)
    );

    localStorage.setItem(
        "studyflow_goal",
        JSON.stringify(goal)
    );
}


/* ================= HELPER ================= */

function todayString() {

    const date = new Date();

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(dateString) {

    if (!dateString) return "-";

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text || "";

    return div.innerHTML;
}


/* ================= DATE TOPBAR ================= */

function showTodayDate() {

    const element =
        document.getElementById("todayDate");

    const date = new Date();

    element.textContent =
        date.toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
}


/* ================= PROFILE ================= */

function renderProfile() {

    const name =
        profile.name || "Student";

    document.getElementById(
        "welcomeName"
    ).textContent = name;

    document.getElementById(
        "topName"
    ).textContent = name;

    document.getElementById(
        "sidebarName"
    ).textContent = name;

    document.getElementById(
        "profileName"
    ).textContent = name;

    document.getElementById(
        "studentName"
    ).value = profile.name || "";

    document.getElementById(
        "studentClass"
    ).value = profile.className || "";

    document.getElementById(
        "studentSchool"
    ).value = profile.school || "";
}


document
    .getElementById("saveProfile")
    .addEventListener("click", function () {

        profile.name =
            document.getElementById(
                "studentName"
            ).value.trim() || "Student";

        profile.className =
            document.getElementById(
                "studentClass"
            ).value.trim();

        profile.school =
            document.getElementById(
                "studentSchool"
            ).value.trim();

        saveAll();

        renderProfile();

        showToast(
            "Profil berhasil disimpan!"
        );
    });


/* ================= NAVIGATION ================= */

const navItems =
    document.querySelectorAll(
        "[data-page]"
    );

const pages =
    document.querySelectorAll(
        ".page"
    );


navItems.forEach(function (item) {

    item.addEventListener(
        "click",
        function () {

            const pageName =
                item.dataset.page;

            pages.forEach(function (page) {

                page.classList.remove(
                    "active"
                );

            });

            const target =
                document.getElementById(
                    pageName
                );

            if (target) {

                target.classList.add(
                    "active"
                );

            }


            document
                .querySelectorAll(
                    ".nav-item"
                )
                .forEach(function (nav) {

                    nav.classList.remove(
                        "active"
                    );

                });


            document
                .querySelectorAll(
                    `.nav-item[data-page="${pageName}"]`
                )
                .forEach(function (nav) {

                    nav.classList.add(
                        "active"
                    );

                });


            if (pageName === "calendar") {
                renderCalendar();
            }

            if (pageName === "tasks") {
                renderTasks();
            }

            if (pageName === "schedule") {
                renderSchedules();
            }

            if (pageName === "statistics") {
                updateStatistics();
            }

        }
    );

});


/* ================= DARK MODE ================= */

const darkModeButton =
    document.getElementById(
        "darkModeButton"
    );


function loadDarkMode() {

    const dark =
        localStorage.getItem(
            "studyflow_dark"
        );

    if (dark === "true") {

        document.body.classList.add(
            "dark"
        );

    }

}


darkModeButton.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark"
        );

        localStorage.setItem(
            "studyflow_dark",
            document.body.classList.contains(
                "dark"
            )
        );

    }
);


/* ================= TASK STATUS ================= */

function getDeadlineStatus(dateString) {

    const today =
        new Date(todayString());

    const deadline =
        new Date(dateString + "T00:00:00");

    const difference =
        Math.ceil(
            (
                deadline - today
            ) /
            (1000 * 60 * 60 * 24)
        );


    if (difference < 0) {

        return {
            type: "red",
            text: "Terlambat"
        };

    }

    if (difference === 0) {

        return {
            type: "red",
            text: "Hari ini"
        };

    }

    if (difference <= 2) {

        return {
            type: "yellow",
            text: `${difference} hari lagi`
        };

    }

    return {
        type: "green",
        text: `${difference} hari lagi`
    };

}


/* ================= TASK RENDER ================= */

function renderTasks() {

    const container =
        document.getElementById(
            "taskList"
        );

    const search =
        document
            .getElementById(
                "searchTask"
            )
            .value
            .toLowerCase();

    const filter =
        document
            .getElementById(
                "filterTask"
            )
            .value;


    let filtered =
        tasks.filter(function (task) {

            const matchSearch =
                task.title
                    .toLowerCase()
                    .includes(search) ||
                task.subject
                    .toLowerCase()
                    .includes(search);


            if (!matchSearch) {
                return false;
            }


            if (filter === "pending") {
                return !task.completed;
            }

            if (filter === "completed") {
                return task.completed;
            }

            if (filter === "high") {
                return task.priority === "high";
            }

            if (filter === "overdue") {

                return (
                    !task.completed &&
                    getDeadlineStatus(
                        task.date
                    ).type === "red"
                );

            }

            return true;

        });


    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="card" style="grid-column:1/-1;text-align:center;">
                <h3>Tidak ada tugas</h3>
                <p style="color:var(--muted);margin-top:7px;">
                    Belum ada tugas yang sesuai.
                </p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        filtered
            .sort(
                (a, b) =>
                    a.date.localeCompare(b.date)
            )
            .map(createTaskCard)
            .join("");

}


function createTaskCard(task) {

    const status =
        getDeadlineStatus(
            task.date
        );

    let priorityText = "Rendah";

    if (task.priority === "medium") {
        priorityText = "Sedang";
    }

    if (task.priority === "high") {
        priorityText = "Tinggi";
    }


    return `
        <div class="task-card ${task.completed ? "completed" : ""}">

            <div class="task-top">

                <div>

                    <span class="task-subject">
                        ${escapeHTML(task.subject)}
                    </span>

                    <h3>
                        ${escapeHTML(task.title)}
                    </h3>

                </div>

                <span class="priority priority-${task.priority}">
                    ${priorityText}
                </span>

            </div>

            <p>
                ${escapeHTML(
                    task.description || "Tidak ada keterangan."
                )}
            </p>

            <div class="task-footer">

                <div class="task-date">

                    <span
                        style="
                        color:${
                            status.type === "red"
                                ? "var(--red)"
                                : status.type === "yellow"
                                ? "#bd7c00"
                                : "var(--green)"
                        };
                        font-weight:600;
                        "
                    >
                        ${status.text}
                    </span>

                    • ${formatDate(task.date)}

                </div>

                <div class="task-actions">

                    <button
                        class="complete-btn"
                        onclick="toggleTask(${task.id})">

                        ${task.completed
                            ? "↩ Batal"
                            : "✓ Selesai"}

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteTask(${task.id})">

                        🗑

                    </button>

                </div>

            </div>

        </div>
    `;

}


/* ================= ADD TASK ================= */

const taskModal =
    document.getElementById(
        "taskModal"
    );


document
    .getElementById("openTaskModal")
    .addEventListener(
        "click",
        function () {

            taskModal.classList.add(
                "show"
            );

        }
    );


function closeTaskModal() {

    taskModal.classList.remove(
        "show"
    );

    document
        .getElementById("taskForm")
        .reset();

}


document
    .getElementById("closeTaskModal")
    .addEventListener(
        "click",
        closeTaskModal
    );


document
    .getElementById("cancelTask")
    .addEventListener(
        "click",
        closeTaskModal
    );


document
    .getElementById("taskForm")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const newTask = {

                id: Date.now(),

                title:
                    document
                        .getElementById(
                            "taskTitle"
                        )
                        .value
                        .trim(),

                subject:
                    document
                        .getElementById(
                            "taskSubject"
                        )
                        .value
                        .trim(),

                date:
                    document
                        .getElementById(
                            "taskDate"
                        )
                        .value,

                priority:
                    document
                        .getElementById(
                            "taskPriority"
                        )
                        .value,

                description:
                    document
                        .getElementById(
                            "taskDescription"
                        )
                        .value
                        .trim(),

                completed: false

            };


            tasks.push(newTask);

            saveAll();

            closeTaskModal();

            updateEverything();

            showToast(
                "Tugas berhasil ditambahkan!"
            );

        }
    );


/* ================= TASK ACTION ================= */

function toggleTask(id) {

    tasks =
        tasks.map(function (task) {

            if (task.id === id) {

                return {
                    ...task,
                    completed: !task.completed
                };

            }

            return task;

        });


    saveAll();

    updateEverything();

}


function deleteTask(id) {

    const confirmDelete =
        confirm(
            "Hapus tugas ini?"
        );

    if (!confirmDelete) {
        return;
    }


    tasks =
        tasks.filter(function (task) {

            return task.id !== id;

        });


    saveAll();

    updateEverything();

    showToast(
        "Tugas berhasil dihapus!"
    );

}


/* ================= DASHBOARD DEADLINES ================= */

function renderDeadlines() {

    const container =
        document.getElementById(
            "deadlineList"
        );


    const list =
        tasks
            .filter(
                task => !task.completed
            )
            .sort(
                (a, b) =>
                    a.date.localeCompare(b.date)
            )
            .slice(0, 5);


    if (list.length === 0) {

        container.innerHTML = `
            <div style="
                text-align:center;
                padding:25px;
                color:var(--muted);
                font-size:11px;
            ">
                🎉 Semua tugas selesai!
            </div>
        `;

        return;
    }


    container.innerHTML =
        list
            .map(function (task) {

                const status =
                    getDeadlineStatus(
                        task.date
                    );

                return `
                    <div class="deadline-item">

                        <div class="deadline-indicator deadline-${status.type}">
                        </div>

                        <div class="deadline-info">

                            <strong>
                                ${escapeHTML(task.title)}
                            </strong>

                            <small>
                                ${escapeHTML(task.subject)}
                                •
                                ${formatDate(task.date)}
                            </small>

                        </div>

                        <span
                            class="deadline-status"
                            style="color:${
                                status.type === "red"
                                    ? "var(--red)"
                                    : status.type === "yellow"
                                    ? "#bd7c00"
                                    : "var(--green)"
                            }"
                        >
                            ${status.text}
                        </span>

                    </div>
                `;

            })
            .join("");

}


/* ================= STATISTICS ================= */

function updateStatistics() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;

    const progress =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    document.getElementById(
        "statTotal"
    ).textContent = total;

    document.getElementById(
        "statCompleted"
    ).textContent = completed;

    document.getElementById(
        "statProgress"
    ).textContent =
        progress + "%";

    document.getElementById(
        "statProgressBar"
    ).style.width =
        progress + "%";

}


/* ================= DASHBOARD STATS ================= */

function updateDashboardStats() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;

    const pending =
        total - completed;

    const progress =
        total === 0
            ? 0
            : Math.round(
                completed / total * 100
            );


    document.getElementById(
        "totalTasks"
    ).textContent = total;

    document.getElementById(
        "pendingTasks"
    ).textContent = pending;

    document.getElementById(
        "completedTasks"
    ).textContent = completed;

    document.getElementById(
        "dashboardProgress"
    ).textContent =
        progress + "%";


    document.getElementById(
        "goalPercent"
    ).textContent =
        calculateGoalPercent() + "%";

    document.getElementById(
        "todayGoal"
    ).textContent =
        calculateGoalPercent() + "%";

}


/* ================= GOAL ================= */

function calculateGoalPercent() {

    if (goal.target <= 0) {
        return 0;
    }

    return Math.min(
        100,
        Math.round(
            goal.current /
            goal.target *
            100
        )
    );

}


function updateGoalDisplay() {

    const percent =
        calculateGoalPercent();


    document.getElementById(
        "goalPercent"
    ).textContent =
        percent + "%";

    document.getElementById(
        "bigGoalPercent"
    ).textContent =
        percent + "%";

    document.getElementById(
        "todayGoal"
    ).textContent =
        percent + "%";


    document.getElementById(
        "goalHours"
    ).textContent =
        `${goal.current} / ${goal.target} jam`;

    document.getElementById(
        "bigGoalText"
    ).textContent =
        `${goal.current} / ${goal.target} jam`;

}


document
    .getElementById("goalForm")
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            goal.target =
                Number(
                    document.getElementById(
                        "goalTarget"
                    ).value
                );

            goal.current =
                Number(
                    document.getElementById(
                        "goalCurrent"
                    ).value
                );


            saveAll();

            updateGoalDisplay();

            showToast(
                "Target belajar disimpan!"
            );

        }
    );


/* ================= SCHEDULE ================= */

function renderSchedules() {

    const container =
        document.getElementById(
            "scheduleList"
        );


    const days = [
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu"
    ];


    container.innerHTML =
        days.map(function (day) {

            const daySchedules =
                schedules
                    .filter(
                        item =>
                            item.day === day
                    )
                    .sort(
                        (a, b) =>
                            a.time.localeCompare(
                                b.time
                            )
                    );


            return `
                <div class="schedule-card">

                    <div class="schedule-day-title">
                        ${day}
                    </div>

                    ${
                        daySchedules.length === 0
                            ? `
                                <p style="
                                    color:var(--muted);
                                    font-size:10px;
                                ">
                                    Belum ada jadwal.
                                </p>
                              `
                            :
                            daySchedules
                                .map(
                                    item => `
                                        <div class="schedule-item">

                                            <div>

                                                <strong>
                                                    ${escapeHTML(item.subject)}
                                                </strong>

                                                <small>
                                                    ${item.time}
                                                    •
                                                    ${escapeHTML(
                                                        item.room ||
                                                        "Ruangan belum diisi"
                                                    )}
                                                </small>

                                            </div>

                                            <button
                                                class="schedule-delete"
                                                onclick="deleteSchedule(${item.id})">

                                                ×

                                            </button>

                                        </div>
                                    `
                                )
                                .join("")
                    }

                </div>
            `;

        })
        .join("");


    renderTodaySchedule();

}


function renderTodaySchedule() {

    const container =
        document.getElementById(
            "todaySchedule"
        );


    const dayNames = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu"
    ];


    const today =
        dayNames[
            new Date().getDay()
        ];


    const todayItems =
        schedules
            .filter(
                item =>
                    item.day === today
            )
            .sort(
                (a, b) =>
                    a.time.localeCompare(
                        b.time
                    )
            );


    if (todayItems.length === 0) {

        container.innerHTML = `
            <div style="
                text-align:center;
                color:var(--muted);
                padding:25px;
                font-size:11px;
            ">
                Tidak ada jadwal hari ini.
            </div>
        `;

        return;

    }


    container.innerHTML =
        todayItems
            .map(
                item => `
                    <div class="schedule-today">

                        <div class="schedule-time">
                            ${item.time}
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(item.subject)}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    item.room || "Ruangan"
                                )}
                            </small>

                        </div>

                    </div>
                `
            )
            .join("");

}


/* ================= ADD SCHEDULE ================= */

const scheduleModal =
    document.getElementById(
        "scheduleModal"
    );


document
    .getElementById("openScheduleModal")
    .addEventListener(
        "click",
        function () {

            scheduleModal.classList.add(
                "show"
            );

        }
    );


function closeScheduleModal() {

    scheduleModal.classList.remove(
        "show"
    );

    document
        .getElementById(
            "scheduleForm"
        )
        .reset();

}


document
    .getElementById(
        "closeScheduleModal"
    )
    .addEventListener(
        "click",
        closeScheduleModal
    );


document
    .getElementById(
        "cancelSchedule"
    )
    .addEventListener(
        "click",
        closeScheduleModal
    );


document
    .getElementById(
        "scheduleForm"
    )
    .addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            schedules.push({

                id: Date.now(),

                subject:
                    document
                        .getElementById(
                            "scheduleSubject"
                        )
                        .value
                        .trim(),

                day:
                    document
                        .getElementById(
                            "scheduleDay"
                        )
                        .value,

                time:
                    document
                        .getElementById(
                            "scheduleTime"
                        )
                        .value,

                room:
                    document
                        .getElementById(
                            "scheduleRoom"
                        )
                        .value
                        .trim()

            });


            saveAll();

            closeScheduleModal();

            renderSchedules();

            showToast(
                "Jadwal berhasil ditambahkan!"
            );

        }
    );


function deleteSchedule(id) {

    schedules =
        schedules.filter(
            item =>
                item.id !== id
        );


    saveAll();

    renderSchedules();

    showToast(
        "Jadwal berhasil dihapus!"
    );

}


/* ================= CALENDAR ================= */

let calendarDate =
    new Date();


function renderCalendar() {

    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();


    const monthName =
        calendarDate.toLocaleDateString(
            "id-ID",
            {
                month: "long",
                year: "numeric"
            }
        );


    document.getElementById(
        "calendarTitle"
    ).textContent =
        monthName;


    const grid =
        document.getElementById(
            "calendarGrid"
        );


    grid.innerHTML = "";


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "calendar-day empty";

        grid.appendChild(empty);

    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const cell =
            document.createElement(
                "div"
            );

        cell.className =
            "calendar-day";


        const date =
            new Date(
                year,
                month,
                day
            );


        const dateString =
            `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;


        if (
            dateString === todayString()
        ) {

            cell.classList.add(
                "today"
            );

        }


        const dayTasks =
            tasks.filter(
                task =>
                    task.date === dateString
            );


        if (dayTasks.length > 0) {

            cell.classList.add(
                "has-task"
            );

        }


        cell.innerHTML = `
            <strong>
                ${day}
            </strong>
        `;


        dayTasks
            .slice(0, 2)
            .forEach(
                task => {

                    const taskElement =
                        document.createElement(
                            "div"
                        );

                    taskElement.className =
                        "calendar-task";

                    taskElement.textContent =
                        task.title;

                    cell.appendChild(
                        taskElement
                    );

                }
            );


        grid.appendChild(cell);

    }

}


document
    .getElementById("prevMonth")
    .addEventListener(
        "click",
        function () {

            calendarDate.setMonth(
                calendarDate.getMonth() - 1
            );

            renderCalendar();

        }
    );


document
    .getElementById("nextMonth")
    .addEventListener(
        "click",
        function () {

            calendarDate.setMonth(
                calendarDate.getMonth() + 1
            );

            renderCalendar();

        }
    );


/* ================= SEARCH ================= */

document
    .getElementById("searchTask")
    .addEventListener(
        "input",
        renderTasks
    );


document
    .getElementById("filterTask")
    .addEventListener(
        "change",
        renderTasks
    );


/* ================= TOAST ================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* ================= UPDATE ALL ================= */

function updateEverything() {

    updateDashboardStats();

    updateGoalDisplay();

    updateStatistics();

    renderTasks();

    renderDeadlines();

    renderSchedules();

    renderCalendar();

}


/* ================= DEFAULT DATA ================= */

function createDefaultData() {

    if (tasks.length === 0) {

        const tomorrow =
            new Date();

        tomorrow.setDate(
            tomorrow.getDate() + 1
        );


        const date =
            `${tomorrow.getFullYear()}-${String(
                tomorrow.getMonth() + 1
            ).padStart(2, "0")}-${String(
                tomorrow.getDate()
            ).padStart(2, "0")}`;


        tasks = [

            {
                id: Date.now(),

                title:
                    "Mengerjakan tugas matematika",

                subject:
                    "Matematika",

                date: date,

                priority:
                    "high",

                description:
                    "Menyelesaikan latihan soal.",

                completed:
                    false
            }

        ];

        saveAll();

    }

}


/* ================= CLOSE MODAL OUTSIDE ================= */

window.addEventListener(
    "click",
    function (event) {

        if (
            event.target === taskModal
        ) {

            closeTaskModal();

        }

        if (
            event.target === scheduleModal
        ) {

            closeScheduleModal();

        }

    }
);


/* ================= ESC KEY ================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeTaskModal();

            closeScheduleModal();

        }

    }
);


/* ================= START APP ================= */

showTodayDate();

loadDarkMode();

createDefaultData();

renderProfile();

updateEverything();