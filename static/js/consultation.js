// Preloader functionality
document.addEventListener('DOMContentLoaded', function() {
    // Hide preloader after page load
    window.addEventListener('load', function() {
        setTimeout(function() {
            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
                preloader.style.transition = 'opacity 0.5s, visibility 0.5s';
                
                setTimeout(function() {
                    preloader.style.display = 'none';
                }, 500);
            }
        }, 1000); // Show preloader for at least 1 second
    });
});