vcl 4.0;

acl upstream_proxy {
    "nginx";
}

# Default backend definition. Set this to point to your content server.
backend default {
    .host = "drupal";
    .port = "8080";
}

sub vcl_recv {

    if (req.method == "PURGE") {
        return (purge);
    }

    if (!req.http.Access-Control-Allow-Origin){
	    return (pass);
    }

    # Set the X-Forwarded-For header so the backend can see the original
    # IP address. If one is already set by an upstream proxy, we'll just re-use that.
    if (client.ip ~ upstream_proxy && req.http.X-Forwarded-For) {
       set req.http.X-Forwarded-For = req.http.X-Forwarded-For;
    } else {
       set req.http.X-Forwarded-For = regsub(client.ip, ":.*", "");
    }

    if (req.http.Cookie !~ "SESS") {
        unset req.http.Cookie;
    }

    ## Remove has_js and Google Analytics cookies.
    set req.http.Cookie = regsuball(req.http.Cookie, "(^|;\s*)(__[a-z]+|has_js|cookie-agreed|MCPopupClosed)=[^;]*", "");
    ## Remove a .;. prefix, if present.
    set req.http.Cookie = regsub(req.http.Cookie, "^;\s*", "");
    ## Remove empty cookies.
    if (req.http.Cookie ~ "^\s*$") {
       unset req.http.Cookie;
    }
    # Site still uses some static files out of /files, cache them
    if (req.url ~ "^/files/site.*") {
       unset req.http.Cookie;
    }
    # enable caching of theme files
    if (req.url ~ "^/sites/www.site.*") {
       unset req.http.Cookie;
    }
    # Drupal js/css doesn.t need cookies, cache them
    if (req.url ~ "^/modules/.*\.(js|css)\?") {
       unset req.http.Cookie;
    }
    ## Pass cron jobs and server-status
    if (req.url ~ ".*/server-status$") {
       return (pass);
    }
    if (req.url ~ "^/update\.php" ||
    	req.url ~ "^/cron\.php" ||
	    req.url ~ "^/install\.php" ||
    	req.url ~ "^/admin" ||
    	req.url ~ "^/admin/.*$" ||
    	req.url ~ "^/user" ||
    	req.url ~ "^/user/.*$" ||
    	req.url ~ "^/users/.*$" ||
    	req.url ~ "^/info/.*$" ||
    	req.url ~ "^/flag/.*$" ||
    	req.url ~ "^.*/ajax/.*$" ||
    	req.url ~ "^.*/node/.*$" ||
	    req.url ~ "^.*customFavorites.*$" ||
    	req.url ~ "^/system/files/.*$" ||
      req.url ~ "^/default/files/.*$" ||
      req.url ~ "^/custom/login/.*$" ||
      req.url ~ "^/dashboard/.*$") {
        return (pass);
    }
}
 
sub vcl_hash {
   if (req.http.Cookie) {
      hash_data(req.http.Cookie);
   }
}
