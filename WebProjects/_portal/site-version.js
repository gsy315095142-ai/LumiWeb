/**
 * 全站版本号：唯一数据源为同目录 projects.json 的 "version" 字段。
 * 页面用法：
 *   <span data-site-version></span>
 *   <a href="..." data-version-href="path/to/page.html">
 *   <script src=".../_portal/site-version.js"></script>
 */
(function () {
  var script = document.currentScript;
  if (!script || !script.src) return;

  var jsonUrl = script.src.replace(/\/[^/]+$/, '/projects.json');

  fetch(jsonUrl)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var version = data && data.version;
      if (!version) return;

      var label = 'v' + version;

      document.querySelectorAll('[data-site-version]').forEach(function (el) {
        el.textContent = label;
      });

      document.querySelectorAll('[data-version-href]').forEach(function (el) {
        var base = el.getAttribute('data-version-href') || el.getAttribute('href') || '';
        base = base.split('?')[0];
        if (base) el.setAttribute('href', base + '?v=' + version);
      });
    })
    .catch(function () { /* file:// 或离线时保留 HTML 占位文案 */ });
})();
