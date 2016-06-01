require([
        "esri/map",
        "esri/dijit/Popup",
        "esri/geometry/Point",
        "esri/tasks/QueryTask",
        "esri/tasks/query",
        "esri/SpatialReference",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/Color",
        "esri/graphic",
        "dojo/dom-construct",
        "dojo/text!./config.json",
        "dojo/domReady!",
        "app/canvas",
        "app/similar",
        "app/scoreboard"
],
    function (Map,
        Popup,
        Point,
        QueryTask,
        Query,
        SpatialReference,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        SimpleFillSymbol,
        Color,
        Graphic,
        domConstruct,
        configJson) {
        $(document).ready(function () {

            //Get globals from config 
            var config = JSON.parse(configJson);
            var leaderboardUrl = config.leaderboardFS;
            var gameContentUrl = config.gameFS;
            var answerField = config.answerField;
            var objectField = config.objectField;
            var timeLeft = config.timeLeft;
            var numberRounds = config.rounds;

            //Map objects
            var map, overviewMap;

            //Arrays to store locations and their names
            var answersArray = [],
                locationsArray = [];

            //Variable to keep track of current round
            var round = 0;

            //Timers for countdowns to allow them to be cleared and restarted as required
            var preRoundTimer, roundTimer, pointsTimer;

            //Variable to hold running total of a user's score
            var totalPoints = 0;

            //Variable holding pre round countdown value
            var count = 5;

            //Variable to hold round countdown value (also used to calculate time-based points)
            var currentTimeLeft = timeLeft;

            //Variable used in canvas.js and index.js to hold the scratchpad points
            window.scratchPoints = 10000;

            //Get locations from game feature service
            function getGameLocations(url, object, answer) {
                var queryTask = new QueryTask(url);
                var query = new Query();
                query.returnGeometry = false;
                query.outSpatialReference = new SpatialReference(4326);
                query.outFields = [
                    object,
                    answer
                ];
                query.where = "1=1"
                queryTask.execute(query,
                    function (result) {
                        var locationsArray2 = [];
                        var answersArray2 = [];
                        //Build random set of features based on the number of rounds
                        for (var i = 0; i < result.features.length; i++) {
                            locationsArray2.push(result.features[i].attributes[object]);
                            answersArray2.push(result.features[i].attributes[answer]);
                        }
                        while (locationsArray.length < numberRounds) {
                            var randomFeature = locationsArray2[Math.floor(Math.random() * locationsArray2.length)];
                            var found = false;
                            for (var i = 0; i < locationsArray.length; i++) {
                                if (locationsArray[i] == randomFeature) {
                                    found = true;
                                    break
                                };
                            }
                            if (!found) {
                                locationsArray[locationsArray.length] = randomFeature;
                                answersArray.push(answersArray2[locationsArray2.indexOf(randomFeature)]);
                            }
                        }
                        //Set things up for the first round
                        getLocation(locationsArray[round], objectField, answerField);
                    });
            }

            //Get extent information for a location
            function getLocation(id, object, answer) {
                var queryTask = new QueryTask(gameContentUrl);
                var query = new Query();
                query.returnGeometry = false;
                query.outSpatialReference = new SpatialReference(4326);
                query.outFields = [
                    object,
                    answer
                ];
                query.where = object + "=" + id;
                //Once we have an extent, run the function to set up the map
                queryTask.executeForExtent(query, mapSetup);
            }

            //Populate the leaderboard
            function getLeaderboard(url) {
                var queryTask = new QueryTask(url);
                var query = new Query();
                //Don't display any scores that are impossible to achieve
                query.where = "Score<" + (numberRounds * ((timeLeft * 100) + window.scratchPoints));
                //Only return the top 10 results
                query.num = 10;
                query.returnGeometry = false;
                query.outFields = [
                    "Name",
                    "Score"
                ];
                query.orderByFields = [
                    "Score DESC"
                ];
                queryTask.execute(query,
                    function (response) {
                        for (var i = 0; i < response.features.length; i++) {
                            if (i === 10) {
                                break;
                            }
                            $('#leaderboard > tbody:last-child').append('<tr><td>' + response.features[i].attributes.Name +
                                '</td><td>' + response.features[i].attributes.Score + '</td></tr>');
                        }
                    });
            }

            //Reset points for a new round
            function pointsReset() {
                window.scratchPoints = 10000;
                points = 0;
            }

            //Set up the map
            function mapSetup(result) {
                var extent = result.extent;
                //If the map doesn't exist, run the create map function
                if (!map) {
                    createMap(extent);
                } else {
                    //If this isn't the first round, change the extent based on the new round's location information
                    map.setExtent(extent);
                    overviewMap.centerAt(extent.getCenter());
                    overviewMap.graphics.clear();
                    var pointSymbol = new SimpleMarkerSymbol(
                        "diamond",
                        20,
                        new SimpleLineSymbol(
                            "solid",
                            new Color([
                                88,
                                116,
                                152
                            ]),
                            2),
                        new Color([
                            88,
                            116,
                            152,
                            0.45
                        ])
                    );
                    var location = new Graphic(extent.getCenter(), pointSymbol);
                    overviewMap.graphics.add(location);
                }
            };

            //Remove the scratching surface and display the answer popup
            function reveal(roundPoints) {
                var popup = new Popup({
                    titleInBody: true,
                    fillSymbol: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                            new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]))
                }, domConstruct.create("div"));
                map.infoWindow.setTitle('The correct answer is...');
                map.infoWindow.setContent(answersArray[round]);
                map.infoWindow.show(map.extent.getCenter());
                //Clear the timers ready for the next round
                clearTimeout(roundTimer);
                clearTimeout(pointsTimer);
                $('#countdown').css("display", "none");
                $('#countdown').css("color", "white");
                $(".reveal").css("display", "block");
                $(".answer-panel").css("display", "none");
                $(".mask").fadeOut();
                $("#map_zoom_slider").css("display", "block");
                //Update the total points and display this to the user
                totalPoints = totalPoints + roundPoints;
                $('#score').html('Score:' + totalPoints);
                round = round + 1;
            }

            //Set things up for a new round
            function nextRound(round) {
                if (round < numberRounds) {
                    map.infoWindow.hide();
                    getLocation(locationsArray[round], objectField, answerField);
                    setupCanvases();
                    $("#pad").css("pointer-events", "none");
                    $(".mask").css("display", "block");
                    $('#rounds-remain').html("SCORES");
                    $('#points').html('Answer correctly to receive max points');
                    $(".reveal").css("display", "none");
                    $(".answer-panel").css("display", "block");
                    $("#map_zoom_slider").css("display", "none");
                    $('#answer').val('');
                    $('.content-below').css("pointer-events", "none");
                    pointsReset();
                    preRoundTimer = setInterval(function () {
                        preRoundCountdown(count);
                    },
                        1000);
                } else {
                    $('#score').html('Score:' + totalPoints);
                    $("#submission").css("display", "block");
                    $(".reveal").css("display", "none");
                }
            }

            //Create the map and overview map
            function createMap(extent) {
                map = new Map("map", {
                    basemap: "satellite",
                    extent: extent,
                    showAttribution: false
                });
                overviewMap = new Map("overview-map", {
                    basemap: "topo",
                    center: extent.getCenter(),
                    zoom: 3,
                    showAttribution: false
                });
                overviewMap.on("load", function () {
                    overviewMap.disablePan();
                    overviewMap.disableRubberBandZoom();
                    overviewMap.disableScrollWheelZoom();
                    overviewMap.disableShiftDoubleClickZoom();
                    overviewMap.disableKeyboardNavigation();
                    overviewMap.disableDoubleClickZoom();
                    var pointSymbol = new SimpleMarkerSymbol(
                        "diamond",
                        12,
                        new SimpleLineSymbol(
                            "solid",
                            new Color([88, 116, 152]), 2
                        ),
                        new Color([88, 116, 152, 0.45])
                    );
                    var location = new Graphic(extent.getCenter(), pointSymbol);
                    overviewMap.graphics.add(location);
                });
                //Start the countdown for the first round
                //preRoundTimer = setInterval(function () {
                //    preRoundCountdown(count);
                //},
                //    1000);
				$("#scoreboard").dialog("open");
            }

            //Round countdown control
            function roundCountdown() {
                $('#countdown').html(currentTimeLeft);
                if (currentTimeLeft == 0) {
                    clearTimeout(roundTimer);
                    reveal(0);
                    $('#status').css("background-color",
                        "red").html("TIME UP").animate({
                            opacity: 1
                        }).delay(2000).animate({
                            opacity: 0
                        });
                    currentTimeLeft = timeLeft;
                } else {
                    currentTimeLeft--;
                }
            }

            //Pre round countdown control
            function preRoundCountdown() {
                if (count === 0) {
                    clearInterval(preRoundTimer);
                    if (round == 0) {
                        $('body').addClass('game-active');
                    };
                    //Make sure the round timer is reset
                    currentTimeLeft = timeLeft;
                    $('#countdown').html(currentTimeLeft);
                    $('.timer').css("display", "none");
                    $('.guide').css("display", "none");
                    roundTimer = setInterval(roundCountdown, 1000);
                    calculatePoints();
                    $('#pad').css("pointer-events", "auto");
                    $('#countdown').css("display", "block");
                    $('.content-below').css("pointer-events", "auto");
                    count = 3;
                } else {
                    if (count == 5) {
                        $('#pad').append("<div class='guide'>Get ready to scratch here and Name That Landmark! <br> Scratch wisely...the more you scratch, the less you score! </div>");
                        $('#pad').append("<div class='timer'>" + count + "</div>");
                    } else {
                        $('.timer').css("display", "block");
                        $('.timer').text(count);
                    }
                    count--;
                }
            }

            //Calculate current available points and display to the user
            function calculatePoints() {
                pointsTimer = setInterval(function () {
                    var points = window.scratchPoints + (currentTimeLeft * 100);
                    $('#points').html('Answer now and receive ' + points + ' points');
                }, 100);
            }

            //Check if the user's answer is correct
            function submitAnswer(userAnswer, correctAnswer) {
                //Remove 'the' from start of answer and user's submission
                if (userAnswer.substr(0, 4) === "THE ") {
                    userAnswer = userAnswer.substr(4, userAnswer.length);
                }
                if (correctAnswer.substr(0, 4) === "THE ") {
                    correctAnswer = correctAnswer.substr(4, correctAnswer.length);
                }
                //Use text comprison algorithm (similar.js) to test similarity of user's submission and correct answer
                var textSimilarity = similar_text(userAnswer,
                    correctAnswer,
                    1);
                //Allow for typos
                if (textSimilarity > 75) {
                    $('#status').css("background-color",
                        "#577B01").html('CORRECT').animate({
                            opacity: 1
                        }).delay(2000).animate({
                            opacity: 0
                        });
                    var points = window.scratchPoints + (currentTimeLeft * 100);
                    reveal(points);
                } else {
                    $('#status').css("background-color",
                        "red").html('WRONG').animate({
                            opacity: 1
                        }).delay(2000).animate({
                            opacity: 0
                        });
                }
            }

            //Functions to set things up
            getLeaderboard(leaderboardUrl);
            getGameLocations(gameContentUrl, objectField, answerField);

            //Function in canvas.js to set up the scratchpad
            setupCanvases();

            //Don't allow anything on the page to be selected
            $('body').attr('unselectable', 'on').css('user-select', 'none').on('selectstart', false);

            //Submit the answer if a user clicks the submit button
            $('#submit').click(function () {
                submitAnswer($('#answer').val().toUpperCase(), answersArray[round].toUpperCase());
            });

            //Submit the answer if the user presses enter after typing a guess
            $('#answer').keydown(function () {
                if (event.which == 13) submitAnswer($('#answer').val().toUpperCase(), answersArray[round].toUpperCase());
            });

            //If a user skips the round, they get 0 points
            $('#skip').click(function () {
                reveal(0);
            });

            //Start the next round when a user has finished exploring the map
            $('#next').click(function () {
                nextRound(round);
            });

            //Submit name and score to leaderboard feature service
            $('#submit-score').click(function () {
                var name = $('#name').val();
                if (name != "") {
                    $("#submit-score").css('display', 'none');
                    $("#name").css('display', 'none');
                    $('#submission-text').text('Thanks for playing!')
                    $.ajax({
                        type: "POST",
                        url: leaderboardUrl + '/applyEdits',
                        dataType: 'json',
                        data: 'f=json&adds=%5B%7B%22geometry%22%3A%7B%22x%22%3A-675091.833814498%2C%22y%22%3A3453730.6860364815%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%7D%2C%22attributes%22%3A%7B%22Score%22%3A' + totalPoints + '%2C%22Name%22%3A%22' + name + '%22%7D%7D%5D',
                        success: function () {
                            //Update the leaderboard in the app and open it
                            $("#name").attr('disabled',
                                'disabled').delay(1000).queue(function () {
                                    $("#scoreboard").dialog("open");
                                });;
                            $("#leaderboard").find("tr:gt(0)").remove();
                            getLeaderboard(leaderboardUrl);
                        }
                    })
                } else {
                    $('#submission-text').text('Please enter your name')
                }
            });

            //Reload the game when a user clicks play again after submitting their score
            $('#restart').click(function () {
                location.reload();
            });

            //Reload the game when the user clicks the refresh button
            $('#refresh').click(function () {
                location.reload();
            });
        });
    });