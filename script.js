// AR.js Showcase JavaScript
let trackingStatus = false;
let markerCount = 0;
let isInfoPanelOpen = false;
let isGPSMode = false;
let gpsInitialized = false;

// DOM elements
const loadingScreen = document.getElementById('loading-screen');
const infoPanel = document.getElementById('info-panel');
const trackingStatusElement = document.getElementById('tracking-status');
const markerCountElement = document.getElementById('marker-count');
const arModeElement = document.getElementById('ar-mode');
const gpsStatusElement = document.getElementById('gps-status');
const gpsStatusItem = document.getElementById('gps-status-item');
const modeToggleBtn = document.getElementById('mode-toggle');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeAR();
    setupEventListeners();
    checkGeolocationSupport();
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

function checkGeolocationSupport() {
    if ("geolocation" in navigator) {
        console.log("Geolocation is supported");
        updateGPSStatus('Available', 'success');
    } else {
        console.log("Geolocation is not supported");
        updateGPSStatus('Not Supported', 'error');
        modeToggleBtn.disabled = true;
    }
}

function initializeGPS() {
    if (gpsInitialized) return;
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            console.log('GPS position obtained:', position.coords);
            updateGPSStatus('Active', 'success');
            gpsInitialized = true;
            
            // Add GPS camera component
            const camera = document.querySelector('#camera-entity');
            camera.setAttribute('gps-camera', 'simulateLatitude: ' + position.coords.latitude + '; simulateLongitude: ' + position.coords.longitude);
            
            // Enable GPS markers
            const gpsMarkers = document.querySelector('#gps-markers');
            gpsMarkers.setAttribute('visible', 'true');
            
            console.log('GPS AR mode initialized');
        },
        (error) => {
            console.error('GPS error:', error);
            updateGPSStatus('Error', 'error');
            
            // Fallback to simulated GPS for demo
            const camera = document.querySelector('#camera-entity');
            camera.setAttribute('gps-camera', 'simulateLatitude: 37.7749; simulateLongitude: -122.4194');
            
            const gpsMarkers = document.querySelector('#gps-markers');
            gpsMarkers.setAttribute('visible', 'true');
            
            updateGPSStatus('Simulated', 'warning');
            gpsInitialized = true;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

function toggleARMode() {
    const scene = document.querySelector('a-scene');
    const camera = document.querySelector('#camera-entity');
    const gpsMarkers = document.querySelector('#gps-markers');
    const markers = document.querySelectorAll('a-marker');
    
    if (!isGPSMode) {
        // Switch to GPS mode
        isGPSMode = true;
        modeToggleBtn.textContent = '🖼️ Marker';
        arModeElement.textContent = 'GPS';
        gpsStatusItem.style.display = 'flex';
        
        // Hide pattern markers
        markers.forEach(marker => {
            marker.setAttribute('visible', 'false');
        });
        
        // Initialize GPS if not already done
        if (!gpsInitialized) {
            initializeGPS();
        } else {
            gpsMarkers.setAttribute('visible', 'true');
        }
        
        // Update scene for GPS mode
        scene.setAttribute('arjs', 'sourceType: webcam; locationBased: true; debugUIEnabled: false');
        
        updateStatus('GPS Mode', 'success');
        console.log('Switched to GPS mode');
    } else {
        // Switch back to marker mode
        isGPSMode = false;
        modeToggleBtn.textContent = '📍 GPS';
        arModeElement.textContent = 'Marker';
        gpsStatusItem.style.display = 'none';
        
        // Show pattern markers
        markers.forEach(marker => {
            marker.setAttribute('visible', 'true');
        });
        
        // Hide GPS markers
        gpsMarkers.setAttribute('visible', 'false');
        
        // Remove GPS camera component
        camera.removeAttribute('gps-camera');
        
        // Update scene for marker mode
        scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3');
        
        updateStatus('Marker Mode', 'success');
        console.log('Switched to marker mode');
    }
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

function updateGPSStatus(status, type) {
    gpsStatusElement.textContent = status;
    gpsStatusElement.className = `status-value ${type}`;
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
    
    if (isGPSMode) {
        updateStatus('GPS Mode', 'success');
        // Re-initialize GPS if needed
        if (gpsInitialized) {
            initializeGPS();
        }
    } else {
        updateStatus('Searching...', 'warning');
    }
    
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