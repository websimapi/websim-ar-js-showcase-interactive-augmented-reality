// AR.js Showcase JavaScript - Enhanced with GPS support
let trackingStatus = false;
let markerCount = 0;
let isInfoPanelOpen = false;
let isGPSMode = false;
let gpsSupported = false;

// DOM elements
let loadingScreen, infoPanel, trackingStatusElement, markerCountElement, arModeElement, gpsStatusElement;

// Safe DOM access function
function safeGetElement(id) {
    try {
        return document.getElementById(id);
    } catch (e) {
        console.warn(`Element ${id} not found:`, e);
        return null;
    }
}

// Safe event listener function
function safeAddEventListener(element, event, handler) {
    try {
        if (element && typeof element.addEventListener === 'function') {
            element.addEventListener(event, handler);
            return true;
        }
    } catch (e) {
        console.warn(`Failed to add event listener:`, e);
    }
    return false;
}

// Initialize DOM elements safely
function initializeDOM() {
    try {
        console.log('Initializing DOM elements...');
        
        loadingScreen = safeGetElement('loading-screen');
        infoPanel = safeGetElement('info-panel');
        trackingStatusElement = safeGetElement('tracking-status');
        markerCountElement = safeGetElement('marker-count');
        arModeElement = safeGetElement('ar-mode');
        gpsStatusElement = safeGetElement('gps-status');
        
        console.log('DOM elements initialized');
        return true;
    } catch (error) {
        console.error('DOM initialization failed:', error);
        return false;
    }
}

// Check GPS support
function checkGPSSupport() {
    try {
        if (navigator.geolocation) {
            gpsSupported = true;
            console.log('GPS is supported');
            updateGPSStatus('Available', 'success');
        } else {
            gpsSupported = false;
            console.log('GPS is not supported');
            updateGPSStatus('Not Available', 'error');
        }
    } catch (error) {
        console.error('GPS check error:', error);
        gpsSupported = false;
        updateGPSStatus('Error', 'error');
    }
}

// Toggle AR mode between marker and GPS
function toggleARMode() {
    try {
        if (!gpsSupported) {
            console.log('GPS not supported, staying in marker mode');
            return;
        }

        isGPSMode = !isGPSMode;
        
        if (isGPSMode) {
            // Switch to GPS mode
            updateARMode('GPS', 'success');
            updateGPSStatus('Active', 'success');
            showGPSEntities();
            console.log('Switched to GPS mode');
        } else {
            // Switch to Marker mode
            updateARMode('Marker', 'success');
            updateGPSStatus('Available', 'warning');
            hideGPSEntities();
            console.log('Switched to Marker mode');
        }
        
        // Visual feedback
        const btn = document.querySelector('.control-btn');
        if (btn) {
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
        }
        
    } catch (error) {
        console.error('AR mode toggle error:', error);
        updateARMode('Error', 'error');
    }
}

// Show GPS entities
function showGPSEntities() {
    try {
        const gpsEntities = ['gps-box', 'gps-sphere', 'gps-cylinder'];
        gpsEntities.forEach(id => {
            const entity = safeGetElement(id);
            if (entity) {
                entity.setAttribute('visible', 'true');
                console.log(`Showing GPS entity: ${id}`);
            }
        });
    } catch (error) {
        console.error('Error showing GPS entities:', error);
    }
}

// Hide GPS entities
function hideGPSEntities() {
    try {
        const gpsEntities = ['gps-box', 'gps-sphere', 'gps-cylinder'];
        gpsEntities.forEach(id => {
            const entity = safeGetElement(id);
            if (entity) {
                entity.setAttribute('visible', 'false');
                console.log(`Hiding GPS entity: ${id}`);
            }
        });
    } catch (error) {
        console.error('Error hiding GPS entities:', error);
    }
}

// Update AR mode display
function updateARMode(mode, type) {
    try {
        if (arModeElement) {
            arModeElement.textContent = mode;
            arModeElement.className = `status-value ${type || ''}`;
        }
    } catch (error) {
        console.error('AR mode update error:', error);
    }
}

// Update GPS status display
function updateGPSStatus(status, type) {
    try {
        if (gpsStatusElement) {
            gpsStatusElement.textContent = status;
            gpsStatusElement.className = `status-value ${type || ''}`;
        }
    } catch (error) {
        console.error('GPS status update error:', error);
    }
}

// Initialize AR scene
function initializeAR() {
    try {
        console.log('Initializing AR scene...');
        
        // Check GPS support
        checkGPSSupport();
        
        // Hide loading screen
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 2000);

        // Wait for A-Frame to be ready
        if (typeof AFRAME !== 'undefined') {
            console.log('A-Frame is ready');
            setupARListeners();
        } else {
            console.warn('A-Frame not loaded, retrying...');
            setTimeout(initializeAR, 1000);
        }
        
    } catch (error) {
        console.error('AR initialization error:', error);
        updateStatus('AR Error', 'error');
    }
}

// Setup AR event listeners
function setupARListeners() {
    try {
        const scene = document.querySelector('a-scene');
        
        if (!scene) {
            console.warn('AR scene not found');
            return;
        }

        // Scene loaded event
        safeAddEventListener(scene, 'loaded', function() {
            console.log('AR scene loaded successfully');
            updateStatus('Ready', 'success');
        });

        // Setup marker detection
        setTimeout(() => {
            const markers = document.querySelectorAll('a-marker');
            console.log(`Setting up ${markers.length} markers`);
            
            markers.forEach((marker, index) => {
                if (marker) {
                    safeAddEventListener(marker, 'markerFound', function() {
                        console.log(`Marker ${index + 1} detected`);
                        markerCount++;
                        updateMarkerCount();
                        updateStatus('Tracking', 'success');
                        trackingStatus = true;
                    });

                    safeAddEventListener(marker, 'markerLost', function() {
                        console.log(`Marker ${index + 1} lost`);
                        markerCount = Math.max(0, markerCount - 1);
                        updateMarkerCount();
                        if (markerCount === 0) {
                            updateStatus('Searching...', 'warning');
                            trackingStatus = false;
                        }
                    });
                }
            });
        }, 1000);
        
    } catch (error) {
        console.error('AR listeners setup error:', error);
        updateStatus('Setup Error', 'error');
    }
}

// Update status display
function updateStatus(status, type) {
    try {
        if (trackingStatusElement) {
            trackingStatusElement.textContent = status;
            trackingStatusElement.className = `status-value ${type || ''}`;
        }
    } catch (error) {
        console.error('Status update error:', error);
    }
}

// Update marker count display
function updateMarkerCount() {
    try {
        if (markerCountElement) {
            markerCountElement.textContent = markerCount.toString();
            markerCountElement.style.color = markerCount > 0 ? '#4ECDC4' : '#FF6B6B';
        }
    } catch (error) {
        console.error('Marker count update error:', error);
    }
}

// Toggle info panel
function toggleInfo() {
    try {
        if (infoPanel) {
            isInfoPanelOpen = !isInfoPanelOpen;
            if (isInfoPanelOpen) {
                infoPanel.classList.remove('hidden');
            } else {
                infoPanel.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error('Info panel toggle error:', error);
    }
}

// Camera toggle with visual feedback
function toggleCamera() {
    try {
        console.log('Camera toggle requested');
        
        // Visual feedback
        const btn = document.querySelector('.control-btn:nth-child(2)');
        if (btn) {
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
        }
    } catch (error) {
        console.error('Camera toggle error:', error);
    }
}

// Reset tracking
function resetTracking() {
    try {
        markerCount = 0;
        trackingStatus = false;
        updateMarkerCount();
        updateStatus('Searching...', 'warning');
        
        // Reset GPS entities if in GPS mode
        if (isGPSMode) {
            hideGPSEntities();
            setTimeout(() => {
                showGPSEntities();
            }, 500);
        }
        
        // Visual feedback
        const btn = document.querySelector('.control-btn:nth-child(3)');
        if (btn) {
            btn.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                btn.style.transform = 'rotate(0deg)';
            }, 500);
        }
        
        console.log('Tracking reset');
    } catch (error) {
        console.error('Tracking reset error:', error);
    }
}

// Toggle fullscreen
function toggleFullscreen() {
    try {
        if (document.fullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(err => {
                    console.log('Fullscreen exit error:', err);
                });
            }
        } else {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log('Fullscreen request error:', err);
                });
            }
        }
    } catch (error) {
        console.error('Fullscreen toggle error:', error);
    }
}

// Main initialization
function initialize() {
    try {
        console.log('Starting application initialization...');
        
        if (!initializeDOM()) {
            throw new Error('DOM initialization failed');
        }
        
        // Initialize AR after a short delay to ensure DOM is ready
        setTimeout(() => {
            try {
                initializeAR();
            } catch (error) {
                console.error('AR initialization failed:', error);
                updateStatus('Error', 'error');
            }
        }, 100);
        
        console.log('Application initialization complete');
        
    } catch (error) {
        console.error('Main initialization error:', error);
        
        // Show error in loading screen
        if (loadingScreen) {
            const loadingContent = loadingScreen.querySelector('.loading-content');
            if (loadingContent) {
                loadingContent.innerHTML = `
                    <div class="loading-spinner"></div>
                    <h2>Initialization Error</h2>
                    <p>Failed to start AR application</p>
                `;
            }
        }
    }
}

// Global error handlers
window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.message, e.error);
    updateStatus('Error', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    updateStatus('Error', 'error');
    e.preventDefault(); // Prevent default error display
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Make functions globally available
window.toggleInfo = toggleInfo;
window.toggleCamera = toggleCamera;
window.resetTracking = resetTracking;
window.toggleFullscreen = toggleFullscreen;
window.toggleARMode = toggleARMode;