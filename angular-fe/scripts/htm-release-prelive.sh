#!/bin/bash
username="kokk" #eq. kokk@gate.wiseman.ee
environment="Prelive" #eq. Prelive or Live
server="test.edu.ee" #eq. test.edu.ee or edu.ee
version=$1 # DO.. NOT... TOUCH

decline() {
  echo "------------------------------------------"
  echo "Variable 'version' missing. Deploy stopped!"
  echo "------------------------------------------"
  sleep 1
  echo "To deploy app use:"
  echo "------------------------------------------"
  sleep 1
  echo "ssh htm-prelive.sh 1.46.2"
  echo "------------------------------------------"
  sleep 1
  echo "where 1.46.2 === version"
  echo "------------------------------------------"
}

check_version() {
  echo "------------------------------------------"
  echo "Checking if version '$version' exists!"
  echo "------------------------------------------"
  STATUS_CODE=$(curl -I  -s  "https://codeload.github.com/hariduspilv/haridusportaal/legacy.tar.gz/$version" | head -n 1 | cut '-d ' '-f2')

  if [ "$STATUS_CODE" == "200" ];
    then
      echo "We struck gold! Release exists. Time to deploy it!"
      echo "------------------------------------------"
      release
    else
      echo "Release version '$version' doesn't exist! Please check if you did a booboo!!!!"
      echo "------------------------------------------"
      sleep 1
      echo "Shutting down..."
      echo "------------------------------------------"
      sleep 1
      echo "Beep.. Boop.. Beep.. Boop..."
      echo "------------------------------------------"
  fi
}

release() {
ssh "$username"@gate.wiseman.ee << EOFGATE
sudo su wiseman
ssh root@vm96 << EOFVM96
su htm
ssh htmcircleci@"$server" << EOFCIRCLE
sudo su root
echo -e "\e[4m\e[1m------------------------------------------"
echo -e "!!!Deploying version: '$version'!!!"
echo -e "------------------------------------------\e[0m"
echo -e "\e[1m\e[31m------------------------------------------"
echo -e "CONTAINER BUILD TAKES 10 MINUTES!!! DO NOT CLOSE YOUR TERMINAL!!!"
echo -e "------------------------------------------"
echo -e "I REPEAT.. DO NOT... CLOSE... YOUR... TERMINAL!!!"
echo -e "------------------------------------------"
echo -e "... i hope your battery will last..."
echo -e "------------------------------------------\e[0m"
echo "Checking if there's an 'angular-tmp' container lurking around..."
echo -e "------------------------------------------"
echo "Don't pay any attention to the 'Error: No such blah blah blah'"
echo -e "------------------------------------------"
docker rm -f angular-tmp
docker run -d --name angular-tmp -e BUILD_VERSION=$version -e ENVIRONMENT=$environment --network=htm hub.wiseman.ee/htm/angular-refacto && sleep 600
echo "Removing old container"
echo -e "------------------------------------------"
docker rm -f angular
echo "Renaming new container"
echo -e "------------------------------------------"
docker rename angular-tmp angular
echo "Restaring container"
docker restart angular
echo -e "\e[1m\e[32m------------------------------------------"
echo -e "Container built! Have a nice day cupcakes ;)"
echo -e "------------------------------------------\e[0m"
exit
exit
EOFCIRCLE
exit
exit
EOFVM96
exit
exit
EOFGATE
exit 0
}

if [ -z "$version" ];
  then
    decline
  else
    check_version
fi
