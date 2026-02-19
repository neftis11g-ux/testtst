
const STORAGE_KEY = "elchetv_state_v3";
const DB_NAME = "elchetv_media";
const DB_VERSION = 1;
const VIDEO_STORE = "videos";
const DEFAULT_SOCKET_PATH = "/socket.io";
const AD_INTERVALS = [5, 8, 6, 10, 7, 9];
const DEFAULT_RTC_CONFIG = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }]
};

const SAMPLE_USERS = [
  { id: "u_mara", username: "marafit", bio: "Rutinas y energia", followers: 18400 },
  { id: "u_nico", username: "nicofilms", bio: "Edicion y transiciones", followers: 23200 },
  { id: "u_lola", username: "lolafood", bio: "Recetas rapidas", followers: 11900 }
];

const SAMPLE_POSTS = [
  { id: "p1", authorId: "u_mara", caption: "Entreno express de 20 minutos", tags: ["fitness", "rutina"], videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fitness-woman-doing-jumping-jacks-4208-large.mp4", videoBlobId: null, privacy: "public", createdAt: "2026-02-01T10:00:00.000Z", likes: ["seed_a"], savedBy: [], comments: [], shares: 12 },
  { id: "p2", authorId: "u_nico", caption: "Transicion cinematica con telefono", tags: ["video", "cine"], videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-taking-a-selfie-video-4838-large.mp4", videoBlobId: null, privacy: "public", createdAt: "2026-02-04T14:20:00.000Z", likes: ["seed_a"], savedBy: [], comments: [], shares: 7 },
  { id: "p3", authorId: "u_lola", caption: "Pasta cremosa en 10 minutos", tags: ["food", "rapido"], videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-pasta-in-a-pan-12294-large.mp4", videoBlobId: null, privacy: "public", createdAt: "2026-02-05T08:10:00.000Z", likes: [], savedBy: [], comments: [], shares: 3 },
  { id: "p4", authorId: "u_nico", caption: "Tip de iluminacion para grabar", tags: ["video", "setup"], videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-taking-a-selfie-video-4838-large.mp4", videoBlobId: null, privacy: "public", createdAt: "2026-02-06T12:10:00.000Z", likes: [], savedBy: [], comments: [], shares: 4 },
  { id: "p5", authorId: "u_mara", caption: "Core rapido para principiantes", tags: ["fitness", "core"], videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fitness-woman-doing-jumping-jacks-4208-large.mp4", videoBlobId: null, privacy: "public", createdAt: "2026-02-10T17:45:00.000Z", likes: [], savedBy: [], comments: [], shares: 5 }
];

const SAMPLE_NOTIFICATIONS = [
  { id: "n_seed_1", text: "El algoritmo te recomienda #fitness y #video", createdAt: "2026-02-10T11:00:00.000Z" }
];

const state = {
  mode: "forYou",
  view: "feedView",
  currentCommentsPostId: null,
  pendingUploadFile: null,
  uploadPreviewUrl: null,
  videoObserver: null,
  feedObjectUrls: [],
  profileObjectUrls: [],
  socket: null,
  liveRooms: [],
  livePeers: new Map(),
  livePendingCandidates: new Map(),
  liveRoomId: null,
  liveHostSocketId: null,
  isLiveHost: false,
  isLiveViewer: false,
  liveLocalStream: null,
  liveRemoteStream: null,
  rtcConfig: DEFAULT_RTC_CONFIG,
  db: null,
  data: loadState()
};

const el = {
  feed: document.getElementById("feed"),
  forYouTab: document.getElementById("forYouTab"),
  followingTab: document.getElementById("followingTab"),
  navBtns: [...document.querySelectorAll(".nav-btn")],
  views: [...document.querySelectorAll(".view")],
  openUpload: document.getElementById("openUpload"),
  openLive: document.getElementById("openLive"),
  uploadModal: document.getElementById("uploadModal"),
  liveModal: document.getElementById("liveModal"),
  profileModal: document.getElementById("profileModal"),
  commentsModal: document.getElementById("commentsModal"),
  onboardModal: document.getElementById("onboardModal"),
  videoFile: document.getElementById("videoFile"),
  fileLabel: document.getElementById("fileLabel"),
  uploadPreview: document.getElementById("uploadPreview"),
  captionInput: document.getElementById("captionInput"),
  tagsInput: document.getElementById("tagsInput"),
  publishBtn: document.getElementById("publishBtn"),
  commentsList: document.getElementById("commentsList"),
  commentInput: document.getElementById("commentInput"),
  sendComment: document.getElementById("sendComment"),
  closeComments: document.getElementById("closeComments"),
  searchInput: document.getElementById("searchInput"),
  searchBtn: document.getElementById("searchBtn"),
  searchResults: document.getElementById("searchResults"),
  trendingTags: document.getElementById("trendingTags"),
  trendingTagsRail: document.getElementById("trendingTagsRail"),
  notifList: document.getElementById("notifList"),
  profileAvatar: document.getElementById("profileAvatar"),
  profileName: document.getElementById("profileName"),
  profileBio: document.getElementById("profileBio"),
  statPosts: document.getElementById("statPosts"),
  statLikes: document.getElementById("statLikes"),
  statFollowers: document.getElementById("statFollowers"),
  profilePosts: document.getElementById("profilePosts"),
  quickUser: document.getElementById("quickUser"),
  quickPosts: document.getElementById("quickPosts"),
  quickLikes: document.getElementById("quickLikes"),
  quickFollowers: document.getElementById("quickFollowers"),
  usernameInput: document.getElementById("usernameInput"),
  bioInput: document.getElementById("bioInput"),
  onboardMsg: document.getElementById("onboardMsg"),
  createProfileBtn: document.getElementById("createProfileBtn"),
  profileEditBtn: document.getElementById("profileEditBtn"),
  editProfileBtn: document.getElementById("editProfileBtn"),
  profileUsernameInput: document.getElementById("profileUsernameInput"),
  profileBioInput: document.getElementById("profileBioInput"),
  profileMsg: document.getElementById("profileMsg"),
  saveProfileBtn: document.getElementById("saveProfileBtn"),
  closeProfileModal: document.getElementById("closeProfileModal"),
  liveTitleInput: document.getElementById("liveTitleInput"),
  liveTopicInput: document.getElementById("liveTopicInput"),
  liveMsg: document.getElementById("liveMsg"),
  goLiveBtn: document.getElementById("goLiveBtn"),
  closeLiveModal: document.getElementById("closeLiveModal"),
  startLiveBtn: document.getElementById("startLiveBtn"),
  joinLiveBtn: document.getElementById("joinLiveBtn"),
  leaveLiveBtn: document.getElementById("leaveLiveBtn"),
  stopLiveBtn: document.getElementById("stopLiveBtn"),
  liveStatusText: document.getElementById("liveStatusText"),
  liveBadge: document.getElementById("liveBadge"),
  liveViewers: document.getElementById("liveViewers"),
  liveVideo: document.getElementById("liveVideo"),
  liveChatList: document.getElementById("liveChatList"),
  liveChatInput: document.getElementById("liveChatInput"),
  sendLiveChat: document.getElementById("sendLiveChat"),
  liveRailText: document.getElementById("liveRailText"),
  openLiveFromRail: document.getElementById("openLiveFromRail")
};

init().catch((error) => console.error("No se pudo iniciar elchetv", error));

async function init() {
  state.db = await openMediaDB();
  await loadRtcConfig();
  initSocket();
  bindEvents();
  window.addEventListener("beforeunload", () => {
    cleanupLiveState({ notifyServer: true });
    releaseFeedObjectUrls();
    releaseProfileObjectUrls();
    releaseUploadPreviewUrl();
  });
  if (!state.data.user) el.onboardModal.showModal();
  state.data.live = null;
  await renderEverything();
}

async function loadRtcConfig() {
  try {
    const response = await fetch("/api/live-config");
    if (!response.ok) return;
    const config = await response.json();
    if (Array.isArray(config.iceServers) && config.iceServers.length) {
      state.rtcConfig = { iceServers: config.iceServers };
    }
  } catch {
    state.rtcConfig = DEFAULT_RTC_CONFIG;
  }
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createDefaultState();
  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return createDefaultState();
  }
}

function createDefaultState() {
  return { user: null, users: SAMPLE_USERS, posts: SAMPLE_POSTS, following: [], notifications: SAMPLE_NOTIFICATIONS, live: null };
}

function normalizeState(data) {
  return {
    user: data.user ?? null,
    users: Array.isArray(data.users) && data.users.length ? data.users : SAMPLE_USERS,
    posts: Array.isArray(data.posts) && data.posts.length ? data.posts : SAMPLE_POSTS,
    following: Array.isArray(data.following) ? data.following : [],
    notifications: Array.isArray(data.notifications) ? data.notifications : SAMPLE_NOTIFICATIONS,
    live: null
  };
}

function saveState() {
  const persisted = { ...state.data, live: null };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
}

function initSocket() {
  if (typeof io !== "function") {
    console.error("Socket.IO client no disponible");
    return;
  }

  const { socketUrl, socketPath } = getSocketConfig();
  state.socket = io(socketUrl, {
    path: socketPath,
    transports: ["websocket", "polling"]
  });

  state.socket.on("connect", () => {
    state.socket.emit("live:list");
  });

  state.socket.on("disconnect", () => {
    cleanupLiveState({ notifyServer: false });
    state.liveRooms = [];
    state.data.live = null;
    renderLivePanel();
    renderFeed();
  });

  state.socket.on("live:rooms", (rooms) => {
    state.liveRooms = Array.isArray(rooms) ? rooms : [];
    refreshLiveSummaryFromRooms();
  });

  state.socket.on("live:started", (room) => {
    state.liveRooms = mergeLiveRoom(state.liveRooms, room);
    refreshLiveSummaryFromRooms();
  });

  state.socket.on("live:viewer-count", ({ roomId, viewerCount }) => {
    state.liveRooms = state.liveRooms.map((room) => (room.id === roomId ? { ...room, viewerCount } : room));
    if (state.data.live?.id === roomId) {
      state.data.live.viewers = viewerCount;
      renderLivePanel();
      renderFeed();
    }
  });

  state.socket.on("live:chat", ({ roomId, message }) => {
    if (!state.data.live || state.data.live.id !== roomId) return;
    state.data.live.chat.push(message);
    state.data.live.chat = state.data.live.chat.slice(-120);
    renderLivePanel();
  });

  state.socket.on("live:viewer-joined", async ({ roomId, viewerSocketId }) => {
    if (!state.isLiveHost || state.liveRoomId !== roomId) return;
    await createOfferForViewer(viewerSocketId);
  });

  state.socket.on("live:viewer-left", ({ viewerSocketId }) => {
    closeLivePeer(viewerSocketId);
  });

  state.socket.on("live:signal", async (payload) => {
    await handleLiveSignal(payload);
  });

  state.socket.on("live:stopped", ({ roomId }) => {
    if (state.liveRoomId === roomId) {
      cleanupLiveState({ notifyServer: false });
    }
    state.liveRooms = state.liveRooms.filter((room) => room.id !== roomId);
    refreshLiveSummaryFromRooms();
  });
}

function getSocketConfig() {
  const configuredUrl = typeof window !== "undefined" ? String(window.ELCHETV_SOCKET_URL || "").trim() : "";
  const configuredPath = typeof window !== "undefined" ? String(window.ELCHETV_SOCKET_PATH || "").trim() : "";
  return {
    socketUrl: configuredUrl || window.location.origin,
    socketPath: configuredPath || DEFAULT_SOCKET_PATH
  };
}
function bindEvents() {
  el.forYouTab.addEventListener("click", () => {
    state.mode = "forYou";
    refreshModeTabs();
    renderFeed();
  });

  el.followingTab.addEventListener("click", () => {
    state.mode = "following";
    refreshModeTabs();
    renderFeed();
  });

  el.navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.id === "navUpload") {
        openUploadModal();
        return;
      }
      if (btn.dataset.view) switchView(btn.dataset.view);
    });
  });

  el.openUpload.addEventListener("click", openUploadModal);
  el.openLive.addEventListener("click", openLiveModal);
  el.startLiveBtn.addEventListener("click", openLiveModal);
  el.joinLiveBtn.addEventListener("click", joinLiveAsViewer);
  el.leaveLiveBtn.addEventListener("click", leaveLiveRoom);
  el.openLiveFromRail.addEventListener("click", () => switchView("liveView"));

  el.videoFile.addEventListener("change", () => {
    const file = el.videoFile.files?.[0];
    if (!file) return;
    state.pendingUploadFile = file;
    el.fileLabel.textContent = file.name;
    releaseUploadPreviewUrl();
    state.uploadPreviewUrl = URL.createObjectURL(file);
    el.uploadPreview.src = state.uploadPreviewUrl;
    el.uploadPreview.style.display = "block";
  });

  el.publishBtn.addEventListener("click", publishVideo);

  el.feed.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const postId = btn.dataset.postId;
    if (action === "like" && postId) toggleLike(postId);
    if (action === "save" && postId) toggleSave(postId);
    if (action === "follow" && postId) toggleFollow(postId);
    if (action === "comment" && postId) openComments(postId);
    if (action === "share" && postId) sharePost(postId);
    if (action === "go-live") switchView("liveView");
    if (action === "open-upload") openUploadModal();
  });

  el.sendComment.addEventListener("click", submitComment);
  el.commentInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitComment();
    }
  });
  el.closeComments.addEventListener("click", () => el.commentsModal.close());

  el.searchBtn.addEventListener("click", () => runSearch(el.searchInput.value));
  el.searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch(el.searchInput.value);
    }
  });

  el.createProfileBtn.addEventListener("click", createProfile);
  el.profileEditBtn.addEventListener("click", openProfileModal);
  el.editProfileBtn.addEventListener("click", openProfileModal);
  el.saveProfileBtn.addEventListener("click", saveProfileChanges);
  el.closeProfileModal.addEventListener("click", () => el.profileModal.close());

  el.goLiveBtn.addEventListener("click", goLive);
  el.stopLiveBtn.addEventListener("click", stopLive);
  el.closeLiveModal.addEventListener("click", () => el.liveModal.close());
  el.sendLiveChat.addEventListener("click", submitLiveChat);
  el.liveChatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitLiveChat();
    }
  });
}

async function renderEverything() {
  refreshModeTabs();
  refreshBottomNav();
  await renderFeed();
  renderTrendingTags();
  renderNotifications();
  renderLivePanel();
  renderProfile();
}

function refreshModeTabs() {
  el.forYouTab.classList.toggle("active", state.mode === "forYou");
  el.followingTab.classList.toggle("active", state.mode === "following");
}

function refreshBottomNav() {
  el.navBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === state.view));
}

function switchView(viewId) {
  state.view = viewId;
  el.views.forEach((view) => view.classList.toggle("active", view.id === viewId));
  refreshBottomNav();
  if (viewId === "profileView") renderProfile();
  if (viewId === "notifView") renderNotifications();
  if (viewId === "liveView") {
    state.socket?.emit("live:list");
    renderLivePanel();
  }
}

function getUserById(id) {
  if (!id) return null;
  if (state.data.user?.id === id) return state.data.user;
  return state.data.users.find((u) => u.id === id) || null;
}

function getAllUsers() {
  return state.data.user ? state.data.users.concat([state.data.user]) : state.data.users.slice();
}

function getPostsForFeed() {
  const visible = state.data.posts
    .filter((post) => post.privacy === "public" || post.authorId === state.data.user?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (state.mode === "forYou") return visible;
  if (!state.data.following.length) return [];
  return visible.filter((post) => state.data.following.includes(post.authorId) || post.authorId === state.data.user?.id);
}

function buildFeedEntries(posts) {
  const entries = [];
  if (state.data.live?.active) entries.push({ type: "live" });
  let intervalIndex = 0;
  let count = 0;
  let next = AD_INTERVALS[intervalIndex];
  posts.forEach((post) => {
    entries.push({ type: "post", post });
    count += 1;
    if (count >= next) {
      entries.push({ type: "ad", key: `ad_${post.id}_${intervalIndex}` });
      count = 0;
      intervalIndex = (intervalIndex + 1) % AD_INTERVALS.length;
      next = AD_INTERVALS[intervalIndex];
    }
  });
  return entries;
}
async function renderFeed() {
  teardownObserver();
  releaseFeedObjectUrls();
  const entries = buildFeedEntries(getPostsForFeed());
  el.feed.innerHTML = "";

  if (!entries.length) {
    el.feed.innerHTML = '<div class="empty-state">No hay videos para mostrar todavia.</div>';
    return;
  }

  for (const entry of entries) {
    if (entry.type === "live") {
      el.feed.append(createLiveFeedCard());
      continue;
    }
    if (entry.type === "ad") {
      el.feed.append(createAdCard(entry.key));
      continue;
    }

    const post = entry.post;
    const user = getUserById(post.authorId);
    const card = document.createElement("article");
    card.className = "video-card";

    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = await resolveVideoSource(post);

    const liked = !!state.data.user && post.likes.includes(state.data.user.id);
    const saved = !!state.data.user && post.savedBy.includes(state.data.user.id);
    const following = state.data.following.includes(post.authorId);
    const own = post.authorId === state.data.user?.id;
    const tags = post.tags.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join("");

    const overlay = document.createElement("div");
    overlay.className = "video-overlay";
    overlay.innerHTML = `
      <div class="video-meta">
        <h3>@${escapeHtml(user?.username || "creador")}</h3>
        <p>${escapeHtml(post.caption)}</p>
        <div class="tags">${tags}</div>
      </div>
      <div class="actions">
        <button class="icon-btn ${liked ? "active" : ""}" data-action="like" data-post-id="${post.id}">Like<small>${post.likes.length}</small></button>
        <button class="icon-btn" data-action="comment" data-post-id="${post.id}">Comentar<small>${post.comments.length}</small></button>
        <button class="icon-btn ${saved ? "active" : ""}" data-action="save" data-post-id="${post.id}">Guardar<small>${post.savedBy.length}</small></button>
        <button class="icon-btn" data-action="share" data-post-id="${post.id}">Compartir<small>${post.shares}</small></button>
        ${own ? "" : `<button class="icon-btn ${following ? "active" : ""}" data-action="follow" data-post-id="${post.id}">${following ? "Siguiendo" : "Seguir"}<small>@${escapeHtml(user?.username || "")}</small></button>`}
      </div>
    `;

    card.append(video, overlay);
    el.feed.append(card);
  }

  setupVideoObserver();
}

function createAdCard(key) {
  const card = document.createElement("article");
  card.className = "ad-card";
  card.dataset.key = key;
  card.innerHTML = `
    <p class="sponsored">Publicidad</p>
    <h3>elchetv Ads</h3>
    <p>Publica, transmite y crece tu audiencia en elchetv.</p>
    <button data-action="open-upload">Crear contenido</button>
  `;
  return card;
}

function createLiveFeedCard() {
  const live = state.data.live;
  const host = getUserById(live?.hostUserId);
  const hostName = live?.hostUsername || host?.username || "creador";
  const card = document.createElement("article");
  card.className = "ad-card live-feed-card";
  card.innerHTML = `
    <p class="sponsored">Ahora en vivo</p>
    <h3>LIVE: ${escapeHtml(live?.title || "Directo")}</h3>
    <p>@${escapeHtml(hostName)} · ${live?.viewers || 0} viewers</p>
    <button data-action="go-live">Entrar al LIVE</button>
  `;
  return card;
}

function teardownObserver() {
  if (!state.videoObserver) return;
  state.videoObserver.disconnect();
  state.videoObserver = null;
}

function setupVideoObserver() {
  const videos = [...el.feed.querySelectorAll("video")];
  if (!videos.length) return;
  state.videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.65) entry.target.play().catch(() => {});
        else entry.target.pause();
      });
    },
    { threshold: [0.25, 0.65, 0.9] }
  );
  videos.forEach((video) => state.videoObserver.observe(video));
}
function toggleLike(postId) {
  if (!requireAuth()) return;
  const post = state.data.posts.find((p) => p.id === postId);
  if (!post) return;
  const i = post.likes.indexOf(state.data.user.id);
  if (i >= 0) post.likes.splice(i, 1);
  else {
    post.likes.push(state.data.user.id);
    pushNotification(`Te gusto un video de @${getUserById(post.authorId)?.username || "creador"}`);
  }
  saveState();
  renderFeed();
  renderProfile();
}

function toggleSave(postId) {
  if (!requireAuth()) return;
  const post = state.data.posts.find((p) => p.id === postId);
  if (!post) return;
  const i = post.savedBy.indexOf(state.data.user.id);
  if (i >= 0) post.savedBy.splice(i, 1);
  else post.savedBy.push(state.data.user.id);
  saveState();
  renderFeed();
}

function toggleFollow(postId) {
  if (!requireAuth()) return;
  const post = state.data.posts.find((p) => p.id === postId);
  if (!post || post.authorId === state.data.user.id) return;
  const user = getUserById(post.authorId);
  const i = state.data.following.indexOf(post.authorId);
  if (i >= 0) {
    state.data.following.splice(i, 1);
    if (user && Number.isFinite(user.followers)) user.followers = Math.max(0, user.followers - 1);
  } else {
    state.data.following.push(post.authorId);
    if (user && Number.isFinite(user.followers)) user.followers += 1;
    pushNotification(`Ahora sigues a @${user?.username || "creador"}`);
  }
  saveState();
  renderFeed();
  renderProfile();
}

async function sharePost(postId) {
  const post = state.data.posts.find((p) => p.id === postId);
  if (!post) return;
  post.shares += 1;
  saveState();
  renderFeed();

  const user = getUserById(post.authorId);
  const text = `Mira este video de @${user?.username || "creador"} en elchetv`;

  if (navigator.share) {
    try {
      await navigator.share({ title: "elchetv", text });
      pushNotification("Compartiste un video");
      renderNotifications();
      return;
    } catch {}
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      pushNotification("Texto para compartir copiado");
    } catch {
      pushNotification("No se pudo copiar para compartir");
    }
    renderNotifications();
  }
}

function openComments(postId) {
  state.currentCommentsPostId = postId;
  renderComments();
  el.commentsModal.showModal();
}

function renderComments() {
  const post = state.data.posts.find((p) => p.id === state.currentCommentsPostId);
  if (!post) return;
  el.commentsList.innerHTML = "";
  if (!post.comments.length) {
    el.commentsList.innerHTML = '<li class="empty-state">No hay comentarios todavia.</li>';
    return;
  }
  post.comments.forEach((c) => {
    const li = document.createElement("li");
    li.className = "comment-item";
    li.innerHTML = `<strong>@${escapeHtml(c.username)}</strong><p>${escapeHtml(c.text)}</p>`;
    el.commentsList.append(li);
  });
}

function submitComment() {
  if (!requireAuth()) return;
  const text = el.commentInput.value.trim();
  if (!text) return;
  const post = state.data.posts.find((p) => p.id === state.currentCommentsPostId);
  if (!post) return;
  post.comments.push({ id: `c_${Date.now()}`, userId: state.data.user.id, username: state.data.user.username, text, createdAt: new Date().toISOString() });
  el.commentInput.value = "";
  saveState();
  renderComments();
  renderFeed();
}

function openUploadModal() {
  if (!requireAuth()) return;
  el.uploadModal.showModal();
}

async function publishVideo() {
  if (!requireAuth()) return;
  const file = state.pendingUploadFile;
  if (!file) {
    el.fileLabel.textContent = "Selecciona un video antes de publicar";
    return;
  }

  const caption = el.captionInput.value.trim() || "Nuevo video";
  const tags = (el.tagsInput.value.trim() || "")
    .split(/[\s,]+/)
    .map((t) => t.replace(/^#/, "").toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
  const privacy = document.querySelector('input[name="privacy"]:checked')?.value || "public";

  const videoBlobId = `v_${Date.now()}`;
  await putVideoBlob(videoBlobId, file);

  state.data.posts.push({
    id: `p_${Date.now()}`,
    authorId: state.data.user.id,
    caption,
    tags,
    videoUrl: null,
    videoBlobId,
    privacy,
    createdAt: new Date().toISOString(),
    likes: [],
    savedBy: [],
    comments: [],
    shares: 0
  });

  pushNotification("Publicaste un nuevo video");
  saveState();
  resetUploadForm();
  el.uploadModal.close();
  switchView("feedView");
  await renderFeed();
  renderTrendingTags();
  renderNotifications();
  renderProfile();
}

function resetUploadForm() {
  state.pendingUploadFile = null;
  el.videoFile.value = "";
  el.fileLabel.textContent = "Selecciona un video";
  releaseUploadPreviewUrl();
  el.uploadPreview.removeAttribute("src");
  el.uploadPreview.style.display = "none";
  el.captionInput.value = "";
  el.tagsInput.value = "";
}
function openLiveModal() {
  if (!requireAuth()) return;
  const live = state.data.live || {};
  el.liveTitleInput.value = live.title || "";
  el.liveTopicInput.value = live.topic || "";
  setMessage(el.liveMsg, "", "error");
  el.liveModal.showModal();
}

async function goLive() {
  if (!requireAuth()) return;
  if (!state.socket?.connected) {
    setMessage(el.liveMsg, "No hay conexion con el servidor LIVE.", "error");
    return;
  }

  const title = el.liveTitleInput.value.trim();
  const topic = el.liveTopicInput.value.trim().toLowerCase() || "general";
  if (title.length < 4) {
    setMessage(el.liveMsg, "Escribe un titulo de al menos 4 caracteres.", "error");
    return;
  }

  if (state.liveRoomId && (state.isLiveHost || state.isLiveViewer)) {
    setMessage(el.liveMsg, "Ya estas dentro de un LIVE.", "error");
    return;
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  } catch {
    setMessage(el.liveMsg, "Permite camara y microfono para iniciar LIVE.", "error");
    return;
  }

  const response = await emitWithAck("live:start", {
    title,
    topic,
    hostUserId: state.data.user.id,
    hostUsername: state.data.user.username
  });

  if (!response?.ok) {
    stopTracks(stream);
    setMessage(el.liveMsg, response?.message || "No se pudo iniciar el LIVE.", "error");
    return;
  }

  state.isLiveHost = true;
  state.isLiveViewer = false;
  state.liveRoomId = response.room.id;
  state.liveHostSocketId = response.room.hostSocketId;
  state.liveLocalStream = stream;
  state.liveRemoteStream = null;
  attachLiveStream(stream, true);

  state.data.live = roomToLiveState(response.room);
  state.data.live.chat = [];

  pushNotification(`Iniciaste LIVE: ${title}`);
  saveState();
  setMessage(el.liveMsg, "LIVE activo", "ok");
  setTimeout(() => el.liveModal.open && el.liveModal.close(), 220);
  switchView("liveView");
  renderLivePanel();
  renderFeed();
  renderNotifications();
}

async function stopLive() {
  if (!state.isLiveHost || !state.liveRoomId) return;
  await emitWithAck("live:stop", { roomId: state.liveRoomId });
  cleanupLiveState({ notifyServer: false });
  state.data.live = null;
  pushNotification("Finalizaste tu LIVE");
  renderLivePanel();
  renderFeed();
  renderNotifications();
}

async function joinLiveAsViewer() {
  if (!state.socket?.connected) return;
  if (state.isLiveHost) return;

  const selectedRoom = state.liveRooms.find((room) => room.id === state.data.live?.id) || state.liveRooms[0];
  if (!selectedRoom) {
    setMessage(el.liveMsg, "No hay LIVE activo para unirse.", "error");
    return;
  }

  if (state.isLiveViewer && state.liveRoomId === selectedRoom.id) {
    setMessage(el.liveMsg, "Ya estas viendo este LIVE.", "ok");
    return;
  }

  if (state.isLiveViewer && state.liveRoomId && state.liveRoomId !== selectedRoom.id) {
    await leaveLiveRoom();
  }

  const viewer = state.data.user
    ? { userId: state.data.user.id, username: state.data.user.username }
    : { userId: `guest_${Date.now()}`, username: `invitado_${Math.floor(Math.random() * 999)}` };

  state.isLiveViewer = true;
  state.isLiveHost = false;
  state.liveRoomId = selectedRoom.id;
  state.liveHostSocketId = selectedRoom.hostSocketId;
  state.liveRemoteStream = null;
  clearLiveVideo();

  const response = await emitWithAck("live:join", {
    roomId: selectedRoom.id,
    userId: viewer.userId,
    username: viewer.username
  });

  if (!response?.ok) {
    cleanupLiveState({ notifyServer: false });
    setMessage(el.liveMsg, response?.message || "No se pudo unir al LIVE.", "error");
    return;
  }

  state.liveRoomId = response.room.id;
  state.liveHostSocketId = response.room.hostSocketId;
  state.data.live = roomToLiveState(response.room);
  state.data.live.chat = [];

  setMessage(el.liveMsg, "Conectando al LIVE...", "ok");
  renderLivePanel();
}

async function leaveLiveRoom() {
  if (!state.liveRoomId) return;
  if (state.isLiveViewer) {
    state.socket?.emit("live:leave", { roomId: state.liveRoomId });
  }
  cleanupLiveState({ notifyServer: false });
  refreshLiveSummaryFromRooms();
  renderLivePanel();
}

function submitLiveChat() {
  const live = state.data.live;
  if (!live?.active || !state.liveRoomId) {
    setMessage(el.liveMsg, "No hay LIVE activo en este momento.", "error");
    return;
  }
  const text = el.liveChatInput.value.trim();
  if (!text) return;

  const sender = state.data.user
    ? { userId: state.data.user.id, username: state.data.user.username }
    : { userId: `guest_${Date.now()}`, username: "invitado" };

  state.socket?.emit("live:chat", {
    roomId: state.liveRoomId,
    userId: sender.userId,
    username: sender.username,
    text
  });

  el.liveChatInput.value = "";
}

async function createOfferForViewer(viewerSocketId) {
  const pc = createLivePeer(viewerSocketId, true);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  state.socket?.emit("live:signal", {
    roomId: state.liveRoomId,
    targetSocketId: viewerSocketId,
    type: "offer",
    data: offer
  });
}

function createLivePeer(peerSocketId, asHost) {
  if (state.livePeers.has(peerSocketId)) return state.livePeers.get(peerSocketId);

  const pc = new RTCPeerConnection(state.rtcConfig || DEFAULT_RTC_CONFIG);
  state.livePeers.set(peerSocketId, pc);

  if (asHost && state.liveLocalStream) {
    state.liveLocalStream.getTracks().forEach((track) => pc.addTrack(track, state.liveLocalStream));
  }

  pc.onicecandidate = (event) => {
    if (!event.candidate) return;
    state.socket?.emit("live:signal", {
      roomId: state.liveRoomId,
      targetSocketId: peerSocketId,
      type: "ice-candidate",
      data: event.candidate
    });
  };

  if (!asHost) {
    pc.ontrack = (event) => {
      const stream = event.streams?.[0];
      if (!stream) return;
      state.liveRemoteStream = stream;
      attachLiveStream(stream, false);
      setMessage(el.liveMsg, "Conectado al LIVE", "ok");
    };
  }

  pc.onconnectionstatechange = () => {
    if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
      closeLivePeer(peerSocketId);
    }
  };

  return pc;
}

async function handleLiveSignal({ roomId, fromSocketId, type, data }) {
  if (!roomId || roomId !== state.liveRoomId) return;

  if (type === "offer" && state.isLiveViewer) {
    const pc = createLivePeer(fromSocketId, false);
    await pc.setRemoteDescription(new RTCSessionDescription(data));
    await flushQueuedCandidates(fromSocketId);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    state.socket?.emit("live:signal", {
      roomId,
      targetSocketId: fromSocketId,
      type: "answer",
      data: answer
    });
    return;
  }

  if (type === "answer" && state.isLiveHost) {
    const pc = state.livePeers.get(fromSocketId);
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(data));
    await flushQueuedCandidates(fromSocketId);
    return;
  }

  if (type === "ice-candidate") {
    const asHost = state.isLiveHost;
    const pc = createLivePeer(fromSocketId, asHost);
    if (!pc.remoteDescription) {
      queueIceCandidate(fromSocketId, data);
      return;
    }
    try {
      await pc.addIceCandidate(new RTCIceCandidate(data));
    } catch {}
  }
}

function closeLivePeer(peerSocketId) {
  const pc = state.livePeers.get(peerSocketId);
  if (!pc) return;
  pc.onicecandidate = null;
  pc.ontrack = null;
  try {
    pc.close();
  } catch {}
  state.livePeers.delete(peerSocketId);
  state.livePendingCandidates.delete(peerSocketId);
}

function cleanupLiveState(options = {}) {
  const notifyServer = options.notifyServer === true;

  if (notifyServer && state.isLiveHost && state.liveRoomId) {
    state.socket?.emit("live:stop", { roomId: state.liveRoomId });
  }
  if (notifyServer && state.isLiveViewer && state.liveRoomId) {
    state.socket?.emit("live:leave", { roomId: state.liveRoomId });
  }

  state.livePeers.forEach((_pc, peerSocketId) => {
    closeLivePeer(peerSocketId);
  });
  state.livePeers.clear();
  state.livePendingCandidates.clear();

  if (state.liveLocalStream) {
    stopTracks(state.liveLocalStream);
  }

  state.liveLocalStream = null;
  state.liveRemoteStream = null;
  state.liveRoomId = null;
  state.liveHostSocketId = null;
  state.isLiveHost = false;
  state.isLiveViewer = false;
  clearLiveVideo();
}

function queueIceCandidate(peerSocketId, candidate) {
  const list = state.livePendingCandidates.get(peerSocketId) || [];
  list.push(candidate);
  state.livePendingCandidates.set(peerSocketId, list);
}

async function flushQueuedCandidates(peerSocketId) {
  const pc = state.livePeers.get(peerSocketId);
  const queue = state.livePendingCandidates.get(peerSocketId);
  if (!pc || !queue?.length) return;
  for (const candidate of queue) {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch {}
  }
  state.livePendingCandidates.delete(peerSocketId);
}

function stopTracks(stream) {
  stream.getTracks().forEach((track) => track.stop());
}

function attachLiveStream(stream, asHostPreview) {
  el.liveVideo.srcObject = stream;
  el.liveVideo.muted = asHostPreview;
  if (asHostPreview) {
    el.liveVideo.setAttribute("muted", "");
  } else {
    el.liveVideo.removeAttribute("muted");
  }
}

function clearLiveVideo() {
  if (el.liveVideo.srcObject) {
    el.liveVideo.srcObject = null;
  }
  el.liveVideo.muted = false;
}

function roomToLiveState(room) {
  const currentChat = state.data.live?.id === room.id && Array.isArray(state.data.live.chat) ? state.data.live.chat : [];
  return {
    id: room.id,
    active: true,
    title: room.title,
    topic: room.topic,
    hostUserId: room.hostUserId,
    hostUsername: room.hostUsername,
    hostSocketId: room.hostSocketId,
    viewers: room.viewerCount || 0,
    chat: currentChat
  };
}

function mergeLiveRoom(list, incomingRoom) {
  if (!incomingRoom?.id) return list;
  const found = list.find((room) => room.id === incomingRoom.id);
  if (!found) return list.concat([incomingRoom]);
  return list.map((room) => (room.id === incomingRoom.id ? { ...room, ...incomingRoom } : room));
}

function refreshLiveSummaryFromRooms() {
  if (state.liveRoomId) {
    const currentRoom = state.liveRooms.find((room) => room.id === state.liveRoomId);
    if (currentRoom) {
      state.data.live = roomToLiveState(currentRoom);
      renderLivePanel();
      renderFeed();
      return;
    }
  }

  if (state.liveRooms.length) {
    state.data.live = roomToLiveState(state.liveRooms[0]);
  } else {
    state.data.live = null;
  }

  renderLivePanel();
  renderFeed();
}

function renderLivePanel() {
  const live = state.data.live;
  if (!live?.active) {
    el.liveStatusText.textContent = "No hay transmision activa.";
    el.liveBadge.textContent = "OFFLINE";
    el.liveBadge.classList.remove("on");
    el.liveViewers.textContent = "0 viewers";
    el.liveRailText.textContent = "No hay directos activos.";
    el.liveChatList.innerHTML = '<li class="empty-state">Cuando inicies LIVE veras el chat aqui.</li>';
    el.joinLiveBtn.style.display = "inline-block";
    el.leaveLiveBtn.style.display = "none";
    el.stopLiveBtn.style.display = "none";
    if (!state.isLiveHost && !state.isLiveViewer) clearLiveVideo();
    return;
  }

  const hostName = live.hostUsername || getUserById(live.hostUserId)?.username || "creador";
  el.liveStatusText.textContent = `${live.title} · #${live.topic} · @${hostName}`;
  el.liveBadge.textContent = "EN VIVO";
  el.liveBadge.classList.add("on");
  el.liveViewers.textContent = `${live.viewers} viewers`;
  el.liveRailText.textContent = `LIVE activo: ${live.title}`;

  el.joinLiveBtn.style.display = state.isLiveHost || state.isLiveViewer ? "none" : "inline-block";
  el.leaveLiveBtn.style.display = state.isLiveViewer ? "inline-block" : "none";
  el.stopLiveBtn.style.display = state.isLiveHost ? "inline-block" : "none";

  el.liveChatList.innerHTML = "";
  const chatItems = Array.isArray(live.chat) ? live.chat.slice(-40) : [];
  if (!chatItems.length) {
    el.liveChatList.innerHTML = '<li class="empty-state">Sin mensajes todavia.</li>';
    return;
  }

  chatItems.forEach((msg) => {
    const li = document.createElement("li");
    li.className = "comment-item";
    li.innerHTML = `<strong>@${escapeHtml(msg.username)}</strong><p>${escapeHtml(msg.text)}</p>`;
    el.liveChatList.append(li);
  });
}
function runSearch(query) {
  const term = query.trim().toLowerCase();
  if (!term) {
    el.searchResults.innerHTML = '<div class="empty-state">Escribe algo para buscar.</div>';
    return;
  }
  const q = term.replace("#", "");
  const users = getAllUsers().filter((u) => u.username.toLowerCase().includes(q));
  const posts = state.data.posts.filter((p) => p.caption.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)));

  const rows = [];
  users.forEach((u) => rows.push(`<div class="search-item"><strong>@${escapeHtml(u.username)}</strong><p>${escapeHtml(u.bio || "")}</p></div>`));
  posts.slice(0, 12).forEach((p) => rows.push(`<div class="search-item"><strong>@${escapeHtml(getUserById(p.authorId)?.username || "creador")}</strong><p>${escapeHtml(p.caption)}</p></div>`));

  el.searchResults.innerHTML = rows.length ? rows.join("") : '<div class="empty-state">Sin resultados para esa busqueda.</div>';
}

function renderTrendingTags() {
  const counts = new Map();
  state.data.posts.forEach((p) => p.tags.forEach((t) => counts.set(t.toLowerCase(), (counts.get(t.toLowerCase()) || 0) + 1)));
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14);
  fillTagContainer(el.trendingTags, sorted);
  fillTagContainer(el.trendingTagsRail, sorted);
}

function fillTagContainer(container, sorted) {
  container.innerHTML = "";
  if (!sorted.length) {
    container.innerHTML = '<div class="empty-state">Aun no hay hashtags en tendencia.</div>';
    return;
  }
  sorted.forEach(([tag, count]) => {
    const btn = document.createElement("button");
    btn.className = "tag-chip";
    btn.textContent = `#${tag} (${count})`;
    btn.addEventListener("click", () => {
      el.searchInput.value = `#${tag}`;
      runSearch(`#${tag}`);
      switchView("exploreView");
    });
    container.append(btn);
  });
}

function pushNotification(text) {
  state.data.notifications.unshift({ id: `n_${Date.now()}_${Math.floor(Math.random() * 1000)}`, text, createdAt: new Date().toISOString() });
  state.data.notifications = state.data.notifications.slice(0, 80);
  saveState();
}

function renderNotifications() {
  el.notifList.innerHTML = "";
  if (!state.data.notifications.length) {
    el.notifList.innerHTML = '<li class="empty-state">Sin notificaciones por ahora.</li>';
    return;
  }
  state.data.notifications.forEach((n) => {
    const li = document.createElement("li");
    li.className = "notif-item";
    const time = new Date(n.createdAt).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
    li.innerHTML = `<strong>${escapeHtml(n.text)}</strong><p>${time}</p>`;
    el.notifList.append(li);
  });
}

function hydrateProfileHeader() {
  const user = state.data.user;
  if (!user) {
    el.profileAvatar.textContent = "E";
    el.profileName.textContent = "@invitado";
    el.profileBio.textContent = "Crea tu perfil para empezar";
    el.quickUser.textContent = "@invitado";
    return;
  }
  el.profileAvatar.textContent = user.username.slice(0, 1).toUpperCase();
  el.profileName.textContent = `@${user.username}`;
  el.profileBio.textContent = user.bio || "Creador en elchetv";
  el.quickUser.textContent = `@${user.username}`;
}

function renderProfile() {
  hydrateProfileHeader();
  releaseProfileObjectUrls();

  if (!state.data.user) {
    el.statPosts.textContent = "0";
    el.statLikes.textContent = "0";
    el.statFollowers.textContent = "0";
    el.quickPosts.textContent = "0";
    el.quickLikes.textContent = "0";
    el.quickFollowers.textContent = "0";
    el.profilePosts.innerHTML = '<div class="empty-state">Crea un perfil para ver estadisticas.</div>';
    return;
  }

  const own = state.data.posts.filter((p) => p.authorId === state.data.user.id);
  const likes = own.reduce((sum, p) => sum + p.likes.length, 0);
  el.statPosts.textContent = String(own.length);
  el.statLikes.textContent = String(likes);
  el.statFollowers.textContent = String(state.data.user.followers || 0);
  el.quickPosts.textContent = String(own.length);
  el.quickLikes.textContent = String(likes);
  el.quickFollowers.textContent = String(state.data.user.followers || 0);

  el.profilePosts.innerHTML = "";
  if (!own.length) {
    el.profilePosts.innerHTML = '<div class="empty-state">Aun no subiste videos.</div>';
    return;
  }

  own
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((post) => {
      const card = document.createElement("article");
      card.className = "profile-post";
      const video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.src = post.videoUrl || "";

      if (post.videoBlobId) {
        getVideoBlob(post.videoBlobId).then((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          state.profileObjectUrls.push(url);
          video.src = url;
        });
      }

      const badge = document.createElement("span");
      badge.textContent = `${post.likes.length} likes`;
      card.append(video, badge);
      el.profilePosts.append(card);
    });
}
function openProfileModal() {
  if (!requireAuth()) return;
  el.profileUsernameInput.value = state.data.user.username;
  el.profileBioInput.value = state.data.user.bio || "";
  setMessage(el.profileMsg, "", "error");
  el.profileModal.showModal();
}

function saveProfileChanges() {
  if (!requireAuth()) return;
  const validation = validateUsername(el.profileUsernameInput.value, state.data.user.id);
  if (!validation.ok) {
    setMessage(el.profileMsg, validation.message, "error");
    return;
  }

  const oldName = state.data.user.username;
  const newName = validation.username;
  state.data.user.username = newName;
  state.data.user.bio = el.profileBioInput.value.trim();

  state.data.posts.forEach((post) => {
    post.comments.forEach((comment) => {
      if (comment.userId === state.data.user.id) comment.username = newName;
    });
  });

  if (oldName !== newName) pushNotification(`Tu usuario ahora es @${newName}`);

  saveState();
  setMessage(el.profileMsg, "Perfil actualizado", "ok");
  setTimeout(() => el.profileModal.open && el.profileModal.close(), 220);
  renderProfile();
  renderFeed();
  renderNotifications();
}

function createProfile() {
  const validation = validateUsername(el.usernameInput.value);
  if (!validation.ok) {
    setMessage(el.onboardMsg, validation.message, "error");
    return;
  }

  state.data.user = {
    id: `u_${Date.now()}`,
    username: validation.username,
    bio: el.bioInput.value.trim(),
    followers: 0
  };

  setMessage(el.onboardMsg, "Perfil creado", "ok");
  saveState();
  setTimeout(() => el.onboardModal.open && el.onboardModal.close(), 220);
  renderProfile();
  renderFeed();
}

function validateUsername(raw, excludeId = null) {
  const username = raw.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
  if (username.length < 3) return { ok: false, message: "El usuario debe tener al menos 3 caracteres." };
  if (username.length > 24) return { ok: false, message: "Maximo 24 caracteres." };
  const exists = getAllUsers().some((u) => u.username.toLowerCase() === username && u.id !== excludeId);
  if (exists) return { ok: false, message: "Ese nombre ya existe." };
  return { ok: true, username };
}

function setMessage(target, text, type) {
  target.textContent = text;
  target.classList.toggle("ok", type === "ok");
}

function requireAuth() {
  if (state.data.user) return true;
  setMessage(el.onboardMsg, "Crea tu perfil para usar esta funcion.", "error");
  el.onboardModal.showModal();
  return false;
}

async function resolveVideoSource(post) {
  if (post.videoUrl) return post.videoUrl;
  if (!post.videoBlobId) return "";
  const blob = await getVideoBlob(post.videoBlobId);
  if (!blob) return "";
  const url = URL.createObjectURL(blob);
  state.feedObjectUrls.push(url);
  return url;
}

function releaseFeedObjectUrls() {
  state.feedObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  state.feedObjectUrls = [];
}

function releaseProfileObjectUrls() {
  state.profileObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  state.profileObjectUrls = [];
}

function releaseUploadPreviewUrl() {
  if (!state.uploadPreviewUrl) return;
  URL.revokeObjectURL(state.uploadPreviewUrl);
  state.uploadPreviewUrl = null;
}

function openMediaDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(VIDEO_STORE)) db.createObjectStore(VIDEO_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function putVideoBlob(id, blob) {
  return new Promise((resolve, reject) => {
    const tx = state.db.transaction(VIDEO_STORE, "readwrite");
    tx.objectStore(VIDEO_STORE).put({ id, blob });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function getVideoBlob(id) {
  return new Promise((resolve, reject) => {
    const tx = state.db.transaction(VIDEO_STORE, "readonly");
    const request = tx.objectStore(VIDEO_STORE).get(id);
    request.onsuccess = () => resolve(request.result?.blob || null);
    request.onerror = () => reject(request.error);
  });
}

function emitWithAck(eventName, payload) {
  return new Promise((resolve) => {
    if (!state.socket) {
      resolve({ ok: false, message: "Sin conexion de socket." });
      return;
    }
    state.socket.emit(eventName, payload, (response) => resolve(response));
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
