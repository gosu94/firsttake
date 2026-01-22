# FirstTake

AI pre-production for short-form video. FirstTake helps you generate scripts, scene prompts, narration, and visual assets, then preview and export a full project.

FirstTake replaces complex video tools with a simple, text-first pre-production workflow.

## Stack
- Backend: Spring Boot (Java 21), H2, JPA
- Frontend: Next.js + React + Tailwind
- AI providers: Fal (Nano Banana, Veo3 Fast), OpenRouter, OpenAI TTS

## Local development
### Backend (API + static frontend)
```bash
./gradlew bootRun
```

### Frontend (dev server)
```bash
cd frontend
yarn install
yarn dev
```

## Build
```bash
./gradlew build
```

The Gradle build exports the Next.js app and copies it into `src/main/resources/static` so Spring Boot can serve it.

## Notes
- Default database: H2
- Configure AI provider credentials via environment variables as expected by each SDK.
