/* ============================================================================
   EDUBIME EDUCATIONAL PORTAL — app.js
   Tab Switching, Language Switcher, Forms, & Data Controller
   (v3: 3-Tab Structure — Home / Admission / Teacher only)
   ============================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // ---- STATE MANAGEMENT ----
  let currentLang = "en"; // 'en' or 'bn'
  let currentTeacher = null;

  // ---- DOM ELEMENTS ----
  const views = document.querySelectorAll(".app-view");
  const tabButtons = document.querySelectorAll(".app-tab");
  const langBtn = document.getElementById("lang-toggle-btn");

  // ==========================================================================
  // 1. MAIN APP TAB NAVIGATION SYSTEM
  //    Handles the 3 views only: view-home, view-admission, view-teacher
  // ==========================================================================
  function switchTab(targetViewId) {
    // Hide all main views
    views.forEach(view => {
      view.hidden = true;
    });

    // Deactivate all tab buttons
    tabButtons.forEach(btn => {
      btn.classList.remove("is-active");
      btn.setAttribute("aria-selected", "false");
    });

    // Show target view
    const targetView = document.getElementById(targetViewId);
    if (targetView) {
      targetView.hidden = false;
    }

    // Activate matching navigation tab button
    const activeTab = document.querySelector(`[aria-controls="${targetViewId}"]`);
    if (activeTab) {
      activeTab.classList.add("is-active");
      activeTab.setAttribute("aria-selected", "true");
    }
  }

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetViewId = button.getAttribute("aria-controls");
      switchTab(targetViewId);
    });
  });

  // ==========================================================================
  // 2. BILINGUAL LANGUAGE SWITCHER (EN <-> BN)
  // ==========================================================================
  function updateLanguage(lang) {
    currentLang = lang;
    const elements = document.querySelectorAll("[data-en]");

    elements.forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = text;
        } else {
          el.textContent = text;
        }
      }
    });

    // Update active badge styling on header button
    const bnSpan = document.getElementById("lang-toggle-bn");
    const enSpan = document.getElementById("lang-toggle-en");

    if (bnSpan && enSpan) {
      bnSpan.classList.toggle("is-active", lang === "bn");
      enSpan.classList.toggle("is-active", lang === "en");
    }
    if (langBtn) {
      langBtn.setAttribute("data-current-lang", lang);
    }
  }

  if (langBtn) {
    langBtn.addEventListener("click", () => {
      const newLang = currentLang === "en" ? "bn" : "en";
      updateLanguage(newLang);
    });
  }

  // ==========================================================================
  // 3. HOME VIEW: PUBLIC NOTICES, SHOWCASE & SUB-TABS
  // ==========================================================================
  async function loadHomeData() {
    // 3A. Notices
    const noticeList = document.getElementById("public-notice-list");
    if (noticeList) {
      const notices = await window.EduDB.getNotices();
      if (notices && notices.length > 0) {
        noticeList.innerHTML = notices.map(n => `
          <li class="notice-item">
            <span class="notice-date">${n.date || '--/--/----'}</span>
            <span class="notice-text">${currentLang === 'bn' ? (n.textBn || n.textEn) : n.textEn}</span>
          </li>
        `).join("");
      }
    }

    // 3B. Student Showcase
    const showcaseGrid = document.getElementById("student-showcase-grid");
    const showcaseTemplate = document.getElementById("showcase-card-template");

    if (showcaseGrid && showcaseTemplate) {
      const showcaseItems = await window.EduDB.getStudentShowcase();
      if (showcaseItems && showcaseItems.length > 0) {
        showcaseGrid.innerHTML = "";
        showcaseItems.forEach(item => {
          const clone = showcaseTemplate.content.cloneNode(true);
          const img = clone.querySelector(".showcase-photo");
          const name = clone.querySelector(".showcase-name");
          const note = clone.querySelector(".showcase-note");

          if (img) { img.src = item.photoUrl || "https://via.placeholder.com/150"; img.alt = item.name || ""; }
          if (name) name.textContent = item.name || "";
          if (note) note.textContent = item.note || "";

          showcaseGrid.appendChild(clone);
        });
      }
    }

    // Class Routine & Exam Schedule Data
    const classRoutineBody = document.getElementById("public-class-routine-body");
    const examScheduleBody = document.getElementById("public-exam-schedule-body");

    if (classRoutineBody && window.EduDB.getClassRoutine) {
      const routines = await window.EduDB.getClassRoutine();
      if (routines && routines.length > 0) {
        classRoutineBody.innerHTML = routines.map(r => `
          <tr>
            <td>${r.time || ''}</td>
            <td>${currentLang === 'bn' ? (r.subjectBn || r.subjectEn) : r.subjectEn}</td>
            <td>${r.teacher || ''}</td>
          </tr>
        `).join("");
      }
    }

    if (examScheduleBody && window.EduDB.getExamSchedule) {
      const exams = await window.EduDB.getExamSchedule();
      if (exams && exams.length > 0) {
        examScheduleBody.innerHTML = exams.map(e => `
          <tr>
            <td>${e.date || ''}</td>
            <td>${currentLang === 'bn' ? (e.subjectBn || e.subjectEn) : e.subjectEn}</td>
            <td>${e.className || ''}</td>
          </tr>
        `).join("");
      }
    }
  }

  // 3C. Routine & Exam Schedule Sub-Tabs
  const routineTabClass = document.getElementById("routine-tab-class");
  const routineTabExam = document.getElementById("routine-tab-exam");
  const routinePanelClass = document.getElementById("routine-panel-class");
  const routinePanelExam = document.getElementById("routine-panel-exam");

  if (routineTabClass && routineTabExam) {
    routineTabClass.addEventListener("click", () => {
      routineTabClass.classList.add("is-active");
      routineTabClass.setAttribute("aria-selected", "true");
      routineTabExam.classList.remove("is-active");
      routineTabExam.setAttribute("aria-selected", "false");
      if (routinePanelClass) routinePanelClass.hidden = false;
      if (routinePanelExam) routinePanelExam.hidden = true;
    });

    routineTabExam.addEventListener("click", () => {
      routineTabExam.classList.add("is-active");
      routineTabExam.setAttribute("aria-selected", "true");
      routineTabClass.classList.remove("is-active");
      routineTabClass.setAttribute("aria-selected", "false");
      if (routinePanelExam) routinePanelExam.hidden = false;
      if (routinePanelClass) routinePanelClass.hidden = true;
    });
  }

  // ==========================================================================
  // 4. ADMISSION FORM SYSTEM
  // ==========================================================================
  const admissionForm = document.getElementById("admission-form");
  const admissionStatus = document.getElementById("admission-form-status");

  if (admissionForm) {
    admissionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (admissionStatus) {
        admissionStatus.textContent = currentLang === "bn" ? "আবেদন জমা হচ্ছে..." : "Submitting application...";
      }

      const formData = {
        studentName: document.getElementById("admission-student-name")?.value || "",
        studentClass: document.getElementById("admission-class")?.value || "",
        rollTarget: document.getElementById("admission-roll-target")?.value || "",
        preferredSubjects: document.getElementById("admission-subjects")?.value || "",
        parentName: document.getElementById("admission-parent-name")?.value || "",
        mobile: document.getElementById("admission-mobile")?.value || "",
        address: document.getElementById("admission-address")?.value || "",
        occupation: document.getElementById("admission-occupation")?.value || "",
        freeTime: document.getElementById("admission-free-time")?.value || "",
        preferredTeacher: document.getElementById("admission-preferred-teacher")?.value || ""
      };

      const res = await window.EduDB.submitAdmission(formData);
      if (res.success) {
        if (admissionStatus) {
          admissionStatus.textContent = currentLang === "bn" ? "আবেদন সফলভাবে জমা হয়েছে!" : "Application submitted successfully!";
        }
        admissionForm.reset();
      } else {
        if (admissionStatus) admissionStatus.textContent = res.message;
      }
    });
  }

  // ==========================================================================
  // 5. TEACHER PORTAL
  // ==========================================================================
  const teacherLoginForm = document.getElementById("teacher-login-form");
  const teacherLoginStatus = document.getElementById("teacher-login-status");
  const teacherLogoutBtn = document.getElementById("teacher-logout-btn");

  if (teacherLoginForm) {
    teacherLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const code = document.getElementById("teacher-code")?.value || "";
      const pass = document.getElementById("teacher-password")?.value || "";

      if (teacherLoginStatus) {
        teacherLoginStatus.textContent = currentLang === "bn" ? "যাচাই করা হচ্ছে..." : "Logging in...";
      }

      const res = await window.EduDB.teacherLogin(code, pass);
      if (res.success) {
        if (teacherLoginStatus) teacherLoginStatus.textContent = "";
        currentTeacher = res.teacher;

        document.getElementById("teacher-login-section").hidden = true;
        document.getElementById("teacher-dashboard-section").hidden = false;
        document.getElementById("teacher-dashboard-name").textContent = currentTeacher.name || code;

        // Populate Assigned Classes Select
        const classSelect = document.getElementById("teacher-class-select");
        if (classSelect && currentTeacher.assignedClasses) {
          classSelect.innerHTML = currentTeacher.assignedClasses.map(c => `<option value="${c}">${c}</option>`).join("");
          loadTeacherStudents(classSelect.value);

          classSelect.addEventListener("change", (e) => {
            loadTeacherStudents(e.target.value);
          });
        }

      } else {
        if (teacherLoginStatus) teacherLoginStatus.textContent = res.message;
      }
    });
  }

  if (teacherLogoutBtn) {
    teacherLogoutBtn.addEventListener("click", () => {
      currentTeacher = null;
      document.getElementById("teacher-login-section").hidden = false;
      document.getElementById("teacher-dashboard-section").hidden = true;
      if (teacherLoginForm) teacherLoginForm.reset();
    });
  }

  async function loadTeacherStudents(className) {
    const studentList = document.getElementById("teacher-student-list");
    const template = document.getElementById("teacher-student-row-template");
    if (!studentList || !template || !className) return;

    studentList.innerHTML = "";
    const students = await window.EduDB.getAssignedStudents(className);

    students.forEach(s => {
      const clone = template.content.cloneNode(true);
      const photo = clone.querySelector(".student-row-photo");
      const name = clone.querySelector(".student-row-name");
      const adviceInput = clone.querySelector(".student-row-advice-input");
      const saveBtn = clone.querySelector(".student-row-save-btn");
      const toggleBtns = clone.querySelectorAll(".attendance-toggle-btn");

      if (photo) photo.src = s.photoUrl || "https://via.placeholder.com/44";
      if (name) name.textContent = s.name || "Student";
      if (adviceInput) adviceInput.value = s.teacherAdvice || "";

      let selectedStatus = s.attendanceStatus || "present";
      toggleBtns.forEach(btn => {
        if (btn.getAttribute("data-status") === selectedStatus) {
          btn.classList.add("is-active");
          btn.setAttribute("aria-pressed", "true");
        }
        btn.addEventListener("click", () => {
          toggleBtns.forEach(b => { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
          btn.classList.add("is-active");
          btn.setAttribute("aria-pressed", "true");
          selectedStatus = btn.getAttribute("data-status");
        });
      });

      if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
          const advice = adviceInput ? adviceInput.value : "";
          saveBtn.textContent = currentLang === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving...";
          await window.EduDB.updateStudentAdvice(s.id, selectedStatus, advice);
          saveBtn.textContent = currentLang === "bn" ? "সংরক্ষিত!" : "Saved!";
          setTimeout(() => { saveBtn.textContent = currentLang === "bn" ? "সংরক্ষণ করুন" : "Save"; }, 1500);
        });
      }

      studentList.appendChild(clone);
    });
  }

  // Initial load
  switchTab("view-home");
  loadHomeData();
});
