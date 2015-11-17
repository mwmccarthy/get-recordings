var config = {};

// Number of recent hours to check for recordings
// Default is 24 to check for last day's worth of recordings
config.hours = 24;

// Path for saved recordings
// E.g., "/root/recordings"
// Defaults to current directory
config.path = ".";

module.exports = config;
