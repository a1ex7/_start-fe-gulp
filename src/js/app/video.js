const video = document.getElementById('js-video');
const playBtn = document.getElementById('js-playbtn');

playBtn.addEventListener('click', (e) => {
  e.preventDefault();
  playVideo(video);
  playBtn.classList.add('hidden');
});

const playVideo = (video) => {
  const src = video.dataset.src;
  video.setAttribute('src', src);
};
