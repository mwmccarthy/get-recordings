# get-recordings

## Getting started:

* Install git with `apt-get install git`.

* Install (nodejs)[https://github.com/nodejs/node-v0.x-archive/wiki/Installing-Node.js-via-package-manager#debian-and-ubuntu-based-linux-distributions]:
```
apt-get install curl
curl -sL https://deb.nodesource.com/setup_4.x | bash -
```

* Install ffmpeg:
```
echo 'deb http://www.deb-multimedia.org wheezy main' >> /etc/apt/sources.list
apt-get update && apt-get install deb-multimedia-keyring --force-yes -y
apt-get update && apt-get install ffmpeg
```
