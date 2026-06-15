// === TOC: 给 section 加 id ===
(function(){
  var sections = document.querySelectorAll(".section-block");
  sections.forEach(function(s, i){ s.id = "sec-" + i; });

  // Build TOC dots
  var toc = document.getElementById("toc-float");
  if (!toc || sections.length === 0) return;
  sections.forEach(function(s, i){
    var titleEl = s.querySelector(".section-title");
    if (!titleEl) return;
    var title = titleEl.textContent.trim().substring(0, 20);
    var dot = document.createElement("div");
    dot.className = "toc-dot";
    dot.setAttribute("data-title", title);
    dot.onclick = function(){ s.scrollIntoView({ behavior: "smooth", block: "start" }); };
    toc.appendChild(dot);
  });
  var dots = toc.querySelectorAll(".toc-dot");

  // Show TOC on scroll
  var backTop = document.getElementById("back-top");
  window.addEventListener("scroll", function(){
    var scrolled = window.scrollY > 200;
    toc.classList.toggle("visible", scrolled);
    if (backTop) backTop.classList.toggle("visible", scrolled);

    // Highlight active section
    var current = -1;
    sections.forEach(function(s, i){
      var rect = s.getBoundingClientRect();
      if (rect.top < window.innerHeight / 3) current = i;
    });
    dots.forEach(function(d, i){ d.classList.toggle("active", i === current); });
  });

  // Back to top
  if (backTop) backTop.onclick = function(){ window.scrollTo({ top: 0, behavior: "smooth" }); };
})();



// === Nav dropdown ===
(function(){
  var groups = document.querySelectorAll(".nav-group");
  groups.forEach(function(g){
    var btn = g.querySelector(".nav-group-btn");
    var dd = g.querySelector(".nav-dropdown");
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      var isOpen = dd.classList.contains("open");
      // Close all
      groups.forEach(function(g2){
        g2.querySelector(".nav-dropdown").classList.remove("open");
        g2.querySelector(".nav-group-btn").classList.remove("open");
      });
      if (!isOpen) { dd.classList.add("open"); btn.classList.add("open"); }
    });
  });
  document.addEventListener("click", function(){
    groups.forEach(function(g){
      g.querySelector(".nav-dropdown").classList.remove("open");
      g.querySelector(".nav-group-btn").classList.remove("open");
    });
  });
})();
