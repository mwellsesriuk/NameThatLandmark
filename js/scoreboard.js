$(function () {
    $("#scoreboard").dialog({
        minWidth: 500,
        autoOpen: false,
        buttons: [{
            text: "CLOSE",
            "class": 'btn red',
            click: function () {
                $(this).dialog("close");
            }
        }],
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