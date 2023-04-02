#!/bin/sh

domain=tools.bonjack.club
ldnappuser=nodeapp
runnergroup=apprunner

sudo rm -rf /var/www/$domain/html
sudo rm -rf /opt/app/ldn-backend

cd ./bonjack-tools-backend
echo "Building backend server ..."
npm install
npx prisma migate dev --name update-server
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

echo "Copy backend server to /opt/app/ldn-backend ..."
sudo cp -R ./bonjack-tools-backend /opt/app/ldn-backend
echo "Give $runnergroup the ownership of the /opt/app & /opt/db directory ..."
sudo chown -R :$runnergroup /opt/app
sudo chown -R :$runnergroup /opt/db
sudo chmod 2775 /opt/app
sudo chmod 2775 /opt/db
sudo chmod 644 /opt/db/ldn-dev.db

echo "Copy static website ..."
sudo cp -r ./bonjack-tools-website-v2/build /var/www/tools.bonjack.club/html

echo "Update supervisor"
sudo supervisorctl restart ldn-backend

echo "Finished !"
