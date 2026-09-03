/* ============================================
   EDUBEMI — APP NAVIGATION CONTROLLER
   js/app.js
   ============================================ */

(function () {
  'use strict';

  /* ---------- ROUTE MAP ---------- */
  /* Maps data-nav keys to their corresponding page files. */
  const routeMap = {
    'home': '../index.html',
    'courses': 'courses.html',
    'student-portal': 'student-portal.html',
    'teacher-portal': 'teacher-portal.html',
    'messages': 'messages.html',
    'profile': 'profile.html'
  };

  /* ---------- CURRENT PAGE DETECTION ---------- */
  function getCurrentPageKey() {
    const path = window.location.pathname;
    const fileName = path.substring(path.lastIndexOf('/') + 1);

    if (fileName === '' || fileName === 'index.html') {
      return 'home';
    }

    const match = fileName.replace('.html', '');
    return match || 'home';
  }

  /* ---------- BOTTOM NAV ACTIVE STATE ---------- */
  function setActiveNavItem() {
    const currentKey = getCurrentPageKey();
    const navItems = document.querySelectorAll('.bottom-nav__item[data-nav]');

    navItems.forEach((item) => {
      const key = item.getAttribute('data-nav');
      if (key === currentKey) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });
  }

  /* ---------- PAGE ROUTING ---------- */
  function handleNavClick(e) {
    const navTarget = e.target.closest('[data-nav]');
    if (!navTarget) return;

    const key = navTarget.getAttribute('data-nav');

    /* Only intercept known bottom-nav routes; let other data-nav
       elements (modals, edit buttons, etc.) be handled by their
       own dedicated modules. */
    if (!routeMap.hasOwnProperty(key)) return;
    if (!navTarget.classList.contains('bottom-nav__item')) return;

    e.preventDefault();

    const destination = routeMap[key];
    if (destination) {
      window.location.href = destination;
    }
  }

  /* ---------- HEADER BACK BUTTON SUPPORT ---------- */
  function handleBackNavigation() {
    const backBtn = document.querySelector('[data-nav="back"]');
    if (!backBtn) return;

    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.back();
    });
  }

  /* ---------- INIT ---------- */
  function init() {
    setActiveNavItem();
    handleBackNavigation();
    document.addEventListener('click', handleNavClick);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
