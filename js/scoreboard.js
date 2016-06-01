//Function for opening and closing leaderboard
$(function () {
    $("#scoreboard").dialog({
        minWidth: 500,
        autoOpen: false,
        buttons: [],
        dialogClass: "no-title",
        hide: {
            effect: "scale",
            easing: "easeInBack"
        },
        show: {
            effect: "scale",
            easing: "easeOutBack"
        }
    });

    $("#show-scoreboard").click(function () {
        if ($("#scoreboard").dialog("isOpen")) {
            $("#scoreboard").dialog("close");
        } else {
            $("#scoreboard").dialog("open");
        }
    });
});