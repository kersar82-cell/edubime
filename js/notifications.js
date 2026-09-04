/* ============================================
   EDUBEMI — NOTIFICATIONS MODULE
   js/notifications.js
   ============================================ */

(function () {
  'use strict';

  /* ---------- DEMO NOTIFICATION DATA ---------- */
  /* ---------- DEMO NOTIFICATION DATA ---------- */
  const assetPrefix = window.location.pathname.includes('/pages/') ? '../assets/' : 'assets/';

  const demoNotifications = [
    {
      id: 'ntf-001',
      type: 'attendance',
      title: 'উপস্থিতি আপডেট',
      message: 'আপনার সন্তানের আজকের উপস্থিতি নিশ্চিত করা হয়েছে।',
      time: '১০ মিনিট আগে',
      isRead: false,
      icon: assetPrefix + 'icons/check-circle.svg'
    },
    {
      id: 'ntf-002',
      type: 'result',
      title: 'নতুন ফলাফল প্রকাশিত',
      message: 'গণিত বিষয়ের সাপ্তাহিক মূল্যায়ন ফলাফল প্রকাশ করা হয়েছে।',
      time: '১ ঘণ্টা আগে',
      isRead: false,
      icon: assetPrefix + 'icons/result.svg'
    },
    {
      id: 'ntf-003',
      type: 'message',
      title: 'নতুন বার্তা',
      message: 'শ্রেণি শিক্ষক আপনাকে একটি বার্তা পাঠিয়েছেন।',
      time: '৩ ঘণ্টা আগে',
      isRead: false,
      icon: assetPrefix + 'icons/chat.svg'
    },
    {
      id: 'ntf-004',
      type: 'event',
      title: 'অভিভাবক সভা',
      message: 'আগামী শনিবার অভিভাবক সভা অনুষ্ঠিত হবে।',
      time: 'গতকাল',
      isRead: true,
      icon: assetPrefix + 'icons/calendar.svg'
    },
    {
      id: 'ntf-005',
      type: 'badge',
      title: 'নতুন ব্যাজ অর্জিত',
      message: 'আপনার সন্তান "৭ দিন স্ট্রিক" ব্যাজ অর্জন করেছে।',
      time: '২ দিন আগে',
      isRead: true,
      icon: assetPrefix + 'badges/streak.svg'
    }
  ];
   

  /* ---------- STATE ---------- */
  let isDropdownOpen = false;

  /* ---------- DOM REFERENCES ---------- */
  const bellBtn = document.querySelector('[data-nav="notifications"]');
  const badgeEl = bellBtn ? bellBtn.querySelector('[data-bind="notificationCount"]') : null;

  /* ---------- BUILD DROPDOWN ELEMENT ---------- */
  function createDropdown() {
    const dropdown = document.createElement('div');
    dropdown.className = 'notif-dropdown';
    dropdown.setAttribute('data-bind', 'notificationDropdown');

    const header = document.createElement('div');
    header.className = 'notif-dropdown__header';
    header.innerHTML = `
      <span class="notif-dropdown__title">নোটিফিকেশন</span>
      <button class="notif-dropdown__clear" data-nav="clear-notifications">সব পড়া হয়েছে</button>
    `;
    dropdown.appendChild(header);

    const list = document.createElement('div');
    list.className = 'notif-dropdown__list';
    list.setAttribute('data-bind', 'notificationList');

    demoNotifications.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'notif-item' + (item.isRead ? '' : ' is-unread');
      row.setAttribute('data-bind', 'notificationItem');
      row.setAttribute('data-nav', 'notification-detail');
      row.dataset.id = item.id;

      row.innerHTML = `
        <div class="notif-item__icon-wrap">
          <img src="${item.icon}" alt="" class="notif-item__icon" />
        </div>
        <div class="notif-item__body">
          <span class="notif-item__title" data-bind="notificationTitle">${item.title}</span>
          <span class="notif-item__message" data-bind="notificationMessage">${item.message}</span>
          <span class="notif-item__time" data-bind="notificationTime">${item.time}</span>
        </div>
        ${!item.isRead ? '<span class="notif-item__dot"></span>' : ''}
      `;

      list.appendChild(row);
    });

    dropdown.appendChild(list);
    return dropdown;
  }

  /* ---------- UPDATE BADGE COUNT ---------- */
  function updateBadgeCount() {
    if (!badgeEl) return;
    const unreadCount = demoNotifications.filter((n) => !n.isRead).length;

    if (unreadCount > 0) {
      badgeEl.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
      badgeEl.classList.remove('badge--hidden');
    } else {
      badgeEl.classList.add('badge--hidden');
    }
  }

  /* ---------- OPEN DROPDOWN ---------- */
  function openDropdown() {
    if (isDropdownOpen || !bellBtn) return;

    const dropdown = createDropdown();
    document.body.appendChild(dropdown);

    requestAnimationFrame(() => {
      dropdown.classList.add('is-open');
    });

    isDropdownOpen = true;

    document.addEventListener('click', handleOutsideClick, true);
    document.addEventListener('keydown', handleEscapeKey);
  }

  /* ---------- CLOSE DROPDOWN ---------- */
  function closeDropdown() {
    const dropdown = document.querySelector('[data-bind="notificationDropdown"]');
    if (!dropdown || !isDropdownOpen) return;

    dropdown.classList.remove('is-open');

    dropdown.addEventListener(
      'transitionend',
      () => {
        if (dropdown.parentNode) {
          dropdown.parentNode.removeChild(dropdown);
        }
      },
      { once: true }
    );

    isDropdownOpen = false;

    document.removeEventListener('click', handleOutsideClick, true);
    document.removeEventListener('keydown', handleEscapeKey);
  }

  /* ---------- TOGGLE DROPDOWN ---------- */
  function toggleDropdown(e) {
    e.stopPropagation();
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  /* ---------- OUTSIDE CLICK HANDLER ---------- */
  function handleOutsideClick(e) {
    const dropdown = document.querySelector('[data-bind="notificationDropdown"]');
    if (!dropdown) return;

    if (!dropdown.contains(e.target) && !bellBtn.contains(e.target)) {
      closeDropdown();
    }
  }

  /* ---------- ESCAPE KEY HANDLER ---------- */
  function handleEscapeKey(e) {
    if (e.key === 'Escape') {
      closeDropdown();
    }
  }

  /* ---------- MARK ALL AS READ ---------- */
  function markAllAsRead(e) {
    if (!e.target.closest('[data-nav="clear-notifications"]')) return;

    demoNotifications.forEach((n) => {
      n.isRead = true;
    });

    document.querySelectorAll('[data-bind="notificationItem"]').forEach((row) => {
      row.classList.remove('is-unread');
      const dot = row.querySelector('.notif-item__dot');
      if (dot) dot.remove();
    });

    updateBadgeCount();
  }

  /* ---------- EVENT DELEGATION FOR DYNAMIC CONTENT ---------- */
  function handleDropdownClicks(e) {
    markAllAsRead(e);
  }

  /* ---------- INIT ---------- */
  function init() {
    if (!bellBtn) return;

    updateBadgeCount();
    bellBtn.addEventListener('click', toggleDropdown);
    document.addEventListener('click', handleDropdownClicks);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
