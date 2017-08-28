﻿toastr.options.positionClass = 'toast-bottom-right';
toastr.options.backgroundpositionClass = 'toast-bottom-right';

function profileLogOut() {
    $("#frmLogOut").submit();
}

function getDate(date) {
    var d = new Date(Date.parse(date));
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

function fromQueryString(name) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

function loading() {
    $('#app-spinner').show();
}

function loaded() {
    $('#app-spinner').hide();
}

// setup page
$(".admin-setup-form #AuthorName").keyup(function () {
    var authorUrl = $(this).val();
    authorUrl = authorUrl.replace(/\s+/g, '-').toLowerCase();
    $(".admin-setup-url").text(window.location.host + '/blog/' + authorUrl);

    if ($(this).val() == '') {
        $(".admin-setup-url").text('');
    }
});

// tooltips
$(function () {
    $(".bf-nav-list a").tooltip({
        placement: 'bottom'
    });

    $(".item-preview-info .btn-group .btn").tooltip({
        placement: 'bottom',
        container: 'body'
    });

    $(".bf-posts-sidebar-multiactions button").tooltip({
        placement: 'bottom',
        container: 'body'
    });
});

// fixed elements on modal

// Create the measurement node for scrollbar
var scrollDiv = document.createElement("div");
scrollDiv.className = "scrollbar-measure";
document.body.appendChild(scrollDiv);
var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
document.body.removeChild(scrollDiv);


$('.modal').on('show.bs.modal', function () {
    $(".bf-nav").css("padding-right", scrollbarWidth);
    $(".mce-toolbar-grp").css({
        "left": -scrollbarWidth,
        "padding-left": scrollbarWidth
    });
});

$('.modal').on('hidden.bs.modal', function () {
    $(".bf-nav, .mce-toolbar-grp").attr("style", "");
});


$("a[disabled]").on("click", function (event) {
    event.preventDefault();
});