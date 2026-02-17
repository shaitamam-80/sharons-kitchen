# המטבח של שרון — ספר מתכונים PWA

## על הפרויקט
אפליקציית PWA לניהול מתכונים אישיים של שרון (קונדיטורית Le Cordon Bleu).
האפליקציה בעברית, RTL מלא.

## מצב נוכחי
- פרויקט React+Vite+TypeScript עובד עם 65 מתכונים
- יש 155 תמונות של מחברות בכתב יד ב-Google Drive (g:\My Drive\shai-pc-downloads\sharon-recepies\שרון מתכונים\)
- צריך לתמלל את התמונות ולהכניס הוראות הכנה
- הגרסה המקורית (HTML בודד) שמורה ב-index.original.html

## סטאק טכנולוגי
- React 19 + Vite 6 + TypeScript
- Tailwind CSS 4
- PWA עם vite-plugin-pwa (Service Worker אוטומטי)
- localStorage לשמירת הוראות הכנה והערות

## מבנה הפרויקט
```
C:\Users\shait\sharons-kitchen\
├── src/
│   ├── components/     ← Header, CategoryBar, RecipeGrid, RecipeCard, RecipeModal, Toast, InstallBanner
│   ├── hooks/          ← useRecipeStore (state מרכזי), useLocalStorage
│   ├── data/           ← recipes.ts (65 מתכונים כ-typed const)
│   ├── types/          ← Recipe, Category interfaces
│   ├── App.tsx         ← מרכיב ראשי
│   └── index.css       ← Tailwind + CSS variables
├── public/             ← PWA icons
└── index.html          ← entry point
```

## כללים
- הכל בעברית, RTL
- עיצוב חם — גווני טרקוטה (#C75B39), קרם (#FFF8F0), זהב (#D4A373), ירוק מרווה (#8B9E7E)
- פונטים: Heebo (body) + Suez One (כותרות)
- המתכונים ב-src/data/recipes.ts, שינויים של המשתמש ב-localStorage (אותו מפתח: sharons-kitchen-data)
- שרון צריכה יכולת להוסיף/לערוך הוראות וטיפים

## פקודות
- `npm run dev` — שרת פיתוח (localhost:5173)
- `npm run build` — בנייה ל-dist/
- `npm run preview` — תצוגה מקדימה של הבנייה
