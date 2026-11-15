/* runs before first paint. marks the page as "intro pending" so the invitation never flashes before the opening sequence.
   kept as a file (not inline) so the csp can stay strict. */
(function () {
  var root = document.documentElement;
  try {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) root.setAttribute('data-intro', 'loading');
  } catch (e) {}
  /* last resort if the app bundle never arrives: let people scroll and read the page instead of leaving them on the boot screen */
  setTimeout(function () {
    var s = root.getAttribute('data-intro');
    if (s === 'loading' || s === 'playing') root.setAttribute('data-intro', 'done');
  }, 36000);
})();
