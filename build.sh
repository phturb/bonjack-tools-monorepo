#!/bin/sh

rm -r ./build
rm -r ./lois-des-norms-backend/dist
rm -r ./frontend/build
rm ./expense-manager-backend/em-backend
rm release.tar.gz

cd ./lois-des-norms-backend
echo "Building lois-des-norms-backend server ..."
npm install
npx prisma generate
npm run build
cd ..

cd ./frontend
echo "Building front end static website ..."
npm install
if [[ -z $1 ]] && [[ $1 -eq '--low-mem']]; then
npm run build-low-memory
else
npm run build
fi
cd ..

cd ./expense-manager-backend
echo "Building expense manager backend .."
go build
cd ..

mkdir ./build
mkdir ./build/lois-des-norms-backend
mkdir ./build/frontend
mkdir ./build/expense-manager-backend

echo "Copy lois-des-norms-backend server to build/lois-des-norms-backend"
cp -r ./lois-des-norms-backend/dist ./build/lois-des-norms-backend/dist
cp ./lois-des-norms-backend/package.json ./build/lois-des-norms-backend/package.json

echo "Copy frontend to build/frontend"
cp -r ./frontend/build/. ./build/frontend

echo "Copy expense manager backend server to build/expense-manager-backend"
cp ./expense-manager-backend/em-backend ./build/expense-manager-backend/em-backend

tar -zcvf release.tar.gz ./build

echo "Finished !"
