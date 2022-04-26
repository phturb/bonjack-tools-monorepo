#!/bin/sh

domain=tools.bonjack.club
ldnappuser=nodeapp
emappuser=goapp
runnergroup=apprunner

user_exists(){ id "$1" &>/dev/null; }

echo "Create necessary directories ..."
sudo mkdir -p /opt/app
sudo mkdir -p /opt/app/ldn-backend
sudo mkdir -p /opt/app/em-backend
sudo mkdir -p /var/www/$domain
sudo mkdir -p /etc/supervisor/conf.d/
sudo mkdir -p /opt/db

echo "Clearning directorires ..."
sudo rm -rf /var/www/$domain/html
sudo rm -rf /opt/app/ldn-backend
sudo rm -rf /opt/app/em-backend
sudo rm -f /etc/supervisor/conf.d/ldn-backend.conf
sudo rm -f /etc/supervisor/conf.d/em-backend.conf
sudo rm -f /opt/db/ldn-dev.db

"Echo verify if user $ldnappuser exist ..."
if user_exists $ldnappuser; code=$?; then
    echo "User : $ldnappuser exist"
else
    echo "Create appuser"
    sudo useradd -m -d /home/$ldnappuser $ldnappuser
    sudo chown -R $ldnappuser:$ldnappuser /opt/app/ldn-backend
fi

echo "Verify if user $emappuser exist ..."
if user_exists $emappuser; code=$?; then
    echo "User : $emappuser exist"
else
    echo "Create $emappuser"
    sudo useradd -m -d /home/$emappuser $emappuser
    sudo chown -R $emappuser:$emappuser /opt/app/em-backend
fi

echo "Verify if usergroup apprunner exist ..."
sudo getent group $runnergroup 2>&1 > /dev/null || sudo groupadd $runnergroup

if id -nGz "$ldnappuser" | grep -qzxF "$runnergroup"
then
    echo User \`$ldnappuser\' belongs to group \`$runnergroup\'
else
    echo User \`$ldnappuser\' does not belong to group \`$runnergroup\'
    sudo usermod -a -G $runnergroup $ldnappuser
fi

if id -nGz "$emappuser" | grep -qzxF "$runnergroup"
then
    echo User \`$emappuser\' belongs to group \`$runnergroup\'
else
    echo User \`$emappuser\' does not belong to group \`$runnergroup\'
    sudo usermod -a -G $runnergroup $emappuser
fi


echo "Creating superviosr config ..."
sed "s/{{APPUSER}}/$ldnappuser/g" supervisor.ldn-backend.conf > ldn-backend.conf
sudo mv -f ldn-backend.conf /etc/supervisor/conf.d/ldn-backend.conf

sed "s/{{APPUSER}}/$emappuser/g" supervisor.em-backend.conf > em-backend.conf
sudo mv -f em-backend.conf /etc/supervisor/conf.d/em-backend.conf

echo "Creating nginx config ..."
echo "Adding domain $domain in nginx config"
sed "s/{{DOMAIN_PATH}}/$domain/g" nginx.conf > $domain

echo "Copying the config to /etc/nginx/sites-available/$domain "
sudo mv -f $domain /etc/nginx/sites-available/$domain
echo "Enable the static website"
sudo ln -s /etc/nginx/sites-available/$domain /etc/nginx/sites-enabled/
echo "Updage nginx"
sudo nginx -t
sudo systemctl restart nginx
sudo nginx -s reload

cd ./lois-des-norms-backend
echo "Building lois-des-norms-backend server ..."
./create_tables.sh ldn-dev.db
npm install
npx prisma generate
npm run build
cd ..

cd ./expense-manager-backend
echo "Building expense manager server ..."
go build -o em-backend
cd ..

cd ./frontend
echo "Building front end static website ..."
npm install
npm run build
cd ..

echo "Copy expense manager backend server to /opt/app/em-backend ..."
sudo mkdir -p /opt/app/em-backend
sudo cp ./expense-manager-backend/em-backend /opt/app/em-backend

echo "Copy lois-des-norms-backend server to /opt/app/ldn-backend ..."
sudo mv ./lois-des-norms-backend/ldn-dev.db /opt/db/ldn-dev.db
sudo cp -R ./lois-des-norms-backend /opt/app/ldn-backend
echo "Give $runnergroup the ownership of the /opt/app & /opt/db directory ..."
sudo chown -R :$runnergroup /opt/app
sudo chown -R :$runnergroup /opt/db
sudo chmod 2775 /opt/app
sudo chmod 2775 /opt/db
sudo chmod 644 /opt/db/ldn-dev.db

echo "Copy static website ..."
sudo cp -R ./frontend/build /var/www/tools.bonjack.club/html

echo "Update supervisor"
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart ldn-backend
sudo supervisorctl restart em-backend

echo "Finished !"
