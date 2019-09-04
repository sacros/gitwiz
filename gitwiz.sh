#!/bin/sh

read -p "Enter username: " user
stty -echo
read -p "Enter password: " password
stty echo
echo

case $1 in
create)
    read -p "Private? (y/N)" ans
    if [ "$ans" = "y" ] || [ "$ans" = "Y" ];then
        ans=true
    else
        ans=false
    fi
    curl -u $user:$password https://api.github.com/user/repos -d '{"name":"'$2'", "private": '$ans'}'
;;
delete)
    curl -u $user:$password -X DELETE https://api.github.com/repos/sacros/$2
;;
*)
    echo "\nSorry, couldn't understand. Available options are:\ncreate:  create new repo\ndelete:  deletes an existing repo"
esac
