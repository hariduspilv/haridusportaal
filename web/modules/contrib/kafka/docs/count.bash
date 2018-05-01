#!/usr/bin/env bash

# This script show the number of non-purged items in a topic.

# BROKER=10.35.25.95:32774
KAFKA_HOME=/Users/fgm/src/Carrefour/kafka_2.11-0.10.1.0
BROKER=127.0.0.1:9092
TOPIC=drupal

# Format of output is like $TOPIC:0:6004244, hence the use of awk $3.
# --time -1: latest message
$KAFKA_HOME/bin/kafka-run-class.sh kafka.tools.GetOffsetShell \
  --broker-list $BROKER                           \
  --topic $TOPIC                                  \
  --time -1 |                                     \
awk -F ":" '{sum += $3} END {print sum}'

# 13818663

# --time -2: earliest message
$KAFKA_HOME/bin/kafka-run-class.sh kafka.tools.GetOffsetShell \
  --broker-list $BROKER                           \
  --topic $TOPIC                                  \
  --time -2 |                                     \
awk -F ":" '{sum += $3} END {print sum}'
# 12434609
