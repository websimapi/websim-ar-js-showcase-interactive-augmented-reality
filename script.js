// AR.js Showcase JavaScript
let trackingStatus = false;
let markerCount = 0;
let isInfoPanelOpen = false;
let isGPSMode = false;
let gpsInitialized = false;

// DOM elements
let loadingScreen, infoPanel, trackingStatusElement, markerCountElement, arModeElement, gpsStatusElement, gpsStatusItem, modeToggleBtn;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('Starting AR.js initialization...');
        initializeDOM();
        setupEventListeners();
        initializeAR();
        checkGeolocationSupport();
        console.log('AR.js initialization complete');
    } catch (error) {
        console.error('Initialization error:', error);
        handleError('Failed to initialize AR application', error);
    }
});

function initializeDOM() {
    try {
        // Safely get DOM elements with fallbacks
        loadingScreen = document.getElementById('loading-screen');
        infoPanel = document.getElementById('info-panel');
        trackingStatusElement = document.getElementById('tracking-status');
        markerCountElement = document.getElementById('marker-count');
        arModeElement = document.getElementById('ar-mode');
        gpsStatusElement = document.getElementById('gps-status');
        gpsStatusItem = document.getElementById('gps-status-item');
        modeToggleBtn = document.getElementById('mode-toggle');
        
        console.log('DOM elements initialized successfully');
    } catch (error) {
        console.error('DOM initialization error:', error);
        throw error;
    }
}

function initializeAR() {
    try {
        console.log('Initializing AR...');
        
        // Hide loading screen after delay
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 2000);

        // Wait for AR scene to be ready
        const scene = document.querySelector('a-scene');
        if (!scene) {
            console.warn('AR scene not found, AR features may not work');
            return;
        }
        
        // Set up AR event listeners
        scene.addEventListener('loaded', function() {
            console.log('AR scene loaded');
            updateStatus('Ready', 'success');
        });

        scene.addEventListener('renderstart', function() {
            console.log('AR rendering started');
        });

        // Listen for marker events with better error handling
        setTimeout(() => {
            const markers = document.querySelectorAll('a-marker');
            console.log(`Found ${markers.length} markers`);
            
            markers.forEach((marker, index) => {
                if (marker) {
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
                }
            });
        }, 1000);
        
        console.log('AR initialization complete');
    } catch (error) {
        console.error('AR initialization error:', error);
        handleError('Failed to initialize AR', error);
    }
}

function checkGeolocationSupport() {
    try {
        if (typeof navigator !== 'undefined' && "geolocation" in navigator) {
            console.log("Geolocation is supported");
            updateGPSStatus('Available', 'success');
        } else {
            console.log("Geolocation is not supported");
            updateGPSStatus('Not Supported', 'error');
            if (modeToggleBtn) {
                modeToggleBtn.disabled = true;
            }
        }
    } catch (error) {
        console.error('Geolocation check error:', error);
        updateGPSStatus('Error', 'error');
    }
}

function initializeGPS() {
    if (gpsInitialized || typeof navigator === 'undefined') return;
    
    try {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('GPS position obtained:', position.coords);
                updateGPSStatus('Active', 'success');
                gpsInitialized = true;
                
                // Add GPS camera component safely
                const camera = document.querySelector('#camera-entity');
                if (camera) {
                    camera.setAttribute('gps-camera', 'simulateLatitude: ' + position.coords.latitude + '; simulateLongitude: ' + position.coords.longitude);
                }
                
                // Enable GPS markers safely
                const gpsMarkers = document.querySelector('#gps-markers');
                if (gpsMarkers) {
                    gpsMarkers.setAttribute('visible', 'true');
                }
                
                console.log('GPS AR mode initialized');
            },
            (error) => {
                console.error('GPS error:', error);
                updateGPSStatus('Error', 'error');
                
                // Fallback to simulated GPS for demo
                const camera = document.querySelector('#camera-entity');
                if (camera) {
                    camera.setAttribute('gps-camera', 'simulateLatitude: 37.7749; simulateLongitude: -122.4194');
                }
                
                const gpsMarkers = document.querySelector('#gps-markers');
                if (gpsMarkers) {
                    gpsMarkers.setAttribute('visible', 'true');
                }
                
                updateGPSStatus('Simulated', 'warning');
                gpsInitialized = true;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    } catch (error) {
        console.error('GPS initialization error:', error);
        updateGPSStatus('Error', 'error');
        handleError('Failed to initialize GPS', error);
    }
}

function toggleARMode() {
    try {
        const scene = document.querySelector('a-scene');
        const camera = document.querySelector('#camera-entity');
        const gpsMarkers = document.querySelector('#gps-markers');
        const markers = document.querySelectorAll('a-marker');
        
        if (!scene || !camera) {
            console.warn('Required AR elements not found');
            return;
        }
        
        if (!isGPSMode) {
            // Switch to GPS mode
            isGPSMode = true;
            if (modeToggleBtn) modeToggleBtn.textContent = '🖼️ Marker';
            if (arModeElement) arModeElement.textContent = 'GPS';
            if (gpsStatusItem) gpsStatusItem.style.display = 'flex';
            
            // Hide pattern markers
            markers.forEach(marker => {
                if (marker) marker.setAttribute('visible', 'false');
            });
            
            // Initialize GPS if not already done
            if (!gpsInitialized) {
                initializeGPS();
            } else if (gpsMarkers) {
                gpsMarkers.setAttribute('visible', 'true');
            }
            
            updateStatus('GPS Mode', 'success');
            console.log('Switched to GPS mode');
        } else {
            // Switch back to marker mode
            isGPSMode = false;
            if (modeToggleBtn) modeToggleBtn.textContent = '📍 GPS';
            if (arModeElement) arModeElement.textContent = 'Marker';
            if (gpsStatusItem) gpsStatusItem.style.display = 'none';
            
            // Show pattern markers
            markers.forEach(marker => {
                if (marker) marker.setAttribute('visible', 'true');
            });
            
            // Hide GPS markers
            if (gpsMarkers) {
                gpsMarkers.setAttribute('visible', 'false');
            }
            
            // Remove GPS camera component
            if (camera.hasAttribute('gps-camera')) {
                camera.removeAttribute('gps-camera');
            }
            
            updateStatus('Marker Mode', 'success');
            console.log('Switched to marker mode');
        }
    } catch (error) {
        console.error('Mode toggle error:', error);
        handleError('Failed to toggle AR mode', error);
    }
}

function setupEventListeners() {
    try {
        // Handle window resize
        window.addEventListener('resize', function() {
            console.log('Window resized');
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                console.log('AR paused');
            } else {
                console.log('AR resumed');
            }
        });

        // Set up global click handlers
        window.toggleARMode = toggleARMode;
        window.toggleInfo = toggleInfo;
        window.toggleCamera = toggleCamera;
        window.resetTracking = resetTracking;
        window.toggleFullscreen = toggleFullscreen;
        
        console.log('Event listeners setup complete');
    } catch (error) {
        console.error('Event listener setup error:', error);
    }
}

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

function updateMarkerCount() {
    try {
        if (markerCountElement) {
            markerCountElement.textContent = markerCount;
            markerCountElement.style.color = markerCount > 0 ? '#4ECDC4' : '#FF6B6B';
        }
    } catch (error) {
        console.error('Marker count update error:', error);
    }
}

function toggleInfo() {
    try {
        isInfoPanelOpen = !isInfoPanelOpen;
        if (infoPanel) {
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

function toggleCamera() {
    try {
        console.log('Camera toggle requested');
        // Visual feedback
        if (event && event.target) {
            const btn = event.target;
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
        }
    } catch (error) {
        console.error('Camera toggle error:', error);
    }
}

function resetTracking() {
    try {
        // Reset tracking state
        markerCount = 0;
        trackingStatus = false;
        updateMarkerCount();
        
        if (isGPSMode) {
            updateStatus('GPS Mode', 'success');
        } else {
            updateStatus('Searching...', 'warning');
        }
        
        // Visual feedback
        if (event && event.target) {
            const btn = event.target;
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

function toggleFullscreen() {
    try {
        if (document.fullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        } else {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log('Error attempting to enable fullscreen:', err);
                });
            }
        }
    } catch (error) {
        console.error('Fullscreen toggle error:', error);
    }
}

// Enhanced error handling
function handleError(message, error) {
    console.error(`${message}:`, error);
    
    // Update UI to show error
    updateStatus('Error', 'error');
    
    // Show error in loading screen if it's still visible
    try {
        const loadingContent = document.querySelector('.loading-content');
        if (loadingContent && loadingScreen && loadingScreen.style.display !== 'none') {
            loadingContent.innerHTML = `
                <div class="loading-spinner"></div>
                <h2>Error Loading AR</h2>
                <p>${message}</p>
                <p style="font-size: 12px; color: #666; margin-top: 10px;">Check console for details</p>
            `;
        }
    } catch (e) {
        console.error('Error updating loading screen:', e);
    }
}

// Global error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error || e.message);
    handleError('Script error occurred', e.error || e.message);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    handleError('Promise rejection', e.reason);
});

// Safe initialization check
if (typeof document !== 'undefined' && document.readyState === 'loading') {
    // Document is still loading, wait for DOMContentLoaded
    console.log('Waiting for DOM to load...');
} else {
    // DOM is already loaded
    console.log('DOM already loaded, initializing immediately...');
    setTimeout(() => {
        try {
            initializeDOM();
            setupEventListeners();
            initializeAR();
            checkGeolocationSupport();
        } catch (error) {
            console.error('Immediate initialization error:', error);
            handleError('Failed to initialize AR application', error);
        }
    }, 100);
}