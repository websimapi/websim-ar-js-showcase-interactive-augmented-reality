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
        initializeDOM();
        initializeAR();
        setupEventListeners();
        checkGeolocationSupport();
    } catch (error) {
        console.error('Initialization error:', error);
        handleError('Failed to initialize AR application', error);
    }
});

function initializeDOM() {
    // Safely get DOM elements
    loadingScreen = document.getElementById('loading-screen');
    infoPanel = document.getElementById('info-panel');
    trackingStatusElement = document.getElementById('tracking-status');
    markerCountElement = document.getElementById('marker-count');
    arModeElement = document.getElementById('ar-mode');
    gpsStatusElement = document.getElementById('gps-status');
    gpsStatusItem = document.getElementById('gps-status-item');
    modeToggleBtn = document.getElementById('mode-toggle');
    
    // Check if all elements exist
    const requiredElements = [
        'loading-screen', 'info-panel', 'tracking-status', 'marker-count', 
        'ar-mode', 'gps-status', 'gps-status-item', 'mode-toggle'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        throw new Error(`Missing DOM elements: ${missingElements.join(', ')}`);
    }
}

function initializeAR() {
    try {
        // Hide loading screen after AR is ready
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 2000);

        // AR.js event listeners
        const scene = document.querySelector('a-scene');
        if (!scene) {
            throw new Error('AR scene not found');
        }
        
        scene.addEventListener('arjs-video-loaded', function() {
            console.log('AR video loaded');
            updateStatus('Ready', 'success');
        });

        scene.addEventListener('arjs-video-error', function(event) {
            console.error('AR video error:', event);
            handleError('Camera access failed', event);
        });

        // Listen for marker events
        const markers = document.querySelectorAll('a-marker');
        if (markers.length === 0) {
            console.warn('No markers found in scene');
        }
        
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
    } catch (error) {
        console.error('AR initialization error:', error);
        handleError('Failed to initialize AR', error);
    }
}

function checkGeolocationSupport() {
    try {
        if ("geolocation" in navigator) {
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
    if (gpsInitialized) return;
    
    try {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('GPS position obtained:', position.coords);
                updateGPSStatus('Active', 'success');
                gpsInitialized = true;
                
                // Add GPS camera component
                const camera = document.querySelector('#camera-entity');
                if (camera) {
                    camera.setAttribute('gps-camera', 'simulateLatitude: ' + position.coords.latitude + '; simulateLongitude: ' + position.coords.longitude);
                }
                
                // Enable GPS markers
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
            throw new Error('Required AR elements not found');
        }
        
        if (!isGPSMode) {
            // Switch to GPS mode
            isGPSMode = true;
            if (modeToggleBtn) modeToggleBtn.textContent = '🖼️ Marker';
            if (arModeElement) arModeElement.textContent = 'GPS';
            if (gpsStatusItem) gpsStatusItem.style.display = 'flex';
            
            // Hide pattern markers
            markers.forEach(marker => {
                marker.setAttribute('visible', 'false');
            });
            
            // Initialize GPS if not already done
            if (!gpsInitialized) {
                initializeGPS();
            } else if (gpsMarkers) {
                gpsMarkers.setAttribute('visible', 'true');
            }
            
            // Update scene for GPS mode
            scene.setAttribute('arjs', 'sourceType: webcam; locationBased: true; debugUIEnabled: false');
            
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
                marker.setAttribute('visible', 'true');
            });
            
            // Hide GPS markers
            if (gpsMarkers) {
                gpsMarkers.setAttribute('visible', 'false');
            }
            
            // Remove GPS camera component
            camera.removeAttribute('gps-camera');
            
            // Update scene for marker mode
            scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3');
            
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
    } catch (error) {
        console.error('Event listener setup error:', error);
    }
}

function updateStatus(status, type) {
    try {
        if (trackingStatusElement) {
            trackingStatusElement.textContent = status;
            trackingStatusElement.className = `status-value ${type}`;
            
            // Add visual feedback
            trackingStatusElement.style.animation = 'none';
            setTimeout(() => {
                trackingStatusElement.style.animation = 'pulse 2s infinite';
            }, 10);
        }
    } catch (error) {
        console.error('Status update error:', error);
    }
}

function updateGPSStatus(status, type) {
    try {
        if (gpsStatusElement) {
            gpsStatusElement.textContent = status;
            gpsStatusElement.className = `status-value ${type}`;
        }
    } catch (error) {
        console.error('GPS status update error:', error);
    }
}

function updateMarkerCount() {
    try {
        if (markerCountElement) {
            markerCountElement.textContent = markerCount;
            
            // Add color coding
            if (markerCount > 0) {
                markerCountElement.style.color = '#4ECDC4';
            } else {
                markerCountElement.style.color = '#FF6B6B';
            }
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
        // This would typically pause/resume the camera
        // For now, we'll just provide visual feedback
        const btn = event.target;
        if (btn) {
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
        }
        
        console.log('Camera toggle requested');
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
            // Re-initialize GPS if needed
            if (gpsInitialized) {
                initializeGPS();
            }
        } else {
            updateStatus('Searching...', 'warning');
        }
        
        // Visual feedback
        const btn = event.target;
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

function toggleFullscreen() {
    try {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    } catch (error) {
        console.error('Fullscreen toggle error:', error);
    }
}

// Performance monitoring
function monitorPerformance() {
    try {
        const scene = document.querySelector('a-scene');
        if (scene && scene.renderer) {
            const info = scene.renderer.info;
            console.log('Render info:', {
                triangles: info.render.triangles,
                calls: info.render.calls,
                frame: info.render.frame
            });
        }
    } catch (error) {
        console.error('Performance monitoring error:', error);
    }
}

// Run performance monitoring every 5 seconds
setInterval(monitorPerformance, 5000);

// Add touch/gesture support for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    try {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    } catch (error) {
        console.error('Touch start error:', error);
    }
}, { passive: true });

document.addEventListener('touchmove', function(e) {
    try {
        if (isInfoPanelOpen) return;
        
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - touchStartX;
        const deltaY = touchY - touchStartY;
        
        // Prevent default scrolling when AR is active
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            e.preventDefault();
        }
    } catch (error) {
        console.error('Touch move error:', error);
    }
}, { passive: false });

// Enhanced error handling
function handleError(message, error) {
    console.error(`${message}:`, error);
    
    // Update UI to show error
    updateStatus('Error', 'error');
    
    // Show error in loading screen if it's still visible
    const loadingContent = document.querySelector('.loading-content');
    if (loadingContent && loadingScreen && loadingScreen.style.display !== 'none') {
        loadingContent.innerHTML = `
            <div class="loading-spinner"></div>
            <h2>Error Loading AR</h2>
            <p>${message}</p>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">Check console for details</p>
        `;
    }
}

// Global error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    handleError('Script error occurred', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    handleError('Promise rejection', e.reason);
});

// Add smooth animations to AR objects
function addSmoothAnimations() {
    try {
        const entities = document.querySelectorAll('a-entity, a-box, a-sphere, a-torus');
        entities.forEach(entity => {
            entity.setAttribute('animation-mixer', '');
        });
    } catch (error) {
        console.error('Animation setup error:', error);
    }
}

// Initialize animations after scene is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addSmoothAnimations, 1000);
});