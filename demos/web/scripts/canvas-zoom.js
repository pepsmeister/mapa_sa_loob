/*
=================================
canvas-zoom - v0.1
http://github.com/licaomeng/canvas-zoom

(c) 2015 Caomeng LI
This code may be freely distributed under the Apache License
=================================
 */

(function () {
    var root = this; // global object
    var CanvasZoom = function (options) {
        if (!options || !options.canvas) {
            throw 'CanvasZoom constructor: missing arguments canvas';
        }

        this.canvas = options.canvas;
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.context = this.canvas.getContext('2d');

        this.desktop = options.desktop || false; // non touch events

        this.scaleAdaption = 1;

        var indoormap = document.getElementById("indoormap");
        var pageWidth = parseInt(indoormap.getAttribute("width"));
        var pageHeight = parseInt(indoormap.getAttribute("height"));
        currentWidth = document.documentElement.clientWidth;
        currentHeight = document.documentElement.clientHeight;

        var offsetX = 0;
        var offsetY = 0;
        if (pageWidth < pageHeight) {//canvas.width < canvas.height
            this.scaleAdaption = currentHeight / pageHeight;
            if (pageWidth * this.scaleAdaption > currentWidth) {
                this.scaleAdaption = this.scaleAdaption * (currentWidth / (this.scaleAdaption * pageWidth));
            }
        } else {//canvas.width >= canvas.height
            this.scaleAdaption = currentWidth / pageWidth;
            if (pageHeight * this.scaleAdaption > currentHeight) {
                this.scaleAdaption = this.scaleAdaption * (currentHeight / (this.scaleAdaption * pageHeight));
            }
        }

        indoormap.setAttribute("width", pageWidth * this.scaleAdaption);
        indoormap.setAttribute("height", pageHeight * this.scaleAdaption);

        this.positionAdaption = {
            x: (parseInt(currentWidth) - parseInt(indoormap.getAttribute("width"))) / 2,
            y: (parseInt(currentHeight) - parseInt(indoormap.getAttribute("height"))) / 2
        };

        indoormap.setAttribute("width", currentWidth);
        indoormap.setAttribute("height", currentHeight);

        this.position = {
            x: 0,
            y: 0
        };

        this.scale = {
            x: 1,
            y: 1
        };

        this.focusPointer = {
            x: 0,
            y: 0
        }

        this.lastZoomScale = null;
        this.lastX = null;
        this.lastY = null;

        this.mdown = false; // desktop drag

        this.init = false;
        requestAnimationFrame(this.animate.bind(this));

        this.setEventListeners();
    };

    CanvasZoom.prototype = {
        animate: function () {
            // set scale such as image cover all the canvas
            if (!this.init) {
                var scaleRatio = null;
                if (this.canvas.clientWidth > this.canvas.clientHeight) {
                    scaleRatio = this.scale.x;
                } else {
                    scaleRatio = this.scale.y;
                }
                this.scale.x = scaleRatio;
                this.scale.y = scaleRatio;
                this.init = true;
            }
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // indoor map drawing function
            DrawMapInfo(this.scale.x * this.scaleAdaption, this.scale.y * this.scaleAdaption, this.position.x + this.positionAdaption.x, this.position.y + this.positionAdaption.y);
            requestAnimationFrame(this.animate.bind(this));
        },

        doMove: function (relativeX, relativeY) {
            if (this.lastX && this.lastY) {
                var deltaX = relativeX - this.lastX;
                var deltaY = relativeY - this.lastY;

                var currentWidth = (this.canvas.clientWidth * this.scale.x);
                var currentHeight = (this.canvas.clientHeight * this.scale.y);

                this.position.x += deltaX;
                this.position.y += deltaY;

                // edge cases
                if (this.position.x > 0) {
                    this.position.x = 0;
                } else if (this.position.x + currentWidth < this.canvas.clientWidth) {
                    this.position.x = this.canvas.width - currentWidth;
                }
                if (this.position.y > 0) {
                    this.position.y = 0;
                } else if (this.position.y + currentHeight < this.canvas.clientHeight) {
                    this.position.y = this.canvas.height - currentHeight;
                }
            }
            this.lastX = relativeX;
            this.lastY = relativeY;
        },

        setEventListeners: function () {
            if (this.desktop) {
                // keyboard+mouse
                window.addEventListener('keyup', function (e) {
                    if (e.keyCode == 187 || e.keyCode == 61) { // +
                        this.doZoom(15);
                    } else if (e.keyCode == 54) {// -
                        this.doZoom(-15);
                    }
                }.bind(this));

                window.addEventListener('mousedown', function (e) {
                    this.mdown = true;
                    this.lastX = null;
                    this.lastY = null;
                }.bind(this));

                window.addEventListener('mouseup', function (e) {
                    this.mdown = false;
                }.bind(this));

                window.addEventListener('mousemove', function (e) {
                    var relativeX = e.pageX - this.canvas.getBoundingClientRect().left;
                    var relativeY = e.pageY - this.canvas.getBoundingClientRect().top;

                    if (e.target == this.canvas && this.mdown) {
                        this.doMove(relativeX, relativeY);
                    }

                    if (relativeX <= 0 || relativeX >= this.canvas.clientWidth || relativeY <= 0 || relativeY >= this.canvas.clientHeight) {
                        this.mdown = false;
                    }
                }.bind(this));
            }
        }
    };

    root.CanvasZoom = CanvasZoom;
}).call(this);