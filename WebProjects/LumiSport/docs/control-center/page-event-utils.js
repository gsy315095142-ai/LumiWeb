/**
 * 公共工具：图片放大查看、ESC 关闭
 */
(function () {
  'use strict';

  window.EventUtils = {
    initOverlay: function () {
      var overlay = document.getElementById('imgOverlay');
      if (!overlay) return;
      overlay.addEventListener('click', function () {
        this.classList.remove('active');
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          var ol = document.getElementById('imgOverlay');
          if (ol) ol.classList.remove('active');
        }
      });
    },

    zoomImg: function (src) {
      var overlay = document.getElementById('imgOverlay');
      var img = document.getElementById('overlayImg');
      if (!overlay || !img) return;
      img.src = src;
      overlay.classList.add('active');
    }
  };

  window.zoomImg = function (src) { EventUtils.zoomImg(src); };
})();
