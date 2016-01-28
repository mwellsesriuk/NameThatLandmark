
(function ($) {
    var root = this, exampleapp = {
        token: null
    },
    _itemUrl = "//www.arcgis.com/sharing/rest/content/items/",

     /**
        * @type {string}
        * @private
    */
    _isNullOrEmpty = function (obj) {
        return (obj === undefined || obj === null || obj === '');
    },

    /**
        * Make a JSON call requestion data information
        * @param itemId
        * @param token
        * @param isDataItem
        * @returns {Json}
        * @private
    */
    _getItem = function (itemId, token, isDataItem) {
        var tokenPart = "", url = _itemUrl + itemId;

        if (!_isNullOrEmpty(token)) {
            tokenPart = "&token=" + encodeURIComponent(token);
        }

        if (isDataItem) {
            url = url + "/data/";
        }

        return $.ajax({
            dataType: "jsonp",
            url: url + "?f=pjson" + tokenPart
        });
    };


    if (!root.esriuk) {
        root.esriuk = {};
    }
    if (!esriuk.exampleapp) {
        esriuk.exampleapp = exampleapp;
    }

    exampleapp.init = function (loadSettings) {
        var siteSettings = loadSettings.itemData, _this = this;

        this.settings = siteSettings;

        // Remember the token
        this.token = loadSettings.accessToken;

        document.write(JSON.stringify(siteSettings, null, 4));

        console.log(siteSettings);
        document.write("</br>");
        document.write("</br>");

        // Load the feature service item to get the URL
        _getItem(siteSettings.featureService, this.token, false).then(function (data) {
            document.write(JSON.stringify(data, null, 4));

            // URL would be data.url

            // Write to api/items/{propertyname}/{itemid}/0
            require(["esri/layers/FeatureLayer", "esri/graphic", "esri/geometry/Point"], function (FeatureLayer, Graphic, Point) {
                var featureLayer, url = "", href = document.location.href;

                url = href.substr(0, href.indexOf('index.html')) + "api/items/featureService/" + siteSettings.featureService +"/0";



                featureLayer = new FeatureLayer(url);


                surveyResponseFeature = new Graphic(new Point(0, 0), null, { TEXT0: "update", REFERENCEID: Math.random().toString(36).substr(2, 5) });
                featureLayer.applyEdits([surveyResponseFeature]);
            });

        });
    };

}(jQuery));