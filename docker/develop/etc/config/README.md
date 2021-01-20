# Letsencrypt generated config files

## Symbolic links on server for fullchain.pem and privkey.pem
  1. /etc/nginx/certs -> /etc/config/etc/letsencrypt/live/haridusportaal.twn.zone

## Letsencrypt dns validation https://medium.com/faun/docker-letsencrypt-dns-validation-75ba8c08a0d
  1. Added api key from twn digitalocean: haridusportaal_dns
  2. Api key added on server at /etc/config/dns-conf/digitalocean.ini

## Dhparams generation
  1. At /etc/nginx `openssl dhparam -out dhparams.pem 4096`
