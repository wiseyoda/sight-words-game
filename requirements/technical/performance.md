# Performance

← [Back to Technical](./README.md)

---

## Performance Budgets

| Metric | Target | Critical |
|--------|--------|----------|
| First Contentful Paint | < 1.5s | < 2.5s |
| Time to Interactive | < 2s | < 3s |
| Largest Contentful Paint | < 2.5s | < 4s |
| Interaction Response | < 100ms | < 200ms |
| Animation Frame Rate | 60fps | 30fps |
| JS Bundle (initial) | < 150KB | < 300KB |
| Total Page Weight | < 1MB | < 2MB |

---

## Optimization Strategies

### Code Splitting

```typescript
// Dynamic imports for routes
const GameBoard = dynamic(() => import('@/components/game/GameBoard'));
const AdminDashboard = dynamic(() => import('@/components/admin/Dashboard'));
```

### Image Optimization

```jsx
import Image from 'next/image';

// Automatic optimization
<Image
  src="/images/characters/chase.png"
  width={200}
  height={200}
  priority={isAboveFold}
/>
```

### Audio Preloading

```typescript
// Preload mission words on map screen
useEffect(() => {
  const words = missionWords[currentMissionId];
  words.forEach(word => {
    new Audio(word.audioUrl).load();
  });
}, [currentMissionId]);
```

---

## Monitoring

- Vercel Analytics (Core Web Vitals)
- Error tracking (Sentry or similar)
- API response time logging

---

← [Technical](./README.md)
