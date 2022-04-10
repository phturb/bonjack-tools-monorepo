#!/bin/sh

domain=tools.bonjack.club
appuser=nodeapp

user_exists(){ id "$1" &>/dev/null; }

echo "Create necessary directories ..."
sudo mkdir -p /opt/app
sudo mkdir -p /var/www/$domain
sudo mkdir -p /etc/supervisor/conf.d/

echo "Clearning directorires ..."
sudo rm -rf /var/www/$domain/html
sudo rm -rf /opt/app/ldn-backend
sudo rm -f /etc/supervisor/conf.d/ldn-backend.conf

"Echo verify if user $appuser exist ..."
if user_exists $appuser; code=$?; then
    echo "User : $appuser exist"
else
    echo "Create appuser"
    sudo useradd -m -d /home/$appuser $appuser
    sudo chown -R $appuser:$appuser /opt/app
fi

echo "Creating superviosr config ..."
sed "s/{{APPUSER}}/$appuser/g" supervisor.conf > ldn-backend.conf
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
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart ldn-backend

echo "Finished !"
