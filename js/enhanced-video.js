// Enhanced video picker with multiple videos
function pickVideo() {
    const videos = [
        'assets/media/hero1.mp4',
        'assets/media/hero2.mp4',
        'assets/media/Global_Data_Integration_Visualization (2).mp4'
    ];
    
    // Rotate videos based on time or user preference
    const videoIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % videos.length;
    return videos[videoIndex];
}

// Progressive loading for different connection speeds
function pickVideoByConnection() {
    const connection = navigator.connection;
    const isSlowConnection = connection && (
        connection.effectiveType === '2g' || 
        connection.effectiveType === 'slow-2g' ||
        connection.downlink < 1.5
    );
    
    if (isSlowConnection) {
        return 'assets/media/icon.mp4'; // Smallest video (927KB)
    } else {
        return 'assets/media/hero1.mp4'; // Full quality (5.7MB)
    }
}