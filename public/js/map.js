// Wait for DOM to load before initializing map
document.addEventListener('DOMContentLoaded', function () {
    // Check if map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.log('Map container not found');
        return;
    }

    const data = (typeof listing !== 'undefined' && listing)
        ? listing
        : ((typeof vehicle !== 'undefined' && vehicle)
            ? vehicle
            : ((typeof dhaba !== 'undefined' && dhaba)
                ? dhaba
                : null));

    // Check if maptoken and data are defined
    console.log('Map Token Check:', {
        tokenDefined: typeof maptoken !== 'undefined',
        tokenValue: typeof maptoken !== 'undefined' ? maptoken.substring(0, 10) + '...' : 'undefined',
        tokenLength: typeof maptoken !== 'undefined' ? maptoken.length : 0,
        dataType: data ? (data.vehicleType ? 'vehicle' : (data.cuisine ? 'dhaba' : 'listing')) : 'none'
    });

    if (typeof maptoken === 'undefined' || maptoken === '' || maptoken === 'undefined') {
        console.error('Mapbox token not found or empty');
        mapContainer.innerHTML = '<p style="padding: 2rem; text-align: center; color: #717171;">Map unavailable - Token not configured</p>';
        return;
    }

    if (!data) {
        console.error('Map data not found');
        return;
    }

    // Check if data has geometry
    if (!data.geometry || !data.geometry.coordinates) {
        console.error('Geometry not found');
        mapContainer.innerHTML = '<p style="padding: 2rem; text-align: center; color: #717171;">Location not available</p>';
        return;
    }

    try {
        // Set the access token
        mapboxgl.accessToken = maptoken;

        // Validate coordinates
        const coordinates = data.geometry.coordinates;

        if (!Array.isArray(coordinates) || coordinates.length < 2) {
            throw new Error('Invalid coordinates');
        }

        const lng = coordinates[0];
        const lat = coordinates[1];

        // Validate lat/lng ranges
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new Error('Coordinates out of range');
        }

        // Initialize the map
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [lng, lat],
            zoom: 12
        });

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add fullscreen control
        map.addControl(new mapboxgl.FullscreenControl(), 'top-left');

        // Create custom marker
        const marker = new mapboxgl.Marker({
            color: '#FF385C'
        })
            .setLngLat([lng, lat])
            .setPopup(
                new mapboxgl.Popup({ offset: 25, closeButton: false })
                    .setHTML(`
                <div style="padding: 0.5rem;">
                    <h4 style="margin: 0 0 0.5rem; font-size: 1rem; font-weight: 600;">${data.title}</h4>
                    <p style="margin: 0; color: #717171; font-size: 0.875rem;">
                        ${data.mapboxPlaceName || `${data.location || 'Location'}${data.country ? `, ${data.country}` : ''}`}
                    </p>
                    <p style="margin: 0.5rem 0 0; font-size: 0.75rem; color: #717171;">
                        Exact location provided after booking
                    </p>
                </div>
            `)
            )
            .addTo(map);

        // Open popup by default
        marker.togglePopup();

        // Handle map resize on window resize
        window.addEventListener('resize', function () {
            map.resize();
        });

        console.log('✅ Map initialized successfully');

    } catch (error) {
        console.error('Map initialization error:', error);
        mapContainer.innerHTML = `
            <div style="padding: 2rem; text-align: center; background: #f7f7f7; border-radius: 12px;">
                <i class="fas fa-map-marked-alt" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                <p style="color: #717171; margin: 0;">Unable to load map</p>
                <p style="color: #b0b0b0; font-size: 0.875rem; margin-top: 0.5rem;">${data.location || ''}${data.country ? `, ${data.country}` : ''}</p>
            </div>
        `;
    }
});