const STORAGE_KEYS = { users: 'skillfolk-users', session: 'skillfolk-session', skills: 'skillfolk-skills', preferences: 'skillfolk-preferences', saved: 'skillfolk-saved' };
const defaultSkills = [
  { id: 's1', name: 'Watercolor for slow mornings', category: 'Creative', format: 'In person', description: 'Loose florals, happy accidents, and learning to let go.', owner: 'Maya Chen', initials: 'MC', location: 'Portland, OR', icon: '🎨', color: 'creative' },
  { id: 's2', name: 'Build your first tiny website', category: 'Technology', format: 'Video call', description: 'A friendly, no-jargon intro to making things for the web.', owner: 'Alex Rivera', initials: 'AR', location: 'Seattle, WA', icon: '⌘', color: 'technology' },
  { id: 's3', name: 'A calmer kind of yoga', category: 'Wellness', format: 'In person', description: 'Gentle movement and breathing for people who sit a lot.', owner: 'Sana Patel', initials: 'SP', location: 'Portland, OR', icon: '☼', color: 'wellness' },
  { id: 's4', name: 'Conversational Spanish', category: 'Language', format: 'Video call', description: 'Practice the everyday phrases you never learn in class.', owner: 'Leo Morales', initials: 'LM', location: 'Remote', icon: '✉', color: 'language' },
  { id: 's5', name: 'Houseplants that actually thrive', category: 'Home & garden', format: 'PDF guide', description: 'A printable, practical guide to your leafy roommates.', owner: 'Nina Brooks', initials: 'NB', location: 'Eugene, OR', icon: '♧', color: 'home-garden' },
  { id: 's6', name: 'Make your ideas make sense', category: 'Business', format: 'Video lessons', description: 'A short workshop on storytelling for small businesses.', owner: 'Theo Park', initials: 'TP', location: 'Remote', icon: '✎', color: 'business' },
  { id: 's7', name: 'Sourdough, without the stress', category: 'Home & garden', format: 'Video call', description: 'A forgiving starter and a loaf you can be proud of.', owner: 'Maya Chen', initials: 'MC', location: 'Portland, OR', icon: '♨', color: 'home-garden' },
  { id: 's8', name: 'Sketching the everyday', category: 'Creative', format: 'In person', description: 'Find the interesting shapes hiding in ordinary things.', owner: 'Sana Patel', initials: 'SP', location: 'Portland, OR', icon: '✎', color: 'creative' },
  { id: 's9', name: 'A kinder inbox', category: 'Technology', format: 'PDF guide', description: 'A thoughtful system for making email feel manageable.', owner: 'Theo Park', initials: 'TP', location: 'Remote', icon: '✉', color: 'technology' }
];
const people = [
  { name: 'Maya Chen', initials: 'MC', location: 'Portland, Oregon', bio: 'Watercolor painter, plant parent, and devoted maker of very slow breakfasts.', skills: ['Watercolor', 'Sourdough'], color: '#ecd8c4', text: '#805f45' },
  { name: 'Alex Rivera', initials: 'AR', location: 'Seattle, Washington', bio: 'Friendly neighborhood web developer. Happy to make tech feel less mysterious.', skills: ['Web design', 'JavaScript'], color: '#c7e2df', text: '#3e706d' },
  { name: 'Sana Patel', initials: 'SP', location: 'Portland, Oregon', bio: 'Yoga teacher and lifelong doodler. Big believer in learning by doing.', skills: ['Gentle yoga', 'Sketching'], color: '#e5e9c7', text: '#68784c' },
  { name: 'Leo Morales', initials: 'LM', location: 'Remote', bio: 'Language enthusiast who thinks the best lessons happen over a cup of coffee.', skills: ['Spanish', 'Cooking'], color: '#e6d9eb', text: '#76577e' },
  { name: 'Nina Brooks', initials: 'NB', location: 'Eugene, Oregon', bio: 'I help little gardens grow, even on tiny windowsills and busy schedules.', skills: ['Gardening', 'Photography'], color: '#d8e6c8', text: '#54754d' },
  { name: 'Theo Park', initials: 'TP', location: 'Remote', bio: 'Storyteller, small-business helper, and enthusiastic notebook collector.', skills: ['Storytelling', 'Writing'], color: '#f0dfc5', text: '#846847' }
];
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const read = (key, fallback) => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let currentUser = read(STORAGE_KEYS.session, null);
let authMode = 'login';
let toastTimer;
let preferences = read(STORAGE_KEYS.preferences, { mode: 'light', colors: ['#167d8d', '#2196f3', '#f2f7a0', '#071b2b'] });

function allSkills() { return [...defaultSkills, ...read(STORAGE_KEYS.skills, [])]; }
function setView(name) {
  const view = $(`#${name}View`);
  if (!view) return;
  $$('.view').forEach(item => item.classList.remove('active'));
  view.classList.add('active');
  const app = $('#appShell');
  app.classList.toggle('intro-mode', name === 'intro');
  const labels = { home: 'Discover', dashboard: 'My dashboard', people: 'Find people', settings: 'Settings' };
  $('#pageCrumb').textContent = labels[name] || 'Discover';
  $$('.nav-item[data-view]').forEach(item => item.classList.toggle('active', item.dataset.view === name));
  $('#sidebar').classList.remove('open');
  if (name === 'home') renderSkills();
  if (name === 'dashboard') renderDashboard();
  if (name === 'people') renderPeople();
  if (name === 'settings') populateSettings();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function currentInitial() { return (currentUser?.name || 'J').trim().charAt(0).toUpperCase(); }
function syncUser() {
  const name = currentUser?.name || 'Curious friend';
  $('#sidebarName').textContent = name;
  $('#topAvatar').textContent = currentInitial();
  $('#dashboardAvatar').textContent = currentInitial();
  $('#dashboardName').textContent = name;
  $('#dashboardLocation').textContent = `${currentUser?.location || 'Somewhere lovely'} · member since ${currentUser?.joined || new Date().getFullYear()}`;
  $('#dashboardBio').textContent = currentUser?.bio || 'Always learning something new. Currently looking for creative inspiration and a good cup of tea.';
}
function applyPreferences() {
  document.body.classList.toggle('dark', preferences.mode === 'dark');
  const colors = preferences.colors || ['#167d8d', '#2196f3', '#f2f7a0', '#071b2b'];
  document.documentElement.style.setProperty('--accent', colors[0]);
  document.documentElement.style.setProperty('--accent-dark', colors[0]);
  document.documentElement.style.setProperty('--blue', colors[1]);
  document.documentElement.style.setProperty('--lemon', colors[2]);
  document.documentElement.style.setProperty('--soil', colors[3]);
  document.documentElement.style.setProperty('--ink', preferences.mode === 'dark' ? '#e3ece6' : colors[3]);
  const artSun = $('.art-sun');
  if (artSun) artSun.style.backgroundColor = colors[2];
  $$('.stat-blue').forEach(icon => { icon.style.color = colors[1]; icon.style.backgroundColor = `${colors[1]}26`; });
  $$('.stat-yellow').forEach(icon => { icon.style.color = colors[3]; icon.style.backgroundColor = `${colors[2]}66`; });
  $$('.mode-card').forEach(card => card.classList.toggle('active', card.dataset.mode === preferences.mode));
  ['colorOne', 'colorTwo', 'colorThree', 'colorFour'].forEach((id, index) => { const input = $(`#${id}`); if (input) input.value = colors[index]; });
}
function renderSkills() {
  const query = $('#skillSearch').value.trim().toLowerCase();
  const category = $('#categoryFilter').value;
  const format = $('#formatFilter').value;
  const skills = allSkills().filter(skill => {
    const matchesText = `${skill.name} ${skill.category} ${skill.description} ${skill.owner}`.toLowerCase().includes(query);
    return matchesText && (category === 'all' || skill.category === category) && (format === 'all' || skill.format === format);
  });
  const saved = read(STORAGE_KEYS.saved, []);
  $('#skillGrid').innerHTML = skills.map((skill, index) => `
    <article class="skill-card" style="animation:fade-in .28s ease ${Math.min(index * 35, 175)}ms both">
      <div class="skill-cover cover-${escapeAttribute(skill.color || 'creative')}"><span class="cover-deco"></span><span class="cover-icon">${escapeHTML(skill.icon || '✳')}</span><button class="save-skill ${saved.includes(skill.id) ? 'saved' : ''}" data-save-skill="${escapeAttribute(skill.id)}" aria-label="${saved.includes(skill.id) ? 'Remove saved skill' : 'Save skill'}">${saved.includes(skill.id) ? '♥' : '♡'}</button></div>
      <div class="skill-card-body"><span class="skill-cat">${escapeHTML(skill.category)}</span><h3 title="${escapeAttribute(skill.name)}">${escapeHTML(skill.name)}</h3><p class="skill-description">${escapeHTML(skill.description)}</p><div class="skill-card-bottom"><div class="skill-tutor"><span class="tutor-avatar">${escapeHTML(skill.initials || initials(skill.owner))}</span><span class="tutor-copy"><strong>${escapeHTML(skill.owner)}</strong><small>${escapeHTML(skill.location || 'Skillfolk member')}</small></span></div><span class="skill-format">${formatIcon(skill.format)} ${escapeHTML(skill.format)}</span></div></div>
    </article>`).join('');
  $('#resultsCount').textContent = skills.length ? `${skills.length} thoughtful ${skills.length === 1 ? 'skill' : 'skills'} to explore` : 'No skills found';
  $('#emptySkills').classList.toggle('hidden', skills.length > 0);
  $('#skillGrid').classList.toggle('hidden', skills.length === 0);
}
function renderDashboard() {
  syncUser();
  const mine = read(STORAGE_KEYS.skills, []).filter(skill => currentUser && skill.ownerEmail === currentUser.email);
  $('#statTeaching').textContent = mine.length;
  $('#mySkillsList').innerHTML = mine.length ? mine.map(skill => `<div class="my-skill-row"><span class="my-skill-icon cover-${escapeAttribute(skill.color)}">${escapeHTML(skill.icon)}</span><span class="my-skill-info"><strong>${escapeHTML(skill.name)}</strong><small>${escapeHTML(skill.category)} · ${escapeHTML(skill.format)}</small></span><span class="skill-status">Sharing</span><button class="delete-skill" data-delete-skill="${escapeAttribute(skill.id)}" aria-label="Remove ${escapeAttribute(skill.name)}">×</button></div>`).join('') : '<div class="dashboard-empty">You haven’t listed a skill yet. There’s something you know that someone would love to learn. <button class="text-link" data-open-skill>Share it →</button></div>';
  $('#dashboardMatches').innerHTML = people.slice(0, 3).map(person => `<div class="match-card"><span class="match-avatar" style="background:${person.color};color:${person.text}">${person.initials}</span><span class="match-info"><strong>${person.name}</strong><small>Teaches ${person.skills[0]}</small></span><button class="match-action" data-contact="${person.name}" aria-label="Say hello to ${person.name}">↗</button></div>`).join('');
}
function renderPeople() {
  const query = $('#peopleSearch').value.trim().toLowerCase();
  const filtered = people.filter(person => `${person.name} ${person.location} ${person.skills.join(' ')} ${person.bio}`.toLowerCase().includes(query));
  const localUser = currentUser ? { name: currentUser.name, initials: initials(currentUser.name), location: currentUser.location || 'New to the community', bio: currentUser.bio || 'Curious about what we can learn together.', skills: read(STORAGE_KEYS.skills, []).filter(skill => skill.ownerEmail === currentUser.email).map(skill => skill.name).slice(0, 2), color: '#d8e6c8', text: '#54754d', isMe: true } : null;
  const peopleToShow = [...(localUser && (!query || `${localUser.name} ${localUser.location} ${localUser.bio}`.toLowerCase().includes(query)) ? [localUser] : []), ...filtered];
  $('#peopleGrid').innerHTML = peopleToShow.map(person => `<article class="person-card"><span class="match-avatar" style="background:${person.color};color:${person.text}">${escapeHTML(person.initials)}</span><h3>${escapeHTML(person.name)}${person.isMe ? ' · you' : ''}</h3><p class="person-place">⌖ ${escapeHTML(person.location)}</p><p class="person-bio">${escapeHTML(person.bio)}</p><div class="person-skill-tags">${person.skills.length ? person.skills.map(skill => `<span>${escapeHTML(skill)}</span>`).join('') : '<span>Finding a first skill</span>'}</div><button class="button button-outline" ${person.isMe ? 'disabled' : `data-contact="${escapeAttribute(person.name)}"`}>${person.isMe ? 'That’s you!' : 'Say hello'} <span>↗</span></button></article>`).join('');
  $('#peopleCount').textContent = query ? `${peopleToShow.length} ${peopleToShow.length === 1 ? 'person' : 'people'} found` : 'A few lovely people to learn with';
  $('#emptyPeople').classList.toggle('hidden', peopleToShow.length > 0);
  $('#peopleGrid').classList.toggle('hidden', peopleToShow.length === 0);
}
function populateSettings() {
  $('#settingName').value = currentUser?.name || '';
  $('#settingLocation').value = currentUser?.location || '';
  $('#settingBio').value = currentUser?.bio || '';
  applyPreferences();
}
function openAuth(mode = 'login') {
  authMode = mode;
  $('#authOverlay').classList.remove('hidden');
  $('#authError').classList.add('hidden');
  const isRegister = mode === 'register';
  $('#authHeading').innerHTML = isRegister ? 'Make a little <em>space.</em>' : 'Welcome <em>back.</em>';
  $('#authSubtitle').textContent = isRegister ? 'Your next good thing starts with a hello.' : 'A little learning looks good on you.';
  $('.auth-name-field').classList.toggle('hidden', !isRegister);
  $('#authName').required = isRegister;
  $('#authPassword').autocomplete = isRegister ? 'new-password' : 'current-password';
  $('#authSubmit').innerHTML = isRegister ? 'Create your account <span>→</span>' : 'Log in <span>→</span>';
  $('#authSwitch').innerHTML = isRegister ? 'Already a member? <button id="switchToLogin" type="button">Log in instead</button>' : 'New around here? <button id="switchToRegister" type="button">Make an account</button>';
  $('#authPassword').value = '';
  setTimeout(() => (isRegister ? $('#authName') : $('#authEmail')).focus(), 40);
}
function closeAuth() { $('#authOverlay').classList.add('hidden'); }
function showApp(view = 'home') {
  currentUser = read(STORAGE_KEYS.session, currentUser);
  syncUser();
  $('#appShell').classList.remove('intro-mode');
  setView(view);
}
function openSkillModal() {
  if (!currentUser) { openAuth('login'); showToast('Log in or make an account to share your skill.'); return; }
  $('#skillForm').reset();
  $('#skillError').classList.add('hidden');
  $('#skillModal').classList.remove('hidden');
  $('#newSkillName').focus();
}
function escapeHTML(value = '') { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
function escapeAttribute(value = '') { return escapeHTML(value).replace(/`/g, '&#96;'); }
function initials(name = '') { return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase() || 'SF'; }
function formatIcon(format = '') { return ({ 'Video call': '◉', 'In person': '⌖', 'Video lessons': '▷', 'PDF guide': '▤' })[format] || '✧'; }

// Main navigation
$$('.nav-item[data-view], [data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
$('#profileMini').addEventListener('click', () => setView('dashboard'));
$('#topAvatar').addEventListener('click', () => setView('dashboard'));
$('#mobileMenu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#startExploring').addEventListener('click', () => $('#skillSearch').focus());
$('#viewAllSkills').addEventListener('click', () => { $('#skillSearch').value = ''; $('#categoryFilter').value = 'all'; $('#formatFilter').value = 'all'; renderSkills(); $('#skillSearch').focus(); });
$('#clearFilters').addEventListener('click', () => { $('#skillSearch').value = ''; $('#categoryFilter').value = 'all'; $('#formatFilter').value = 'all'; renderSkills(); });
$('#skillSearch').addEventListener('input', renderSkills);
$('#categoryFilter').addEventListener('change', renderSkills);
$('#formatFilter').addEventListener('change', renderSkills);
$('#peopleSearch').addEventListener('input', renderPeople);
$('#sortButton').addEventListener('click', () => showToast('Showing a thoughtful mix picked for curious minds.'));
$('#themeToggle').addEventListener('click', () => { preferences.mode = preferences.mode === 'dark' ? 'light' : 'dark'; write(STORAGE_KEYS.preferences, preferences); applyPreferences(); });

// Intro and sign-in/register
$('#introLogin').addEventListener('click', () => openAuth('login'));
$('#introJoin').addEventListener('click', () => openAuth('register'));
$('#introBrowse').addEventListener('click', () => { showApp('home'); document.querySelector('.main-area').scrollIntoView({ behavior: 'smooth' }); });
$('#authClose').addEventListener('click', closeAuth);
$$('[data-close-auth]').forEach(el => el.addEventListener('click', closeAuth));
$('#authSwitch').addEventListener('click', event => { if (event.target.id === 'switchToRegister') openAuth('register'); if (event.target.id === 'switchToLogin') openAuth('login'); });
$('#authForm').addEventListener('submit', event => {
  event.preventDefault();
  const email = $('#authEmail').value.trim().toLowerCase();
  const password = $('#authPassword').value;
  const users = read(STORAGE_KEYS.users, []);
  const error = $('#authError');
  error.classList.add('hidden');
  if (authMode === 'register') {
    const name = $('#authName').value.trim();
    if (users.some(user => user.email === email)) { error.textContent = 'There’s already an account with that email. Try logging in instead.'; error.classList.remove('hidden'); return; }
    currentUser = { name, email, password, location: '', bio: '', joined: new Date().getFullYear() };
    users.push(currentUser);
    write(STORAGE_KEYS.users, users);
  } else {
    currentUser = users.find(user => user.email === email && user.password === password);
    if (!currentUser) { error.textContent = 'We couldn’t find that email and password combination. Try again, or make an account.'; error.classList.remove('hidden'); return; }
  }
  write(STORAGE_KEYS.session, currentUser);
  closeAuth();
  showApp('home');
  showToast(authMode === 'register' ? `Welcome to Skillfolk, ${currentUser.name.split(' ')[0]}!` : `Lovely to have you back, ${currentUser.name.split(' ')[0]}.`);
});

// Marketplace cards, saving, contact actions, and user's own skills
$('#skillGrid').addEventListener('click', event => {
  const button = event.target.closest('[data-save-skill]');
  if (!button) return;
  const id = button.dataset.saveSkill;
  const saved = read(STORAGE_KEYS.saved, []);
  const next = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id];
  write(STORAGE_KEYS.saved, next);
  renderSkills();
  showToast(next.includes(id) ? 'Saved for a little later ♥' : 'Removed from your saved skills.');
});
document.addEventListener('click', event => {
  const contact = event.target.closest('[data-contact]');
  if (contact) {
    if (!currentUser) { openAuth('login'); return; }
    showToast(`A friendly hello to ${contact.dataset.contact} is on its way soon.`);
  }
  if (event.target.closest('[data-open-skill]')) openSkillModal();
  const deleteButton = event.target.closest('[data-delete-skill]');
  if (deleteButton) {
    const remaining = read(STORAGE_KEYS.skills, []).filter(skill => skill.id !== deleteButton.dataset.deleteSkill);
    write(STORAGE_KEYS.skills, remaining);
    renderDashboard();
    showToast('Your skill was removed.');
  }
});
$('#addSkillButton').addEventListener('click', openSkillModal);
$('#addSkillSmall').addEventListener('click', openSkillModal);
$('#skillModalClose').addEventListener('click', () => $('#skillModal').classList.add('hidden'));
$$('[data-close-skill]').forEach(el => el.addEventListener('click', () => $('#skillModal').classList.add('hidden')));
$('#skillForm').addEventListener('submit', event => {
  event.preventDefault();
  if (!currentUser) return;
  const name = $('#newSkillName').value.trim();
  const category = $('#newSkillCategory').value;
  const color = category.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
  const icons = { Creative: '🎨', Technology: '⌘', Wellness: '☼', Language: '✉', 'Home & garden': '♧', Business: '✎' };
  const skill = { id: `u${Date.now()}`, name, category, format: $('#newSkillFormat').value, description: $('#newSkillDescription').value.trim() || `A friendly way to learn ${name.toLowerCase()} together.`, owner: currentUser.name, ownerEmail: currentUser.email, initials: initials(currentUser.name), location: currentUser.location || 'Skillfolk member', icon: icons[category], color };
  const skills = read(STORAGE_KEYS.skills, []);
  skills.unshift(skill);
  write(STORAGE_KEYS.skills, skills);
  $('#skillModal').classList.add('hidden');
  renderDashboard();
  showToast('Your skill is out in the world. Thanks for sharing! ✳');
});

// Personal details, theme customization, and account controls
$('#saveSettings').addEventListener('click', () => {
  if (currentUser) {
    currentUser = { ...currentUser, name: $('#settingName').value.trim() || currentUser.name, location: $('#settingLocation').value.trim(), bio: $('#settingBio').value.trim() };
    write(STORAGE_KEYS.session, currentUser);
    write(STORAGE_KEYS.users, read(STORAGE_KEYS.users, []).map(user => user.email === currentUser.email ? currentUser : user));
  }
  preferences.colors = ['colorOne', 'colorTwo', 'colorThree', 'colorFour'].map(id => $(`#${id}`).value);
  write(STORAGE_KEYS.preferences, preferences);
  applyPreferences();
  syncUser();
  showToast('Your changes have been saved.');
});
$$('.mode-card').forEach(card => card.addEventListener('click', () => { preferences.mode = card.dataset.mode; applyPreferences(); }));
$$(['colorOne', 'colorTwo', 'colorThree', 'colorFour'].map(id => `#${id}`).join(',')).forEach(input => input.addEventListener('input', () => {
  preferences.colors = ['colorOne', 'colorTwo', 'colorThree', 'colorFour'].map(id => $(`#${id}`).value);
  applyPreferences();
}));
$('#resetPalette').addEventListener('click', () => { preferences.colors = ['#167d8d', '#2196f3', '#f2f7a0', '#071b2b']; applyPreferences(); });
$$('.settings-tab').forEach(tab => tab.addEventListener('click', () => { $$('.settings-tab').forEach(item => item.classList.remove('active')); tab.classList.add('active'); }));
function logout() { localStorage.removeItem(STORAGE_KEYS.session); currentUser = null; showToast('You’ve signed out. See you soon!'); setView('intro'); }
$('#logoutButton').addEventListener('click', logout);
$('#deleteAccount').addEventListener('click', () => {
  if (!currentUser) return;
  if (!window.confirm('Delete your account and the skills you have shared? This cannot be undone.')) return;
  const email = currentUser.email;
  write(STORAGE_KEYS.users, read(STORAGE_KEYS.users, []).filter(user => user.email !== email));
  write(STORAGE_KEYS.skills, read(STORAGE_KEYS.skills, []).filter(skill => skill.ownerEmail !== email));
  localStorage.removeItem(STORAGE_KEYS.session);
  currentUser = null;
  setView('intro');
  showToast('Your local account has been deleted.');
});

// Escape closes overlays; the intro is the first page for signed-out visitors.
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { closeAuth(); $('#skillModal').classList.add('hidden'); $('#sidebar').classList.remove('open'); }
  if (event.key === 'Enter' && document.activeElement === $('#peopleSearch')) renderPeople();
});
applyPreferences();
syncUser();
if (currentUser) setView('home');
else setView('intro');
