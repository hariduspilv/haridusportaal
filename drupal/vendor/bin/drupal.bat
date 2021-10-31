@ECHO OFF
setlocal DISABLEDELAYEDEXPANSION
SET BIN_TARGET=%~dp0/../drupal/console/bin/drupal
php "%BIN_TARGET%" %*
