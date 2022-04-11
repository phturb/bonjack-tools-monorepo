#!/bin/sh

domain=tools.bonjack.club
appuser=nodeapp

sudo rm -rf /var/www/$domain/html
sudo rm -rf /opt/app/ldn-backend

cd ./lois-des-norms-backend
echo "Building lois-des-norms-backend server ..."
npm install
npx prisma generate
npm run build
cd ..

cd ./frontend
echo "Building front end static website ..."
npm install
npm run build
cd ..

echo "Copy lois-des-norms-backend server to /opt/app/ldn-backend ..."
sudo cp -r ./lois-des-norms-backend /opt/app/ldn-backend
echo "Give $appuser the ownership of the /opt/app/ldn-backend directory ..."
sudo chown -R $appuser:$appuser /opt/app/ldn-backend

echo "Copy static website ..."
sudo cp -r ./frontend/build /var/www/tools.bonjack.club/html

echo "Update supervisor"
sudo supervisorctl restart ldn-backend

echo "Finished !"
