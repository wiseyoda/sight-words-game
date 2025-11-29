# Sample Data

← [Back to Index](../README.md)

---

## Sample Mission

```json
{
  "id": "paw-patrol-m1",
  "campaignId": "paw-patrol-adventure-bay",
  "order": 1,
  "type": "play",
  "title": "Chase to the Rescue!",
  "narrativeIntro": "Uh oh! A kitten is stuck in a tree! Chase needs YOUR help to save it!",
  "narrativeOutro": "You did it! The kitten is safe! Chase says THANK YOU!",
  "scaffoldingLevel": 1,
  "sentences": [
    {
      "id": "pp-m1-s1",
      "text": "Chase can help.",
      "orderedWords": ["Chase", "can", "help", "."],
      "distractors": ["run", "see"]
    },
    {
      "id": "pp-m1-s2",
      "text": "The cat is up.",
      "orderedWords": ["The", "cat", "is", "up", "."],
      "distractors": ["down", "dog"]
    },
    {
      "id": "pp-m1-s3",
      "text": "Chase said go!",
      "orderedWords": ["Chase", "said", "go", "!"],
      "distractors": ["run", "help"]
    }
  ]
}
```

---

## Sample Theme

```json
{
  "id": "paw-patrol",
  "name": "Paw Patrol",
  "displayName": "Paw Patrol: Adventure Bay Rescue",
  "palette": {
    "primary": "#0066CC",
    "secondary": "#FF6B35",
    "accent": "#FFD700",
    "background": "#87CEEB",
    "cardBackground": "#FFFFFF",
    "text": "#1A1A2E",
    "success": "#4CAF50",
    "special": "#FFD700"
  },
  "characters": [
    {
      "id": "chase",
      "name": "Chase",
      "imageUrl": "/images/themes/paw-patrol/chase.png",
      "vocabulary": ["help", "stop", "go", "run", "find"]
    }
  ],
  "feedbackPhrases": {
    "correct": ["Paw-some!", "Great job, pup!", "You're on the case!"],
    "encourage": ["Almost there, pup!", "Try again, you've got this!"],
    "celebrate": ["Mission complete!", "Adventure Bay is saved!"]
  },
  "isActive": true,
  "isCustom": false
}
```

---

## Sample Player Progress

```json
{
  "id": "progress-emma-1",
  "playerId": "player-emma",
  "completedMissionIds": [
    "paw-patrol-m1",
    "paw-patrol-m2",
    "paw-patrol-m3"
  ],
  "currentCampaignId": "paw-patrol-adventure-bay",
  "currentMissionId": "paw-patrol-m4",
  "missionStars": {
    "paw-patrol-m1": 3,
    "paw-patrol-m2": 2,
    "paw-patrol-m3": 3
  },
  "unlockedAvatarIds": ["star", "heart", "rocket"],
  "unlockedStickerIds": ["chase-badge", "first-mission"],
  "totalStars": 8,
  "totalPlayTimeSeconds": 2340,
  "totalMissionsCompleted": 3
}
```

---

## Sample Word Mastery

```json
{
  "id": "mastery-emma-the",
  "playerId": "player-emma",
  "wordId": "word-the",
  "timesSeen": 15,
  "timesCorrectFirstTry": 14,
  "timesNeededRetry": 1,
  "timesNeededHint": 0,
  "streakCurrent": 8,
  "streakBest": 12,
  "masteryLevel": "mastered",
  "accuracy": 93,
  "lastSeenAt": "2025-11-28T15:30:00Z"
}
```

---

← [Back to Index](../README.md) | [AI Prompts →](./ai-prompts.md)
