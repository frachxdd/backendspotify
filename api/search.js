const axios = require('axios');

const CLIENT_ID = 'ad7ddc4c765f4937b0acb69dce60b299';
const CLIENT_SECRET = '798fdb9ee6fe461381f058423c91d626';

async function getSpotifyToken() {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
            }
        }
    );
    return response.data.access_token;
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query "q" diperlukan' });
    }

    try {
        const token = await getSpotifyToken();
        const response = await axios.get('https://api.spotify.com/v1/search', {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { q: query, type: 'track', limit: 1 }
        });

        const track = response.data.tracks.items[0];
        if (!track || !track.preview_url) {
            return res.json({ success: false, message: 'Preview tidak tersedia untuk lagu ini' });
        }

        res.json({
            success: true,
            title: track.name,
            artist: track.artists[0].name,
            preview_url: track.preview_url
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
