#!/bin/sh
# ----------------------------------------------------------------------------
# Self-bootstrapping Maven Wrapper
# ----------------------------------------------------------------------------

set -e

# Detect or configure JAVA_HOME if not already set or not working
if [ -z "$JAVA_HOME" ] || ! command -v java >/dev/null 2>&1; then
  if [ -d "/Applications/IntelliJ IDEA CE.app/Contents/jbr/Contents/Home" ]; then
    export JAVA_HOME="/Applications/IntelliJ IDEA CE.app/Contents/jbr/Contents/Home"
    export PATH="$JAVA_HOME/bin:$PATH"
  elif [ -x "/usr/libexec/java_home" ]; then
    JH=$(/usr/libexec/java_home 2>/dev/null || true)
    if [ -n "$JH" ]; then
      export JAVA_HOME="$JH"
      export PATH="$JAVA_HOME/bin:$PATH"
    fi
  fi
fi

# Detect existing system mvn
if command -v mvn >/dev/null 2>&1; then
  exec mvn "$@"
fi

# Local maven wrapper directory
MAVEN_VERSION="3.9.9"
MAVEN_HOME="$HOME/.m2/wrapper/dists/apache-maven-$MAVEN_VERSION-bin/apache-maven-$MAVEN_VERSION"

if [ ! -x "$MAVEN_HOME/bin/mvn" ]; then
  echo "Downloading Apache Maven $MAVEN_VERSION..."
  mkdir -p "$HOME/.m2/wrapper/dists/apache-maven-$MAVEN_VERSION-bin"
  TAR_FILE="$HOME/.m2/wrapper/dists/apache-maven-$MAVEN_VERSION-bin.tar.gz"
  
  curl -fsSL "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/$MAVEN_VERSION/apache-maven-$MAVEN_VERSION-bin.tar.gz" -o "$TAR_FILE"
  tar -xzf "$TAR_FILE" -C "$HOME/.m2/wrapper/dists/apache-maven-$MAVEN_VERSION-bin"
  rm -f "$TAR_FILE"
fi

exec "$MAVEN_HOME/bin/mvn" "$@"
