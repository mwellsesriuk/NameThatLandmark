//Taken from http://codepen.io/kairyou/pen/wcIlt

var width = $(".box").width();
    var height = $(".box").height();
    var doc = document,
      cvs = doc.getElementById('j-cvs'),
      ctx,
      config = {
          w: width,
          h: height
      },
      mouseDown = false;
    $("#map").css("width", width + 'px');
    $("#height").css("height", height + 'px');
  
    function getLocalCoords(elem, ev) {
        var ox = 0,
            oy = 0;
        var first;
        var pageX, pageY;
        while (elem != null) {
            ox += elem.offsetLeft;
            oy += elem.offsetTop;
            elem = elem.offsetParent;
        }
        if (ev.pageX) {
            pageX = ev.pageX;
            pageY = ev.pageY;
        }
        else if ("changedTouches" in ev) {
            first = ev.changedTouches[0];
            pageX = first.pageX;
            pageY = first.pageY;
        }
        else {
            pageX = ev.originalEvent.changedTouches[0].pageX;
            pageY = ev.originalEvent.changedTouches[0].pageY;
        }

        return {
            'x': pageX - ox,
            'y': pageY - oy
        };
    }

    function diffTransSize(cxt, threshold, callback) {
        if (!'getImageData' in ctx) return; // <=IE8 
        var imageData = ctx.getImageData(0, 0, cvs.width, cvs.height),
            pix = imageData.data,
            pixLength = pix.length,
            pixelSize = pixLength * 0.25;
        var i = 1,
            k, l = 0;
        for (; i <= pixelSize; i++) { // 3, 7, 11 -> 4n-1
            if (0 === pix[4 * i - 1]) l++;
        };
        var percentage = (l / pixelSize * 100);
        window.scratchPoints = Math.round((100 - percentage) * 100);
    }

    function scratchLine(cvs, x, y, fresh) {
        ctx = cvs.getContext('2d');
        // sumsung Android 4.1.2, 4.2.2 default browser does not render, http://goo.gl/H5lwgo
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 10;
        ctx.lineCap = ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(0,0,0,1)'; //'#000';
        if (fresh) {
            ctx.beginPath();
            // bug WebKit/Opera/IE9: +0.01
            ctx.moveTo(x + 0.1, y);
        }
        ctx.lineTo(x, y);
        ctx.stroke();
        // fix sumsung bug
        // var style = cvs.style; // cursor/lineHeight
        //style.lineHeight = style.lineHeight == '1' ? '1.1' : '1';

        diffTransSize(ctx);
    }

    function setupCanvases() {
        cvs.width = config.w;
        cvs.height = config.h;
        var ctx = cvs.getContext("2d");
        // add mask
        //ctx.fillStyle = '#CCC';
        var my_gradient = ctx.createLinearGradient(0, 0, 170, 0);
        my_gradient.addColorStop(0, "silver");
        my_gradient.addColorStop(1, "grey");
        ctx.fillStyle = my_gradient;
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        // On mouse down
        var mousedown_handler = function (e) {
            var local = getLocalCoords(cvs, e);
            mouseDown = true;
            scratchLine(cvs, local.x, local.y, true);
            if (e.cancelable) {
                e.preventDefault();
            }
            return false;
        };
        // On mouse move
        var mousemove_handler = function (e) {
            if (!mouseDown) {
                return true;
            }
            var local = getLocalCoords(cvs, e);
            scratchLine(cvs, local.x, local.y, false);

            if (e.cancelable) {
                e.preventDefault();
            }
            return false;
        };
        // On mouseup
        var mouseup_handler = function (e) {
            if (mouseDown) {
                mouseDown = false;
                if (e.cancelable) {
                    e.preventDefault();
                }
                return false;
            }
            return true;
        };

        $(".mask").on("mousedown", mousedown_handler);
        $(".mask").on("touchstart", mousedown_handler);
        $("body").on("mousemove", mousemove_handler);
        $("body").on("touchmove", mousemove_handler);
        $("body").on("mouseup", mouseup_handler);
        $("body").on("touchend", mouseup_handler);
    };