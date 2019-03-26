#!/usr/bin/env bash
# fail if any commands fails
set -e
# debug log
set -x

# write your script here
echo "Hello World!"

# or run a script from your repository, like:
# bash ./path/to/script.sh
# not just bash, e.g.:
# ruby ./path/to/script.rb
iqScannerDirectory="iqscanner"
mkdir -p $iqScannerDirectory
if [ -z "$(ls -A $iqScannerDirectory)" ]; then
   echo "Empty"
else
   echo "Not Empty"
   rm $iqScannerDirectory/*
fi
IQ_CLI_ADDRESS=${IQ_CLI_ADDRESS}
IQ_SERVER_ADDRESS=${IQ_SERVER_ADDRESS}

wget -q $IQ_CLI_ADDRESS -P $iqScannerDirectory


filename=$(ls $iqScannerDirectory) && tar -zxvf $iqScannerDirectory/$filename -C $iqScannerDirectory
cliScanner=$(ls $iqScannerDirectory/*cli*)

#copying the dependencies
# ./gradlew copyDependenciesRelease

#now we scan with IQScanner
#./gradlew iqScan $cliScanner, $IQ_SERVER_ADDRESS, $IQ_SERVER_USER_NAME, $IQ_SERVER_PASSWORD

iqscandir='/home/circleci/node_modules'
appName=chome-extension-nexus-iq
java -jar $cliScanner -s $IQ_SERVER_ADDRESS -a ${NEXUS_IQ_USER_NAME}:${NEXUS_IQ_PASSWORD} -i $appName $iqscandir
