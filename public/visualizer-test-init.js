document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('initBtn').addEventListener('click', () => {
        window.setupAudioVisualizer(document.getElementById('audio1'));
        window.setupAudioVisualizer(document.getElementById('audio2'));
        window.setupAudioVisualizer(document.getElementById('audio3'));
    });
});
