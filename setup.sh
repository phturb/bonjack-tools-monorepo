#!/bin/sh

domain=tools.bonjack.club
ldnappuser=nodeapp
runnergroup=apprunner

user_exists(){ id "$1" &>/dev/null; }

echo "Create necessary directories ..."
sudo mkdir -p /opt/app
sudo mkdir -p /opt/app/ldn-backend
sudo mkdir -p /var/www/$domain
sudo mkdir -p /etc/supervisor/conf.d/
sudo mkdir -p /opt/db

echo "Clearning directorires ..."
sudo rm -rf /var/www/$domain/html
sudo rm -rf /opt/app/ldn-backend
sudo rm -f /etc/supervisor/conf.d/ldn-backend.conf
sudo rm -f /opt/db/ldn-dev.db

"Echo verify if user $ldnappuser exist ..."
if user_exists $ldnappuser; code=$?; then
    echo "User : $ldnappuser exist"
else
    echo "Create appuser"
    sudo useradd -m -d /home/$ldnappuser $ldnappuser
    sudo chown -R $ldnappuser:$ldnappuser /opt/app/ldn-backend
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

cd ./bonjack-tools-backend
echo "Building backend server ..."
npm install
npx prisma migrate dev --name init-server
npm run build
cd ..

cd ./bonjack-tools-website-v2
echo "Building front end static website ..."
npm install
npm run build
cd ..

echo "Copy backend server to /opt/app/ldn-backend ..."
sudo mv ./bonjack-tools-backend/ldn-dev.db /opt/db/ldn-dev.db
sudo cp -R ./bonjack-tools-backend /opt/app/ldn-backend
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

echo "Finished !"
