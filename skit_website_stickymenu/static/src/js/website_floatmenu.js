$(document).ready(function () {
    var menu = $('.fixed-homemenu');
    var origOffsetY = 10;
    console.log(menu.offset());
if ($(".o_connected_user").length > 100){
	function scroll() {
        if ($(window).scrollTop() >= origOffsetY) {
            $('.fixed-homemenu').addClass('sticky_homemenu_afterlogin');
        } else {
            $('.fixed-homemenu').removeClass('sticky_homemenu_afterlogin');
        }
    }
	document.onscroll = scroll;
}
else{
	function scroll() {
        if ($(window).scrollTop() >= origOffsetY) {
            $('.fixed-homemenu').addClass('sticky_homemenu_beforelogin');
        } else {
            $('.fixed-homemenu').removeClass('sticky_homemenu_beforelogin');
        }
    }
	document.onscroll = scroll;
}
});
