$(document).ready(function() {
    wrapImageWithFancyBox();
});
/**
 * Wrap images with fancybox support.
 */
function wrapImageWithFancyBox() {
    $('img').not('.sidebar-image img').not('#author-avatar img').not(".mdl-menuimg").not(".something-else-logo img").not('.avatar').not('.share-body img').each(function() {
        var $image = $(this);
        var alt = $image.attr('alt');
        var src = $image.attr('src');
        $imageWrapLink = $image.wrap('<a data-fancybox=images data-caption="' + alt + '" href="' + src + '"></a>');
    });

    // fix微信分享二维码需要开新页面查看问题
    $('.qrcode').attr('data-fancybox', 'images');

    $().fancybox({
        selector: '[data-fancybox="images"]',
        thumbs: false,
        hash: true,
        loop: false,
        fullScreen: false,
        slideShow: false,
        protect: true,
    });
}