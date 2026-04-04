FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
RUN mkdir -p /etc/caddy/domains

EXPOSE 80 443 2019

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
