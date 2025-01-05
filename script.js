const CLIENT_ID = '9e7e54361d064647ab3855cf9b6f2eb0'; 
const REDIRECT_URI = 'http://127.0.0.1:5500/Holiday%20project/index.html'; 
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=user-read-private%20user-read-email%20streaming`;

let accessToken = null;
let selectedTracks = [];

function authenticate() {
    window.location.href = AUTH_URL;
}


function handleRedirect() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    accessToken = params.get('access_token');

    if (accessToken) {
        console.log('Access Token:', accessToken);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        authenticate(); 
    }
}

handleRedirect();

async function searchTracks(query) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.tracks.items;
    } catch (error) {
        console.error('Error fetching tracks:', error);
        alert('Failed to fetch tracks. Please try again.');
        return [];
    }
}

function displayTracks(tracks) {
    const trackList = document.createElement('ul');
    trackList.id = 'track-list';
    trackList.innerHTML = ''; 

    tracks.forEach(track => {
        const listItem = document.createElement('li');
        listItem.textContent = track.name; 
        listItem.onclick = () => addTrack(track); 
        trackList.appendChild(listItem);
    });

    const existingList = document.getElementById('track-list');
    if (existingList) {
        existingList.remove(); 
    }
    document.getElementById('mashup-application').appendChild(trackList);
}


function addTrack(track) {
    if (!selectedTracks.find(t => t.id === track.id)) {
        selectedTracks.push(track);
        alert(`${track.name} added to mashup!`);
        updateSelectedTracks();
    } else {
        alert(`${track.name} is already in the mashup!`);
    }
}


function updateSelectedTracks() {
    const selectedList = document.getElementById('selected-tracks');
    selectedList.innerHTML = ""; 

    selectedTracks.forEach(track => {
        const trackItem = document.createElement('li');
        trackItem.textContent = track.name;
        selectedList.appendChild(trackItem);
    });
}


async function fetchTracks() {
    const searchTerm = document.getElementById('input-box').value.trim();
    if (!searchTerm) {
        alert('Please enter a search term.');
        return;
    }
    const tracks = await searchTracks(searchTerm);
    displayTracks(tracks);
}


function downloadTracks() {
    selectedTracks.forEach(track => {
        if (track.preview_url) {
            const link = document.createElement('a');
            link.href = track.preview_url;
            link.download = `${track.name}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert(`Preview not available for track: ${track.name}`);
        }
    });
}

// Event listeners
document.getElementById('fetch-btn').addEventListener('click', fetchTracks);
document.getElementById('download-btn').addEventListener('click', downloadTracks);
