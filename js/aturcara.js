// aturcara.js

// Placeholder for future dynamic aturcara features
console.log("Aturcara Family Day page loaded.");

document.addEventListener('DOMContentLoaded', function() {
    const wrapper = document.querySelector('.facilities-wrapper');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (!wrapper || !prevBtn || !nextBtn) return;

    // Scroll amount for each click (width of one item plus gap)
    const scrollAmount = 270; // 250px (item width) + 20px (gap)

    // Update button states
    function updateButtonStates() {
        prevBtn.style.opacity = wrapper.scrollLeft <= 0 ? "0.3" : "0.7";
        nextBtn.style.opacity = 
            wrapper.scrollLeft >= (wrapper.scrollWidth - wrapper.clientWidth) ? "0.3" : "0.7";
    }

    // Add click handlers
    prevBtn.addEventListener('click', () => {
        wrapper.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    nextBtn.addEventListener('click', () => {
        wrapper.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Update button states on scroll
    wrapper.addEventListener('scroll', updateButtonStates);
    
    // Initial button state
    updateButtonStates();

    // Handle touch events for mobile swipe
    let touchStart = null;
    let touchX = null;

    wrapper.addEventListener('touchstart', (e) => {
        touchStart = e.touches[0].clientX;
        touchX = touchStart;
    }, false);

    wrapper.addEventListener('touchmove', (e) => {
        if (!touchStart) return;
        
        e.preventDefault();
        touchX = e.touches[0].clientX;
    }, { passive: false });

    wrapper.addEventListener('touchend', () => {
        if (!touchStart || !touchX) return;
        
        const diff = touchStart - touchX;
        const threshold = 50; // minimum distance for swipe

        if (Math.abs(diff) > threshold) {
            wrapper.scrollBy({
                left: diff > 0 ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }

        touchStart = null;
        touchX = null;
    }, false);
});
