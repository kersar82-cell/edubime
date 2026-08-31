/* ============================================================================
   EDUBIME EDUCATIONAL PORTAL — app.js
   Tab Switching, Language Switcher, Modals, Forms, & Data Controller
   ============================================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // ---- STATE MANAGEMENT ----
  let currentLang = "en"; // 'en' or 'bn'
  let hasVotedThisSession = false;
  let currentTeacher = null;

  // ---- DOM ELEMENTS ----
  const views = document.querySelectorAll(".app-view");
  const tabButtons = document.querySelectorAll(".app-tab");
  const langBtn = document.getElementById("lang-toggle-btn");

  // ==========================================================================
  // 1. MAIN APP TAB NAVIGATION SYSTEM
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

    // Trigger Parent Weekly Vote Modal if entering Parent Portal for the first time
    if (targetViewId === "view-parent" && !hasVotedThisSession) {
      openParentVoteModal();
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
  // 4. PARENT PORTAL: WEEKLY VOTE MODAL & SEARCH
  // ==========================================================================
  const parentModal = document.getElementById("parent-voting-modal");
  const parentVoteForm = document.getElementById("parent-weekly-vote-form");

  function openParentVoteModal() {
    if (parentModal) parentModal.hidden = false;
  }

  function closeParentVoteModal() {
    if (parentModal) parentModal.hidden = true;
  }

  if (parentVoteForm) {
    parentVoteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const selectedOption = parentVoteForm.querySelector('input[name="weeklyVote"]:checked');
      const statusEl = document.getElementById("parent-vote-status");

      if (!selectedOption) return;

      if (statusEl) statusEl.textContent = currentLang === "bn" ? "ভোট জমা হচ্ছে..." : "Submitting vote...";
      const result = await window.EduDB.submitParentVote(selectedOption.value);

      if (result.success) {
        hasVotedThisSession = true;
        if (statusEl) statusEl.textContent = "";
        closeParentVoteModal();
      } else {
        if (statusEl) statusEl.textContent = currentLang === "bn" ? "ভোট জমা হতে সমস্যা হয়েছে।" : "Failed to submit vote.";
      }
    });
  }

  // Parent Student Search
  const parentSearchBtn = document.getElementById("parent-search-btn");
  const parentSearchInput = document.getElementById("parent-search-input");
  const parentResultCard = document.getElementById("parent-result-card");
  const parentSearchStatus = document.getElementById("parent-search-status");

  if (parentSearchBtn) {
    parentSearchBtn.addEventListener("click", async () => {
      const code = parentSearchInput ? parentSearchInput.value : "";
      if (!code) return;

      if (parentSearchStatus) {
        parentSearchStatus.textContent = currentLang === "bn" ? "অনুসন্ধান করা হচ্ছে..." : "Searching...";
      }
      if (parentResultCard) parentResultCard.hidden = true;

      const res = await window.EduDB.searchStudent(code);
      if (res.success) {
        if (parentSearchStatus) parentSearchStatus.textContent = "";
        
        document.getElementById("parent-result-name").textContent = res.data.name || "Student";
        document.getElementById("parent-result-photo").src = res.data.photoUrl || "https://via.placeholder.com/84";
        document.getElementById("parent-result-attendance").textContent = res.data.attendance || "0";
        document.getElementById("parent-result-marks").textContent = res.data.marks || "N/A";
        document.getElementById("parent-result-advice-text").textContent = res.data.teacherAdvice || (currentLang === "bn" ? "কোন পরামর্শ নেই।" : "No advice provided yet.");

        const fill = document.getElementById("parent-result-progress-fill");
        if (fill) fill.style.width = `${res.data.attendance || 0}%`;

        if (parentResultCard) parentResultCard.hidden = false;
      } else {
        if (parentSearchStatus) parentSearchStatus.textContent = res.message;
      }
    });
  }

  // ==========================================================================
  // 5. ADMISSION FORM SYSTEM
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
          admissionStatus.textContent = currentLang === "bn" ? "আবেদন সফলভাবে জমা হয়েছে!" : "Application submitted successfully!";
        }
        admissionForm.reset();
      } else {
        if (admissionStatus) admissionStatus.textContent = res.message;
      }
    });
  }

  // ==========================================================================
  // 6. TEACHER PORTAL
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

  // ==========================================================================
  // 7. OWNER PORTAL
  // ==========================================================================
  const ownerForm = document.getElementById("owner-passcode-form");
  const ownerStatus = document.getElementById("owner-passcode-status");

  if (ownerForm) {
    ownerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const pass = document.getElementById("owner-passcode-input")?.value || "";

      if (ownerStatus) ownerStatus.textContent = currentLang === "bn" ? "আনলক করা হচ্ছে..." : "Unlocking...";
      const res = await window.EduDB.ownerLogin(pass);

      if (res.success) {
        if (ownerStatus) ownerStatus.textContent = "";
        document.getElementById("owner-login-section").hidden = true;
        document.getElementById("owner-dashboard-section").hidden = false;
        loadOwnerInbox();
        loadOwnerVoteStats();
      } else {
        if (ownerStatus) ownerStatus.textContent = res.message;
      }
    });
  }

  // Owner Dashboard Sub-Tabs
  const ownerSubTabs = [
    { btn: "owner-tab-notices", panel: "owner-notice-form-panel" },
    { btn: "owner-tab-assignments", panel: "owner-teacher-assign-form-panel" },
    { btn: "owner-tab-inbox", panel: "owner-admission-inbox" },
    { btn: "owner-tab-votes", panel: "owner-voting-stats" }
  ];

  ownerSubTabs.forEach(tab => {
    const btnEl = document.getElementById(tab.btn);
    if (btnEl) {
      btnEl.addEventListener("click", () => {
        ownerSubTabs.forEach(t => {
          const b = document.getElementById(t.btn);
          const p = document.getElementById(t.panel);
          if (b) { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); }
          if (p) p.hidden = true;
        });
        btnEl.classList.add("is-active");
        btnEl.setAttribute("aria-selected", "true");
        const activePanel = document.getElementById(tab.panel);
        if (activePanel) activePanel.hidden = false;
      });
    }
  });

  // Owner: Notice Publish Form
  const ownerNoticeForm = document.getElementById("owner-notice-form");
  if (ownerNoticeForm) {
    ownerNoticeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const textEn = document.getElementById("owner-notice-text-en")?.value || "";
      const textBn = document.getElementById("owner-notice-text-bn")?.value || "";

      const res = await window.EduDB.publishNotice(textEn, textBn);
      if (res.success) {
        ownerNoticeForm.reset();
        loadHomeData(); // Refresh public notices
      }
    });
  }

  // Owner: Inbox & Votes Loader
  async function loadOwnerInbox() {
    const inboxList = document.getElementById("owner-admission-inbox-list");
    if (!inboxList) return;

    const items = await window.EduDB.getAdmissionsInbox();
    if (items && items.length > 0) {
      inboxList.innerHTML = items.map(i => `
        <li class="manage-item" style="padding:10px; border-bottom:1px solid #eee;">
          <strong>${i.studentName}</strong> (Class: ${i.studentClass})<br/>
          <small>Parent: ${i.parentName} | Mobile: ${i.mobile}</small>
        </li>
      `).join("");
    } else {
      inboxList.innerHTML = `<li style="font-size:13px; color:#888;">No submissions yet.</li>`;
    }
  }

  async function loadOwnerVoteStats() {
    const totalsContainer = document.getElementById("owner-vote-totals");
    if (!totalsContainer) return;

    const stats = await window.EduDB.getVoteStats();
    totalsContainer.innerHTML = Object.keys(stats).map(k => `
      <div class="stat-box" style="padding:10px; background:#f8f9fa; border-radius:8px; text-align:center;">
        <span style="font-size:12px; color:#666;">${k}</span><br/>
        <strong style="font-size:18px; color:#1B2A4A;">${stats[k]} Votes</strong>
      </div>
    `).join("");
  }

  // Initial load
  switchTab("view-home");
  loadHomeData();
});
