/*global pulse, app, jQuery, require, document, esri, esriuk, Handlebars, console, $, mynearest, window, alert, unescape, navigator */

define.amd.jQuery = true;

require(["jquery"], function (jQuery) {
    require([
        "./platform/pageload.js",
        "./js/main.js"
    ], 
    function () {
        (function ($) {
            
                require(["dojo/ready", "dojo/domReady!"], function (ready) {
                    ready(function () {
                        app.initialisation.applicationStart().done(function (pageloading) {
                    
                            esriuk.exampleapp.init(pageloading);

                        });
                    })
                });
        }(jQuery));
    });
});

