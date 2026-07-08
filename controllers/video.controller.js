const store = require('../data/store');
const https = require('https');
const http = require('http');
const url = require('url');

exports.streamVideo = async (req, res, next) => {
    try {
        const { sessionId, videoUrl } = req.query;
        const range = req.headers.range;

        // Ensure Range is provided (even if bytes=0-)
        if (!range) {
            return res.status(400).send('Requires Range header');
        }

        if (sessionId) {
            // Serve from memory (uploaded chunked video)
            const session = store.uploadSessions.get(sessionId);
            if (!session || session.status !== 'complete' || !session.assembledBuffer) {
                return res.status(404).json({ error: 'Video not found or incomplete' });
            }

            const videoSize = session.assembledSize;
            const CHUNK_SIZE = 10 ** 6; // 1MB chunk size default fallback
            
            // Parse Range (handles bytes=0-, bytes=0-100, and bytes=-500)
            const parts = range.replace(/bytes=/, "").split("-");
            let start, end;
            
            if (parts[0] === "") {
                // e.g. bytes=-500 (last 500 bytes)
                start = Math.max(videoSize - parseInt(parts[1], 10), 0);
                end = videoSize - 1;
            } else {
                start = parseInt(parts[0], 10);
                end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE - 1, videoSize - 1);
            }
            
            if (end >= videoSize) end = videoSize - 1;
            
            // Prevent out-of-bounds
            if (start >= videoSize) {
                res.status(416).send(`Requested range not satisfiable\n${start} >= ${videoSize}`);
                return;
            }
            
            const contentLength = (end - start) + 1;
            
            const headers = {
                'Content-Range': `bytes ${start}-${end}/${videoSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': contentLength,
                'Content-Type': session.mimeType || 'video/mp4',
            };

            res.writeHead(206, headers);
            
            // Slice the buffer and send it
            const bufferChunk = session.assembledBuffer.slice(start, end + 1);
            res.end(bufferChunk);

        } else if (videoUrl) {
            // Proxy external video URL securely using global fetch (follows redirects automatically)
            const response = await fetch(videoUrl, {
                headers: {
                    'Range': range,
                    'User-Agent': 'Parampara-Progressive-Video-Loader/1.0'
                }
            });

            res.status(response.status);
            
            // Forward relevant headers from remote
            response.headers.forEach((val, key) => {
                res.setHeader(key, val);
            });
            
            // Ensure client knows we support range requests
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Accept-Ranges', 'bytes');
            
            // Pipe response body back to client
            const { Readable } = require('stream');
            Readable.fromWeb(response.body).pipe(res);

        } else {
            return res.status(400).json({ error: 'Must provide sessionId or videoUrl query parameter' });
        }

    } catch (err) {
        next(err);
    }
};
