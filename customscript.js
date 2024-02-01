var content = 'This Website is under construction...';

var ele = '<span>' + content.split('').join('</span><span>') + '</span>';

$(document).ready(function() {
    $(ele).hide().appendTo('#intro').each(function (i) {
        $(this).delay(100 * i).css({
            display: 'inline',
            opacity: 0
        }).animate({
            opacity: 1
        }, 100);
    });
    $('.marquee').marquee({
        pauseOnHover: true,
        duration: 10000,
        gap: 0,
      });
      
});


