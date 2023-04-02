#!/bin/sh

rm -r ./build
rm -r ./bonjack-tools-backend/dist
rm -r ./bonjack-tools-website-v2/build
rm release.tar.gz

cd ./bonjack-tools-backend
echo "Building backend server ..."
npm install
npx prisma migrate dev --name build-server
npm run build
cd ..

cd ./bonjack-tools-website-v2
echo "Building front end static website ..."
npm install
if [[ -z $1 ]] && [[ $1 -eq '--low-mem']]; then
npm run build-low-memory
else
npm run build
fi
cd ..

mkdir ./build
mkdir ./build/backend
mkdir ./build/frontend

echo "Copy backend server to build/backend"
cp -r ./bonjack-tools-backend/dist ./build/backend/dist
cp ./bonjack-tools-backend/package.json ./build/backend/package.json

echo "Copy frontend to build/frontend"
cp -r ./bonjack-tools-website-v2/build/. ./build/frontend

tar -zcvf release.tar.gz ./build

echo "Finished !"
