FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace/app

ARG SKIP_FRONTEND_BUILD=false

# ---- Install Node.js + Yarn ----
RUN apt-get update && apt-get install -y curl ca-certificates gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    corepack enable && \
    rm -rf /var/lib/apt/lists/*

# Optional: sanity check
RUN node -v && yarn -v

COPY gradlew gradlew.bat ./
COPY gradle gradle
COPY build.gradle settings.gradle ./

# Frontend deps layer (cacheable)
COPY frontend/package.json frontend/yarn.lock ./frontend/
RUN cd frontend && yarn install --frozen-lockfile

# Backend deps layer (cacheable)
RUN ./gradlew --no-daemon dependencies || true

COPY frontend frontend
COPY src src

RUN if [ "$SKIP_FRONTEND_BUILD" = "true" ]; then \
        ./gradlew bootJar --no-daemon -PskipFrontendBuild; \
    else \
        ./gradlew bootJar --no-daemon; \
    fi

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN addgroup --system app && adduser --system --ingroup app app
COPY --from=build /workspace/app/build/libs/*.jar /app/app.jar
RUN mkdir -p /app/uploads && chown -R app:app /app

USER app

ENV JAVA_OPTS=""
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
