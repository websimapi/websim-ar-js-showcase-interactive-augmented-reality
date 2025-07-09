// AR.js Showcase JavaScript
let trackingStatus = false;
let markerCount = 0;
let isInfoPanelOpen = false;

// DOM elements
const loadingScreen = document.getElementById('loading-screen');
const infoPanel = document.getElementById('info-panel');
const trackingStatusElement = document.getElementById('tracking-status');
const markerCountElement = document.getElementById('marker-count');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeAR();
    setupEventListeners();
});

function initializeAR() {
    // Hide loading screen after AR is ready
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);

    // AR.js event listeners
    const scene = document.querySelector('a-scene');
    
    scene.addEventListener('arjs-video-loaded', function() {
        console.log('AR video loaded');
        updateStatus('Ready', 'success');
    });

    // Listen for marker events
    const markers = document.querySelectorAll('a-marker');
    markers.forEach((marker, index) => {
        marker.addEventListener('markerFound', function() {
            console.log(`Marker ${index + 1} found`);
            markerCount++;
            updateMarkerCount();
            updateStatus('Tracking', 'success');
            trackingStatus = true;
        });

        marker.addEventListener('markerLost', function() {
            console.log(`Marker ${index + 1} lost`);
            markerCount = Math.max(0, markerCount - 1);
            updateMarkerCount();
            if (markerCount === 0) {
                updateStatus('Searching...', 'warning');
                trackingStatus = false;
            }
        });
    });
}

function setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', function() {
        // AR.js handles camera aspect ratio automatically
    });

    // Handle visibility change
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            console.log('AR paused');
        } else {
            console.log('AR resumed');
        }
    });
}

function updateStatus(status, type) {
    trackingStatusElement.textContent = status;
    trackingStatusElement.className = `status-value ${type}`;
    
    // Add visual feedback
    trackingStatusElement.style.animation = 'none';
    setTimeout(() => {
        trackingStatusElement.style.animation = 'pulse 2s infinite';
    }, 10);
}

function updateMarkerCount() {
    markerCountElement.textContent = markerCount;
    
    // Add color coding
    if (markerCount > 0) {
        markerCountElement.style.color = '#4ECDC4';
    } else {
        markerCountElement.style.color = '#FF6B6B';
    }
}

function toggleInfo() {
    isInfoPanelOpen = !isInfoPanelOpen;
    if (isInfoPanelOpen) {
        infoPanel.classList.remove('hidden');
    } else {
        infoPanel.classList.add('hidden');
    }
}

function toggleCamera() {
    // This would typically pause/resume the camera
    // For now, we'll just provide visual feedback
    const btn = event.target;
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 150);
    
    console.log('Camera toggle requested');
}

function resetTracking() {
    // Reset tracking state
    markerCount = 0;
    trackingStatus = false;
    updateMarkerCount();
    updateStatus('Searching...', 'warning');
    
    // Visual feedback
    const btn = event.target;
    btn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        btn.style.transform = 'rotate(0deg)';
    }, 500);
    
    console.log('Tracking reset');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Error attempting to enable fullscreen:', err);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Performance monitoring
function monitorPerformance() {
    const scene = document.querySelector('a-scene');
    if (scene && scene.renderer) {
        const info = scene.renderer.info;
        console.log('Render info:', {
            triangles: info.render.triangles,
            calls: info.render.calls,
            frame: info.render.frame
        });
    }
}

// Run performance monitoring every 5 seconds
setInterval(monitorPerformance, 5000);

// Add touch/gesture support for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', function(e) {
    if (isInfoPanelOpen) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX;
    const deltaY = touchY - touchStartY;
    
    // Prevent default scrolling when AR is active
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        e.preventDefault();
    }
}, { passive: false });

// Error handling
window.addEventListener('error', function(e) {
    console.error('AR.js error:', e.error);
    updateStatus('Error', 'error');
});

// Add smooth animations to AR objects
function addSmoothAnimations() {
    const entities = document.querySelectorAll('a-entity, a-box, a-sphere, a-torus');
    entities.forEach(entity => {
        entity.setAttribute('animation-mixer', '');
    });
}

// Initialize animations after scene is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addSmoothAnimations, 1000);
});

