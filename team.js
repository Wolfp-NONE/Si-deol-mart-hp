document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-enter");
  setTimeout(() => document.body.classList.remove("page-enter"), 600);
});

function navigateTo(url) {
  document.body.classList.add("page-exit");
  setTimeout(() => { window.location.href = url; }, 480);
}

function goBack() { navigateTo("index.html"); }

// Swipe gesture
var startX = 0;
document.addEventListener("touchstart", function(e){ startX = e.touches[0].clientX; });
document.addEventListener("touchend", function(e){
  var diff = startX - e.changedTouches[0].clientX;
  if(diff > 50) goBack();
});
