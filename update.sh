#!/bin/sh

domain=tools.bonjack.club
ldnappuser=nodeapp
emappuser=goapp
runnergroup=apprunner

sudo rm -rf /var/www/$domain/html
sudo rm -rf /opt/app/em-backend
sudo rm -rf /opt/app/ldn-backend

cd ./lois-des-norms-backend
echo "Building lois-des-norms-backend server ..."
npm install
npx prisma migate dev --name update-server
npm run build
cd ..

cd ./expense-manager-backend
echo "Building expense manager server ..."
go build -o em-backend
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

echo "Copy expense manager backend server to /opt/app/em-backend ..."
sudo mkdir -p /opt/app/em-backend
sudo cp ./expense-manager-backend/em-backend /opt/app/em-backend

echo "Copy lois-des-norms-backend server to /opt/app/ldn-backend ..."
sudo cp -R ./lois-des-norms-backend /opt/app/ldn-backend
echo "Give $runnergroup the ownership of the /opt/app & /opt/db directory ..."
sudo chown -R :$runnergroup /opt/app
sudo chown -R :$runnergroup /opt/db
sudo chmod 2775 /opt/app
sudo chmod 2775 /opt/db
sudo chmod 644 /opt/db/ldn-dev.db

echo "Copy static website ..."
sudo cp -r ./frontend/build /var/www/tools.bonjack.club/html

echo "Update supervisor"
sudo supervisorctl restart ldn-backend
sudo supervisorctl restart em-backend

echo "Finished !"
