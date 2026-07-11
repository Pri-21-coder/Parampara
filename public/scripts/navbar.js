document.addEventListener("DOMContentLoaded", () => {
  const navMenu = document.getElementById('navMenu');
  if (navMenu) {
    if (!navMenu.querySelector('a[href="artifacts.html"]')) {
      const li = document.createElement('li');
      li.innerHTML = '<a href="artifacts.html"><i class="ti ti-archive"></i> Artifacts</a>';
      navMenu.appendChild(li);
    }
    if (!navMenu.querySelector('a[href="profile.html"]')) {
      const li = document.createElement('li');
      li.innerHTML = '<a href="profile.html"><i class="ti ti-user"></i> Achievement Profile</a>';
      navMenu.appendChild(li);
    }
  }

  const fullGrid = document.querySelector('.nav-fullmenu-grid');
  if (fullGrid) {
    if (!fullGrid.querySelector('a[href="artifacts.html"]')) {
      const a = document.createElement('a');
      a.setAttribute('href', 'artifacts.html');
      a.innerHTML = '<i class="ti ti-archive"></i> Artifacts';
      fullGrid.appendChild(a);
    }
    if (!fullGrid.querySelector('a[href="profile.html"]')) {
      const a = document.createElement('a');
      a.setAttribute('href', 'profile.html');
      a.innerHTML = '<i class="ti ti-user"></i> Achievement Profile';
      fullGrid.appendChild(a);
    }
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const allLinks = document.querySelectorAll('.nav-menu a, .nav-fullmenu-grid a');
  allLinks.forEach((link) => {
    if (link.getAttribute('href') === currentPage || (currentPage === '' && link.getAttribute('href') === 'index.html')) {
      link.classList.add('active');
    }
  });
});
