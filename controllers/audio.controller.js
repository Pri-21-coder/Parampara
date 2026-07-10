const store = require('../data/store');
const { v4: uuidv4 } = require('uuid');

const audioController = {
  /**
   * Receives processed audio metadata from the client and stores it.
   */
  saveAudioMetadata: (req, res, next) => {
    try {
      const { fileName, duration, sampleRate, bitrate, channels, bpm, fingerprint, peaks } = req.body;

      if (!fileName || !duration || !fingerprint || !peaks || !Array.isArray(peaks) || peaks.length === 0) {
        return res.status(400).json({ error: 'Missing required audio metadata fields. peaks must be a non-empty array.' });
      }

      const id = uuidv4();
      const metadataRecord = {
        id,
        fileName,
        duration,
        sampleRate,
        bitrate,
        channels,
        bpm,
        fingerprint,
        peaks,
        uploadedAt: new Date().toISOString()
      };

      store.audioMetadata.set(id, metadataRecord);

      res.status(201).json({
        message: 'Audio metadata saved successfully',
        id: id
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves stored audio metadata by ID.
   */
  getAudioMetadata: (req, res, next) => {
    try {
      const { id } = req.params;
      const metadata = store.audioMetadata.get(id);

      if (!metadata) {
        return res.status(404).json({ error: 'Audio metadata not found' });
      }

      res.status(200).json(metadata);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = audioController;
