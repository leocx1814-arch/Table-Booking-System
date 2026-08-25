# ==============================================================================
# Single-Container Multi-Stage Production Dockerfile (Backend Context Copy)
# Building: Table Booking System (Frontend SPA + Express Backend)
# ==============================================================================

# ---- Stage 1: Build Frontend Static Bundle ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
ENV VITE_API_URL=""
RUN npm run build

# ---- Stage 2: Production Express Application Runner ----
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Install backend production dependencies only
COPY backend/package*.json ./
RUN npm ci --only=production || npm install --omit=dev

# Copy backend application source code
COPY backend/ ./

# Copy built frontend assets from Stage 1 into backend public/ directory
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 5001

CMD ["node", "src/server.js"]
