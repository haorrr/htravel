# Test Images for Landmark Recognition

This directory is for storing test images to verify the AI landmark recognition feature (Phase 04).

## Suggested Test Images

For comprehensive testing, download or use photos of well-known landmarks:

### Famous Landmarks (High Confidence Expected)
- **Eiffel Tower** (Paris, France)
- **Statue of Liberty** (New York, USA)
- **Big Ben** (London, UK)
- **Taj Mahal** (Agra, India)
- **Colosseum** (Rome, Italy)
- **Great Wall of China** (China)
- **Sydney Opera House** (Sydney, Australia)
- **Christ the Redeemer** (Rio de Janeiro, Brazil)

### Vietnamese Landmarks (Local Context)
- **Hoan Kiem Lake** (Hanoi)
- **One Pillar Pagoda** (Hanoi)
- **Imperial City** (Hue)
- **Ha Long Bay** (Quang Ninh)
- **Golden Bridge** (Da Nang)
- **Notre-Dame Cathedral** (Ho Chi Minh City)
- **Cu Chi Tunnels** (Ho Chi Minh City)

## Image Requirements

- **Format**: JPEG, PNG, or WebP
- **Max Size**: 10 MB
- **Min Dimensions**: 200x200 pixels
- **Recommended**: Clear photo with good lighting, landmark visible and centered

## Where to Get Test Images

1. **Free Stock Photos**:
   - Unsplash: https://unsplash.com/s/photos/landmarks
   - Pexels: https://www.pexels.com/search/landmarks/
   - Pixabay: https://pixabay.com/images/search/landmarks/

2. **Your Own Photos**: Use any landmark photos from your travels

3. **Wikipedia Commons**: https://commons.wikimedia.org/

## Running Tests

Once you have test images in this directory:

```bash
# Test with a specific image
node test-landmark-manual.js ./test-images/eiffel-tower.jpg

# Or use relative path
node test-landmark-manual.js test-images/taj-mahal.png
```

## Expected Results

The AI should return:
- **name**: Landmark name (e.g., "Eiffel Tower")
- **confidence**: 0.0 to 1.0 (>0.5 is good)
- **description**: Brief historical/cultural context
- **location**: Country/city information
- **category**: Type (monument, building, natural, etc.)

## Troubleshooting

If landmark is not recognized:
- ✅ Check image quality (not blurry, well-lit)
- ✅ Ensure landmark is prominent in photo
- ✅ Try different angle or closer shot
- ✅ Verify GEMINI_API_KEY is configured in .env
- ✅ Check server logs for detailed error messages

## API Key Not Configured?

If you haven't configured your Gemini API key yet:

1. Go to https://ai.google.dev/
2. Click "Get API key in Google AI Studio"
3. Sign in with Google account
4. Click "Create API Key"
5. Add to `.env` file:
   ```env
   GEMINI_API_KEY=your-actual-key-here
   ```
6. Restart server: `npm run dev`
