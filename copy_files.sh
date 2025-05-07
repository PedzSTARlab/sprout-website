#!/bin/bash
# Script to copy GitHub Pages files from original workspace to the new repository

# Source directory (original workspace)
SRC_DIR="/Users/cosmobot/Downloads/Website"

# Destination directory (new repository)
DEST_DIR="."

# Create necessary directories
mkdir -p css js tabs tables images

# Copy main files
cp "$SRC_DIR/index.html" .
cp "$SRC_DIR/.nojekyll" .
cp "$SRC_DIR/_config.yml" .
cp "$SRC_DIR/README.md" .

# Copy CSS files
cp "$SRC_DIR/css/dashboard.css" css/

# Copy JavaScript files
cp "$SRC_DIR/js/main.js" js/

# Copy tab content files
cp "$SRC_DIR/tabs/"*.html tabs/

# Copy table files
cp "$SRC_DIR/tables/"*.csv tables/

# Copy image files
cp "$SRC_DIR/images/"* images/

echo "Files copied successfully!"
