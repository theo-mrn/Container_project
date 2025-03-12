FROM nginx:stable-alpine

# Installation des dépendances nécessaires
RUN apk add --no-cache \
    curl \
    tzdata \
    && rm -rf /var/cache/apk/*

# Configuration du fuseau horaire
ENV TZ=Europe/Paris

# Création des répertoires nécessaires avec les bonnes permissions
RUN mkdir -p /var/cache/nginx \
    && mkdir -p /var/log/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

# Copie des fichiers de configuration
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx conf.d/default.conf /etc/nginx/conf.d/default.conf

# Configuration des permissions
RUN chmod 644 /etc/nginx/nginx.conf \
    && chmod 644 /etc/nginx/conf.d/default.conf

# Exposition du port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost/ || exit 1

# Utilisation de l'utilisateur non-root
USER nginx

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"] 