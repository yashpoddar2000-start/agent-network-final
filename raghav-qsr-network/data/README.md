# Data Directory

This directory contains all post data for Raghav's QSR content analysis.

## File Structure

### `/posts/`

#### `all-posts.json` ⭐ **MAIN FILE - EDIT THIS**
- **Single source of truth** for all posts
- Add new posts here (or use `npm run add-post`)
- Contains 51 posts with full analysis and leverage signals

#### `viral-posts.json` (Auto-generated)
- High-performing posts (engagement score ≥ 100 OR isViral: true)
- **Do not edit directly** - regenerated from all-posts.json

#### `flop-posts.json` (Auto-generated)
- Low-performing posts (engagement score < 100 OR isViral: false)
- **Do not edit directly** - regenerated from all-posts.json

#### `cleaned-posts.json` (Legacy)
- Simplified version without analysis
- Kept for reference, may remove later

## Post Data Structure

Each post in `all-posts.json` has:

```json
{
  "id": "P001",
  "text": "Post content...",
  "postedDate": "2025-07-15 16:45:01",
  "engagement": {
    "totalReactions": 427,
    "likes": 346,
    "comments": 28,
    "reposts": 20,
    "engagementScore": 455
  },
  "hasMedia": true,
  "textLength": 1168,
  "lineCount": 16,
  "isViral": true,
  "analysis": {
    "howItMadeReadersFeel": "...",
    "whatTheyLearned": "...",
    "whyShareableOrNot": "...",
    "whatWorkedOrDidntWork": "..."
  },
  "leverageSignals": [
    {
      "signal": "shocking_number_contrast",
      "impact": "high",
      "note": "..."
    }
  ]
}
```

## Workflows

### Adding New Posts

**Option 1: Interactive CLI**
```bash
npm run add-post
```

**Option 2: Manual Edit**
1. Edit `data/posts/all-posts.json`
2. Add new post to the array
3. Run `npm run refresh-data`

### After Adding Posts

Always run to update viral/flop splits:
```bash
npm run refresh-data
```

## Stats (as of now)

- Total posts: 51
- Viral posts: ~30
- Flop posts: ~21
- Average viral engagement: ~150+
- Average flop engagement: ~15-30

