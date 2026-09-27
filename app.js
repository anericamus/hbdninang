const chapters = ["hello", "birthday", "memories", "letter", "finale"];
const PHOTO_ROTATIONS = [-5, 4, -3, 6, 3, -5, 4];
const CONFETTI_COLORS = ["#a83d50", "#d79992", "#e6bd66", "#c1a3ac", "#fffaf4"];
const WISH_DELAY_MS = 2400;
const MUSIC_START_SECONDS = 127;
const photos = [
  "IMG_1394",
  "IMG_1395",
  "IMG_3961",
  "IMG_3962",
  "IMG_4820",
  "IMG_4821",
  "IMG_4822",
];
let musicWanted = true;
let currentChapter = "hello";
let photoIndex = 0;
const music = document.querySelector("#background-music");
let musicPositioned = false;
let musicStarted = false;
music.volume = 0.35;
const video = document.querySelector("#birthday-video");
const musicButton = document.querySelector("#sound");

function updateMusicButton(playing) {
  musicButton.setAttribute("aria-pressed", String(playing));
  musicButton.querySelector("span").textContent = playing
    ? "Music on"
    : "Play music";
}

function positionMusic() {
  if (musicPositioned) return true;
  if (music.readyState < 1) return false;
  music.currentTime =
    Number.isFinite(music.duration) && music.duration <= MUSIC_START_SECONDS
      ? 0
      : MUSIC_START_SECONDS;
  musicPositioned = true;
  music.autoplay = musicWanted;
  return true;
}

function playMusic() {
  if (!musicWanted || !video.paused || !positionMusic()) return;
  music.play().catch((error) => {
    if (error.name === "NotAllowedError") {
      updateMusicButton(false);
      musicButton.querySelector("span").textContent = "Tap to play music";
    } else if (error.name !== "AbortError")
      musicButton.querySelector("span").textContent = "Music unavailable";
  });
}

function pauseMusic() {
  music.pause();
  updateMusicButton(false);
}

function showChapter(id) {
  if (!chapters.includes(id)) return;
  resetWish();
  if (currentChapter === "finale" && id !== "finale") video.pause();
  currentChapter = id;
  document.querySelectorAll(".scene").forEach((el) => {
    el.hidden = el.id !== id;
  });
  document.querySelectorAll("nav button").forEach((button) => {
    if (button.dataset.next === id) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
  document.querySelector("#chapter").textContent =
    `${String(chapters.indexOf(id) + 1).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}`;
  window.scrollTo({ top: 0, behavior: "instant" });
  playMusic();
  if (id === "birthday") launchConfetti();
  const heading = document.querySelector(`#${id} h1, #${id} h2`);
  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
}
document
  .querySelectorAll("[data-next]")
  .forEach((button) =>
    button.addEventListener("click", () => showChapter(button.dataset.next)),
  );
document.querySelector(".wordmark").addEventListener("click", (event) => {
  event.preventDefault();
  showChapter("hello");
});
musicButton.addEventListener("click", () => {
  if (!music.paused) {
    musicWanted = false;
    pauseMusic();
  } else {
    musicWanted = true;
    if (!video.paused) video.pause();
    playMusic();
  }
});
music.addEventListener("loadedmetadata", () => {
  positionMusic();
  playMusic();
});
// Attempt playback as soon as audio is ready; retry on a real user gesture
// if the browser does not permit audible autoplay.
music.addEventListener("canplay", () => {
  if (!musicStarted) playMusic();
});

function startMusicOnInteraction(event) {
  if (
    event.target instanceof Element &&
    event.target.closest("#sound, #birthday-video")
  )
    return;
  if (
    event.type === "keydown" &&
    (event.repeat || !["Enter", " "].includes(event.key))
  )
    return;
  if (!musicStarted && musicWanted) playMusic();
}
document.addEventListener("click", startMusicOnInteraction);
document.addEventListener("keydown", startMusicOnInteraction);
music.addEventListener("play", () => {
  if (!video.paused || !musicWanted) {
    pauseMusic();
    return;
  }
  musicStarted = true;
  document.removeEventListener("click", startMusicOnInteraction);
  document.removeEventListener("keydown", startMusicOnInteraction);
  updateMusicButton(true);
});
music.addEventListener("pause", () => updateMusicButton(false));
music.addEventListener("ended", () => {
  musicPositioned = false;
  playMusic();
});
music.addEventListener("error", () => {
  updateMusicButton(false);
  musicButton.querySelector("span").textContent = "Music unavailable";
});
playMusic();
video.addEventListener("play", pauseMusic);
video.addEventListener("pause", playMusic);
video.addEventListener("ended", () => {
  playMusic();
  launchConfetti();
});

function launchConfetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const box = document.querySelector("#confetti");
  for (let i = 0; i < 75; i++) {
    const el = document.createElement("i");
    el.className = "confetti-piece";
    el.style.cssText = `--left:${Math.random() * 100}%;--duration:${2 + Math.random() * 2}s;--color:${CONFETTI_COLORS[i % CONFETTI_COLORS.length]};--drift:${Math.random() * 250 - 125}px;--spin:${Math.random() * 360}deg;animation-delay:${Math.random() * 0.5}s`;
    box.append(el);
    setTimeout(() => el.remove(), 5000);
  }
}
const wishButton = document.querySelector("#wish");
let wishTimer = null;

function resetWish() {
  clearTimeout(wishTimer);
  wishTimer = null;
  wishButton.disabled = false;
  wishButton.removeAttribute("aria-busy");
  wishButton.classList.remove("is-wishing");
  wishButton.textContent = "Make a wish ✧";
  document.querySelector("#wish-note").textContent = "";
}
wishButton.addEventListener("click", () => {
  if (wishTimer !== null) return;
  wishButton.disabled = true;
  wishButton.setAttribute("aria-busy", "true");
  wishButton.classList.add("is-wishing");
  wishButton.innerHTML =
    '<span class="wish-spinner" aria-hidden="true"></span><span>Making a little wish…</span>';
  document.querySelector("#wish-note").textContent = "Sana matupad, nang. ✧";
  launchConfetti();
  wishTimer = setTimeout(() => {
    if (currentChapter === "birthday") showChapter("memories");
    else resetWish();
  }, WISH_DELAY_MS);
});
const collage = document.querySelector("#collage");
photos.forEach((name, i) => {
  const button = document.createElement("button");
  button.className = "polaroid";
  button.style.setProperty("--rotation", `${PHOTO_ROTATIONS[i]}deg`);
  button.style.setProperty("--delay", `${i * 0.08}s`);
  button.setAttribute("aria-label", `Enlarge photo ${i + 1}`);
  const img = document.createElement("img");
  img.src = `assets/${name}.jpg?v=2`;
  img.alt = `Ninang’s scrapbook photo ${i + 1}`;
  img.loading = "lazy";
  button.append(img);
  const caption = document.createElement("span");
  caption.textContent = `a little memory · 0${i + 1}`;
  button.append(caption);
  button.onclick = () => {
    photoIndex = i;
    updatePhotoPreview();
    dialog.showModal();
  };
  collage.append(button);
});
const dialog = document.querySelector("#photo-dialog");

function updatePhotoPreview() {
  const photo = document.querySelector("#large-photo");
  photo.src = `assets/${photos[photoIndex]}.jpg?v=2`;
  photo.alt = `Ninang’s scrapbook photo ${photoIndex + 1}`;
  document.querySelector("#photo-count").textContent =
    `${photoIndex + 1} / ${photos.length}`;
}

function changePhoto(direction) {
  photoIndex = (photoIndex + direction + photos.length) % photos.length;
  updatePhotoPreview();
}
dialog.querySelector(".close").onclick = () => dialog.close();
dialog.querySelector(".photo-prev").onclick = () => changePhoto(-1);
dialog.querySelector(".photo-next").onclick = () => changePhoto(1);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  }
});
dialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") changePhoto(1);
  if (event.key === "ArrowLeft") changePhoto(-1);
});
