# Users' JWT Authentication

This module is used to authenticate requests from a JWT in the header. This module
may be installed independently of the main jwt module. Only public key authentication
is supported, and each key is connected to a specific Drupal user account.

## JWT Header and Claims

When creating a JWT, the header must include a key ID (kid). This will be a unique
string associated with a Drupal user account.

When creating a JWT, the iat and exp claims must be included. The exp cannot be more than
24 hours later than the iat value.

Like the jwt_auth_consumer module, the namespaced claim drupal / uid is used to
determine the user account to be used when authenticated. You can also use a user
uuid or username with claims "drupal / uuid" or "drupal / name". The claims are
checked in the order listed here, and the first one that's populated is used to
determine the user. This user uid must match the uid associated with the key ID.

## Request Header

The JWT may be sent in either of two headers. The fallback header is intended for use
in development environments that are protected by basic authentication, e.g. to block
web crawlers.

Main header format:

    Authorization: UsersJwt [token]

Fallback header:

    JWT-Authorization: UsersJwt [token]

## API Integration

For REST api integration (e.g. Views) enable the users_jwt_auth authentication option.

## Debugging

For local or non-production debugging log messages when authentication fails,
create the following in settings.php or or local settings include file:

    $settings['jwt.debug_log'] = TRUE;
